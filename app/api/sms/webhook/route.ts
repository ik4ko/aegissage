import { NextResponse, type NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { normalizePhone, recordOptIn, recordOptOut } from '@/lib/notify/sms';
import { advisor, site } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Inbound SMS webhook — STOP / START / HELP.
 *
 * Twilio signs every request with the account auth token. Verifying that
 * signature is what stops anyone who learns this URL from opting arbitrary
 * numbers in or out. An unverified opt-out endpoint is a griefing tool; an
 * unverified opt-IN endpoint is a compliance incident.
 *
 * Carriers handle STOP at the network level for compliant senders, but the
 * suppression must ALSO be recorded here. Relying on the carrier alone means
 * our own database still believes the person is reachable.
 */

/** Twilio: HMAC-SHA1 of the full URL plus sorted POST params, base64. */
function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
  authToken: string,
): boolean {
  const data =
    url +
    Object.keys(params)
      .sort()
      .map((key) => key + params[key])
      .join('');

  const expected = createHmac('sha1', authToken).update(Buffer.from(data, 'utf8')).digest('base64');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function twiml(message: string | null): NextResponse {
  const body = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
  return new NextResponse(body, {
    status: 200,
    headers: { 'Content-Type': 'text/xml', 'Cache-Control': 'no-store' },
  });
}

const STOP_WORDS = ['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit', 'revoke'];
const START_WORDS = ['start', 'unstop', 'yes'];
const HELP_WORDS = ['help', 'info'];

export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const signature = req.headers.get('x-twilio-signature');

  // Fail closed. Without a token configured there is no way to establish that
  // a request is genuinely from Twilio, so nothing is acted on.
  if (!authToken || !signature) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') params[key] = value;
  }

  // Twilio signs the URL it was configured with. Behind Vercel's proxy the
  // inbound protocol can appear as http, so normalise to https.
  const url = req.nextUrl.href.replace(/^http:/, 'https:');

  if (!verifyTwilioSignature(url, params, signature, authToken)) {
    console.warn('[sms-webhook] signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const from = normalizePhone(params.From ?? null);
  const keyword = (params.Body ?? '').trim().toLowerCase();

  if (!from) return twiml(null);

  if (STOP_WORDS.includes(keyword)) {
    await recordOptOut(from, 'stop_keyword');
    // Carriers usually send their own STOP confirmation; returning empty
    // TwiML avoids a duplicate message to someone who just asked for silence.
    return twiml(null);
  }

  if (START_WORDS.includes(keyword)) {
    await recordOptIn(from);
    return twiml(
      `You're re-subscribed to messages from ${advisor.firstName} at ${site.name}. Reply STOP to opt out.`,
    );
  }

  if (HELP_WORDS.includes(keyword)) {
    return twiml(
      `${site.name}: Medicare help from ${advisor.name}. Call or text ${advisor.phone}. ` +
        'Msg&data rates may apply. Reply STOP to opt out.',
    );
  }

  // Any other inbound text is a real person replying. Do not auto-answer
  // Medicare questions — that is a human's job, and an automated reply here
  // would be an unsolicited message on top of it.
  return twiml(null);
}
