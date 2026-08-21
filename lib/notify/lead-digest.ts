import 'server-only';
import { createHash } from 'node:crypto';
import { Resend } from 'resend';
import { getServerSupabase } from '@/lib/supabase/server';
import { classifyFailure, redact } from '@/lib/crm/health';
import { site } from '@/lib/site';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  DAILY LEAD-HEALTH DIGEST
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  The Bridge Health panel is pull-only: it tells Erekle something is broken
 *  the moment he looks. This tells him when he is not looking, which is the
 *  case that actually matters — a lead that failed to sync on Friday evening
 *  should not wait until he happens to open the dashboard on Monday.
 *
 *  ── Why this queries the database directly ────────────────────────────────
 *  lib/crm/health.ts deliberately returns NO personal data, because it feeds
 *  a cross-project endpoint the Agent Factory calls. This module has a
 *  different audience: one email, to the advisor's own inbox, about his own
 *  enquiries — the same destination and the same information the existing
 *  contact alert already sends him. So it reads what it needs, including the
 *  name and contact channel of a lead that never made it, because "delivery
 *  #3f9a failed" is not something a person can act on at 8am.
 *
 *  `classifyFailure` and `redact` are shared with health.ts so an operator
 *  sees the same wording in both places.
 *
 *  ── What it must never do ─────────────────────────────────────────────────
 *  Send when nothing is wrong. A daily "all good" email is trained-to-ignore
 *  within a fortnight, and then the one that matters is ignored too.
 */

/** A lead still unsent after this long has missed both after() and a cron. */
export const PENDING_ALERT_HOURS = 6;

const DIGEST_PURPOSE = 'lead-health-digest';
const DEDUPE_VERSION = 'v1';

/** Days before an unchanged, still-broken state is allowed to alert again. */
const RENEWED_ATTENTION_DAYS = 7;

export type DigestRow = {
  id: string;
  contactId: string;
  remoteId: string | null;
  status: string;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt: string | null;
  lastError: string | null;
  createdAt: string;
  /** From the outbox payload snapshot. Advisor-only, see the note above. */
  name: string | null;
  reach: string | null;
};

export type DigestInput = {
  rows: DigestRow[];
  emailFailures: number;
  now: Date;
};

export type DigestSelection = {
  shouldSend: boolean;
  reasons: string[];
  dead: DigestRow[];
  exhausted: DigestRow[];
  stalePending: DigestRow[];
  retrying: DigestRow[];
  emailFailures: number;
  oldestPendingHours: number | null;
};

// ── Selection ──────────────────────────────────────────────────────────────

/**
 * Decides whether anything here is worth an email, and sorts it into buckets.
 *
 * Pure and exported so it can be exercised against fixtures without a
 * database, a network, or a Resend key. See scripts/test-digest.mjs.
 */
export function selectDigestItems({ rows, emailFailures, now }: DigestInput): DigestSelection {
  const hoursSince = (iso: string) => (now.getTime() - new Date(iso).getTime()) / 3_600_000;

  const dead = rows.filter((r) => r.status === 'dead');
  // Exhausted but not yet marked dead — the worker has not swept it yet.
  const exhausted = rows.filter((r) => r.status !== 'dead' && r.attempts >= r.maxAttempts);
  const stalePending = rows.filter(
    (r) =>
      (r.status === 'pending' || r.status === 'in_flight') &&
      r.attempts < r.maxAttempts &&
      hoursSince(r.createdAt) >= PENDING_ALERT_HOURS,
  );
  // Failing but still inside its retry budget: reported for context, and on
  // its own never a reason to send.
  const retrying = rows.filter(
    (r) =>
      (r.status === 'pending' || r.status === 'failed') &&
      r.attempts > 0 &&
      r.attempts < r.maxAttempts &&
      !stalePending.includes(r),
  );

  const pendingAges = rows
    .filter((r) => r.status === 'pending' || r.status === 'in_flight')
    .map((r) => hoursSince(r.createdAt));
  const oldestPendingHours = pendingAges.length ? Math.max(...pendingAges) : null;

  const reasons: string[] = [];
  if (dead.length) reasons.push(`${dead.length} delivery(s) permanently failed`);
  if (exhausted.length) reasons.push(`${exhausted.length} delivery(s) out of retry attempts`);
  if (stalePending.length) {
    reasons.push(`${stalePending.length} lead(s) still unsent after ${PENDING_ALERT_HOURS}h`);
  }
  if (emailFailures > 0) reasons.push(`${emailFailures} advisor email notification(s) failed`);

  return {
    // `retrying` is deliberately not a trigger. A delivery inside its backoff
    // window is the system working, not a fault.
    shouldSend: dead.length + exhausted.length + stalePending.length > 0 || emailFailures > 0,
    reasons,
    dead,
    exhausted,
    stalePending,
    retrying,
    emailFailures,
    oldestPendingHours,
  };
}

