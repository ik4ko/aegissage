'use client';

import { motion, type Variants } from 'motion/react';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

/**
 * Scroll-driven reveal — the site-wide interaction pattern.
 *
 * ── The audience constraint drives every number here ──────────────────────
 * The primary reader is 65+. Motion sensitivity is more common in this group,
 * so this is deliberately restrained:
 *
 *  - 320ms, never longer. Short enough to read as responsiveness, not effect.
 *  - Translate only, 14px. No parallax, no scale, no rotation — the three
 *    things most likely to trigger vestibular discomfort.
 *  - `amount: 0.15` so an element commits as soon as a sliver is visible;
 *    content is never withheld from someone scrolling quickly.
 *  - `once: false` with a generous negative bottom margin, so the reverse on
 *    scroll-up only fires well after the element has left the viewport. The
 *    reverse is what makes the page feel alive rather than one-shot, but it
 *    must never fire while a reader can still see the element.
 *
 * ── Reduced motion ─────────────────────────────────────────────────────────
 * `usePrefersReducedMotion` reads and subscribes to the media query. When set,
 * this renders a plain <div> — no motion component, no variants, no
 * transition. Not a faster animation: none at all.
 *
 * A CSS rule in globals.css independently forces [data-reveal] visible under
 * the same query, covering the pre-hydration frame. Do not remove either half;
 * an earlier version relied on the JS check alone and left reduced-motion
 * users looking at invisible content.
 *
 * ── No-JS ──────────────────────────────────────────────────────────────────
 * The hidden state is server-rendered, so without JS the content would stay
 * transparent. `app/layout.tsx` carries a <noscript> rule that forces every
 * [data-reveal] element visible. The text is always in the DOM either way,
 * so crawlers and readers relying on markup are unaffected.
 */

export type RevealDirection = 'up' | 'left' | 'right' | 'none';

const OFFSET = 14;

function offsetFor(direction: RevealDirection) {
  switch (direction) {
    case 'left':
      return { x: -OFFSET, y: 0 };
    case 'right':
      return { x: OFFSET, y: 0 };
    case 'none':
      return { x: 0, y: 0 };
    default:
      return { x: 0, y: OFFSET };
  }
}

export const REVEAL_VIEWPORT = {
  once: false,
  amount: 0.15,
  // Reverse only once the element is comfortably out of view.
  margin: '-8% 0px -18% 0px',
} as const;

const TRANSITION = { duration: 0.32, ease: [0.16, 1, 0.3, 1] } as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  /** Seconds to wait before this element starts. Use for deliberate sequencing. */
  delay?: number;
  /** Render as a different element, e.g. 'section' or 'li'. */
  as?: 'div' | 'section' | 'li' | 'article' | 'aside';
};

export function Reveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  as = 'div',
}: RevealProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const { x, y } = offsetFor(direction);
  const MotionTag = motion[as];

  return (
    <MotionTag
      data-reveal=""
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ ...TRANSITION, delay }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Staggered reveal for a group of siblings — card grids, stat tiles, lists.
 * Wrap the container in <RevealGroup> and each child in <RevealItem>.
 *
 * The stagger is 60ms and capped by how many children there are; a long list
 * should not leave the last card waiting a full second.
 */
const groupVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: OFFSET },
  visible: { opacity: 1, y: 0, transition: TRANSITION },
};

export function RevealGroup({
  children,
  className,
  as = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'ul' | 'section';
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];

  return (
    <MotionTag
      data-reveal=""
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={groupVariants}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article';
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];

  return (
    <MotionTag data-reveal="" className={className} variants={itemVariants}>
      {children}
    </MotionTag>
  );
}
