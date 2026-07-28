import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand } from '@/components/marketing/cta-band';
import { TrustBar } from '@/components/marketing/trust-bar';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/badge';
import { breadcrumbJsonLd } from '@/lib/seo';
import { planStates } from '@/lib/states';
import { site } from '@/lib/site';

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
      <section className="container py-14 sm:py-16">
        <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
          Choose your state
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {planStates.map((state) => (
            <li key={state.code}>
              <Link
                href={`/plans/${state.slug}`}
                className="flex min-h-touch items-center rounded-2xl border border-line bg-paper px-5 text-lg font-semibold text-ink-soft shadow-card hover:border-navy/40 hover:text-navy"
              >
                Medicare in {state.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand
        where="plans-index-cta"
        heading="Your ZIP code is the useful starting point."
        body="If you want help reading what is actually available where you live, call or text and we can look at the decision together."
      />
    </>
  );
}
