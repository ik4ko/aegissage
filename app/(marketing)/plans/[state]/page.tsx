import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CtaBand } from '@/components/marketing/cta-band';
import { TrustBar } from '@/components/marketing/trust-bar';
import { GlossaryTerm } from '@/components/marketing/glossary-term';
import { ContactForm } from '@/components/forms/contact-form';
import { ArticleCard } from '@/components/marketing/article-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { getStateBySlug, planStates } from '@/lib/states';
import { getArticles } from '@/lib/content';
import { advisor, site } from '@/lib/site';
import { breadcrumbJsonLd } from '@/lib/seo';

/**
 * Programmatic SEO, one page per licensed state.
 *
 * Scaffolded now so the route and its metadata exist before AEP traffic; the
 * per-state substance is seeded progressively via `NOTES` in lib/states.ts.
 *
 * Compliance boundary: these pages describe *rules and availability
 * mechanics* for a state. They must never list plan names, premiums, star
 * ratings or benefits — that content is county-level, changes annually, and
 * would turn a scaffold into a marketing claim.
 */

type Params = { state: string };

export function generateStaticParams(): Params[] {
  return planStates.map((state) => ({ state: state.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { state: slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};

  const title = `Medicare in ${state.name}`;
  // `state.note` is a full sentence of local detail; appending it pushed this
  // past 240 characters and Google truncated it. The note still renders on the
  // page — it just does not belong in a search-result description.
  const description = `How Medicare enrollment works in ${state.name}, and how to reach Eric Niniashvili, a licensed independent advisor covering the state.`;
  const ogImage =
    `${site.url}/api/og?title=${encodeURIComponent(`Medicare in ${state.name}`)}` +
    `&kicker=${encodeURIComponent(state.code)}` +
    `&subtitle=${encodeURIComponent('Licensed here. Independent. Reachable by phone.')}`;

  return {
    title,
    description,
    alternates: { canonical: `/plans/${state.slug}` },
    openGraph: {
      type: 'website',
      title: `${title} — ${site.name}`,
      description,
      url: `${site.url}/plans/${state.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${site.name}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function StatePage({ params }: { params: Promise<Params> }) {
  const { state: slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const guides = getArticles('medicare-basics').slice(0, 3);
  const others = planStates.filter((s) => s.slug !== state.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Plan pages', url: `${site.url}/plans` },
          { name: `Medicare in ${state.name}`, url: `${site.url}/plans/${state.slug}` },
        ])}
      />
      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <div className="max-w-3xl">
            <Badge tone="navy">{state.code}</Badge>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              Medicare in {state.name}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
              I hold an active health license in {state.name}, which means I can help you
              here directly — not hand you off to someone else&rsquo;s call center.
            </p>
          </div>

          <TrustBar className="mt-9 max-w-3xl" />
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="article-body max-w-[68ch]">
            <h2>What is specific to {state.name}</h2>
            <p>{state.note}</p>

            <h2>What is the same everywhere</h2>
            <p>
              The enrollment calendar is federal, so it does not change when you cross a
              state line. Your <GlossaryTerm k="iep" /> is the seven months around your
              65th birthday. The <GlossaryTerm k="aep" /> runs October 15 through December
              7 every year. A <GlossaryTerm k="sep" /> opens only when a qualifying life
              event — such as losing employer coverage or moving out of a plan&rsquo;s
              service area — gives you one.
            </p>
            <p>
              Late enrollment penalties are federal too. Going without{' '}
              <GlossaryTerm k="creditable-coverage" /> builds a{' '}
              <GlossaryTerm k="part-d" /> penalty that is permanent once it starts, and
              delaying <GlossaryTerm k="part-b" /> without active employer coverage does
              the same thing to your monthly premium for life.
            </p>

            <h2>What actually varies</h2>
            <p>
              Which plans exist for you is decided at the county level, not the state
              level. Two towns thirty minutes apart in {state.name} can have meaningfully
              different sets of options, different networks, and different drug lists. That
              is why the first question I ask is your ZIP code, and the second is your list
              of doctors and prescriptions.
            </p>
            <p>
              I do not publish plan lists on this site. They change every contract year,
              and a stale list is worse than no list. If you want to know what is available
              where you live, ask me and I will pull it up with you — or check every option
              yourself at medicare.gov.
            </p>

            <div className="not-prose mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/tools/eligibility-check">Check your enrollment window →</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/tools/plan-comparison">Compare the two routes</Link>
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <ContactForm
              source={`state-${state.code.toLowerCase()}`}
              context={{ State: state.name }}
              heading={`Talk to someone licensed in ${state.name}`}
              intro="Tell me your ZIP and what you are trying to figure out. I will take it from there."
            />
          </div>
        </div>
      </section>

      {guides.length > 0 ? (
        <section className="border-t border-line bg-paper">
          <div className="container py-14 sm:py-16">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">
              Start with these
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {guides.map((article) => (
                <ArticleCard key={article.href} article={article} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container py-12">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
          Also licensed in
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {others.map((other) => (
            <li key={other.code}>
              <Link
                href={`/plans/${other.slug}`}
                className="flex min-h-touch items-center rounded-xl border border-line bg-paper px-4 text-base text-ink-soft hover:border-navy/40 hover:text-navy"
              >
                {other.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand
        where={`state-${state.code.toLowerCase()}-cta`}
        heading={`Licensed in ${state.name}. Reachable by phone.`}
        body={`Call or text ${advisor.phone} and you will get me, not a queue. No fee, no obligation, and no pressure to enroll in anything.`}
      />
    </>
  );
}
