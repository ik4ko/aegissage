import 'server-only';
import { getServerSupabase } from '@/lib/supabase/server';
import { advisor, site } from '@/lib/site';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  SMS — provider abstraction and consent gate
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── The one rule ──────────────────────────────────────────────────────────
 * A client-facing SMS requires explicit, attributable, standalone consent.
 * SMS consent is NEVER inferred from:
 *
 *   • the presence of a phone number
 *   • `preferred_contact = 'text'`
 *   • the general contact-form consent
 *   • a prior submission under older wording
 *
 * `sendClientSms` enforces this by requiring the caller to pass a consent
 * record it then re-verifies against the database, plus an opt-out check. It
 * cannot be called in a way that skips either.
 *
 * ── Internal vs client ────────────────────────────────────────────────────
 * `sendInternalSms` alerts the advisor about his own leads. It needs no
 * consumer consent, uses a DIFFERENT destination env var, and shares no code
 * path with the client sender. Conflating the two is precisely how a system
 * ends up texting a beneficiary who never opted in, so they are kept apart
 * deliberately — do not "simplify" them into one function.
 *
 * ── Current state ─────────────────────────────────────────────────────────
 * Twilio credentials are not configured. Every function below no-ops safely
 * and reports `skipped`. Nothing here will send a message to anyone until
 * TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and the relevant destination are set.
 */

export type SmsResult = {
  status: 'sent' | 'skipped' | 'failed';
  providerMessageId?: string;
  reason?: string;
};

const RATE_LIMIT_PER_NUMBER_PER_DAY = 3;

function twilioConfig() {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  return sid && token && from ? { sid, token, from } : null;
}

/** E.164 normalisation. Returns null for anything that is not a US 10-digit. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '').replace(/^1/, '');
  return digits.length === 10 ? `+1${digits}` : null;
}

/**
 * Required disclosure appended to the FIRST client message.
 *
 * Identifies the sender, states that messages may be automated, notes that
 * rates may apply, and gives STOP/HELP. These are not optional garnish — they
 * are the disclosures that make an automated message lawful.
 */
export function clientSmsFooter(): string {
  return `— ${advisor.firstName} at ${site.name}. Msgs may be automated. Msg&data rates may apply. Reply STOP to opt out, HELP for help.`;
}

async function postToTwilio(to: string, body: string): Promise<SmsResult> {
  const cfg = twilioConfig();
  if (!cfg) return { status: 'skipped', reason: 'twilio_not_configured' };

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${cfg.sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${cfg.sid}:${cfg.token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: cfg.from, Body: body }),
        cache: 'no-store',
      },
    );

    const data = (await res.json().catch(() => ({}))) as { sid?: string; message?: string };
    if (!res.ok) {
      return { status: 'failed', reason: data.message ?? `HTTP ${res.status}` };
    }
    return { status: 'sent', providerMessageId: data.sid };
  } catch (err) {
    return { status: 'failed', reason: err instanceof Error ? err.message : 'network error' };
  }
}

/** True if this number has opted out and has not since opted back in. */
export async function isOptedOut(phoneE164: string): Promise<boolean> {
  const supabase = getServerSupabase();
  if (!supabase) return true; // Fail closed. No database = no sending.

  const { data, error } = await supabase
    .from('sms_opt_outs')
    .select('opted_in_again_at')
    .eq('phone', phoneE164)
    .maybeSingle();

  if (error) {
    console.error('[sms] opt-out lookup failed:', error.message);
    return true; // Fail closed on error, always.
  }
  if (!data) return false;
  return data.opted_in_again_at === null;
}

async function withinRateLimit(phoneE164: string): Promise<boolean> {
  const supabase = getServerSupabase();
  if (!supabase) return false;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from('notification_deliveries')
    .select('id', { count: 'exact', head: true })
    .eq('channel', 'sms')
    .eq('audience', 'client')
    // `destination`, NOT provider_message_id — that column holds the Twilio
    // message SID, so matching a phone number against it never matched
    // anything and this limit silently allowed unlimited sends.
    .eq('destination', phoneE164)
    .gte('created_at', since);

  if (error) return false;
  return (count ?? 0) < RATE_LIMIT_PER_NUMBER_PER_DAY;
}

