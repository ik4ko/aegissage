import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock } from 'lucide-react';
import type { Article } from '@/lib/content';
import { Mdx } from './mdx';
import { ShareBar } from './share-bar';
import { TrustBar } from './trust-bar';
import { ArticleCard } from './article-card';
import { CtaBand } from './cta-band';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { advisor } from '@/lib/site';

/**
 * Shared long-form layout for both content collections.
 *
 * The measure is capped at 68 characters — the single biggest readability
 * lever for this audience — and the share affordance appears both above and
 * below the body, since the social path is the whole point of these pages.
 */
export function ArticleLayout({
  article,
  related,
  backHref,
  backLabel,
}: {
  article: Article;
  related: Article[];
  backHref: string;
  backLabel: string;
}) {
  return (
    <>
      <article>
        <header className="border-b border-line bg-paper">
          {/* Same 68ch column as the body below, so the title block and the
              prose share one left edge instead of stepping. */}
          <div className="container py-10 sm:py-14">
            <div className="mx-auto max-w-[68ch]">
              <Link
                href={backHref}
                className="inline-flex min-h-touch items-center gap-2 text-base font-semibold text-navy hover:underline"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                {backLabel}
              </Link>

              <div className="mt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="ember">{article.category}</Badge>
                  <span className="flex items-center gap-1.5 text-sm text-ink-faint">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {article.minutes} min read
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-ink-faint">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    <time dateTime={article.updated ?? article.date}>
                      {article.updated
                        ? `Updated ${formatDate(article.updated)}`
                        : formatDate(article.date)}
                    </time>
                  </span>
                </div>

                <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
                  {article.title}
                </h1>

                <p className="mt-5 text-xl leading-relaxed text-ink-soft">
                  {article.description}
                </p>

                <p className="mt-6 text-base text-ink-faint">
                  By {advisor.name}, {advisor.credential}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container py-12 sm:py-16">
          <div className="mx-auto max-w-[68ch]">
            <ShareBar path={article.href} title={article.title} />

            <Reveal className="article-body mt-10">
              <Mdx source={article.body} />
            </Reveal>

            <hr className="my-12 border-line" />

            <ShareBar path={article.href} title={article.title} />

            <Reveal>
              <TrustBar className="mt-8" />
            </Reveal>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-line bg-paper">
          <div className="container py-14 sm:py-16">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">
              Read next
            </h2>
            <RevealGroup className="mt-8 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <RevealItem key={item.href}>
                  <ArticleCard article={item} className="h-full" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      <CtaBand where={`article-${article.slug}`} />
    </>
  );
}

/** Article structured data, so search results show the byline and date. */
export function articleJsonLd(article: Article, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updated ?? article.date,
    author: {
      '@type': 'Person',
      name: advisor.name,
      jobTitle: advisor.credential,
    },
    mainEntityOfPage: url,
  };
}
