import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleLayout, articleJsonLd } from '@/components/marketing/article-layout';
import { getArticle, getArticles, getRelated } from '@/lib/content';
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
    title: article.title,
    description: article.description,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(article, `${site.url}${article.href}`)),
        }}
      />
      <ArticleLayout
        article={article}
        related={getRelated(article)}
        backHref="/blog"
        backLabel="All articles"
      />
    </>
  );
}
