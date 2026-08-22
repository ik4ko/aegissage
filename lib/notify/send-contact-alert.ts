import 'server-only';

import { Resend } from 'resend';
import { advisor, site } from '@/lib/site';
import { type LeadScore } from '@/lib/lead-score';
import { describeQuizAnswers, QUIZ_QUESTION_IDS } from '@/lib/validations/quiz';
import type { ContactPayload } from '@/lib/validations/contact';

/**
 * Real-time alert to the advisor when someone reaches out.
 *
 * Both channels degrade gracefully: if the credentials are not configured the
 * send is skipped and logged, but the code path is real — set the env vars and
 * it sends with no code change. Notification failure never fails the request;
 * the submission is already durably stored in Supabase by the time we get here.
 *
 * Env:
 *   RESEND_API_KEY, NOTIFY_EMAIL_FROM, NOTIFY_EMAIL_TO   — email alert
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
 *   TWILIO_FROM_NUMBER, NOTIFY_SMS_TO                    — SMS alert
 */

export type NotifyChannelResult = {
  channel: 'email' | 'sms';
  status: 'sent' | 'skipped' | 'failed';
  detail?: string;
  /** Provider-side id, so a delivery can be traced in Resend/Twilio later. */
  providerMessageId?: string;
};

/**
 * NOTE ON THE SMS IN THIS FILE
 *
 * `sendSms` below alerts the ADVISOR about a new lead. It reads NOTIFY_SMS_TO
 * — Erekle's own number — and is an internal notification, so no consumer
 * consent applies to it.
 *
 * It is not, and must never become, a path for texting the person who filled
 * in the form. Client-facing SMS lives in lib/notify/sms.ts, behind an
 * explicit consent check and an opt-out check. Keep the two separate.
 */

function summarize(
  payload: ContactPayload,
  meta: { submittedAt: string; leadScore?: LeadScore },
) {
  const lines = [
    meta.leadScore === 'A'
      ? `URGENT (A) — new contact from ${site.domain}`
      : `New contact from ${site.domain}`,
    '',
    `Priority:  ${meta.leadScore ?? '—'}`,
    `Name:      ${payload.name}`,
    `Email:     ${payload.email || '—'}`,
    `Phone:     ${payload.phone || '—'}`,
    `ZIP:       ${payload.zip || '—'}`,
    `Prefers:   ${payload.preferredContact}`,
    `Topic:     ${payload.topic ?? '—'}`,
    `Source:    ${payload.source}`,
    `Submitted: ${meta.submittedAt}`,
  ];

  /*
    Quiz answers are stored keyed by question id and valued by option value,
    so they are mapped back to the wording the person actually saw. Anything
    in `context` that is not a quiz answer — UTM keys, landing path, referrer,
    turns65 — is printed as-is underneath.
  */
  if (payload.context && Object.keys(payload.context).length > 0) {
    const quizLines = describeQuizAnswers(payload.context);
    if (quizLines.length > 0) {
      lines.push('', 'Eligibility check answers:');
      for (const line of quizLines) lines.push(`  ${line}`);
    }

    const rest = Object.entries(payload.context).filter(([key]) => !QUIZ_QUESTION_IDS.has(key));
    if (rest.length > 0) {
      lines.push('', 'Context:');
      for (const [key, value] of rest) lines.push(`  ${key}: ${value}`);
    }
  }

  if (payload.message) {
    lines.push('', 'Message:', payload.message);
  }

  return lines.join('\n');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendEmail(
  text: string,
  payload: ContactPayload,
  leadScore?: LeadScore,
): Promise<NotifyChannelResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.NOTIFY_EMAIL_FROM ?? `AegisSage <notifications@${site.domain}>`;

  if (!apiKey || !to) {
    return { channel: 'email', status: 'skipped', detail: 'RESEND_API_KEY or NOTIFY_EMAIL_TO not set' };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: to.split(',').map((t) => t.trim()),
      replyTo: payload.email || undefined,
      /*
        A leads are flagged in the SUBJECT, not just the body. The whole point
        of scoring is that an urgent one is not buried under three newsletter
        signups, and a body-only flag is invisible in an inbox list — which is
        exactly where the burying happens.
      */
      subject:
        leadScore === 'A'
          ? `[A] URGENT — ${payload.name} (${payload.preferredContact}) — AegisSage`
          : `New AegisSage contact — ${payload.name} (${payload.preferredContact})`,
      text,
      html: `<pre style="font:15px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
    });
    if (error) {
      return { channel: 'email', status: 'failed', detail: error.message };
    }
    return { channel: 'email', status: 'sent', providerMessageId: data?.id };
  } catch (err) {
    return {
      channel: 'email',
      status: 'failed',
      detail: err instanceof Error ? err.message : 'unknown error',
    };
  }
}

async function sendSms(payload: ContactPayload): Promise<NotifyChannelResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.NOTIFY_SMS_TO;

  if (!sid || !token || !from || !to) {
    return { channel: 'sms', status: 'skipped', detail: 'Twilio env vars or NOTIFY_SMS_TO not set' };
  }

  const reach = payload.phone || payload.email || 'no contact given';
  const body =
    `AegisSage: ${payload.name} asked you to reach out by ${payload.preferredContact}. ` +
    `${reach}${payload.zip ? ` (ZIP ${payload.zip})` : ''}. Source: ${payload.source}.`;

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body.slice(0, 320) }),
    });

    if (!res.ok) {
      return { channel: 'sms', status: 'failed', detail: `Twilio responded ${res.status}` };
    }
    return { channel: 'sms', status: 'sent' };
  } catch (err) {
    return {
      channel: 'sms',
      status: 'failed',
      detail: err instanceof Error ? err.message : 'unknown error',
    };
  }
}

export async function sendContactAlert(
  payload: ContactPayload,
  leadScore?: LeadScore,
): Promise<NotifyChannelResult[]> {
  const submittedAt = new Date().toISOString();
  const text = summarize(payload, { submittedAt, leadScore });

  const results = await Promise.all([sendEmail(text, payload, leadScore), sendSms(payload)]);

  for (const result of results) {
    if (result.status === 'failed') {
      console.error(`[contact-alert] ${result.channel} failed: ${result.detail}`);
    } else if (result.status === 'skipped') {
      console.warn(
        `[contact-alert] ${result.channel} skipped (${result.detail}). ` +
          `Submission is stored; notify ${advisor.name} manually until configured.`,
      );
    }
  }

  return results;
}
