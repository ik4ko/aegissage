'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { glossary, isGlossaryKey } from '@/lib/glossary';
import { trackGlossaryOpen } from '@/lib/analytics';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Inline jargon explainer. Click/tap driven rather than hover, because the
 * site rule is that nothing may depend on hover — this has to work identically
 * for a thumb, a mouse and a keyboard.
 *
 * Usage in MDX:  <G k="irmaa" />  or  <G k="part-b">Part B premium</G>
 */
export function GlossaryTerm({
  k,
  children,
  className,
}: {
  k: string;
  children?: React.ReactNode;
  /** Extra classes for the trigger, e.g. a full 48px row when it stands alone in a list. */
  className?: string;
}) {
  if (!isGlossaryKey(k)) {
    // A typo'd key should degrade to plain text, never crash an article.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[glossary] unknown term key: "${k}"`);
    }
    return <>{children ?? k}</>;
  }

  const entry = glossary[k];
  const label = children ?? entry.term;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={() => trackGlossaryOpen(k)}
          className={cn(
            'inline items-baseline rounded px-0.5 text-left font-semibold text-navy underline decoration-ember decoration-dotted decoration-2 underline-offset-4 hover:decoration-solid focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy',
            className,
          )}
        >
          {label}
          <span className="sr-only"> — what this means</span>
        </button>
      </PopoverTrigger>
      {/* Radix renders the content as role="dialog", which needs its own
          accessible name — the trigger's name does not carry over. */}
      <PopoverContent aria-label={`${entry.term}: definition`}>
        <p className="font-display text-lg font-semibold text-ink">{entry.term}</p>
        <p className="mt-2 text-base leading-relaxed text-ink-soft">{entry.definition}</p>
        {/* Every key in lib/glossary.ts has an entry of the same slug in the
            full glossary; scripts/test-glossary.mjs fails if one goes missing. */}
        <p className="mt-3">
          <Link
            href={`/medicare-glossary#${k}`}
            className="inline-flex min-h-touch items-center text-base font-semibold text-navy underline underline-offset-4"
          >
            Full entry and source
          </Link>
        </p>
      </PopoverContent>
    </Popover>
  );
}
