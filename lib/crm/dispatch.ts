import 'server-only';
import {
  IDEMPOTENCY_HEADER,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  signPayload,
} from './contract';
import { claimDueLeads, markDelivered, markFailed, type OutboxRow } from './outbox';

/**
 * Delivers queued leads to the Agent Factory ingest endpoint.
 *
 * Server-only. Both env vars are non-public by design — a signing secret that
 * reached the browser would let anyone forge leads into the CRM.
 *
 *   CRM_INGEST_URL      full URL of the Agent Factory ingest route
 *   CRM_INGEST_SECRET   shared secret for HMAC request signing
 *
 * Absent credentials are a no-op, not an error. Leads keep accumulating in
 * the outbox and drain the moment the bridge is configured — which is exactly
 * the current state of the world, since the CRM side is not yet deployed.
 */

export type SyncResult = {
  configured: boolean;
  claimed: number;
  delivered: number;
  failed: number;
  dead: number;
};

const REQUEST_TIMEOUT_MS = 10_000;

function config() {
  const url = process.env.CRM_INGEST_URL?.trim();
  const secret = process.env.CRM_INGEST_SECRET?.trim();
  return url && secret ? { url, secret } : null;
}

async function deliver(row: OutboxRow, url: string, secret: string): Promise<string | null> {
  const body = JSON.stringify(row.payload);
  const timestamp = String(Date.now());
  const signature = signPayload(body, timestamp, secret);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [SIGNATURE_HEADER]: signature,
        [TIMESTAMP_HEADER]: timestamp,
        [IDEMPOTENCY_HEADER]: row.idempotency_key,
      },
      body,
      signal: controller.signal,
      cache: 'no-store',
    });

    const text = await res.text();

    /*
      2xx is success. 409 is ALSO success: the receiver is telling us this
      idempotency key already exists, which is the dedupe guarantee working.
      Retrying a 409 forever would be the bug.
    */
    if (res.ok || res.status === 409) {
      try {
        const parsed = JSON.parse(text) as { id?: string; leadId?: string };
        return parsed.id ?? parsed.leadId ?? null;
      } catch {
        return null;
      }
    }

    /*
      4xx other than 408/429 is a permanent rejection — a malformed payload or
      a bad signature will not fix itself, so burn the attempts immediately
      rather than retrying a broken request for a day.
    */
    const permanent = res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429;
    throw Object.assign(new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`), { permanent });
  } finally {
    clearTimeout(timer);
  }
}

export async function syncPendingLeads(limit = 10): Promise<SyncResult> {
  const cfg = config();
  if (!cfg) {
    return { configured: false, claimed: 0, delivered: 0, failed: 0, dead: 0 };
  }

  const rows = await claimDueLeads(limit);
  let delivered = 0;
  let failed = 0;
  let dead = 0;

  for (const row of rows) {
    try {
      const remoteId = await deliver(row, cfg.url, cfg.secret);
      await markDelivered(row.id, remoteId);
      delivered += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const permanent = Boolean((err as { permanent?: boolean })?.permanent);

      if (permanent) {
        // Skip straight to dead — no amount of retrying fixes a 400.
        await markFailed({ ...row, attempts: row.max_attempts - 1 }, `permanent: ${message}`);
        dead += 1;
      } else {
        await markFailed(row, message);
        failed += 1;
      }
    }
  }

  return { configured: true, claimed: rows.length, delivered, failed, dead };
}
