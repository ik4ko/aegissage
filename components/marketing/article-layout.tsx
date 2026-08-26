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
import { JsonLd } from '@/components/seo/json-ld';
import { formatDate } from '@/lib/utils';
import { breadcrumbJsonLd } from '@/lib/seo';
import { advisor, site } from '@/lib/site';

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
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: backLabel, url: `${site.url}${backHref}` },
          { name: article.title, url: `${site.url}${article.href}` },
        ])}
      />
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
{/*
                      `updated` is now a required field, so its mere presence
                      no longer means the piece was revised — every article
                      carries one. A revision is `updated` STRICTLY AFTER
                      `published`; equal means never revised, and printing
                      "Updated" for that would assert a revision that did not
                      happen. Compare the values, not the field's existence.
                    */}
                    <time dateTime={article.updated}>
                      {article.updated > article.published
                        ? `Updated ${formatDate(article.updated)}`
                        : formatDate(article.published)}
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
export function articleJsonLd(
  article: Article,
  url: string,
  type: 'Article' | 'NewsArticle' = 'Article',
) {
  const schemaDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value;
  const image =
    `${site.url}/api/og?title=${encodeURIComponent(article.title)}` +
    `&kicker=${encodeURIComponent(article.category)}` +
    `&subtitle=${encodeURIComponent(article.description)}`;

  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#article`,
    headline: article.title,
    description: article.description,
    image: [image],
    datePublished: schemaDate(article.published),
    dateModified: schemaDate(article.updated),
    author: { '@id': `${site.url}#advisor`, url: `${site.url}/about` },
    publisher: { '@id': `${site.url}#organization` },
    articleSection: article.category,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}