// ── Deduplication ──────────────────────────────────────────────────────────

/**
 * A stable identity for "this exact alert".
 *
 * Built from the identity AND progress of every row being reported, so:
 *   • the same unchanged failures produce the same key and cannot re-alert
 *   • a new failure, or another attempt burned on an existing one, changes it
 *   • a resolved failure changes it
 *
 * ── No time component, deliberately ───────────────────────────────────────
 * The first version of this appended a floor(days / 7) bucket so an unchanged
 * failure could eventually re-alert. That was wrong, and the fixture tests
 * caught it: the bucket is a fixed grid, not a window since the last send, so
 * a failure that first alerted on day 6 of a bucket re-alerted the very next
 * day. "At most once a week" silently became "possibly twice in 24 hours".
 *
 * Renewed attention is handled where the information actually lives — against
 * the stored `sent_at` of the previous digest with this key. See
 * `shouldResend` below.
 */
export function digestDedupeKey(selection: DigestSelection): string {
  const signature = [...selection.dead, ...selection.exhausted, ...selection.stalePending]
    .map((r) => `${r.id}:${r.status}:${r.attempts}`)
    .sort()
    .join('|');

  const fingerprint = createHash('sha256')
    .update(`${signature}#email:${selection.emailFailures}`)
    .digest('hex')
    .slice(0, 24);

  return `${DIGEST_PURPOSE}:${DEDUPE_VERSION}:${fingerprint}`;
}

/**
 * Whether an already-sent digest for the same unchanged state may be sent
 * again. Measured from the actual send time, so the guarantee is a true
 * rolling window: one alert per unchanged failure set per
 * RENEWED_ATTENTION_DAYS, no matter when in the week it first fired.
 *
 * Without this, a dead row nobody ever touches would alert exactly once and
 * then go quiet forever, turning a forgotten lead into a permanently silent
 * one.
 */
export function shouldResend(sentAt: string | null, now: Date): boolean {
  if (!sentAt) return true;
  const days = (now.getTime() - new Date(sentAt).getTime()) / 86_400_000;
  return days >= RENEWED_ATTENTION_DAYS;
}

// ── Rendering ──────────────────────────────────────────────────────────────

