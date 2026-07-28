import 'server-only';
import { getServerSupabase } from '@/lib/supabase/server';

/**
 * Lead-operations health, for the Agent Factory dashboard.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 * `lead_sync_outbox` and `notification_deliveries` live in the WEBSITE
 * Supabase project. The Agent Factory dashboard reads the CRM project, so a
 * lead that never reached the CRM was invisible to the operator: the failure
 * was recorded faithfully and then seen by nobody. This closes that gap.
 *
 * ── What is deliberately NOT returned ─────────────────────────────────────
 * No names, emails, phone numbers, ZIPs, messages, or any part of
 * `lead_sync_outbox.payload`. A failed row is identified by its submission id
 * and acted on with the retry action — the operator never needs the person's
 * details to re-drive a delivery, so they do not cross the boundary. Keeping
 * PII out means this endpoint leaks nothing of consequence even if the token
 * were compromised.
 */

/** Outbox lifecycle, mapped to what an operator actually needs to know. */
export type DeliveryHealth = {
  outbox: {
    pending: number;
    processing: number;
    delivered: number;
    retryable: number;
    dead: number;
    oldestPendingAt: string | null;
  };
  notifications: {
    emailSent: number;
    emailFailed: number;
    smsSkipped: number;
    smsSent: number;
    smsFailed: number;
  };
  recentFailures: FailedDelivery[];
  /** True when Twilio is unconfigured, so SMS skips are expected, not faults. */
  smsConfigured: boolean;
  generatedAt: string;
};

export type FailedDelivery = {
  id: string;
  websiteSubmissionId: string;
  remoteLeadId: string | null;
  category: FailureCategory;
  message: string;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt: string | null;
  nextAttemptAt: string | null;
  /** `dead` has exhausted its attempts; `retryable` is still scheduled. */
  state: 'retryable' | 'dead';
};

export type FailureCategory =
  | 'deployment_protection'
  | 'rejected_by_crm'
  | 'crm_unavailable'
  | 'network_or_timeout'
  | 'not_configured'
  | 'unknown';

/**
 * Turns a raw `last_error` into something an operator can act on.
 *
 * The raw string is a developer artefact — an HTTP status plus a slice of a
 * response body. Classifying it means the dashboard can say "the CRM rejected
 * this" rather than showing a status code to someone who should not have to
 * care what a 400 is.
 */
export function classifyFailure(raw: string | null): { category: FailureCategory; message: string } {
  const error = raw ?? '';

  if (/vercel_auth_enabled|Deployment Protection/i.test(error)) {
    return {
      category: 'deployment_protection',
      message:
        'Blocked by Vercel Deployment Protection before reaching the CRM. The bridge bypass token is missing or has been rotated.',
    };
  }
  if (/not configured|CRM_INGEST_(URL|SECRET)/i.test(error)) {
    return {
      category: 'not_configured',
      message: 'The bridge is not fully configured, so delivery was not attempted.',
    };
  }
  if (/abort|timeout|ETIMEDOUT|ENOTFOUND|ECONNREFUSED|fetch failed|network/i.test(error)) {
    return {
      category: 'network_or_timeout',
      message: 'Could not reach the CRM. This is usually temporary and will retry.',
    };
  }
  if (/HTTP 5\d\d/.test(error)) {
    return {
      category: 'crm_unavailable',
      message: 'The CRM returned a server error. This will retry automatically.',
    };
  }
  if (/permanent|HTTP 4\d\d|Schema rejected|Invalid signature|Missing signature/i.test(error)) {
    return {
      category: 'rejected_by_crm',
      message:
        'The CRM rejected this delivery and will not accept it as-is. It needs a look rather than another retry.',
    };
  }
  return { category: 'unknown', message: 'Delivery failed for an unrecognised reason.' };
}

/**
 * Strips anything token-shaped out of a message before it leaves the server.
 *
 * `last_error` embeds a slice of the CRM's response body. That should never
 * contain a credential, but "should never" is not a guarantee worth betting a
 * signing key on, so long high-entropy runs are redacted on the way out.
 */
export function redact(message: string): string {
  return message
    .replace(/\b[A-Fa-f0-9]{32,}\b/g, '[redacted]')
    .replace(/\b[A-Za-z0-9_-]{40,}\b/g, '[redacted]')
    .slice(0, 300);
}

