import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/json-ld';
import { PartnerRequestForm } from '@/components/forms/partner-request-form';
import { ORG_HUB_PATH, orgAudiences } from '@/lib/organizations';
import { pageMetadata } from '@/lib/page-metadata';
import { breadcrumbJsonLd, speakableJsonLd } from '@/lib/seo';
import { advisor, contactHrefs, site } from '@/lib/site';

/**
 * /for-organizations: the hub for organizations that want a Medicare
 * resource for the people they serve (lib/organizations.ts).
 */

const ANSWER =
  'Organizations whose patients, residents, members or employees ask Medicare questions can send them to me. I give plain education talks and help anyone who asks, one-on-one, in English, Georgian or Russian. Nothing of value changes hands, and no organization ever sends me a name or a list.';

export const metadata: Metadata = pageMetadata({
  title: 'A Medicare resource for your organization',
  description:
    'For billing teams, medical groups, new practices, senior living, community programs and employers in New Jersey and New York City: plain Medicare help for the people you serve.',
  path: ORG_HUB_PATH,
  kicker: 'For organizations',
  shareTitle: 'A Medicare resource for the people you serve',
});

export default function ForOrganizationsPage() {
  const url = `${site.url}${ORG_HUB_PATH}`;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'For organizations', url },
        ])}
      />
      <JsonLd data={speakableJsonLd({ url, name: 'A Medicare resource for your organization', cssSelector: ['h1 + p'] })} />

      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-base font-semibold uppercase tracking-[0.12em] text-ember-deep">For organizations</p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              A Medicare resource for the people your organization serves
            </h1>
            <p className="mt-5 text-xl leading-relaxed text-ink-soft">{ANSWER}</p>
            <p className="mt-4 text-lg text-ink-soft">
              I am {advisor.name}, a licensed insurance broker based in Edgewater, New Jersey. I
              meet people in person in Bergen and Hudson counties, and by phone or video in New
              York City and Philadelphia.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-12 sm:py-16">
        <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">Choose your organization</h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {orgAudiences.map((a) => (
            <li key={a.slug} className="flex flex-col rounded-2xl border border-line bg-paper p-6">
              <p className="text-base font-semibold uppercase tracking-[0.12em] text-ember-deep">{a.kicker}</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-ink">
                <Link href={`${ORG_HUB_PATH}/${a.slug}`} className="hover:text-navy">
                  {a.h1}
                </Link>
              </h3>
              <p className="mt-3 text-lg leading-relaxed text-ink-soft">{a.description}</p>
              <p className="mt-auto pt-4">
                <Link
                  href={`${ORG_HUB_PATH}/${a.slug}`}
                  className="inline-flex min-h-touch items-center font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
                >
                  Read how it works →
                </Link>
              </p>
            </li>
          ))}
        </ul>

        <div className="article-body mt-12 max-w-[68ch]">
          <h2>The same rules for every organization</h2>
          <ul>
            <li>No referral fees, gifts or meals, in either direction.</li>
            <li>You never send me a name, a list, a chart or a schedule. People contact me themselves.</li>
            <li>Talks are educational: no plan or insurance company is named and no applications are taken.</li>
            <li>
              One-on-one plan help starts with a Scope of Appointment the person agrees to and I record. It can be the
              same day as a talk.
            </li>
          </ul>
          <p>
            The full rules, with their Medicare sources, are on the <Link href="/partners">partners page</Link>.
          </p>
        </div>

        <div className="mt-10 max-w-3xl">
          <PartnerRequestForm sourcePage={ORG_HUB_PATH} />
          <p className="mt-5 text-lg text-ink-soft">
            Or call <a href={contactHrefs.tel} className="font-semibold text-navy underline">{advisor.phone}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
