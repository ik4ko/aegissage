import { Resend } from 'resend';
import { signPayload } from '@/lib/crm/contract';
import { CONSENT_TEXT_VERSIONS, WORKSHOP_RSVP_SOURCE } from '@/lib/consent';
import { getServerSupabase } from '@/lib/supabase/server';
import { site } from '@/lib/site';
import { LANGUAGES, getWorkshop, workshopLabel } from '@/lib/workshops';
import { RSVP_ANY_SESSION, type WorkshopRsvp } from '@/lib/validations/workshop-rsvp';

/**
 * Delivers a workshop RSVP three ways, independently:
 *
 *   1. Supabase `contacts` (the durable record, with the consent row fields
 *      every lead carries: consent, consent_text_version, consent_at, the
 *      SMS consent exactly as ticked, user agent and IP). Append-only: an
 *      RSVP is always a new row.
 *   2. Email to Erekle (same Resend setup as contact alerts).
 *   3. A signed POST to the Sheet's Apps Script web app, which appends a row
 *      to the "Workshops" tab (docs/workshops/workshops-sheet.md):
 *        WORKSHOP_RSVP_WEBHOOK_URL, WORKSHOP_RSVP_WEBHOOK_SECRET
 *
 * Any one can be missing or fail; the route reports success if at least one
 * stored or delivered the RSVP. Server-only.
 */

export type ChannelResult = {
  channel: 'database' | 'email' | 'sheet';
  status: 'sent' | 'skipped' | 'failed';
  detail?: string;
};

const PARTS_LABEL = { yes: 'Yes', no: 'No', 'not-sure': 'Not sure' } as const;

export type RsvpMeta = { userAgent: string | null; ip: string };

export function sessionLabel(rsvp: WorkshopRsvp): string {
  if (rsvp.workshopId === RSVP_ANY_SESSION) {
    return `Next session near ${rsvp.town || '(town not given)'}`;
  }
  const workshop = getWorkshop(rsvp.workshopId);
  return workshop ? workshopLabel(workshop) : `Unknown session "${rsvp.workshopId}"`;
}

export function summarizeRsvp(rsvp: WorkshopRsvp, receivedAt: string): string {
  return [
    `New workshop RSVP (${receivedAt})`,
    '',
    `Session: ${sessionLabel(rsvp)}`,
    `Name: ${rsvp.name}`,
    `Phone: ${rsvp.phone || '(not given)'}`,
    `Email: ${rsvp.email || '(not given)'}`,
    `Attending: ${rsvp.attendees}`,
    `Language: ${LANGUAGES[rsvp.language].label}`,
    `Has Part A and Part B: ${PARTS_LABEL[rsvp.partsAB]}`,
    `Town: ${rsvp.town || '(not given)'}`,
    `Texting OK: ${rsvp.consentSms ? 'yes' : 'no'}`,
    `Consent version: ${CONSENT_TEXT_VERSIONS.workshopRsvp}`,
    `Sent from: ${rsvp.sourcePage || '/workshops'}`,
    '',
    'Reminder: educational session. No plan names and no applications at the talk. One-on-one plan help only after a recorded Scope of Appointment.',
  ].join('\n');
}

