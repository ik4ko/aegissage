import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Brain,
  Calculator,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  Compass,
  MessageCircleQuestion,
} from 'lucide-react';
import { Hero } from '@/components/marketing/hero';
import { TrustBar } from '@/components/marketing/trust-bar';
import { CtaBand } from '@/components/marketing/cta-band';
import { ArticleCard } from '@/components/marketing/article-card';
import { NewsCard } from '@/components/marketing/news-card';
import { SocialLinks } from '@/components/marketing/social-links';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { CountUp } from '@/components/motion/count-up';
import { TriageFlow } from '@/components/tools/triage-flow';
import { DeadlineCapture } from '@/components/forms/deadline-capture';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { getArticles, getLatestNews } from '@/lib/content';
import { locationLandings } from '@/lib/locations';
import { licensedStates } from '@/lib/states';
import { advisor, site } from '@/lib/site';
import { faqJsonLd } from '@/lib/seo';

const OG_IMAGE =
  `${site.url}/api/og?title=${encodeURIComponent(site.tagline)}` +
  `&kicker=${encodeURIComponent('Medicare, explained')}` +
  `&subtitle=${encodeURIComponent(`Independent guidance across ${site.serviceArea}.`)}`;

export const metadata: Metadata = {
  // Short forms for the search result; the full tagline and description are
  // kept below for Open Graph and Twitter, where the space exists.
  title: site.shortTitle,
  description: site.metaDescription,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: `${site.url}/`,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [OG_IMAGE],
  },
};

const TOOLS = [
  {
    href: '/medicare-checklist',
    icon: ClipboardList,
    kicker: 'Free · Printable',
    title: 'The Medicare appointment checklist',
    body: 'Print it, fill it in at the kitchen table, bring it to any conversation. Doctors, prescriptions, ZIP code, deadlines, and the questions worth asking. No email required.',
  },
  {
    href: '/tools/eligibility-check',
    icon: CalendarClock,
    kicker: '2 minutes',
    title: 'Which enrollment window is yours?',
    body: 'Five questions, one per screen. Tells you which deadline applies to your situation and what it costs to miss it. No email required.',
  },
  {
    href: '/tools/medicare-iq',
    icon: Brain,
    kicker: 'New questions every visit',
    title: 'Test your Medicare IQ',
    body: 'A short trivia round with rotating question sets. You find out why after every answer. Most people score lower than they expect.',
  },
  {
    href: '/tools/plan-comparison',
    icon: Compass,
    kicker: 'Side by side',
    title: 'Original Medicare vs. Medicare Advantage',
    body: 'The structural differences laid out honestly — including the trade-off nobody explains until it is too late to change your mind.',
  },
  {
    href: '/tools/penalty-calculator',
    icon: Calculator,
    kicker: '3 minutes',
    title: 'What would a late penalty actually cost you?',
    body: 'Part B and Part D late enrollment penalties, estimated in real dollars from your dates. No email required.',
  },
  {
    href: '/tools/irmaa-calculator',
    icon: CircleDollarSign,
    kicker: '2 minutes',
    title: 'Does your income add a surcharge?',
    body: 'IRMAA raises Part B and Part D premiums above a certain income, based on your tax return from two years ago. See where you land and how close the next threshold is.',
  },
  {
    href: '/medicare-basics',
    icon: MessageCircleQuestion,
    kicker: 'Start here',
    title: 'Medicare, explained without the jargon',
    body: 'The guides I send people before our first call. Every Medicare term is a tap away from a plain-English definition.',
  },
] as const;

/**
 * Homepage FAQ — the questions people put to search and AI assistants about a
 * local broker. Each answer is the exact text in the FAQPage schema below;
 * `link` renders after the answer and is not part of the schema text.
 *
 * Dates: https://www.medicare.gov/health-drug-plans/open-enrollment (Oct 15 –
 * Dec 7) and https://www.medicare.gov/publications/11219-Understanding-Medicare-Advantage-Medicare-Drug-Plan-Enrollment-Periods.pdf
 * (Medicare Advantage Open Enrollment, Jan 1 – Mar 31). Plan-ending wording
 * mirrors /medicare-plan-ending-letter. No promises about price or outcome.
 */
