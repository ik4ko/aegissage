import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Article } from '@/lib/content';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ArticleCard({
  article,
  featured = false,
  className,
  headingLevel = 3,
}: {
  article: Article;
  featured?: boolean;
  className?: string;
  /**
   * The card title's heading level. Defaults to h3, which is right when the
   * grid sits under a section h2. On index pages where the cards are the
   * first content under the page h1, pass 2 so the outline does not skip a
   * level.
   */
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3';

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl border border-line bg-paper p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:p-7',
        featured && 'border-navy/25 bg-navy-soft/40',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={featured ? 'ember' : 'navy'}>{article.category}</Badge>
        <span className="text-sm text-ink-faint">{article.minutes} min read</span>
      </div>

      <Heading
        className={cn(
          'mt-4 font-display font-bold tracking-[-0.02em] text-ink',
          featured ? 'text-2xl sm:text-3xl' : 'text-xl',
        )}
      >
        <Link href={article.href} className="after:absolute after:inset-0 after:content-['']">
          {article.title}
        </Link>
      </Heading>

      <p className="mt-3 flex-1 text-base leading-relaxed text-ink-soft">
        {article.description}
      </p>

      <span className="mt-5 inline-flex items-center gap-1.5 text-base font-semibold text-navy">
        Read it
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </span>
    </article>
  );
}
