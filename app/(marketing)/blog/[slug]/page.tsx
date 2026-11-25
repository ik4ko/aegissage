import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleLayout, articleJsonLd } from '@/components/marketing/article-layout';
import { JsonLd } from '@/components/seo/json-ld';
import { getArticle, getArticles, getRelated } from '@/lib/content';
import { faqJsonLd } from '@/lib/seo';
import { site } from '@/lib/site';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getArticles('blog').map((article) => ({ slug: article.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle('blog', slug);
  if (!article) return {};

  const ogUrl =
    `/api/og?title=${encodeURIComponent(article.title)}` +
    `&kicker=${encodeURIComponent(article.category)}` +
    `&subtitle=${encodeURIComponent(article.description)}`;

  return {
    title: article.seo_title ?? article.title,
    description: article.seo_description ?? article.description,
    alternates: { canonical: article.href },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url: `${site.url}${article.href}`,
      publishedTime: article.published,
      modifiedTime: article.updated,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [ogUrl],
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = getArticle('blog', slug);
  if (!article) notFound();

  /*
    Optional on blog posts: when a post carries `faq` and `sources` in its
    frontmatter, render them the same way answer pages do. The visible
    "Common questions" section and the FAQPage schema come from the same
    array, so they cannot drift apart.
  */
  const faq = article.faq ?? [];
  const sources = article.sources ?? [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(article, `${site.url}${article.href}`)),
        }}
      />
      {faq.length > 0 ? <JsonLd data={faqJsonLd(faq)} /> : null}
      <ArticleLayout
        article={article}
        related={getRelated(article)}
        backHref="/blog"
        backLabel="All articles"
        afterBody={
          faq.length > 0 || sources.length > 0 ? (
            <div className="article-body mt-10">
              {faq.length > 0 ? (
                <>
                  <h2>Common questions</h2>
                  {faq.map((item) => (
                    <div key={item.question}>
                      <h3>{item.question}</h3>
                      <p>{item.answer}</p>
                    </div>
                  ))}
                </>
              ) : null}
              {sources.length > 0 ? (
                <>
                  <h2>Sources</h2>
                  <ul>
                    {sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-row"
                        >
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ) : undefined
        }
      />
    </>
  );
}