const HOME_FAQS: { question: string; answer: string; link?: { href: string; label: string } }[] = [
  {
    question: 'Do Medicare brokers charge a fee?',
    answer:
      'No. There is no cost to you to talk with me or to compare your options. If you choose to enroll in a plan, the broker is paid by the insurance company, not by you.',
  },
  {
    question: 'When can I change my Medicare plan?',
    answer:
      'Each year during the Annual Enrollment Period, October 15 to December 7, with changes starting January 1. If you are in a Medicare Advantage plan, you can also make one change from January 1 to March 31. Outside those dates, a special enrollment period may apply after events such as moving or losing other coverage.',
    link: { href: '/tools/eligibility-check', label: 'Check which window applies to you' },
  },
  {
    question: 'My plan sent a letter saying it is ending. What now?',
    answer:
      'If your plan is not renewing, you can choose new coverage during the Annual Enrollment Period, and people whose plan is ending generally get a special enrollment period after it as well. If you do nothing, you are generally returned to Original Medicare, which can leave you without drug coverage. Bring me the letter and we will go through your options together.',
    link: { href: '/medicare-plan-ending-letter', label: 'What a plan-ending letter means' },
  },
  {
    question: 'Can I get help in Georgian or Russian?',
    answer:
      'Yes. I explain Medicare in English, Georgian or Russian, whether the coverage is for you or for a parent.',
    link: { href: '/medicare-help-georgian-russian', label: 'Medicare help in Georgian and Russian' },
  },
  {
    question: 'Do you only help people in New Jersey?',
    answer: `No. I am based in Edgewater, New Jersey, and serve Bergen and Hudson Counties, Brooklyn, Queens and Philadelphia. I am licensed in ${licensedStates.length} states and can help by phone or video anywhere in them.`,
    link: { href: '/plans', label: `See all ${licensedStates.length} states` },
  },
];

