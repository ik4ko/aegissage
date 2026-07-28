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
 *   CRM_INGEST_URL           full URL of the Agent Factory ingest route
 *   CRM_INGEST_SECRET        shared secret for HMAC request signing
 *   CRM_INGEST_BYPASS_TOKEN  optional; see below
 *
 * Absent credentials are a no-op, not an error. Leads keep accumulating in
 * the outbox and drain the moment the bridge is configured.
 *
 * ── Why the bypass token exists ───────────────────────────────────────────
 * The Agent Factory deployment has Vercel Deployment Protection enabled.
 * Verified by probing it: every path, including /api/*, answers 302 to
 * vercel.com/sso-api. That protection is good — it keeps an internal
 * operations dashboard off the public internet — but it also means a
 * server-to-server POST never reaches the route handler, so the signature
 * check inside it never runs.
 *
 * `CRM_INGEST_BYPASS_TOKEN` is Vercel's "Protection Bypass for Automation"
 * secret, sent as x-vercel-protection-bypass. It gets the request past the
 * edge gate so the endpoint's OWN signature verification can do the real
 * authorization. It is a transport concern, not an authentication one — the
 * HMAC is still what proves the request is genuine, and the bypass token
 * alone grants nothing but the ability to be rejected by that check.
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
  const bypass = process.env.CRM_INGEST_BYPASS_TOKEN?.trim();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      // `manual` so a Vercel SSO redirect surfaces as a failure to retry
      // rather than being silently followed to an HTML login page that
      // would then parse as a mysterious schema error.
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
        [SIGNATURE_HEADER]: signature,
        [TIMESTAMP_HEADER]: timestamp,
        [IDEMPOTENCY_HEADER]: row.idempotency_key,
        ...(bypass ? { 'x-vercel-protection-bypass': bypass } : {}),
      },
      body,
      signal: controller.signal,
      cache: 'no-store',
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location') ?? '';
      const isSso = location.includes('vercel.com/sso-api');
      throw Object.assign(
        new Error(
          isSso
            ? 'Blocked by Vercel Deployment Protection. Set CRM_INGEST_BYPASS_TOKEN ' +
              'to the target project\'s Protection Bypass for Automation secret.'
            : `Unexpected redirect to ${location.slice(0, 120)}`,
        ),
        // Retryable: this is a configuration problem someone will fix, and
        // the lead should still be waiting in the queue when they do.
        { permanent: false },
      );
    }

    const text = await res.text();

    /*
      Vercel Deployment Protection does NOT always answer with a redirect.
      A browser GET gets a 302 to sso-api (handled above), but a
      server-to-server POST gets a 401 whose JSON body carries
      `"protection":{"vercel_auth_enabled":true}` — verified by probing the
      live deployment.

      That distinction matters a great deal here. 401 otherwise falls into the
      permanent bucket below, so a missing or rotated bypass token would burn
      every attempt at once and mark real leads `dead` instead of holding them
      until someone fixes the configuration. It is a transport failure wearing
      an authentication status code, so it is classified by body, not status.
    */
    if (res.status === 401 && text.includes('"vercel_auth_enabled":true')) {
      throw Object.assign(
        new Error(
          'Blocked by Vercel Deployment Protection (401). Set CRM_INGEST_BYPASS_TOKEN ' +
            "to the target project's Protection Bypass for Automation secret.",
        ),
        { permanent: false },
      );
    }

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