async function storeRow(rsvp: WorkshopRsvp, receivedAt: string, meta: RsvpMeta): Promise<ChannelResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { channel: 'database', status: 'skipped', detail: 'Supabase not configured' };
  const version = CONSENT_TEXT_VERSIONS.workshopRsvp;
  const base = {
    name: rsvp.name,
    email: rsvp.email || null,
    phone: rsvp.phone || null,
    zip: null,
    topic: null,
    preferred_contact: rsvp.phone ? 'phone' : 'email',
    message: `Workshop RSVP: ${sessionLabel(rsvp)}`,
    source: WORKSHOP_RSVP_SOURCE,
    context: {
      workshop_id: rsvp.workshopId,
      attendees: String(rsvp.attendees),
      language: rsvp.language,
      parts_ab: rsvp.partsAB,
      town: rsvp.town,
      source_url: rsvp.sourcePage || '/workshops',
    },
    consent: true,
    consent_text_version: version,
    user_agent: meta.userAgent,
    ip_address: meta.ip,
  };
  const consentColumns = {
    consent_at: receivedAt,
    consent_sms: rsvp.consentSms === true,
    consent_sms_at: rsvp.consentSms === true ? receivedAt : null,
    consent_sms_text_version: rsvp.consentSms === true ? version : null,
  };
  try {
    // Same fallback as /api/contact: if the later consent columns are not
    // migrated yet, the RSVP is still stored with its base consent fields.
    let { error } = await supabase.from('contacts').insert({ ...base, ...consentColumns });
    if (error) ({ error } = await supabase.from('contacts').insert(base));
    return error ? { channel: 'database', status: 'failed', detail: error.message } : { channel: 'database', status: 'sent' };
  } catch (error) {
    return { channel: 'database', status: 'failed', detail: String(error) };
  }
}

async function sendEmail(text: string, rsvp: WorkshopRsvp): Promise<ChannelResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.NOTIFY_EMAIL_FROM ?? `AegisSage <notifications@${site.domain}>`;
  if (!apiKey || !to) return { channel: 'email', status: 'skipped', detail: 'RESEND_API_KEY or NOTIFY_EMAIL_TO not set' };
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: to.split(',').map((t) => t.trim()),
      ...(rsvp.email ? { replyTo: rsvp.email } : {}),
      subject: `Workshop RSVP — ${rsvp.name} (${rsvp.attendees}) — ${sessionLabel(rsvp)}`.slice(0, 200),
      text,
    });
    return error ? { channel: 'email', status: 'failed', detail: error.message } : { channel: 'email', status: 'sent' };
  } catch (error) {
    return { channel: 'email', status: 'failed', detail: String(error) };
  }
}

async function postToSheet(rsvp: WorkshopRsvp, receivedAt: string): Promise<ChannelResult> {
  const url = process.env.WORKSHOP_RSVP_WEBHOOK_URL;
  const secret = process.env.WORKSHOP_RSVP_WEBHOOK_SECRET;
  if (!url || !secret) return { channel: 'sheet', status: 'skipped', detail: 'WORKSHOP_RSVP_WEBHOOK_URL or _SECRET not set' };
  const body = JSON.stringify({
    kind: 'workshop_rsvp',
    receivedAt,
    workshopId: rsvp.workshopId,
    session: sessionLabel(rsvp),
    name: rsvp.name,
    phone: rsvp.phone,
    email: rsvp.email,
    attendees: rsvp.attendees,
    language: LANGUAGES[rsvp.language].label,
    partsAB: PARTS_LABEL[rsvp.partsAB],
    town: rsvp.town,
    consentSms: rsvp.consentSms ? 'yes' : 'no',
    consentVersion: CONSENT_TEXT_VERSIONS.workshopRsvp,
    sourcePage: rsvp.sourcePage,
  });
  // Signature travels in the body (Apps Script cannot read headers); same
  // HMAC scheme as lib/notify/partner-request.ts.
  const timestamp = String(Date.now());
  const envelope = JSON.stringify({ payload: body, timestamp, signature: signPayload(body, timestamp, secret) });
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: envelope,
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    return res.ok ? { channel: 'sheet', status: 'sent' } : { channel: 'sheet', status: 'failed', detail: `HTTP ${res.status}` };
  } catch (error) {
    return { channel: 'sheet', status: 'failed', detail: String(error) };
  }
}

export async function deliverWorkshopRsvp(rsvp: WorkshopRsvp, meta: RsvpMeta): Promise<ChannelResult[]> {
  const receivedAt = new Date().toISOString();
  const text = summarizeRsvp(rsvp, receivedAt);
  return Promise.all([storeRow(rsvp, receivedAt, meta), sendEmail(text, rsvp), postToSheet(rsvp, receivedAt)]);
}
