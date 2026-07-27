import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleCard } from '@/components/marketing/article-card';
import { CtaBand } from '@/components/marketing/cta-band';
import { TrustBar } from '@/components/marketing/trust-bar';
import { GlossaryTerm } from '@/components/marketing/glossary-term';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { getArticles } from '@/lib/content';
import { glossary } from '@/lib/glossary';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { site } from '@/lib/site';

const TITLE = 'Medicare Basics';
const DESCRIPTION =
  'The plain-English guides I send people before our first call. Enrollment windows, the parts, the penalties, and the traps — written to be understood, not to sell you something.';

const FAQ_ITEMS = [
  {
    question: 'When should I start learning about Medicare?',
    answer:
      'Start before your Initial Enrollment Period closes. The right timing depends on your age, current coverage, and whether you are still working, so gather those facts before choosing a route.',
  },
  {
    question: 'Does Medicare plan availability depend on where I live?',
    answer:
      'Yes. Medicare Advantage plans, provider networks, and drug formularies are local. Your ZIP code and county determine which options are actually available to compare.',
  },
  {
    question: 'What should I compare first?',
    answer:
      'Start with the doctors you need to keep, the prescriptions you take, and the enrollment window you are in. Premiums and plan features only make sense after those constraints are clear.',
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/medicare-basics' },
  openGraph: {
    title: `${TITLE} — the guides I send people first`,
    description: DESCRIPTION,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent('Medicare, explained without the jargon')}&kicker=${encodeURIComponent('Start here')}&subtitle=${encodeURIComponent('The guides I send people before our first call.')}`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
};

export default function MedicareBasicsPage() {
  const articles = getArticles('medicare-basics');
  const [lead, ...rest] = articles;

  // A compact glossary index doubles as an SEO surface and a genuinely useful
  // reference for anyone who lands mid-research.
  const terms = Object.entries(glossary);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: TITLE, url: `${site.url}/medicare-basics` },
        ])}
      />
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />
      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
              The library
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              Medicare, explained the way I would explain it to my own mother.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
              No countdown timers, no &ldquo;limited time&rdquo; anything. Just the things
              that actually determine whether this goes well for you. Every piece of jargon
              on these pages is one tap from a plain definition.
            </p>
          </Reveal>

          <Reveal>
            <TrustBar className="mt-9 max-w-3xl" />
          </Reveal>
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        {articles.length === 0 ? (
          <p className="text-lg text-ink-soft">Guides are being written. Check back shortly.</p>
        ) : (
          <RevealGroup className="grid gap-5">
            {lead ? <RevealItem><ArticleCard article={lead} featured headingLevel={2} /></RevealItem> : null}
            {rest.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <RevealItem key={article.href}><ArticleCard article={article} headingLevel={2} /></RevealItem>
                ))}
              </div>
            ) : null}
          </RevealGroup>
        )}

        <Reveal className="mt-9 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/tools/eligibility-check">Check your enrollment window →</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/tools/plan-comparison">Compare the two routes</Link>
          </Button>
        </Reveal>
      </section>

      {/* ── Glossary ──────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-paper">
        <div className="container py-14 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
            The words nobody defines for you
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">
            Tap any term for a plain-English definition. These same definitions appear
            inline throughout every guide on this site.
          </p>

          <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {terms.map(([key, entry]) => (
              <li key={key} className="flex min-h-touch items-center border-b border-line/70">
                <GlossaryTerm k={key}>{entry.term}</GlossaryTerm>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
            Medicare questions people ask first
          </h2>
          <Reveal as="section" className="mt-8">
          <dl className="divide-y divide-line border-y border-line">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <div key={question} className="py-6">
                <dt className="font-display text-xl font-bold text-ink">{question}</dt>
                <dd className="mt-3 text-lg leading-relaxed text-ink-soft">{answer}</dd>
              </div>
            ))}
          </dl>
          </Reveal>
        </div>
      </section>

      <CtaBand
        where="basics-cta"
        heading="Read everything and still have a question?"
        body="Good — that means you are taking it seriously. Call or text and I will answer it straight, whether or not you ever become a client."
      />
    </>
  );
}
