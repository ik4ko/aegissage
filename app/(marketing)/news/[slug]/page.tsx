import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Mdx } from '@/components/marketing/mdx';
import { ShareBar } from '@/components/marketing/share-bar';
import { TrustBar } from '@/components/marketing/trust-bar';
import { NewsCard } from '@/components/marketing/news-card';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { getArticle, getArticles } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import { site } from '@/lib/site';
import { articleJsonLd } from '@/components/marketing/article-layout';
import { breadcrumbJsonLd } from '@/lib/seo';

/**
 * A single news item.
 *
 * Deliberately lighter than the long-form article layout — no related-reading
 * grid of guides, no byline block. News items are short by design and the page
 * should feel that way, but each still gets a permalink and its own OG image
 * so a single item is worth posting to social on its own.
 */

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getArticles('news').map((item) => ({ slug: item.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getArticle('news', slug);
  if (!item) return {};

  const ogUrl =
    `/api/og?title=${encodeURIComponent(item.title)}` +
    `&kicker=${encodeURIComponent(item.category)}` +
    `&subtitle=${encodeURIComponent(item.description)}`;

  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: item.href },
    openGraph: {
      type: 'article',
      title: item.title,
      description: item.description,
      url: `${site.url}${item.href}`,
      publishedTime: item.date,
      modifiedTime: item.updated ?? item.date,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: item.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.description,
      images: [ogUrl],
    },
  };
}

export default async function NewsItemPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = getArticle('news', slug);
  if (!item) notFound();

  const more = getArticles('news')
    .filter((n) => n.slug !== item.slug)
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={articleJsonLd(item, `${site.url}${item.href}`, 'NewsArticle')}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Medicare News & Updates', url: `${site.url}/news` },
          { name: item.title, url: `${site.url}${item.href}` },
        ])}
      />

      <article className="container py-12 sm:py-16">
        <div className="mx-auto max-w-[68ch]">
          <Link
            href="/news"
            className="inline-flex min-h-touch items-center gap-2 text-base font-semibold text-navy hover:underline"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            All updates
          </Link>

          <Reveal className="mt-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="sage">{item.category}</Badge>
              <span className="flex items-center gap-1.5 text-sm text-ink-faint">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                <time dateTime={item.updated ?? item.date}>
                  {item.updated ? `Updated ${formatDate(item.updated)}` : formatDate(item.date)}
                </time>
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">
              {item.title}
            </h1>

            <p className="mt-4 text-xl leading-relaxed text-ink-soft">{item.description}</p>
          </Reveal>

          <Reveal className="article-body mt-10" delay={0.05}>
            <Mdx source={item.body} />
          </Reveal>

          <hr className="my-10 border-line" />

          <ShareBar path={item.href} title={item.title} />

          <TrustBar className="mt-8" />
        </div>
      </article>

      {more.length > 0 ? (
        <section className="border-t border-line bg-paper">
          <div className="container py-14 sm:py-16">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">
              More updates
            </h2>
            <RevealGroup className="mt-8 grid gap-5 md:grid-cols-3">
              {more.map((other) => (
                <RevealItem key={other.href}>
                  <NewsCard item={other} from="index" className="h-full" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      <CtaBand where={`news-${item.slug}`} />
    </>
  );
}
