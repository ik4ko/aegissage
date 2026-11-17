import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactActions } from '@/components/marketing/contact-actions';
import { CtaBand } from '@/components/marketing/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import {
  CALENDAR_PATH,
  CALENDAR_REVIEWED,
  allWindows,
  calendarSections,
  fixedDates,
} from '@/lib/enrollment-calendar';
import { glossaryHref } from '@/lib/medicare-glossary';
import { pageMetadata } from '@/lib/page-metadata';
import { breadcrumbJsonLd } from '@/lib/seo';
import { advisor, compliance, site } from '@/lib/site';
import { formatDate } from '@/lib/utils';

/**
 * /medicare-enrollment-calendar: every Medicare enrollment window, as a rule.
 *
 * Content and its rules live in lib/enrollment-calendar.ts. Nothing on this
 * page names a year: the windows are the same every year, and a page that
 * says "this year" is wrong by January.
 *
 * Server-rendered in full: nothing here needs JavaScript to be read.
 */

const TITLE = 'Medicare enrollment calendar: every window';
const H1 = 'Medicare enrollment calendar';
const DESCRIPTION =
  'Every Medicare enrollment window in one place: when it opens, who it is for, what you can change and when coverage starts, each with its official source.';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: CALENDAR_PATH,
  kicker: 'Enrollment calendar',
  shareTitle: 'Medicare enrollment windows, in one place',
});

const pageUrl = `${site.url}${CALENDAR_PATH}`;
const reviewedIso = `${CALENDAR_REVIEWED}T00:00:00Z`;

const rowLabel = 'text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft';

export default function MedicareEnrollmentCalendarPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: H1, url: pageUrl },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              '@id': `${pageUrl}#webpage`,
              url: pageUrl,
              name: TITLE,
              description: DESCRIPTION,
              inLanguage: 'en-US',
              isPartOf: { '@id': `${site.url}#website` },
              author: { '@id': `${site.url}#advisor` },
              reviewedBy: { '@id': `${site.url}#advisor` },
              lastReviewed: reviewedIso,
              dateModified: reviewedIso,
              mainEntity: { '@id': `${pageUrl}#windows` },
            },
            {
              '@type': 'ItemList',
              '@id': `${pageUrl}#windows`,
              name: 'Medicare enrollment windows',
              numberOfItems: allWindows.length,
              itemListElement: allWindows.map((window, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: window.name,
                description: `${window.when} ${window.can}`,
                url: `${pageUrl}#${window.id}`,
              })),
            },
          ],
        }}
      />

      <section className="border-b border-line bg-paper">
        <div className="container max-w-3xl py-14 sm:py-20">
          <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
            {H1}
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-ink-soft">
            Medicare lets you sign up or change coverage only at certain times. This page lists
            every window: when it opens, who it is for, what you can do and when the change
            starts. The dates are rules that repeat every year.
          </p>
          <p className="mt-4 text-base text-ink-soft" data-byline>
            Written and reviewed by{' '}
            <Link href="/about#credentials" className="font-semibold text-navy underline">
              {advisor.name}
            </Link>
            , licensed insurance broker{advisor.npn ? `, NPN ${advisor.npn}` : ''}. Checked against
            the sources on {formatDate(CALENDAR_REVIEWED)}.
          </p>
        </div>
      </section>

      <div className="container max-w-3xl py-10 sm:py-14">
        <section aria-labelledby="fixed-dates">
          <h2
            id="fixed-dates"
            className="font-display text-3xl font-bold tracking-[-0.025em] text-ink"
          >
            The dates that are the same every year
          </h2>
          <p className="mt-3 text-lg leading-[1.75] text-ink-soft">
            Most other windows depend on something in your own life, such as your birthday, a
            move or the end of a job.
          </p>
          <ul className="mt-6 space-y-3">
            {fixedDates.map((item) => (
              <li
                key={item.anchor}
                className="rounded-2xl border border-line bg-paper p-5 sm:flex sm:items-baseline sm:gap-5"
              >
                <span className="block font-display text-xl font-bold text-ink sm:w-64 sm:shrink-0">
                  {item.dates}
                </span>
                <a
                  href={`#${item.anchor}`}
                  className="mt-1 inline-flex min-h-touch items-center text-lg font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 sm:mt-0"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <nav aria-label="On this page" className="mt-10 rounded-2xl border border-line bg-paper p-5">
          <h2 className="text-base font-semibold text-ink">On this page</h2>
          <ul className="mt-2">
            {calendarSections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="inline-flex min-h-touch items-center text-lg font-semibold text-navy underline decoration-line underline-offset-4 hover:decoration-navy"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {calendarSections.map((section) => (
          <section key={section.id} id={section.id} className="mt-14 scroll-mt-24">
            <h2 className="font-display text-3xl font-bold tracking-[-0.025em] text-ink">
              {section.heading}
            </h2>
            <p className="mt-3 text-lg leading-[1.75] text-ink-soft">{section.intro}</p>

            <div className="mt-6 space-y-6">
              {section.windows.map((window) => (
                <article
                  key={window.id}
                  id={window.id}
                  className="scroll-mt-24 rounded-2xl border border-line bg-paper p-6 target:border-navy target:ring-2 target:ring-navy/20"
                >
                  <h3 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">
                    {window.name}
                  </h3>
                  <dl className="mt-4 space-y-4 text-lg leading-[1.7] text-ink-soft">
                    <div>
                      <dt className={rowLabel}>Who it is for</dt>
                      <dd className="mt-1">{window.who}</dd>
                    </div>
                    <div>
                      <dt className={rowLabel}>When</dt>
                      <dd className="mt-1 font-semibold text-ink">{window.when}</dd>
                    </div>
                    <div>
                      <dt className={rowLabel}>What you can do</dt>
                      <dd className="mt-1">{window.can}</dd>
                    </div>
                    <div>
                      <dt className={rowLabel}>When it starts</dt>
                      <dd className="mt-1">{window.starts}</dd>
                    </div>
                    {window.note ? (
                      <div>
                        <dt className={rowLabel}>Keep in mind</dt>
                        <dd className="mt-1">{window.note}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <p className="mt-5 text-base text-ink-soft">
                    Source:{' '}
                    <a
                      href={window.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4"
                    >
                      {window.source.title}, {window.source.site}
                    </a>
                    {window.glossary ? (
                      <>
                        {' · '}
                        <Link
                          href={glossaryHref(window.glossary)}
                          className="font-semibold text-navy underline decoration-line underline-offset-4"
                        >
                          Glossary entry
                        </Link>
                      </>
                    ) : null}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}

        <div className="article-body mt-14">
          <h2>What this page cannot tell you</h2>
          <p>
            It cannot tell you which window applies to you. That depends on your birthday, your
            coverage and what has changed. Social Security decides Part A and Part B sign-up
            questions, and Medicare can confirm plan enrollment windows at{' '}
            {compliance.medicarePhone}. Your State Health Insurance Assistance Program gives free
            counseling.
          </p>
          <p>
            Related: <Link href="/answers/medicare-enrollment-periods-explained">enrollment periods explained</Link>,{' '}
            <Link href="/answers/how-to-switch-medicare-plans">how to switch Medicare plans</Link>,{' '}
            <Link href="/tools/eligibility-check">the enrollment check</Link> and the{' '}
            <Link href="/medicare-glossary">Medicare glossary</Link>.
          </p>
          <h2>Talk it through with a person</h2>
          <p>
            If you are not sure which window you are in, call or text me and we can work it out
            together. There is no charge and no obligation. {compliance.licensedAgentNotice}
          </p>
        </div>
        <ContactActions where="enrollment-calendar" className="mt-6" size="lg" />
      </div>

      <CtaBand where="enrollment-calendar" />
    </>
  );
}
