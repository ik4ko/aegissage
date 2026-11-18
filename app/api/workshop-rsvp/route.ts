import { NextResponse } from 'next/server';
import { deliverWorkshopRsvp } from '@/lib/notify/workshop-rsvp';
import { advisor } from '@/lib/site';
import { getWorkshop, upcomingWorkshops } from '@/lib/workshops';
import { RSVP_ANY_SESSION, workshopRsvpSchema } from '@/lib/validations/workshop-rsvp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/workshop-rsvp: RSVPs from /workshops. Stores the RSVP with its
 * consent record, emails Erekle and appends a row to the "Workshops" Sheet
 * tab (lib/notify/workshop-rsvp.ts). If nothing could store or deliver it,
 * the visitor is told to call, so an RSVP is never silently lost.
 */

const GENERIC_ERROR = `Something went wrong saving that. Please call or text ${advisor.phone} and I will hold your seat.`;

function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Could not read that request.' }, { status: 400 });
  }

  const parsed = workshopRsvpSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? 'Please check the form.', field: first?.path?.[0] ?? null },
      { status: 400 },
    );
  }

  // Honeypot: return 200 so a bot learns nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const { workshopId } = parsed.data;
  if (workshopId !== RSVP_ANY_SESSION) {
    const workshop = getWorkshop(workshopId);
    const stillOpen = workshop && upcomingWorkshops().some((w) => w.id === workshop.id);
    if (!stillOpen) {
      return NextResponse.json(
        { error: 'That session is no longer open. Please choose another, or call me.', field: 'workshopId' },
        { status: 400 },
      );
    }
  }

  const results = await deliverWorkshopRsvp(parsed.data, {
    userAgent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
    ip: clientIp(req),
  });
  for (const r of results) {
    if (r.status !== 'sent') console.warn(`[workshop-rsvp] ${r.channel} ${r.status}: ${r.detail ?? ''}`);
  }
  if (!results.some((r) => r.status === 'sent')) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
