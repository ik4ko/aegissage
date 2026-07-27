'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

/** A small, dependency-free counter for the few numeric proof points on the site. */
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setCurrent(value);
      return;
    }

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

  return <span ref={ref} aria-label={`${value}${suffix}`}>{current}{suffix}</span>;
}
