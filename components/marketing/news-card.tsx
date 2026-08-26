'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Article } from '@/lib/content';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { trackNewsOpen } from '@/lib/analytics';
import { cn } from '@/lib/utils';

/**
 * Compact news item. Deliberately lighter than <ArticleCard> — a news item is
 * a headline and a sentence, and dressing it up like a long-form guide would
 * make the feed feel heavier than it is.
 */
export function NewsCard({
  item,
  from,
  className,
  headingLevel = 3,
}: {
  item: Article;
  from: 'home' | 'index';
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3';

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl border border-line bg-paper p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-card sm:p-6',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="sage">{item.category}</Badge>
        <time dateTime={item.published} className="text-sm text-ink-faint">
          {formatDate(item.published)}
        </time>
      </div>

      <Heading className="mt-3 font-display text-xl font-bold tracking-[-0.02em] text-ink">
        <Link
          href={item.href}
          onClick={() => trackNewsOpen(item.slug, from)}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {item.title}
        </Link>
      </Heading>

      <p className="mt-2 flex-1 text-base leading-relaxed text-ink-soft">{item.description}</p>

      <span className="mt-4 inline-flex items-center gap-1.5 text-base font-semibold text-navy">
        Read it
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </span>
    </article>
  );
}
