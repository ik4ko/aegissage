'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getSnapshot() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

/** Server render always assumes motion; the client corrects on hydration. */
function getServerSnapshot() {
  return false;
}

/**
 * Whether the visitor has asked for reduced motion.
 *
 * This exists instead of motion's own `useReducedMotion` because that hook
 * initialises to `null` and, in this app's tree, never re-rendered once the
 * media query resolved — which left every scroll-reveal element stuck at
 * opacity 0 for reduced-motion users. Content invisible to the people most
 * likely to need it visible is the worst possible failure mode here.
 *
 * `useSyncExternalStore` reads the media query synchronously on the client and
 * subscribes to changes, so the value is correct on the first client render
 * and stays correct if the OS setting is toggled mid-session.
 *
 * There is also a CSS backstop in globals.css that forces [data-reveal]
 * visible under the same media query. That covers the single pre-hydration
 * frame and any future regression in this hook — belt and braces, because
 * this is an accessibility guarantee rather than a nicety.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
