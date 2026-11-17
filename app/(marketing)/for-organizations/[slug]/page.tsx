import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/json-ld';
import { PartnerRequestForm } from '@/components/forms/partner-request-form';
import { ORG_HUB_PATH, getOrgAudience, orgAudiences } from '@/lib/organizations';
import { pageMetadata } from '@/lib/page-metadata';
import { breadcrumbJsonLd, faqJsonLd, speakableJsonLd } from '@/lib/seo';
import { advisor, contactHrefs, site } from '@/lib/site';

type Params = { slug: string };

export function generateStaticParams() {
  return orgAudiences.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getOrgAudience(slug);
  if (!a) return {};
  return pageMetadata({
    title: a.metaTitle,
    description: a.description,
    path: `${ORG_HUB_PATH}/${a.slug}`,
    kicker: a.kicker,
    shareTitle: a.h1,
  });
}

export default async function OrgAudiencePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const a = getOrgAudience(slug);
  if (!a) notFound();
  const url = `${site.url}${ORG_HUB_PATH}/${a.slug}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'For organizations', url: `${site.url}${ORG_HUB_PATH}` },
          { name: a.kicker, url },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: a.h1,
          serviceType: 'Medicare education and enrollment help',
          description: a.description,
          url,
          provider: { '@id': `${site.url}#professional-service` },
          audience: { '@type': 'BusinessAudience', audienceType: a.kicker },
          areaServed: ['Bergen County, New Jersey', 'Hudson County, New Jersey', 'New York City', 'Philadelphia'],
          availableLanguage: ['English', 'Georgian', 'Russian'],
        }}
      />
      <JsonLd data={faqJsonLd(a.faq)} />
      <JsonLd data={speakableJsonLd({ url, name: a.h1, cssSelector: ['h1 + p', '[data-spoken-answer]'] })} />

      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-base font-semibold uppercase tracking-[0.12em] text-ember-deep">{a.kicker}</p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">{a.h1}</h1>
            <p className="mt-5 text-xl leading-relaxed text-ink-soft">{a.answer}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#request"
                className="inline-flex min-h-touch items-center rounded-xl bg-ember px-5 text-lg font-semibold text-white hover:bg-ember-deep"
              >
                Ask for a talk or a help day
              </a>
              <Link
                href={`${ORG_HUB_PATH}/${a.slug}/sheet`}
                className="inline-flex min-h-touch items-center rounded-xl border-2 border-navy/30 px-5 text-lg font-semibold text-navy hover:border-navy"
              >
                Printable one-page sheet
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12 sm:py-16">
        <div className="article-body max-w-[68ch]">
          <h2>What I do</h2>
          <ul>
            {a.whatIDo.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h2>What I do not do</h2>
          <ul>
            {a.whatIDont.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h2>How it works, step by step</h2>
          <ol>
            {a.steps.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>

          <h2>Questions organizations ask</h2>
          {a.faq.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p data-spoken-answer="">{item.answer}</p>
            </div>
          ))}

          <h2>Read more</h2>
          <ul>
            {a.related.map((r) => (
              <li key={r.href}>
                <Link href={r.href}>{r.label}</Link>
              </li>
            ))}
            <li>
              <Link href={ORG_HUB_PATH}>All organization pages</Link>
            </li>
          </ul>
        </div>

        <div id="request" className="mt-12 max-w-3xl scroll-mt-28">
          <PartnerRequestForm sourcePage={`${ORG_HUB_PATH}/${a.slug}`} defaultType={a.formType} />
          <p className="mt-5 text-lg text-ink-soft">
            Or call or text <a href={contactHrefs.tel} className="font-semibold text-navy underline">{advisor.phone}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
