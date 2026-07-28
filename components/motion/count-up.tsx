'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

/** A small, dependency-free counter for the few numeric proof points on the site. */
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(0);

  /**
   * Under reduced motion the final value is derived, not stored. Writing it
   * into state from an effect meant the counter rendered "0" for a frame
   * before correcting itself — the one thing a reduced-motion user should
   * never see from a component whose whole job is optional animation.
   */
  const display = reduced ? value : current;

  useEffect(() => {
    if (reduced) return;

    const element = ref.current;
    if (!element) return;

    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / 600, 1);
        setCurrent(Math.round(value * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.35 });

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduced, value]);

  return <span ref={ref} aria-label={`${value}${suffix}`}>{display}{suffix}</span>;
}
