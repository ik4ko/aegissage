import Link from 'next/link';
import { ContactForm } from '@/components/forms/contact-form';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/badge';
import { PLAN_ENDING_ANSWER_HREF, type PlanEndingPage } from '@/lib/plan-endings';
import { breadcrumbJsonLd, faqJsonLd, speakableJsonLd } from '@/lib/seo';
import { advisor, compliance, site } from '@/lib/site';
import { formatDate } from '@/lib/utils';

/**
 * Template for /braven-health-plan-ending-2027 and
 * /aetna-medicare-plan-ending-2027. Content and rules: lib/plan-endings.ts.
 *
 * Order matters: the direct answer comes before any call to action, the
 * questions follow, and the form, call and text come last. Every section's
 * first paragraph is the spoken answer (Speakable) and the FAQPage answer.
 */
export function PlanEndingTemplate({ page }: { page: PlanEndingPage }) {
  const path = `/${page.slug}`;
  const url = `${site.url}${path}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Plan ending letters', url: `${site.url}${PLAN_ENDING_ANSWER_HREF}` },
          { name: page.title, url },
        ])}
      />
      <JsonLd
        data={faqJsonLd(page.sections.map(({ question, answer }) => ({ question, answer })))}
      />
      <JsonLd
        data={speakableJsonLd({
          url,
          name: page.h1,
          cssSelector: ['[data-direct-answer]', '[data-spoken-answer]'],
        })}
      />

      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <div className="max-w-3xl">
            <Badge tone="navy">Plan ending in 2027</Badge>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              {page.h1}
            </h1>
            <p data-direct-answer="" className="mt-5 text-xl leading-relaxed text-ink">
              {page.directAnswer}
            </p>
            <p className="mt-4 text-lg text-ink-soft">
              Checked against the sources at the end of this page on {formatDate(page.reviewed)}.
              This page explains your choices. It does not recommend a plan.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <article className="article-body max-w-[68ch]">
            {page.sections.map((section) => (
              <section key={section.question}>
                <h2>{section.question}</h2>
                <p data-spoken-answer="">{section.answer}</p>
                {section.points ? (
                  <ul>
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
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

            <h2>More on plan-ending letters</h2>
            <p>
              The general guide covers the difference between a plan that is not renewing, a plan
              leaving your county and a plan merging into another.
            </p>
            <p className="not-prose">
              <Link
                href={PLAN_ENDING_ANSWER_HREF}
                className="inline-flex min-h-touch items-center font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
              >
                What a non-renewal letter means
              </Link>
            </p>

            <h2>Sources</h2>
            <ul>
              {page.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="link-row">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              Checked on {formatDate(page.reviewed)} by {advisor.name}, {advisor.credential}.
              Confirm anything that affects a decision at medicare.gov or by calling{' '}
              {compliance.medicarePhone} (TTY {compliance.medicareTty}).
            </p>
          </article>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="font-display text-3xl font-bold tracking-[-0.025em] text-ink">
              Go through it with a person
            </h2>
            <p className="mt-3 text-lg text-ink-soft">
              I compare what is offered in your county for your doctors and prescriptions,
              including staying with Original Medicare. There is no charge to you.{' '}
              {compliance.licensedAgentNotice}
            </p>
            <div className="mt-8">
              <ContactForm
                source={`plan-ending-${page.slug}`}
                context={{ topic: 'plan-ending', company: page.company }}
                heading="Ask me to call you back"
                intro="Tell me how to reach you and your ZIP code. Leave out your Medicare number; I will never ask for it here."
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