/**
 * Sends a client-facing SMS, or refuses.
 *
 * Every gate must pass: a valid number, a stored `consent_sms = true` on the
 * contact row, no active opt-out, and the daily rate limit. The consent check
 * reads the database rather than trusting the caller — a caller that has
 * already made a mistake should not be able to talk this into sending.
 */
export async function sendClientSms(opts: {
  contactId: string;
  to: string | null;
  body: string;
  purpose: string;
}): Promise<SmsResult> {
  const supabase = getServerSupabase();
  const to = normalizePhone(opts.to);

  if (!to) return { status: 'skipped', reason: 'no_valid_phone' };
  if (!supabase) return { status: 'skipped', reason: 'no_database' };

  // Re-verify consent at send time, from the record, every time.
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('consent_sms, consent_sms_at, consent_sms_text_version')
    .eq('id', opts.contactId)
    .maybeSingle();

  if (error || !contact) return { status: 'skipped', reason: 'contact_not_found' };
  if (contact.consent_sms !== true) {
    return { status: 'skipped', reason: 'no_sms_consent' };
  }

  if (await isOptedOut(to)) return { status: 'skipped', reason: 'opted_out' };
  if (!(await withinRateLimit(to))) return { status: 'skipped', reason: 'rate_limited' };

  const result = await postToTwilio(to, `${opts.body}\n\n${clientSmsFooter()}`);

  await supabase.from('notification_deliveries').insert({
    contact_id: opts.contactId,
    channel: 'sms',
    audience: 'client',
    purpose: opts.purpose,
    status: result.status === 'sent' ? 'sent' : result.status === 'failed' ? 'failed' : 'skipped',
    provider: 'twilio',
    provider_message_id: result.providerMessageId ?? null,
    // What the rate limiter counts. Must be the normalised number, not the SID.
    destination: to,
    last_error: result.reason ?? null,
    // A client message must always name the consent that permitted it. The
    // database constraint enforces this too.
    consent_basis: `consent_sms@${contact.consent_sms_text_version ?? 'unknown'}`,
    sent_at: result.status === 'sent' ? new Date().toISOString() : null,
    failed_at: result.status === 'failed' ? new Date().toISOString() : null,
  });

  return result;
}

/**
 * Alerts the advisor about activity on his own site.
 *
 * No consumer consent is involved and none is checked — this messages Eric,
 * not a beneficiary. It reads NOTIFY_SMS_TO, which is deliberately a
 * different variable from TWILIO_FROM_NUMBER and from any client destination,
 * so an internal alert can never be addressed to a client by configuration
 * error.
 */
export async function sendInternalSms(body: string, purpose: string): Promise<SmsResult> {
  const to = normalizePhone(process.env.NOTIFY_SMS_TO ?? null);
  if (!to) return { status: 'skipped', reason: 'no_internal_destination' };

  const result = await postToTwilio(to, body);

  const supabase = getServerSupabase();
  if (supabase) {
    await supabase.from('notification_deliveries').insert({
      contact_id: null,
      channel: 'sms',
      audience: 'internal',
      purpose,
      status: result.status === 'sent' ? 'sent' : result.status === 'failed' ? 'failed' : 'skipped',
      provider: 'twilio',
      provider_message_id: result.providerMessageId ?? null,
      destination: to,
      last_error: result.reason ?? null,
      consent_basis: null, // Internal audience: no consumer consent applies.
      sent_at: result.status === 'sent' ? new Date().toISOString() : null,
      failed_at: result.status === 'failed' ? new Date().toISOString() : null,
    });
  }

  return result;
}

/** Records a STOP. Idempotent — repeating STOP keeps them suppressed. */
export async function recordOptOut(phoneE164: string, reason = 'stop_keyword'): Promise<void> {
  const supabase = getServerSupabase();
  if (!supabase) return;

  await supabase
    .from('sms_opt_outs')
    .upsert(
      { phone: phoneE164, reason, opted_out_at: new Date().toISOString(), opted_in_again_at: null },
      { onConflict: 'phone' },
    );
}

/** Records a START. The row is kept so the opt-out history survives. */
export async function recordOptIn(phoneE164: string): Promise<void> {
  const supabase = getServerSupabase();
  if (!supabase) return;

  await supabase
    .from('sms_opt_outs')
    .update({ opted_in_again_at: new Date().toISOString() })
    .eq('phone', phoneE164);
}
