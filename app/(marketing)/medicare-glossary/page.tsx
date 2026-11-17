import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactActions } from '@/components/marketing/contact-actions';
import { CtaBand } from '@/components/marketing/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { GLOSSARY_PATH, GLOSSARY_REVIEWED, glossaryTerms } from '@/lib/medicare-glossary';
import { pageMetadata } from '@/lib/page-metadata';
import { breadcrumbJsonLd } from '@/lib/seo';
import { advisor, compliance, site } from '@/lib/site';
import { formatDate } from '@/lib/utils';

/**
 * /medicare-glossary: every Medicare term this site uses, in plain language.
 *
 * Content lives in lib/medicare-glossary.ts, with the rules for it. This
 * file only lays it out. Each term is an <article> with a stable id, so
 * /medicare-glossary#part-b is a real, linkable definition; answer pages
 * link their first mention of a term here automatically.
 *
 * Server-rendered in full: nothing here needs JavaScript to be read.
 */

const TITLE = 'Medicare glossary: 40 terms in plain language';
const H1 = 'Medicare glossary';
const DESCRIPTION =
  'Forty Medicare terms explained in two or three plain sentences each, from Part A to SHIP. Every definition links to the official source it was checked against.';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: GLOSSARY_PATH,
  kicker: 'Medicare glossary',
  shareTitle: 'Medicare terms in plain language',
});

const sorted = [...glossaryTerms].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));

/** A, B, C … only the letters that have a term. */
const letters = [...new Set(sorted.map((entry) => entry.term[0].toUpperCase()))];
const firstOfLetter = new Map<string, string>();
for (const entry of sorted) {
  const letter = entry.term[0].toUpperCase();
  if (!firstOfLetter.has(letter)) firstOfLetter.set(letter, entry.slug);
}

const pageUrl = `${site.url}${GLOSSARY_PATH}`;
const reviewedIso = `${GLOSSARY_REVIEWED}T00:00:00Z`;

export default function MedicareGlossaryPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: H1, url: pageUrl },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              '@id': `${pageUrl}#webpage`,
              url: pageUrl,
              name: TITLE,
              description: DESCRIPTION,
              inLanguage: 'en-US',
              isPartOf: { '@id': `${site.url}#website` },
              author: { '@id': `${site.url}#advisor` },
              reviewedBy: { '@id': `${site.url}#advisor` },
              lastReviewed: reviewedIso,
              dateModified: reviewedIso,
              mainEntity: { '@id': `${pageUrl}#terms` },
            },
            {
              '@type': 'DefinedTermSet',
              '@id': `${pageUrl}#terms`,
              name: H1,
              description: DESCRIPTION,
              url: pageUrl,
              inLanguage: 'en-US',
              publisher: { '@id': `${site.url}#organization` },
              hasDefinedTerm: sorted.map((entry) => ({
                '@type': 'DefinedTerm',
                '@id': `${pageUrl}#${entry.slug}`,
                name: entry.term,
                ...(entry.alsoCalled?.length ? { alternateName: entry.alsoCalled } : {}),
                description: entry.definition,
                url: `${pageUrl}#${entry.slug}`,
                termCode: entry.slug,
                inDefinedTermSet: { '@id': `${pageUrl}#terms` },
                isBasedOn: entry.source.url,
              })),
            },
          ],
        }}
      />

      <section className="border-b border-line bg-paper">
        <div className="container max-w-3xl py-14 sm:py-20">
          <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
            {H1}
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-ink-soft">
            {sorted.length} Medicare terms, each explained in two or three plain sentences. Every
            definition names the official page it was checked against, so you can read the rule
            in Medicare&rsquo;s own words.
          </p>
          <p className="mt-4 text-base text-ink-soft" data-byline>
            Written and reviewed by{' '}
            <Link href="/about#credentials" className="font-semibold text-navy underline">
              {advisor.name}
            </Link>
            , licensed insurance broker{advisor.npn ? `, NPN ${advisor.npn}` : ''}. Checked against
            the sources on {formatDate(GLOSSARY_REVIEWED)}.
          </p>
        </div>
      </section>

      <div className="container max-w-3xl py-10 sm:py-14">
        <nav aria-label="Jump to a letter" className="rounded-2xl border border-line bg-paper p-5">
          <h2 className="text-base font-semibold text-ink">Jump to a letter</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {letters.map((letter) => (
              <li key={letter}>
                <a
                  href={`#${firstOfLetter.get(letter)}`}
                  className="inline-flex min-h-touch min-w-[48px] items-center justify-center rounded-xl border-2 border-line bg-white px-3 text-lg font-semibold text-navy hover:border-navy"
                >
                  {letter}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 space-y-6">
          {sorted.map((entry) => (
            <article
              key={entry.slug}
              id={entry.slug}
              className="scroll-mt-24 rounded-2xl border border-line bg-paper p-6 target:border-navy target:ring-2 target:ring-navy/20"
            >
              <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">
                <a href={`#${entry.slug}`} className="hover:underline">
                  {entry.term}
                </a>
              </h2>
              {entry.alsoCalled?.length ? (
                <p className="mt-1 text-base text-ink-soft">
                  Also called: {entry.alsoCalled.join(', ')}
                </p>
              ) : null}
              <p className="mt-3 text-lg leading-[1.75] text-ink-soft">{entry.definition}</p>
              <p className="mt-4 text-base text-ink-soft">
                Source:{' '}
                <a
                  href={entry.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4"
                >
                  {entry.source.title}, Medicare.gov
                </a>
              </p>
            </article>
          ))}
        </div>

        <div className="article-body mt-14">
          <h2>How to use this page</h2>
          <p>
            These definitions are general education. They explain what a word means, not what is
            right for you. Dollar amounts are left out on purpose, because premiums, deductibles
            and income limits change every year; the current figures are at{' '}
            <a href="https://www.medicare.gov/basics/costs/medicare-costs">Medicare.gov</a> or by
            calling {compliance.medicarePhone}.
          </p>
          <p>
            For dates, see the <Link href="/medicare-enrollment-calendar">enrollment calendar</Link>.
            For full explanations, see the <Link href="/answers">Medicare answers</Link> and the{' '}
            <Link href="/medicare-basics">Medicare basics guides</Link>.
          </p>
          <h2>Talk it through with a person</h2>
          <p>
            If a term on a letter or a plan document is not here, or you want to go through your
            own situation, call or text me. There is no charge and no obligation.{' '}
            {compliance.licensedAgentNotice}
          </p>
        </div>
        <ContactActions where="glossary" className="mt-6" size="lg" />
      </div>

      <CtaBand where="glossary" />
    </>
  );
}
