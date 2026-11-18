import Link from 'next/link';
import { CtaBand } from './cta-band';
import { ContactActions } from './contact-actions';
import { ContactForm } from '@/components/forms/contact-form';
import { PlanEndingLinks } from '@/components/marketing/plan-ending-links';
import { MedigapLine } from './medigap-line';
import { TrustBar } from './trust-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd, localBusinessJsonLd, speakableJsonLd } from '@/lib/seo';
import { advisor, site } from '@/lib/site';
import { getArticle } from '@/lib/content';
import { formatCountDate } from '@/lib/tpmo';
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

/**
 * Full place name for schema, walking up the parentSlug chain.
 *
 * `context.Location` is what the page shows a visitor, and for a town it is
 * the bare name — "Fort Lee", "Edgewater". That is right on the page, where
 * the surrounding copy supplies the context, and wrong in `areaServed`, where
 * a consumer has only the string. There is a Fort Lee in several states.
 *
 * Walking parentSlug yields "Fort Lee, Bergen County, New Jersey" without
 * hardcoding a state, so a landing added outside New Jersey stays correct.
 * The depth guard is against a parentSlug cycle, which would otherwise hang
 * the build rather than fail it.
 */
function fullAreaServed(location: LocationLanding): string {
  const parts: string[] = [location.name];
  if (location.county) parts.push(location.county);
  let parentSlug = location.parentSlug;
  let depth = 0;

  while (parentSlug && depth < 5) {
    const parent = getLocationLanding(parentSlug);
    if (!parent) break;
    if (!parts.includes(parent.name)) parts.push(parent.name);
    parentSlug = parent.parentSlug;
    depth += 1;
  }

  return parts.join(', ');
}

export function LocationLandingPage({ location }: { location: LocationLanding }) {
  const url = `${site.url}/medicare-${location.slug}`;
  const parent = location.parentSlug ? getLocationLanding(location.parentSlug) : undefined;
  const children = getChildLocations(location.slug);
  /*
    A town page links its own county's towns, not all twenty landings: with
    the town pages added, "every other location" became a wall of links.
    Top-level and county pages keep the old rule.
  */
  const isTownPage = Boolean(location.localHelp);
  const peers = getPeerLocations(location.slug).filter((peer) =>
    isTownPage
      ? peer.parentSlug === location.parentSlug && peer.county === location.county
      : peer.slug !== parent?.slug &&
        !children.some((c) => c.slug === peer.slug) &&
        !peer.localHelp,
  );
  const related = (location.relatedAnswers ?? []).map((slug) => {
    const article = getArticle('answers', slug);
    if (!article) {
      throw new Error(`lib/locations.ts: ${location.slug} names a missing answer page "${slug}".`);
    }
    return article;
  });

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
      <JsonLd
        data={speakableJsonLd({
          url,
          name: `Medicare in ${location.name}`,
          cssSelector: ['h1 + p', '.article-body h2 + p'],
        })}
      />
      {/*
        Per-page LocalBusiness/InsuranceAgency node, scoped to this one place.
        `context.Location` is the page's own full place name, already used for
        the form context, so the schema and the visible page cannot disagree
        about where this page is about.
      */}
      <JsonLd
        data={localBusinessJsonLd({
          path: `/medicare-${location.slug}`,
          areaServed: fullAreaServed(location),
        })}
      />

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

            {location.localHelp && location.localHelp.length > 0 ? (
              <>
                <h2>Free local help near {location.shortName}</h2>
                <p>
                  These are public services. None of them sells insurance, and none is connected
                  to me. Each one was checked on its official page on the date shown.
                </p>
                <ul className="not-prose mt-4 space-y-5">
                  {location.localHelp.map((item) => (
                    <li key={item.name} className="text-lg leading-relaxed text-ink-soft">
                      <a
                        href={item.url}
                        rel="noopener"
                        className="inline-flex min-h-touch items-center font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
                      >
                        {item.name}
                      </a>
                      <span className="block">{item.what}</span>
                      {item.phone ? (
                        <a
                          href={`tel:+1${item.phone.replace(/\D/g, '').slice(0, 10)}`}
                          className="inline-flex min-h-touch items-center font-semibold text-ink underline underline-offset-4"
                        >
                          {item.phone}
                        </a>
                      ) : null}
                      <span className="block text-base text-ink-soft">
                        Checked {formatCountDate(item.checked)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {related.length > 0 ? (
              <>
                <h2>Answers worth reading</h2>
                <ul className="not-prose mt-4 space-y-2">
                  {related.map((article) => (
                    <li key={article.href}>
                      <Link
                        href={article.href}
                        className="inline-flex min-h-touch items-center text-lg font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <PlanEndingLinks newJersey={location.inState === 'New Jersey'} className="mt-10" />

            <MedigapLine state={location.inState} />

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
