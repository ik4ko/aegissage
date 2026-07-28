import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { runLeadDigest } from '@/lib/notify/lead-digest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Lead-health digest, on demand.
 *
 * The daily Vercel cron does not call this route — Hobby allows exactly one
 * cron entry, and that slot belongs to /api/internal/sync-leads, which runs
 * the digest itself once the drain has finished. Draining first matters: a
 * lead that the sweep successfully delivers must not then be reported as
 * broken.
 *
 * This route exists so the digest can be evaluated, dry-run, or re-driven by
 * hand during an incident without waiting a day for the cron.
 *
 * Authorisation is CRON_SECRET, the same credential that guards the drain
 * worker — this performs the same class of internal operation. Unset means
 * disabled, not open.
 *
 * `?dryRun=1` evaluates and renders without sending anything and without
 * claiming a dedupe key, so it is safe to call repeatedly.
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header =
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    req.headers.get('x-cron-secret') ??
    '';

  const a = Buffer.from(header, 'utf8');
  const b = Buffer.from(secret, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get('dryRun') === '1';

  try {
    const result = await runLeadDigest({ dryRun });
    // Counts and reasons only. No lead identity is ever returned over HTTP —
    // the personal details go to the advisor's inbox and nowhere else.
    return NextResponse.json(result);
  } catch (err) {
    console.error('[lead-digest] failed:', err);
    return NextResponse.json({ error: 'Digest failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
