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
  /*
    ── Migration-tolerant write ──────────────────────────────────────────
    The granular-consent columns arrive with 20260727000000_lead_ops.sql. If
    that migration has not been applied to this environment yet, Postgres
    rejects the whole insert with 42703 (undefined_column) and the visitor
    sees an error — which is exactly what happened in production when the
    code shipped ahead of the migration.

    So the write is attempted with the full column set and falls back to the
    columns that have always existed. The contact form is the site's primary
    conversion path; it must not depend on migration ordering. Once the
    migration lands, the first branch succeeds and the fallback goes unused.

    The fallback loses only the granular consent COLUMNS, never the consent
    itself: `consent` is still required and recorded, and because SMS consent
    cannot be persisted in that state, lib/notify/sms.ts reads a missing/false
    value and refuses to send. Degrading here fails safe.
  */
  const baseRow = {
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
    consent_text_version: CONSENT_TEXT_VERSION,
    user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
    ip_address: clientIp(req),
  };

  const consentColumns = {
    consent_at: now,
    consent_sms: payload.consentSms === true,
    consent_sms_at: payload.consentSms === true ? now : null,
    consent_sms_text_version: payload.consentSms === true ? CONSENT_TEXT_VERSION : null,
    consent_marketing: payload.consentMarketing === true,
    consent_marketing_at: payload.consentMarketing === true ? now : null,
    consent_marketing_text_version:
      payload.consentMarketing === true ? CONSENT_TEXT_VERSION : null,
  };

  let inserted: { id: string } | null = null;
  let leadOpsAvailable = true;

  {
    const attempt = await supabase
      .from('contacts')
      .insert({ ...baseRow, ...consentColumns })
      .select('id')
      .single();

    if (attempt.error) {
      // 42703 = undefined_column, PGRST204 = column not in schema cache.
      const missingColumn =
        attempt.error.code === '42703' || attempt.error.code === 'PGRST204';

      if (!missingColumn) {
        console.error('[contact] Supabase insert failed:', attempt.error.message);
        await sendContactAlert(payload);
        return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
      }

      /*
        DEGRADED WRITE. This is an error, not a warning.

        Two real submissions were stored through this branch in July 2026 and
        nobody found out for three weeks, because this logged at warn level
        and the audit table that would have recorded the damage was skipped by
        the same condition that caused it.

        `LEAD_OPS_DEGRADED` is the marker to alert on. /api/internal/lead-health
        also probes the schema directly, so this state is visible without
        anyone reading logs at all.
      */
      console.error(
        '[contact] LEAD_OPS_DEGRADED — lead_ops migration not applied. Storing ' +
          'without granular consent columns. Consent itself is still recorded and ' +
          'SMS still fails closed, but CRM handoff and delivery auditing are ' +
          'unavailable until supabase/migrations/20260727000000_lead_ops.sql is ' +
          'applied.',
      );
      leadOpsAvailable = false;

      const fallback = await supabase.from('contacts').insert(baseRow).select('id').single();
      if (fallback.error || !fallback.data) {
        console.error('[contact] Supabase insert failed:', fallback.error?.message);
        await sendContactAlert(payload);
        return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
      }
      inserted = fallback.data as { id: string };
    } else {
      inserted = attempt.data as { id: string };
    }
  }

  if (!inserted) {
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

  /*
    ── Why none of this is gated any more ──────────────────────────────────

    All of the writes below used to sit inside `if (leadOpsAvailable)`. That
    put the DELIVERY AUDIT behind the same condition that breaks delivery —
    so when the lead_ops migration was missing, the system lost both the
    ability to hand a lead off AND the ability to record that it had failed
    to. Two leads sat undelivered and unreported for three weeks in July 2026
    because of exactly that.

    Each step now attempts independently and reports its own outcome. A
    missing table produces a loud, marked log line instead of silence. None
    of them can fail the request: the submission is already durably stored,
    and a broken CRM must never become an error page for someone asking for
    help with their Medicare.
  */
  function reportDegraded(step: string, detail: string | undefined): void {
    /*
      `cause` separates the two very different situations that land here.

      "migration-missing" is already explained by the LEAD_OPS_DEGRADED line
      logged at insert time — expected fallout, one fix.

      "unexpected" means the schema is fine and this step failed anyway: a
      Supabase outage, a policy change, a genuine bug. Same visible symptom,
      completely different investigation, so the log says which.
    */
    const cause = leadOpsAvailable ? 'unexpected' : 'migration-missing';
    console.error(
      `[contact] LEAD_OPS_DEGRADED step=${step} cause=${cause} contact=${contactId} — ` +
        `${detail ?? 'unknown error'}`,
    );
  }

  // Notification outcome on the row itself, so a Resend outage is visible as
  // notify_status='failed' in the operational queue rather than a log line.
  {
    const { error } = await supabase
      .from('contacts')
      .update({
        notify_status: emailAlert?.status ?? 'failed',
        notified_at: emailAlert?.status === 'sent' ? new Date().toISOString() : null,
      })
      .eq('id', contactId);
    if (error) reportDegraded('notify_status', error.message);
  }

  /*
    One audit row per channel attempted. Both are audience='internal': these
    are alerts to the advisor, not messages to the person who submitted.

    This is the record of whether Erekle was actually told about this lead. It
    is the single most important thing to write when something else is broken,
    which is why it is no longer conditional on anything.
  */
  {
    const { error } = await supabase.from('notification_deliveries').insert(
      alerts.map((result) => ({
        contact_id: contactId,
        channel: result.channel,
        audience: 'internal' as const,
        purpose: 'contact-alert',
        status:
          result.status === 'sent' ? 'sent' : result.status === 'failed' ? 'failed' : 'skipped',
        provider: result.channel === 'email' ? 'resend' : 'twilio',
        provider_message_id: result.providerMessageId ?? null,
        last_error: result.detail ?? null,
        consent_basis: null, // Internal audience — no consumer consent applies.
        sent_at: result.status === 'sent' ? new Date().toISOString() : null,
        failed_at: result.status === 'failed' ? new Date().toISOString() : null,
      })),
    );
    if (error) reportDegraded('notification_deliveries', error.message);
  }

  /*
    Queue the CRM handoff. Deliberately AFTER the durable write and the
    advisor alert, and deliberately non-blocking on failure.
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
    A lead that could not be queued is a lead the CRM will never receive, and
    the daily sweep cannot rescue it because there is no row to sweep. That is
    precisely the July 2026 failure, and it must be loud.
  */
  if (!queued) {
    reportDegraded('lead_sync_outbox', 'enqueueLeadSync returned false — lead not queued for CRM');
  }

  /*
    Drain the outbox immediately, AFTER the response is sent.

    `after()` runs once the response has been flushed, so the visitor never
    waits on a cross-project HTTP call.

    This is the primary delivery path, not an optimisation. Vercel Hobby caps
    cron jobs at once per day, so relying on the scheduled sweep alone would
    leave a lead sitting for up to 24 hours. The cron remains the retry safety
    net — but note that it is disabled entirely unless CRON_SECRET is set, so
    this path is the only one that runs until it is.
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
  'firstTouchDate',
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
