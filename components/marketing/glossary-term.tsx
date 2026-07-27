'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { glossary, isGlossaryKey } from '@/lib/glossary';
import { trackGlossaryOpen } from '@/lib/analytics';

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
}: {
  k: string;
  children?: React.ReactNode;
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
          className="inline items-baseline rounded px-0.5 text-left font-semibold text-navy underline decoration-ember decoration-dotted decoration-2 underline-offset-4 hover:decoration-solid focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
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
      </PopoverContent>
    </Popover>
  );
}
