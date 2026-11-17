import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand } from '@/components/marketing/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { getArticles } from '@/lib/content';
import { breadcrumbJsonLd } from '@/lib/seo';
import { site } from '@/lib/site';

const TITLE = 'Medicare answers';
const DESCRIPTION =
  'Direct answers to the Medicare questions people in New Jersey, New York City and Philadelphia ask most, each checked against official sources.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/answers' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${site.url}/answers` },
};

export default function AnswersIndexPage() {
  const answers = getArticles('answers');

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: TITLE, url: `${site.url}/answers` },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${site.url}/answers#collection`,
          url: `${site.url}/answers`,
          name: TITLE,
          description: DESCRIPTION,
          hasPart: answers.map((answer) => ({
            '@type': 'Article',
            headline: answer.title,
            url: `${site.url}${answer.href}`,
          })),
        }}
      />

      <section className="border-b border-line bg-paper">
        <div className="container max-w-3xl py-14 sm:py-20">
          <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
            {TITLE}
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-ink-soft">
            One question per page, answered in the first paragraph. Each page lists the official
            sources it was checked against and the date it was checked.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Looking up a word or a date? See the{' '}
            <Link href="/medicare-glossary" className="font-semibold text-navy underline">
              Medicare glossary
            </Link>{' '}
            and the{' '}
            <Link href="/medicare-enrollment-calendar" className="font-semibold text-navy underline">
              enrollment calendar
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="container max-w-3xl py-12 sm:py-16">
        <ul className="space-y-5">
          {answers.map((answer) => (
            <li key={answer.href} className="rounded-2xl border border-line bg-paper p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ember-deep">
                {answer.category}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink">
                <Link href={answer.href} className="hover:underline">
                  {answer.title}
                </Link>
              </h2>
              <p className="mt-2 text-lg text-ink-soft">{answer.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand where="answers-index" />
    </>
  );
}
