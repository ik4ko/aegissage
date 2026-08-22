'use client';

import { useEffect } from 'react';
import { trackNotFound } from '@/lib/analytics';

/**
 * Reports a 404 to the analytics layer, once per mount.
 *
 * ── Why this is a client component and not a server log ───────────────────
 * The first version logged from app/not-found.tsx using `headers()` with
 * `dynamic = 'force-dynamic'`. The root not-found sits in every route's tree,
 * so forcing it dynamic took the WHOLE SITE off static rendering: all 64
 * prerendered pages became per-request serverless invocations. The 404 signal
 * is worth having; it is not worth that.
 *
 * Firing from the client costs nothing, keeps not-found prerendered, and puts
 * the event in Vercel Analytics beside every other funnel event — queryable —
 * rather than in a log line someone has to go and grep. It also inherits
 * assertNoPii, which a console.log never did.
 */
export function NotFoundBeacon() {
  useEffect(() => {
    trackNotFound(window.location.pathname, document.referrer);
  }, []);

  return null;
}
