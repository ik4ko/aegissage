import { NextResponse, type NextRequest } from 'next/server';

/**
 * Rate limiting for /api/contact.
 *
 * NOTE ON THE FILENAME: the build brief calls for `middleware.ts`. Next 16
 * deprecated that convention in favour of `proxy.ts` — same request-level
 * hook, same matcher config, new name. This is that file.
 *
 * Deliberately simple: an in-memory fixed window, per IP. On Vercel each
 * serverless instance keeps its own counter, so this is a speed bump against
 * casual abuse rather than a hard guarantee — combined with the form honeypot
 * it is proportionate for a contact form with no auth and no payments. If
 * volume ever justifies it, swap the Map for Upstash Redis; the shape of this
 * function does not need to change.
 *
 * There is no auth middleware in this app on purpose. Every public page must
 * work with zero signup friction.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
/** Entries older than this are dropped on the next sweep. */
const SWEEP_AFTER_MS = 10 * 60_000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_AFTER_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

function keyFor(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export default function proxy(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.next();

  const now = Date.now();
  sweep(now);

  const key = keyFor(req);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (bucket.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      {
        error:
          'That is a lot of messages in a short time. Give it a minute — or just call me, which is faster anyway.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'Cache-Control': 'no-store',
        },
      },
    );
  }

  bucket.count += 1;
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/contact'],
};
