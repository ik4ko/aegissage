import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Brain,
  CalendarClock,
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
import { Button } from '@/components/ui/button';
import { getArticles, getLatestNews } from '@/lib/content';
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
  const news = getLatestNews(3);

  return (
    <>
      <Hero />

      <section className="container -mt-4 pb-4">
        <Reveal>
          <TrustBar />
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
              kicker="Start without talking to anyone"
              title="Answer your own question first"
              body="You should be able to get a long way on your own. These are the same tools I walk people through on the phone."
            />
          </Reveal>

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
                stat: <CountUp value={3} suffix=" areas" />,
                label: 'New Jersey, New York City, and Philadelphia.',
              },
              {
                stat: <CountUp value={26} suffix=" states" />,
                label: 'Active health licenses across the listed states.',
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

            {posts.length > 0 ? (
              <RevealGroup className="mt-5 grid gap-5 md:grid-cols-2">
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
              More from Eric
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
