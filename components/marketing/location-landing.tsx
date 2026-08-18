import Link from 'next/link';
import { CtaBand } from './cta-band';
import { ContactActions } from './contact-actions';
import { ContactForm } from '@/components/forms/contact-form';
import { TrustBar } from './trust-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo';
import { advisor, site } from '@/lib/site';
import {
  getLocationLanding,
  getChildLocations,
  getPeerLocations,
  type LocationLanding,
} from '@/lib/locations';
import { Reveal } from '@/components/motion/reveal';

/**
 * Shared shell for the local landing pages.
 *
 * ── What is shared and what is not ────────────────────────────────────────
 * This file owns layout, CTAs, breadcrumbs and cross-linking. It does NOT
 * own copy. Headings, paragraphs and questions all come from the landing's
 * own entry in lib/locations.ts, so two location pages never render the same
 * body with a place name swapped in.
 *
 * ── Why the hero is not wrapped in <Reveal> ───────────────────────────────
 * <Reveal> server-renders its children at opacity 0 and only animates them in
 * after the motion runtime hydrates. Putting the <h1> inside it made the
 * largest above-the-fold element invisible until hydration, which measured as
 * a 3596ms LCP on /medicare-new-jersey — the worst on the site. The hero now
 * paints with the document. Reveal is still used below the fold, where the
 * delay costs nothing.
 */
export function LocationLandingPage({ location }: { location: LocationLanding }) {
  const url = `${site.url}/medicare-${location.slug}`;
  const parent = location.parentSlug ? getLocationLanding(location.parentSlug) : undefined;
  const children = getChildLocations(location.slug);
  const peers = getPeerLocations(location.slug).filter(
    (peer) => peer.slug !== parent?.slug && !children.some((c) => c.slug === peer.slug),
  );

  const crumbs = [
    { name: 'Home', url: `${site.url}/` },
    ...(parent
      ? [{ name: `Medicare in ${parent.name}`, url: `${site.url}/medicare-${parent.slug}` }]
      : []),
    { name: `Medicare in ${location.name}`, url },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <div className="max-w-3xl">
            <Badge tone="navy">{location.region}</Badge>

            {parent ? (
              <p className="mt-4 text-base text-ink-soft">
                Part of{' '}
                <Link
                  href={`/medicare-${parent.slug}`}
                  className="font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
                >
                  Medicare in {parent.name}
                </Link>
              </p>
            ) : null}

            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              {location.headline}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
              {location.intro}
            </p>
            <ContactActions where={`location-${location.slug}`} className="mt-8" size="lg" />
          </div>
          <TrustBar className="mt-9 max-w-3xl" />
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal as="article" className="article-body max-w-[68ch]">
            {location.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
                {section.link ? (
                  <p className="not-prose">
                    <Link
                      href={section.link.href}
                      className="inline-flex min-h-touch items-center font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
                    >
                      {section.link.label}
                    </Link>
                  </p>
                ) : null}
              </section>
            ))}

            <h2>Questions worth bringing to the conversation</h2>
            <ul>
              {location.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>

            <div className="not-prose mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/tools/eligibility-check">Check your enrollment window →</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/medicare-basics">Read the plain-English guides</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <ContactForm
              source={`location-${location.slug}`}
              context={location.context}
              heading={`Talk about Medicare in ${location.shortName}`}
              intro={`Tell ${advisor.firstName} your ZIP code, doctors, prescriptions, and what you are trying to decide.`}
            />
          </Reveal>
        </div>
      </section>

      {children.length > 0 || peers.length > 0 ? (
        <section className="border-t border-line bg-paper">
          <div className="container py-12 sm:py-14">
            {children.length > 0 ? (
              <>
                <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">
                  Going more local
                </h2>
                <ul className="mt-5 flex flex-wrap gap-3">
                  {children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/medicare-${child.slug}`}
                        className="flex min-h-touch items-center rounded-xl border-2 border-line bg-cream px-4 text-base font-semibold text-ink-soft hover:border-navy/50 hover:text-navy"
                      >
                        Medicare in {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {peers.length > 0 ? (
              <>
                <h2
                  className={`font-display text-2xl font-bold tracking-[-0.02em] text-ink ${
                    children.length > 0 ? 'mt-10' : ''
                  }`}
                >
                  Nearby areas I cover
                </h2>
                <ul className="mt-5 flex flex-wrap gap-3">
                  {peers.map((peer) => (
                    <li key={peer.slug}>
                      <Link
                        href={`/medicare-${peer.slug}`}
                        className="flex min-h-touch items-center rounded-xl border border-line bg-cream px-4 text-base text-ink-soft hover:border-navy/40 hover:text-navy"
                      >
                        Medicare in {peer.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </section>
      ) : null}

      <CtaBand
        where={`location-${location.slug}-cta`}
        heading={`Need a second opinion in ${location.shortName}?`}
        body={`Call or text ${advisor.phone}. You will get a real person, with no fee and no obligation to enroll.`}
      />
    </>
  );
}
