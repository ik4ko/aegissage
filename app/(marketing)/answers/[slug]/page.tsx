import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ArticleLayout,
  articleJsonLd,
  reviewedByAdvisor,
} from '@/components/marketing/article-layout';
import { ContactActions } from '@/components/marketing/contact-actions';
import { ContactForm } from '@/components/forms/contact-form';
import { PlanEndingLinks } from '@/components/marketing/plan-ending-links';
import { PLAN_ENDING_ANSWER_HREF } from '@/lib/plan-endings';
import { JsonLd } from '@/components/seo/json-ld';
import { getArticle, getArticles, getRelatedAnswers } from '@/lib/content';
import { faqJsonLd, speakableJsonLd } from '@/lib/seo';
import { advisor, compliance, site } from '@/lib/site';
import { formatDate } from '@/lib/utils';

/**
 * Answer pages: content/answers/*.mdx.
 *
 * One page answers one question a person would actually ask, in the first
 * paragraph, then explains it. The template adds everything that must be the
 * same on every answer page so no author can forget it:
 *
 *   - "Common questions", rendered from frontmatter `faq`, the same array the
 *     FAQPage schema is built from
 *   - "Sources", from frontmatter `sources`, with the date it was last checked
 *   - tap-to-call with the licensed-agent notice
 *   - the lead form
 *
 * Rules for the copy itself are in CLAUDE.md ("AI-visibility and answer
 * pages") and are enforced where they can be by lib/content-guard.ts.
 */

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getArticles('answers').map((article) => ({ slug: article.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle('answers', slug);
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

export default async function AnswerPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = getArticle('answers', slug);
  if (!article) notFound();

  const faq = article.faq ?? [];
  const sources = article.sources ?? [];

  return (
    <>
      <JsonLd data={articleJsonLd(article, `${site.url}${article.href}`)} />
      {faq.length > 0 ? <JsonLd data={faqJsonLd(faq)} /> : null}
      <JsonLd
        data={speakableJsonLd({
          url: `${site.url}${article.href}`,
          name: article.title,
          cssSelector: ['.article-body > p:first-of-type', '.article-body h2 + p'],
        })}
      />
      <ArticleLayout
        article={article}
        related={getRelatedAnswers(article)}
        relatedHeading="Related answers"
        backHref="/answers"
        backLabel="All Medicare answers"
        afterBody={
          <div className="article-body mt-10">
            {/*
              The general non-renewal answer links to the company-specific
              plan-ending pages. The company names appear only in these link
              labels, rendered by the template, not in the answer copy.
            */}
            {article.href === PLAN_ENDING_ANSWER_HREF ? (
              <PlanEndingLinks showGeneral={false} className="mb-10" />
            ) : null}
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

            <h2>Sources</h2>
            <ul>
              {sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="link-row">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
            {article.review_date ? (
              <p>
                Checked against these sources on {formatDate(article.review_date)} by{' '}
                {article.reviewed_by}
                {reviewedByAdvisor(article) ? `, ${advisor.credential}` : ''}. Medicare rules and dollar amounts
                change every year; confirm anything that affects a decision at medicare.gov or by
                calling {compliance.medicarePhone}.
              </p>
            ) : null}

            <h2>Talk it through with a person</h2>
            <p>
              This page is general education, not advice about your situation. If you want to go
              through it together, call or text me. There is no charge and no obligation.{' '}
              {compliance.licensedAgentNotice}
            </p>
          </div>
        }
        afterColumn={
          <>
            <ContactActions where={`answer-${article.slug}`} className="mt-6" size="lg" />
            <div className="mt-10">
              <ContactForm
                source={`answer-${article.slug}`}
                heading="Ask me about this"
                intro="Tell me what is going on and how to reach you. I read every one of these myself."
              />
            </div>
          </>
        }
      />
    </>
  );
}
