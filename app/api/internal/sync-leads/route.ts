import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { syncPendingLeads } from '@/lib/crm/dispatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Outbox drain worker.
 *
 * Called on a schedule (Vercel Cron) or manually during an incident. It is not
 * a public endpoint: without a matching CRON_SECRET it returns 401 and does
 * nothing.
 *
 * Deliberately returns only counts. An unauthenticated prober learns nothing
 * about lead volume, and even an authenticated caller gets no lead content —
 * this is an operational health check, not a data read.
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // No secret configured = endpoint disabled. Failing closed is the only safe
  // default for something that talks to another system.
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

  try {
    const result = await syncPendingLeads(25);

    if (!result.configured) {
      return NextResponse.json({
        ok: true,
        configured: false,
        note:
          'CRM_INGEST_URL / CRM_INGEST_SECRET are not set. Leads remain queued ' +
          'in lead_sync_outbox and will drain once the bridge is configured.',
      });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[sync-leads] worker failed:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
