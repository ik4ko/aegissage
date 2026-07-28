'use client';

import { useEffect, useRef } from 'react';
import { captureAttribution, getAttribution } from '@/lib/attribution';
import { trackSessionStart } from '@/lib/analytics';

/**
 * Records first-touch attribution once per session.
 *
 * Mounted in the root layout. Renders nothing, blocks nothing, and runs in an
 * effect so it never delays paint — it is strictly after-the-fact bookkeeping.
 *
 * The ref guard matters: React 19 Strict Mode runs effects twice in
 * development, and without it every dev session would emit two session_start
 * events and skew local numbers.
 */
export function AttributionCapture() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    captureAttribution();

    // Emit once per session, not once per navigation.
    try {
      const FLAG = 'aegissage:session-tracked';
      if (!window.sessionStorage.getItem(FLAG)) {
        window.sessionStorage.setItem(FLAG, '1');
        trackSessionStart(getAttribution());
      }
    } catch {
      // Storage unavailable — skip the event rather than double-count.
    }
  }, []);

  return null;
}
