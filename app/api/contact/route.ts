import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations/contact';
import { getServerSupabase } from '@/lib/supabase/server';
import { sendContactAlert } from '@/lib/notify/send-contact-alert';
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

  const { error } = await supabase.from('contacts').insert({
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
  });

  if (error) {
    console.error('[contact] Supabase insert failed:', error.message);
    // Still try to notify — a dropped row is bad, a dropped person is worse.
    await sendContactAlert(payload);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }

  // Notification failures are logged inside sendContactAlert and never fail
  // the request: the submission is already durably stored at this point.
  await sendContactAlert(payload);

  return NextResponse.json({ ok: true, persisted: true });
}

/**
 * Bump this whenever the consent language in <ContactForm /> changes, so each
 * stored row records which wording the visitor actually agreed to.
 */
const CONSENT_TEXT_VERSION = '2026-01';
