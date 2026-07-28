import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand } from '@/components/marketing/cta-band';
import { TrustBar } from '@/components/marketing/trust-bar';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/badge';
import { breadcrumbJsonLd } from '@/lib/seo';
import { planStates, type StateInfo } from '@/lib/states';
import { locationLandings } from '@/lib/locations';
import { site } from '@/lib/site';

/** Groups states under their initial letter, alphabetically. */
function groupByLetter(states: StateInfo[]): [string, StateInfo[]][] {
  const groups = new Map<string, StateInfo[]>();
  for (const state of [...states].sort((a, b) => a.name.localeCompare(b.name))) {
    const letter = state.name[0].toUpperCase();
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(state);
  }
  return [...groups.entries()];
}

const TITLE = 'Medicare plan pages by state';
const DESCRIPTION =
  'State-by-state Medicare enrollment and plan-availability guidance for the states AegisSage serves.';
const OG_IMAGE =
  `${site.url}/api/og?title=${encodeURIComponent('Medicare guidance by state')}` +
  `&kicker=${encodeURIComponent('State by state')}` +
  `&subtitle=${encodeURIComponent('Enrollment rules are federal. Plan availability is local.')}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/plans' },
  openGraph: {
    type: 'website',
    title: `${TITLE} · ${site.name}`,
    description: DESCRIPTION,
    url: `${site.url}/plans`,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} · ${site.name}`,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function PlansPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Plan pages', url: `${site.url}/plans` },
        ])}
      />
      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <div className="max-w-3xl">
            <Badge tone="navy">State by state</Badge>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              Medicare guidance by state.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
              Enrollment rules are federal, but plan availability, provider networks, and
              county-level options are local. Start with the state where you live, then
              bring your ZIP code and doctor list to the comparison.
            </p>
          </div>
          <TrustBar className="mt-9 max-w-3xl" />
        </div>
      </section>
      {/* ── Local markets first ──────────────────────────────────────────
          These four have their own written local pages. Surfacing them above
          the A–Z list is deliberate: the state directory should not dilute
          the local authority the location pages are built to earn. */}
      <section className="container py-14 sm:py-16">
        <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
          Start where you live
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          These areas have their own local pages, written for the county and
          borough questions that actually come up there.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {locationLandings.map((location) => (
            <li key={location.slug}>
              <Link
                href={`/medicare-${location.slug}`}
                className="flex h-full min-h-touch flex-col justify-center rounded-2xl border-2 border-line bg-paper px-6 py-5 shadow-card transition-colors hover:border-navy/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
              >
                <span className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
                  Medicare in {location.name}
                </span>
                <span className="mt-1 text-base text-ink-soft">{location.region}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Full A–Z directory, grouped by letter ────────────────────────
          Grouped rather than one flat 26-item grid so the list is scannable
          without a client-side filter. Still fully server-rendered: no
          JavaScript is required to find a state. */}
      <section className="border-t border-line bg-paper">
        <div className="container py-14 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
            Find your state
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">
            All {planStates.length} states where I hold an active health license.
            Every one of these is a state I can help you in directly.
          </p>

          <div className="mt-9 space-y-8">
            {groupByLetter(planStates).map(([letter, group]) => (
              <div key={letter}>
                <h3 className="font-display text-xl font-bold text-ember-deep">{letter}</h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((state) => (
                    <li key={state.code}>
                      <Link
                        href={`/plans/${state.slug}`}
                        className="flex min-h-touch items-center gap-3 rounded-2xl border border-line bg-cream px-5 text-lg font-semibold text-ink-soft transition-colors hover:border-navy/40 hover:text-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
                      >
                        <span className="text-sm font-bold text-ink-faint">{state.code}</span>
                        {state.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand
        where="plans-index-cta"
        heading="Your ZIP code is the useful starting point."
        body="If you want help reading what is actually available where you live, call or text and we can look at the decision together."
      />
    </>
  );
}