export async function getDeliveryHealth(failureLimit = 20): Promise<DeliveryHealth | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const smsConfigured = Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_FROM_NUMBER?.trim(),
  );

  // Status counts. `head: true` with an exact count keeps these cheap — no
  // rows cross the wire, only the number.
  const countOf = async (status: string) => {
    const { count } = await supabase
      .from('lead_sync_outbox')
      .select('id', { count: 'exact', head: true })
      .eq('status', status);
    return count ?? 0;
  };

  const notificationCount = async (channel: string, status: string) => {
    const { count } = await supabase
      .from('notification_deliveries')
      .select('id', { count: 'exact', head: true })
      .eq('channel', channel)
      .eq('status', status);
    return count ?? 0;
  };

  const [pending, processing, delivered, failed, dead] = await Promise.all([
    countOf('pending'),
    countOf('in_flight'),
    countOf('delivered'),
    countOf('failed'),
    countOf('dead'),
  ]);

  const [emailSent, emailFailed, smsSkipped, smsSent, smsFailed] = await Promise.all([
    notificationCount('email', 'sent'),
    notificationCount('email', 'failed'),
    notificationCount('sms', 'skipped'),
    notificationCount('sms', 'sent'),
    notificationCount('sms', 'failed'),
  ]);

  const { data: oldest } = await supabase
    .from('lead_sync_outbox')
    .select('created_at')
    .in('status', ['pending', 'in_flight'])
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  // Anything not delivered and carrying an error. `dead` first: those have
  // stopped retrying and are the ones that actually need a human.
  const { data: failures } = await supabase
    .from('lead_sync_outbox')
    .select('id, contact_id, remote_id, status, attempts, max_attempts, last_error, last_attempt_at, next_attempt_at')
    .in('status', ['dead', 'failed', 'pending'])
    .not('last_error', 'is', null)
    .order('last_attempt_at', { ascending: false })
    .limit(failureLimit);

  const recentFailures: FailedDelivery[] = (failures ?? []).map((row) => {
    const { category, message } = classifyFailure(row.last_error as string | null);
    return {
      id: row.id as string,
      websiteSubmissionId: row.contact_id as string,
      remoteLeadId: (row.remote_id as string | null) ?? null,
      category,
      message: redact(message),
      attempts: (row.attempts as number) ?? 0,
      maxAttempts: (row.max_attempts as number) ?? 0,
      lastAttemptAt: (row.last_attempt_at as string | null) ?? null,
      nextAttemptAt: (row.next_attempt_at as string | null) ?? null,
      state: row.status === 'dead' ? 'dead' : 'retryable',
    };
  });

  return {
    outbox: {
      pending,
      processing,
      delivered,
      retryable: failed + pending,
      dead,
      oldestPendingAt: (oldest?.created_at as string | undefined) ?? null,
    },
    notifications: { emailSent, emailFailed, smsSkipped, smsSent, smsFailed },
    recentFailures,
    smsConfigured,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Re-arms a single outbox row so the next drain picks it up.
 *
 * Idempotent by construction: `idempotency_key` is never touched, so if the
 * lead did in fact reach the CRM, the retry gets a 409 back and is recorded as
 * delivered rather than creating a second lead. It only ever moves a row from
 * dead/failed to pending — it cannot create, edit or delete a lead on either
 * side.
 */
export async function requeueDelivery(id: string): Promise<{ ok: boolean; reason?: string }> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, reason: 'not_configured' };

  const { data: row, error } = await supabase
    .from('lead_sync_outbox')
    .select('id, status')
    .eq('id', id)
    .maybeSingle();

  if (error || !row) return { ok: false, reason: 'not_found' };
  if (row.status === 'delivered') return { ok: false, reason: 'already_delivered' };

  const { error: updateError } = await supabase
    .from('lead_sync_outbox')
    .update({
      status: 'pending',
      attempts: 0,
      next_attempt_at: new Date().toISOString(),
      last_error: null,
    })
    .eq('id', id)
    // Guard against a race with a drain that delivered it in between.
    .neq('status', 'delivered');

  if (updateError) return { ok: false, reason: 'update_failed' };
  return { ok: true };
}
