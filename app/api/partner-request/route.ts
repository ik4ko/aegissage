import { NextResponse } from 'next/server';
import { partnerRequestSchema } from '@/lib/validations/partner-request';
import { deliverPartnerRequest } from '@/lib/notify/partner-request';
import { advisor } from '@/lib/site';

/**
 * POST /api/partner-request: organization requests from /partners and the
 * /for-organizations pages. Emails Erekle and appends a row to the
 * "Partner Requests" Sheet tab (lib/notify/partner-request.ts).
 *
 * Nothing about a senior is accepted (lib/validations/partner-request.ts).
 * The request is not stored anywhere else; if both channels are unconfigured
 * the visitor is told to call, so a request is never silently lost.
 */

const GENERIC_ERROR = `Something went wrong sending that. Please email or call ${advisor.phone} and I will set it up.`;

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Could not read that request.' }, { status: 400 });
  }

  const parsed = partnerRequestSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? 'Please check the form.', field: first?.path?.[0] ?? null },
      { status: 400 },
    );
  }

  // Honeypot: return 200 so a bot learns nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const results = await deliverPartnerRequest(parsed.data);
  for (const r of results) {
    if (r.status !== 'sent') console.warn(`[partner-request] ${r.channel} ${r.status}: ${r.detail ?? ''}`);
  }
  if (!results.some((r) => r.status === 'sent')) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
