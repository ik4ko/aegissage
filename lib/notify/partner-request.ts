import { Resend } from 'resend';
import { signPayload } from '@/lib/crm/contract';
import { site } from '@/lib/site';
import { ORGANIZATION_TYPES, REQUEST_KINDS, type PartnerRequest } from '@/lib/validations/partner-request';

/**
 * Delivers an organization request two ways, independently:
 *
 *   1. Email to Erekle (same Resend setup as contact alerts):
 *        RESEND_API_KEY, NOTIFY_EMAIL_TO, NOTIFY_EMAIL_FROM (optional)
 *   2. A signed POST to the Google Sheet's Apps Script web app, which appends
 *      a row to the "Partner Requests" tab (docs/partners/partner-requests-sheet.md):
 *        PARTNER_REQUESTS_WEBHOOK_URL, PARTNER_REQUESTS_WEBHOOK_SECRET
 *
 * Either can be missing; the other still runs, and the result says which
 * channels were skipped so the route can log it. Server-only.
 */

export type ChannelResult = { channel: 'email' | 'sheet'; status: 'sent' | 'skipped' | 'failed'; detail?: string };

const label = <T extends { value: string; label: string }>(list: readonly T[], value: string) =>
  list.find((item) => item.value === value)?.label ?? value;

export function summarizePartnerRequest(req: PartnerRequest, receivedAt: string): string {
  return [
    `New organization request (${receivedAt})`,
    '',
    `Organization: ${req.organization}`,
    `Type: ${label(ORGANIZATION_TYPES, req.organizationType)}`,
    `Town: ${req.town}`,
    `Contact: ${req.contactName}${req.role ? `, ${req.role}` : ''}`,
    `Email: ${req.email}`,
    `Phone: ${req.phone || '(not given)'}`,
    `Asking for: ${req.requests.map((r) => label(REQUEST_KINDS, r)).join('; ')}`,
    `Timing: ${req.timing || '(not given)'}`,
    `Sent from: ${req.sourcePage || '(unknown page)'}`,
    '',
    req.message ? `Message:\n${req.message}` : 'Message: (none)',
    '',
    'Reminder: education only, no plan names, no lists. Any one-on-one plan talk needs a recorded Scope of Appointment first.',
  ].join('\n');
}

async function sendEmail(text: string, req: PartnerRequest): Promise<ChannelResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.NOTIFY_EMAIL_FROM ?? `AegisSage <notifications@${site.domain}>`;
  if (!apiKey || !to) return { channel: 'email', status: 'skipped', detail: 'RESEND_API_KEY or NOTIFY_EMAIL_TO not set' };
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: to.split(',').map((t) => t.trim()),
      replyTo: req.email,
      subject: `Organization request — ${req.organization} (${req.town})`,
      text,
    });
    return error ? { channel: 'email', status: 'failed', detail: error.message } : { channel: 'email', status: 'sent' };
  } catch (error) {
    return { channel: 'email', status: 'failed', detail: String(error) };
  }
}

async function postToSheet(req: PartnerRequest, receivedAt: string): Promise<ChannelResult> {
  const url = process.env.PARTNER_REQUESTS_WEBHOOK_URL;
  const secret = process.env.PARTNER_REQUESTS_WEBHOOK_SECRET;
  if (!url || !secret) return { channel: 'sheet', status: 'skipped', detail: 'PARTNER_REQUESTS_WEBHOOK_URL or _SECRET not set' };
  const body = JSON.stringify({
    kind: 'partner_request',
    receivedAt,
    organization: req.organization,
    organizationType: label(ORGANIZATION_TYPES, req.organizationType),
    town: req.town,
    contactName: req.contactName,
    role: req.role,
    email: req.email,
    phone: req.phone,
    requests: req.requests.map((r) => label(REQUEST_KINDS, r)).join('; '),
    timing: req.timing,
    message: req.message,
    sourcePage: req.sourcePage,
  });
  /*
    Apps Script web apps cannot read request headers, so the signature travels
    in the body: { payload: "<raw JSON>", timestamp, signature }. The script
    recomputes HMAC-SHA256 over `${timestamp}.${payload}` (same scheme as
    lib/crm/contract.ts, timestamp in milliseconds) and rejects a mismatch or
    anything older than 5 minutes.
  */
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

export async function deliverPartnerRequest(req: PartnerRequest): Promise<ChannelResult[]> {
  const receivedAt = new Date().toISOString();
  const text = summarizePartnerRequest(req, receivedAt);
  return Promise.all([sendEmail(text, req), postToSheet(req, receivedAt)]);
}
