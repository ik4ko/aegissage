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
import type { LocationLanding } from '@/lib/locations';
import { Reveal } from '@/components/motion/reveal';

export function LocationLandingPage({ location }: { location: LocationLanding }) {
  const url = `${site.url}/medicare-${location.slug}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: `Medicare in ${location.name}`, url },
        ])}
      />

      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <Reveal className="max-w-3xl">
            <Badge tone="navy">{location.region}</Badge>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              Medicare in {location.name}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
              {location.intro}
            </p>
            <ContactActions where={`location-${location.slug}`} className="mt-8" size="lg" />
          </Reveal>
          <Reveal>
            <TrustBar className="mt-9 max-w-3xl" />
          </Reveal>
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal as="article" className="article-body max-w-[68ch]">
            <h2>What is local about Medicare here</h2>
            {location.localFocus.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <h2>Enrollment windows and local moves</h2>
            <p>{location.enrollment}</p>
            <p>
              The safest first step is to write down your current ZIP code, every doctor you
              want to keep, and every prescription you take. Then compare what is actually
              available rather than relying on a national advertisement.
            </p>

            <h2>Questions worth bringing to a conversation</h2>
            <ul>
              <li>Will my doctors and hospitals remain in network at this address?</li>
              <li>Are my prescriptions covered at a tier I can live with?</li>
              <li>What changes if I move across a county or service-area line?</li>
              <li>Which enrollment window applies to my exact situation?</li>
            </ul>

            <div className="not-prose mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/tools/eligibility-check">Check your enrollment window →</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/medicare-basics">Read the plain-English guides</Link>
              </Button>
            </div>

            <aside className="not-prose mt-10 rounded-2xl border border-ember/30 bg-ember-soft p-5 text-base leading-relaxed text-ink">
              <strong>Before launch:</strong> {location.verificationNote}
            </aside>
          </Reveal>

          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <ContactForm
              source={`location-${location.slug}`}
              context={location.context}
              heading={`Talk about Medicare in ${location.shortName}`}
              intro={`Tell ${advisor.name.split(' ')[0]} your ZIP code, doctors, prescriptions, and what you are trying to decide.`}
            />
          </Reveal>
        </div>
      </section>

      <CtaBand
        where={`location-${location.slug}-cta`}
        heading={`Need a second opinion in ${location.shortName}?`}
        body={`Call or text ${advisor.phone}. You will get a real person, with no fee and no obligation to enroll.`}
      />
    </>
  );
}
