import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CalendarClock, Compass, MessageCircleQuestion } from 'lucide-react';
import { Hero } from '@/components/marketing/hero';
import { TrustBar } from '@/components/marketing/trust-bar';
import { CtaBand } from '@/components/marketing/cta-band';
import { ArticleCard } from '@/components/marketing/article-card';
import { Button } from '@/components/ui/button';
import { getArticles } from '@/lib/content';
import { advisor, site } from '@/lib/site';

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: '/' },
};

const TOOLS = [
  {
    href: '/tools/eligibility-check',
    icon: CalendarClock,
    kicker: '2 minutes',
    title: 'Which enrollment window is yours?',
    body: 'Five questions, one per screen. Tells you which deadline applies to your situation and what it costs to miss it. No email required.',
  },
  {
    href: '/tools/plan-comparison',
    icon: Compass,
    kicker: 'Side by side',
    title: 'Original Medicare vs. Medicare Advantage',
    body: 'The structural differences laid out honestly — including the trade-off nobody explains until it is too late to change your mind.',
  },
  {
    href: '/medicare-basics',
    icon: MessageCircleQuestion,
    kicker: 'Start here',
    title: 'Medicare, explained without the jargon',
    body: 'The guides I send people before our first call. Every Medicare term is a tap away from a plain-English definition.',
  },
] as const;

export default function HomePage() {
  const guides = getArticles('medicare-basics').slice(0, 3);
  const posts = getArticles('blog').slice(0, 2);

  return (
    <>
      <Hero />

      <section className="container -mt-4 pb-4">
        <TrustBar />
      </section>

      {/* ── Tools ─────────────────────────────────────────────────────── */}
      <section className="container py-14 sm:py-20">
        <SectionHeading
          kicker="Start without talking to anyone"
          title="Answer your own question first"
          body="You should be able to get a long way on your own. These are the same tools I walk people through on the phone."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {TOOLS.map(({ href, icon: Icon, kicker, title, body }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl border border-line bg-paper p-7 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-lift focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
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
          ))}
        </div>
      </section>

      {/* ── Point of view ─────────────────────────────────────────────── */}
      <section className="border-y border-line bg-paper">
        <div className="container grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
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
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:content-start">
            {[
              {
                stat: `${advisor.yearsLicensed} years`,
                label: 'Licensed and doing this full time.',
              },
              {
                stat: `${advisor.licensedStates.length} states`,
                label: 'Active health licenses, so a move does not mean a new agent.',
              },
              {
                stat: 'One person',
                label: 'You get me on the phone, not a rotating queue.',
              },
              {
                stat: 'No fee',
                label: 'My help never costs you anything, and never requires enrolling.',
              },
            ].map((item) => (
              <li key={item.stat} className="rounded-2xl border border-line bg-cream p-6">
                <p className="font-display text-3xl font-bold tracking-[-0.02em] text-navy">
                  {item.stat}
                </p>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">{item.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Library ───────────────────────────────────────────────────── */}
      {guides.length > 0 ? (
        <section className="container py-14 sm:py-20">
          <SectionHeading
            kicker="The library"
            title="The guides I actually send people"
            body="Written the way I would explain it at a kitchen table. Share any of them with whoever else is helping you decide."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((article) => (
              <ArticleCard key={article.href} article={article} />
            ))}
          </div>

          {posts.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {posts.map((article) => (
                <ArticleCard key={article.href} article={article} />
              ))}
            </div>
          ) : null}

          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="outline" size="lg">
              <Link href="/medicare-basics">All Medicare basics</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/blog">Latest articles →</Link>
            </Button>
          </div>
        </section>
      ) : null}

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
