import type { ReactNode } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { ContactActions } from '@/components/marketing/contact-actions';
import { TrustBar } from '@/components/marketing/trust-bar';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd, faqJsonLd, localBusinessJsonLd } from '@/lib/seo';
import { site } from '@/lib/site';

/**
 * Shared layout for the single-service pages added Oct 28 2026
 * (/medicare-plan-ending-letter, /dual-eligible-medicare-medicaid,
 * /medicare-help-georgian-russian).
 *
 * Each page exists so a search for that exact need — and an AI assistant
 * asked about it — lands on a page that answers it, instead of a homepage
 * mention. The keyword line sits inside the <h1> above the plain-English
 * headline, the same pattern as the location landings.
 *
 * ── Compliance ───────────────────────────────────────────────────────────
 * Educational only. No form and no ZIP field on these pages, so they carry
 * the generic TPMO disclaimer (they are deliberately NOT in ZIP_ROUTES).
 * Contact is by phone, text or the /book interstitial, which handles its own
 * consent. No plan names, premiums, "$0", savings or eligibility claims.
 * FAQ schema mirrors the visible questions and answers word for word.
 */
export type ServicePageFaq = { question: string; answer: string };

export function ServicePage(props: {
  path: string;
  /** Visible keyword line inside the <h1>, e.g. "Plan-ending letter help · Bergen County, NJ". */
  keywordLine: string;
  headline: string;
  intro: ReactNode;
  /** Breadcrumb / schema name. */
  name: string;
  areaServed?: string;
  children: ReactNode;
  faqs: ServicePageFaq[];
  related?: { href: string; label: string }[];
}) {
  const url = `${site.url}${props.path}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: site.url },
          { name: props.name, url },
        ])}
      />
      <JsonLd
        data={localBusinessJsonLd({
          path: props.path,
          areaServed: props.areaServed ?? site.serviceArea,
        })}
      />
      <JsonLd data={faqJsonLd(props.faqs)} />

      <section className="bg-cream">
        <div className="container py-14 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
              <span className="mb-3 block font-sans text-lg font-semibold tracking-normal text-navy sm:text-xl">
                {props.keywordLine}
              </span>
              {props.headline}
            </h1>
            <div className="mt-6 text-lg leading-relaxed text-ink-soft sm:text-xl">{props.intro}</div>
            <ContactActions where={`service-${props.path.slice(1)}`} className="mt-8" size="lg" />
            <p className="mt-4 text-sm text-ink-faint">
              No cost to talk and no obligation. Nothing is enrolled on the first call.
            </p>
          </div>
          <TrustBar className="mx-auto mt-9 max-w-3xl" />
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        <Reveal className="article-body mx-auto max-w-[68ch]">
          {props.children}

          <h2>Common questions</h2>
          {props.faqs.map((faq) => (
            <div key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}

          {props.related && props.related.length > 0 ? (
            <>
              <h2>Related</h2>
              <ul>
                {props.related.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Reveal>
      </section>

      <section className="bg-cream">
        <div className="container py-12">
          <div className="mx-auto max-w-3xl">
            <p className="font-display text-2xl font-bold text-ink">Talk it through with me</p>
            <p className="mt-3 text-lg text-ink-soft">
              Call, text, or book a time. English, Georgian or Russian.
            </p>
            <ContactActions where={`service-${props.path.slice(1)}-footer`} className="mt-6" size="lg" />
          </div>
        </div>
      </section>
    </>
  );
}
