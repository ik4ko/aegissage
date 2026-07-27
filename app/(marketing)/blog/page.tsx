import type { Metadata } from 'next';
import { ArticleCard } from '@/components/marketing/article-card';
import { CtaBand } from '@/components/marketing/cta-band';
import { TrustBar } from '@/components/marketing/trust-bar';
import { JsonLd } from '@/components/seo/json-ld';
import { getArticles } from '@/lib/content';
import { breadcrumbJsonLd } from '@/lib/seo';
import { site } from '@/lib/site';

const TITLE = 'Articles';
const DESCRIPTION =
  'Things I keep having to explain, written down once. Myths, mailers, deadlines and the occasional rant about how Medicare gets marketed.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/blog' },
  openGraph: {
    title: `${TITLE} — straight talk about Medicare`,
    description: DESCRIPTION,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent('Things I keep having to explain')}&kicker=${encodeURIComponent('Articles')}&subtitle=${encodeURIComponent('Written down once, so I can send the link instead.')}`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
};

export default function BlogPage() {
  const articles = getArticles('blog');

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: TITLE, url: `${site.url}/blog` },
        ])}
      />
      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
              Articles
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              Things I keep having to explain.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
              Written down once so I can send the link instead of repeating myself. Share
              any of these with whoever needs to hear it.
            </p>
          </div>
          <TrustBar className="mt-9 max-w-3xl" />
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        {articles.length === 0 ? (
          <p className="text-lg text-ink-soft">Nothing published yet. Check back soon.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.href} article={article} headingLevel={2} />
            ))}
          </div>
        )}
      </section>

      <CtaBand where="blog-cta" />
    </>
  );
}