function line(row: DigestRow): string {
  const { message } = classifyFailure(row.lastError);
  const who = row.name ? `${row.name}${row.reach ? ` · ${row.reach}` : ''}` : 'name unavailable';
  return [
    `  • ${who}`,
    `    submission ${row.contactId}`,
    row.remoteId ? `    CRM lead   ${row.remoteId}` : null,
    `    attempts   ${row.attempts}/${row.maxAttempts}`,
    `    last tried ${row.lastAttemptAt ?? 'never'}`,
    `    cause      ${redact(message)}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function renderDigestText(selection: DigestSelection, now: Date, inboxUrl: string): string {
  const parts: string[] = [
    `AegisSage — lead delivery needs attention`,
    ``,
    `Generated ${now.toISOString()}`,
    ``,
    `Why you are getting this:`,
    ...selection.reasons.map((r) => `  - ${r}`),
    ``,
    `Summary`,
    `  Permanently failed : ${selection.dead.length}`,
    `  Out of attempts    : ${selection.exhausted.length}`,
    `  Stuck pending      : ${selection.stalePending.length}`,
    `  Retrying normally  : ${selection.retrying.length}`,
    `  Failed advisor emails: ${selection.emailFailures}`,
    `  Oldest pending     : ${
      selection.oldestPendingHours === null
        ? 'none'
        : `${selection.oldestPendingHours.toFixed(1)}h`
    }`,
    ``,
  ];

  const section = (title: string, rows: DigestRow[]) => {
    if (!rows.length) return;
    parts.push(title, ...rows.map(line), ``);
  };

  section('Permanently failed — these will not retry on their own:', selection.dead);
  section('Out of retry attempts:', selection.exhausted);
  section(`Stuck pending for more than ${PENDING_ALERT_HOURS}h:`, selection.stalePending);

  parts.push(
    `What to do`,
    selection.dead.length + selection.exhausted.length > 0
      ? `  Open Bridge Health and press Retry on each failed delivery. If it fails\n  again with the same cause, the bridge configuration needs a look —\n  nothing will reach the CRM until it is fixed.`
      : `  Open Bridge Health and confirm these clear on the next sync.`,
    ``,
    `  ${inboxUrl}`,
    ``,
    `Every lead is still stored safely on the website. Nothing has been lost —`,
    `these are deliveries to the CRM that have not completed.`,
    ``,
    `— automated message from ${site.name}`,
  );

  return parts.join('\n');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Orchestration ──────────────────────────────────────────────────────────

export type DigestResult = {
  evaluated: true;
  shouldSend: boolean;
  reasons?: string[];
  dedupeKey?: string;
  sent: boolean;
  skipped?: 'nothing_wrong' | 'already_sent' | 'dry_run' | 'not_configured';
  error?: string;
};

/** Rows worth considering. Delivered rows are of no interest to an alert. */
async function loadRows(): Promise<DigestRow[] | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('lead_sync_outbox')
    .select('id, contact_id, remote_id, status, attempts, max_attempts, last_attempt_at, last_error, created_at, payload')
    .neq('status', 'delivered')
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) return null;

  return (data ?? []).map((row) => {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    const email = typeof payload.email === 'string' ? payload.email : null;
    const phone = typeof payload.phone === 'string' ? payload.phone : null;
    return {
      id: row.id as string,
      contactId: row.contact_id as string,
      remoteId: (row.remote_id as string | null) ?? null,
      status: row.status as string,
      attempts: (row.attempts as number) ?? 0,
      maxAttempts: (row.max_attempts as number) ?? 0,
      lastAttemptAt: (row.last_attempt_at as string | null) ?? null,
      lastError: (row.last_error as string | null) ?? null,
      createdAt: row.created_at as string,
      name: typeof payload.name === 'string' ? payload.name : null,
      reach: email ?? phone,
    };
  });
}

async function countFailedAdvisorEmails(sinceHours = 24): Promise<number> {
  const supabase = getServerSupabase();
  if (!supabase) return 0;
  const since = new Date(Date.now() - sinceHours * 3_600_000).toISOString();
  const { count } = await supabase
    .from('notification_deliveries')
    .select('id', { count: 'exact', head: true })
    .eq('channel', 'email')
    .eq('audience', 'internal')
    .eq('purpose', 'contact-alert')
    .in('status', ['failed', 'permanently_failed'])
    .gte('created_at', since);
  return count ?? 0;
}

/**
 * Evaluates health and, if warranted, sends exactly one digest.
 *
 * The claim-then-send ordering is what makes a double cron fire safe: the
 * dedupe row is inserted BEFORE Resend is called, so a second concurrent run
 * loses the unique-index race and stands down rather than sending a second
 * copy. If the send then fails, the row is marked failed and stays claimable
 * by a later run — a timeout costs a retry, not a lost alert.
 */
export async function runLeadDigest(options: { dryRun?: boolean } = {}): Promise<DigestResult> {
  const now = new Date();

  const rows = await loadRows();
  if (rows === null) {
    return { evaluated: true, shouldSend: false, sent: false, skipped: 'not_configured' };
  }

  const selection = selectDigestItems({
    rows,
    emailFailures: await countFailedAdvisorEmails(),
    now,
  });

  if (!selection.shouldSend) {
    return { evaluated: true, shouldSend: false, sent: false, skipped: 'nothing_wrong', reasons: [] };
  }

  const dedupeKey = digestDedupeKey(selection);

  if (options.dryRun) {
    return { evaluated: true, shouldSend: true, reasons: selection.reasons, dedupeKey, sent: false, skipped: 'dry_run' };
  }

  const supabase = getServerSupabase();
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_HEALTH_ALERT_TO?.trim() || process.env.NOTIFY_EMAIL_TO?.trim();
  const from = process.env.NOTIFY_EMAIL_FROM ?? `AegisSage <notifications@${site.domain}>`;

  if (!supabase || !apiKey || !to) {
    return { evaluated: true, shouldSend: true, reasons: selection.reasons, dedupeKey, sent: false, skipped: 'not_configured' };
  }

  // Claim first. A unique violation means another run already owns this alert.
  const { data: existing } = await supabase
    .from('notification_deliveries')
    .select('id, status, sent_at')
    .eq('dedupe_key', dedupeKey)
    .maybeSingle();

  const deliveryId: string | null = existing?.id ?? null;

  // Already alerted for exactly this state, and recently enough that saying it
  // again would be noise rather than news.
  if (existing?.status === 'sent' && !shouldResend(existing.sent_at as string | null, now)) {
    return { evaluated: true, shouldSend: true, reasons: selection.reasons, dedupeKey, sent: false, skipped: 'already_sent' };
  }

  let claimedId = deliveryId;

  if (!claimedId) {
    const { data: claimed, error: claimError } = await supabase
      .from('notification_deliveries')
      .insert({
        contact_id: null,
        channel: 'email',
        audience: 'internal',
        purpose: DIGEST_PURPOSE,
        status: 'queued',
        provider: 'resend',
        destination: to,
        dedupe_key: dedupeKey,
        consent_basis: null, // Internal audience — no consumer consent applies.
      })
      .select('id')
      .single();

    // 23505 = a concurrent run won the claim. Correct behaviour is to stop.
    if (claimError) {
      if (claimError.code === '23505') {
        return { evaluated: true, shouldSend: true, reasons: selection.reasons, dedupeKey, sent: false, skipped: 'already_sent' };
      }
      return { evaluated: true, shouldSend: true, reasons: selection.reasons, dedupeKey, sent: false, error: 'claim_failed' };
    }
    claimedId = claimed.id as string;
  }

  const inboxUrl = process.env.LEAD_INBOX_URL?.trim() || `${site.url}/contact`;
  const text = renderDigestText(selection, now, inboxUrl);
  const subject = `[AegisSage] ${selection.reasons[0] ?? 'Lead delivery needs attention'}`;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: to.split(',').map((t) => t.trim()),
      subject,
      text,
      html: `<pre style="font:14px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
    });

    if (error) throw new Error(error.message);

    await supabase
      .from('notification_deliveries')
      .update({
        status: 'sent',
        provider_message_id: data?.id ?? null,
        sent_at: new Date().toISOString(),
        last_error: null,
      })
      .eq('id', claimedId);

    return { evaluated: true, shouldSend: true, reasons: selection.reasons, dedupeKey, sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    // Recorded as failed and left claimable, so the next run can retry it.
    await supabase
      .from('notification_deliveries')
      .update({
        status: 'failed',
        failed_at: new Date().toISOString(),
        last_error: redact(message),
      })
      .eq('id', claimedId);

    console.error(`[lead-digest] send failed: ${message}`);
    return { evaluated: true, shouldSend: true, reasons: selection.reasons, dedupeKey, sent: false, error: 'send_failed' };
  }
}
