import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getDeliveryHealth, requeueDelivery } from '@/lib/crm/health';
import { syncPendingLeads } from '@/lib/crm/dispatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Lead-operations health, read by the Agent Factory operator dashboard.
 *
 * ── Authentication ────────────────────────────────────────────────────────
 * A dedicated bearer secret, `LEAD_HEALTH_TOKEN`, deliberately separate from
 * both `CRON_SECRET` and `CRM_INGEST_SECRET`. Three different jobs, three
 * different credentials: rotating or leaking the health token must not grant
 * the ability to drive the drain worker or to forge a lead into the CRM.
 *
 * Without the variable set the endpoint is disabled, not open. That is the
 * only safe default for something that reads operational data.
 *
 * ── What this is NOT ──────────────────────────────────────────────────────
 * This does not expose the website's Supabase service-role key to anything.
 * The key stays in this process; the caller receives counts and sanitised
 * failure records and nothing else. No lead PII crosses this boundary — see
 * the note in lib/crm/health.ts.
 *
 * The browser never calls this. The Agent Factory dashboard hits its own
 * operator-gated route, which calls this server-to-server.
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.LEAD_HEALTH_TOKEN?.trim();
  // Not configured = disabled. Fail closed.
  if (!secret) return false;

  const header =
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    req.headers.get('x-lead-health-token') ??
    '';

  const a = Buffer.from(header, 'utf8');
  const b = Buffer.from(secret, 'utf8');
  // Length check first: timingSafeEqual throws on a length mismatch.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Identical body for "no token" and "wrong token" — probing learns nothing. */
const DENIED = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!authorized(req)) return DENIED;

  const health = await getDeliveryHealth();
  if (!health) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }
  return NextResponse.json(health, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

/**
 * Operator retry.
 *
 * Re-arms one outbox row and immediately runs a drain so the operator sees the
 * result rather than waiting for the daily cron. Safe to press twice: the
 * idempotency key is unchanged, so a delivery that already landed comes back
 * as a 409 and is recorded as delivered instead of creating a second lead.
 */
export async function POST(req: NextRequest) {
  if (!authorized(req)) return DENIED;

  const body = (await req.json().catch(() => null)) as { action?: string; id?: string } | null;

  if (body?.action !== 'retry' || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'Expected { action: "retry", id }' }, { status: 400 });
  }
  // Reject anything that is not a uuid before it reaches the database.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const requeued = await requeueDelivery(body.id);
  if (!requeued.ok) {
    const status = requeued.reason === 'not_found' ? 404 : 409;
    return NextResponse.json({ error: requeued.reason ?? 'retry_failed' }, { status });
  }

  // Drain now so the operator gets a real answer from one click.
  const result = await syncPendingLeads(5);

  return NextResponse.json({ ok: true, requeued: body.id, sync: result });
}