export default function HomePage() {
  const guides = getArticles('medicare-basics').slice(0, 3);
  const posts = getArticles('blog').slice(0, 2);
  const news = getLatestNews(3);

  return (
    <>
      <Hero />

      <section className="container -mt-4 pb-4">
        <Reveal>
          <TrustBar />
        </Reveal>
      </section>

      {/* ── Lead capture ──────────────────────────────────────────────── */}
      {/*
        Sits between the hero's "What I actually do" card and the news feed:
        after the visitor knows who this is and what he does, and before the
        page turns into a reading list. Every other CTA on this page assumes
        someone is ready to act today; this is the only one that works for a
        reader who is months out.
      */}
      <section className="container py-14 sm:py-16">
        <Reveal className="mx-auto max-w-3xl">
          <SectionHeading
            kicker="Two dates, no pitch"
            title="Tell me your ZIP and the month you turn 65."
            body="I'll send you the two deadlines that actually apply to you. No plan pitches, no phone calls unless you ask."
          />
          <div className="mt-8">
            <DeadlineCapture />
          </div>
        </Reveal>
      </section>

      {/* ── News ──────────────────────────────────────────────────────── */}
      {news.length > 0 ? (
        <section className="container py-14 sm:py-16">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              kicker="Latest"
              title="What is worth knowing this week"
              body="Short updates, posted often — deadlines coming up, rules that changed, and the myth I heard most this week."
            />
            <Button asChild variant="ghost" size="md">
              <Link href="/news">All updates →</Link>
            </Button>
          </Reveal>

          <RevealGroup className="mt-9 grid gap-5 md:grid-cols-3">
            {news.map((item) => (
              <RevealItem key={item.href}>
                <NewsCard item={item} from="home" className="h-full" />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      ) : null}

      {/* ── Tools ─────────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <Reveal>
            <SectionHeading
              kicker="Self-serve tools"
              title="Get answers before you call"
              body="The free tools I use with clients, plus the guides I send people before we talk."
            />
          </Reveal>

          {/*
            A plain four-column grid, deliberately. Earlier versions used a
            six-column grid with two-column spans and a hand-placed card to
            centre whatever orphan the current tool count produced — which
            had to be re-derived every time a tool was added, and was wrong
            twice. This hub keeps growing, so the layout should not care how
            many cards it holds. A short last row is fine.
          */}
          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map(({ href, icon: Icon, kicker, title, body }) => (
              <RevealItem key={href}>
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-cream p-7 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-lift focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-soft text-navy">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-ember-deep">
                    {kicker}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold tracking-[-0.02em] text-ink">
                    {title}
                  </h3>
                  <p className="mt-3 flex-1 text-base leading-relaxed text-ink-soft">{body}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-semibold text-navy">
                    Open it
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="border-y border-navy-deep bg-navy-deep text-white">
        <div className="container py-14 sm:py-20">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-soft">Not sure where to begin?</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Answer two questions and I will point you to the right next step.</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75">No plan recommendations, no data collection, and no pressure to contact me.</p>
          </Reveal>
          <Reveal className="mt-9">
            <TriageFlow />
          </Reveal>
        </div>
      </section>

      {/* ── Point of view ─────────────────────────────────────────────── */}
      <section className="container py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal direction="left">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
              Why this site exists
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
              Most Medicare advice is written by people who want you to stop reading and
              start dialing.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              I went the other way. Everything here is written to be genuinely useful even
              if you never contact me — because if it is not useful, you have no reason to
              trust me with something this important.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              I am independent, which means no carrier tells me what to recommend. And I am
              one person, which means the number on this page is my number.
            </p>
            <Button asChild variant="navy" size="lg" className="mt-8">
              <Link href="/about">Read my story →</Link>
            </Button>
          </Reveal>

          <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:content-start">
            {[
              {
                stat: <CountUp value={locationLandings.length} suffix=" local areas" />,
                label: 'Bergen County, New Jersey, New York City, and Philadelphia.',
              },
              {
                stat: <CountUp value={licensedStates.length} suffix=" states" />,
                label: 'Active health licenses across the listed states.',
              },
              {
                stat: 'One person',
                label: 'You get me, not a rotating queue of strangers.',
              },
              {
                stat: 'No fee to you',
                label: 'You never pay me, and you are never required to enroll in anything.',
              },
            ].map((item) => (
              <RevealItem as="li" key={typeof item.stat === 'string' ? item.stat : item.label} className="rounded-2xl border border-line bg-paper p-6">
                <p className="font-display text-3xl font-bold tracking-[-0.02em] text-navy">
                  {item.stat}
                </p>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">{item.label}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Library ───────────────────────────────────────────────────── */}
      {guides.length > 0 ? (
        <section className="border-t border-line bg-paper">
          <div className="container py-14 sm:py-20">
            <Reveal>
              <SectionHeading
                kicker="The library"
                title="The guides I actually send people"
                body="Written the way I would explain it at a kitchen table. Share any of them with whoever else is helping you decide."
              />
            </Reveal>

            <RevealGroup className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((article) => (
                <RevealItem key={article.href}>
                  <ArticleCard article={article} className="h-full" />
                </RevealItem>
              ))}
            </RevealGroup>

            {/* Two-card row is constrained to the width of two of the three
                cards above it, then centred, rather than stretched full width. */}
            {posts.length > 0 ? (
              <RevealGroup className="mt-5 grid gap-5 md:grid-cols-2 lg:mx-auto lg:max-w-[calc(66.666%-0.833rem)]">
                {posts.map((article) => (
                  <RevealItem key={article.href}>
                    <ArticleCard article={article} className="h-full" />
                  </RevealItem>
                ))}
              </RevealGroup>
            ) : null}

            <Reveal className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="outline" size="lg">
                <Link href="/medicare-basics">All Medicare basics</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/blog">Latest articles →</Link>
              </Button>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="border-t border-line bg-paper">
        <div className="container py-14 sm:py-16">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
              More from Erekle
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
              Short Medicare explanations, wherever you watch.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Watch the latest videos on YouTube or follow AegisSage on Instagram. The links
              open in a new tab, so you can come back to the guides whenever you need them.
            </p>
            <SocialLinks className="mt-6" />
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <JsonLd data={faqJsonLd(HOME_FAQS)} />
      <section className="border-t border-line">
        <div className="container py-14 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <SectionHeading kicker="Common questions" title="Questions people ask me first" />
            <div className="mt-8 divide-y divide-line">
              {HOME_FAQS.map((faq) => (
                <div key={faq.question} className="py-6">
                  <h3 className="font-display text-xl font-bold tracking-[-0.01em] text-ink">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-lg leading-relaxed text-ink-soft">{faq.answer}</p>
                  {faq.link ? (
                    <Link
                      href={faq.link.href}
                      className="mt-2 inline-flex min-h-touch items-center font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
                    >
                      {faq.link.label} →
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaBand where="home-cta" />
    </>
  );
}

function SectionHeading({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
        {kicker}
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
        {title}
      </h2>
      {body ? <p className="mt-4 text-lg leading-relaxed text-ink-soft">{body}</p> : null}
    </div>
  );
}
