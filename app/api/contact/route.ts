import { NextResponse, after } from 'next/server';
import { contactSchema } from '@/lib/validations/contact';
import { getServerSupabase } from '@/lib/supabase/server';
import { sendContactAlert } from '@/lib/notify/send-contact-alert';
import { enqueueLeadSync } from '@/lib/crm/outbox';
import { syncPendingLeads } from '@/lib/crm/dispatch';
import { advisor } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The only write path in the app.
 *
 * Order of operations matters: validate, store, then notify. Storage is the
 * durable record, so a notification outage can never lose someone's request —
 * the row is already in Supabase and the failure is logged for follow-up.
 */

const GENERIC_ERROR = `Something went wrong saving that. Please call or text ${advisor.phone} — I do not want you stuck.`;

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? 'unknown';
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Could not read that submission.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? 'Please check the form and try again.' },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  // Honeypot: a bot filled the hidden field. Return 200 so it learns nothing.
  if (payload.website) {
    console.warn(`[contact] honeypot triggered from ${clientIp(req)}`);
    return NextResponse.json({ ok: true });
  }

  // Belt and braces — the schema requires consent, but this is the one
  // condition that must never be bypassed, so it is checked again here.
  if (payload.consent !== true) {
    return NextResponse.json(
      { error: 'Consent is required before I can contact you.' },
      { status: 400 },
    );
  }

  const supabase = getServerSupabase();

  if (!supabase) {
    // Not configured (local dev / preview without secrets). The submission
    // must not silently vanish, so it is logged and the alert still attempts.
    console.warn(
      '[contact] Supabase is not configured — submission not persisted. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
    await sendContactAlert(payload);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const now = new Date().toISOString();

  /*
    Granular consent is recorded exactly as given.

    `consent_sms` comes ONLY from its own unticked checkbox. It is never
    derived from `phone` being present or from preferredContact === 'text'.
    lib/notify/sms.ts re-reads this column at send time rather than trusting
    any caller, so there is no path that texts someone who did not tick it.
  */
  const { data: inserted, error } = await supabase
    .from('contacts')
    .insert({
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone || null,
      zip: payload.zip || null,
      topic: payload.topic ?? null,
      preferred_contact: payload.preferredContact,
      message: payload.message || null,
      source: payload.source,
      context: payload.context ?? null,

      consent: true,
      consent_at: now,
      consent_text_version: CONSENT_TEXT_VERSION,

      consent_sms: payload.consentSms === true,
      consent_sms_at: payload.consentSms === true ? now : null,
      consent_sms_text_version: payload.consentSms === true ? CONSENT_TEXT_VERSION : null,

      consent_marketing: payload.consentMarketing === true,
      consent_marketing_at: payload.consentMarketing === true ? now : null,
      consent_marketing_text_version:
        payload.consentMarketing === true ? CONSENT_TEXT_VERSION : null,

      user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
      ip_address: clientIp(req),
    })
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('[contact] Supabase insert failed:', error?.message);
    // Still try to notify — a dropped row is bad, a dropped person is worse.
    await sendContactAlert(payload);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }

  const contactId = inserted.id as string;

  /*
    Notification failures are logged inside sendContactAlert and never fail
    the request: the submission is already durably stored at this point. The
    outcome is now recorded on the row as well, so a silent Resend outage
    shows up as `notify_status = 'failed'` in the operational queue instead of
    disappearing into a log line nobody reads.
  */
  const alerts = await sendContactAlert(payload);
  const emailAlert = alerts.find((r) => r.channel === 'email');

  await supabase
    .from('contacts')
    .update({
      notify_status: emailAlert?.status ?? 'failed',
      notified_at: emailAlert?.status === 'sent' ? new Date().toISOString() : null,
    })
    .eq('id', contactId);

  // One audit row per channel attempted. Both are audience='internal': these
  // are alerts to the advisor, not messages to the person who submitted.
  await supabase.from('notification_deliveries').insert(
    alerts.map((result) => ({
      contact_id: contactId,
      channel: result.channel,
      audience: 'internal' as const,
      purpose: 'contact-alert',
      status: result.status === 'sent' ? 'sent' : result.status === 'failed' ? 'failed' : 'skipped',
      provider: result.channel === 'email' ? 'resend' : 'twilio',
      provider_message_id: result.providerMessageId ?? null,
      last_error: result.detail ?? null,
      consent_basis: null, // Internal audience — no consumer consent applies.
      sent_at: result.status === 'sent' ? new Date().toISOString() : null,
      failed_at: result.status === 'failed' ? new Date().toISOString() : null,
    })),
  );

  /*
    Queue the CRM handoff. Deliberately AFTER the durable write and the
    advisor alert, and deliberately non-blocking on failure: the visitor's
    submission is already safe, and a CRM that is unreachable must never turn
    into an error page for someone asking for help.
  */
  const queued = await enqueueLeadSync({
    contactId,
    submittedAt: now,
    name: payload.name,
    email: payload.email || null,
    phone: payload.phone || null,
    zip: payload.zip || null,
    preferredContact: payload.preferredContact,
    topic: payload.topic ?? null,
    message: payload.message || null,
    sourcePage: payload.source,
    attribution: extractAttribution(payload.context),
    consent: {
      reply: true,
      replyAt: now,
      replyTextVersion: CONSENT_TEXT_VERSION,
      sms: payload.consentSms === true,
      smsAt: payload.consentSms === true ? now : null,
      smsTextVersion: payload.consentSms === true ? CONSENT_TEXT_VERSION : null,
      marketing: payload.consentMarketing === true,
      marketingAt: payload.consentMarketing === true ? now : null,
      marketingTextVersion: payload.consentMarketing === true ? CONSENT_TEXT_VERSION : null,
    },
  });

  /*
    Drain the outbox immediately, AFTER the response is sent.

    `after()` runs once the response has been flushed, so the visitor never
    waits on a cross-project HTTP call — the same reason the delivery is not
    inline in the first place.

    This is the primary delivery path, not an optimisation. Vercel Hobby caps
    cron jobs at once per day, so relying on the scheduled sweep alone would
    leave a lead sitting for up to 24 hours. The cron remains as the retry
    safety net for anything that fails here.

    Failures are swallowed: the row is already durably queued, and the sweep
    will pick it up with proper backoff.
  */
  if (queued) {
    after(async () => {
      try {
        await syncPendingLeads(5);
      } catch (err) {
        console.error('[contact] post-response sync failed:', err);
      }
    });
  }

  return NextResponse.json({ ok: true, persisted: true });
}

/**
 * Pulls the attribution keys out of the submitted context.
 *
 * An allowlist, not a filter. `context` also carries page-supplied values
 * such as quiz answers, and those are not attribution — sending them across
 * a project boundary because they happened to share a field would be exactly
 * the kind of accidental leak the contract's prohibited-field check exists to
 * catch.
 */
const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'landing',
  'referrer',
];

function extractAttribution(context: Record<string, string> | undefined): Record<string, string> {
  if (!context) return {};
  const out: Record<string, string> = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = context[key];
    if (typeof value === 'string' && value) out[key] = value.slice(0, 80);
  }
  return out;
}

/**
 * Bump this whenever the consent language in <ContactForm /> changes, so each
 * stored row records which wording the visitor actually agreed to.
 */
const CONSENT_TEXT_VERSION = '2026-07';
