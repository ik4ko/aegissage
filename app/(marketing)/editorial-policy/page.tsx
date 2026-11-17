import type { Metadata } from 'next';
import { withShareCard } from '@/lib/page-metadata';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo';
import { advisor, contactHrefs, site } from '@/lib/site';

const TITLE = 'Editorial policy';
const DESCRIPTION = 'How the Medicare guides on aegissage.com are written, sourced, reviewed and corrected, and who is responsible for them.';
/** Date this page was last reviewed by Erekle. Update it when the text changes. */
const REVIEWED = 'November 16, 2026';

export const metadata: Metadata = withShareCard(
  {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/editorial-policy' },
    openGraph: { type: 'website', url: `${site.url}/editorial-policy`, title: TITLE, description: DESCRIPTION },
  },
  { path: '/editorial-policy', kicker: 'Editorial policy' },
);

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: site.url },
          { name: TITLE, url: `${site.url}/editorial-policy` },
        ])}
      />
      <div className="container py-14 sm:py-20">
        <div className="mx-auto max-w-[68ch]">
          <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
            {TITLE}
          </h1>
          <p className="mt-4 text-base text-ink-soft">
            By <Link href="/about#credentials" className="underline">{advisor.name}</Link>, licensed
            insurance broker, NPN {advisor.npn}. Last reviewed {REVIEWED}.
          </p>
          <div className="article-body mt-10">
            <h2>Who writes and reviews this site</h2>
            <p>
              I do. I am {advisor.name}, a licensed insurance broker. Every guide and answer
              page carries my name and the date I last reviewed it. Some pages are drafted
              with the help of AI writing tools. Nothing is published until I have read it
              and checked it against the sources below.
            </p>

            <h2>Sources</h2>
            <p>
              Facts about Medicare come from government sources: Medicare.gov, the Centers
              for Medicare &amp; Medicaid Services (cms.gov), the Social Security
              Administration (ssa.gov), and state agencies in New Jersey, New York and
              Pennsylvania. Each answer page lists the pages it was checked against. I do
              not use insurance company marketing as a source.
            </p>

            <h2>What you will not find here</h2>
            <ul>
              <li>Rankings of plans or companies, or claims that any plan is the best.</li>
              <li>Statements that you qualify for a plan, a benefit or a savings amount.</li>
              <li>Numbers I cannot trace to a source.</li>
              <li>Plan premiums or benefits without a source and a review date.</li>
            </ul>

            <h2>Review cycle</h2>
            <p>
              Medicare changes every year. I review every guide and answer page at least
              once a year, before the fall enrollment period that starts October 15, and
              sooner when a rule changes.
            </p>

            <h2>Corrections</h2>
            <p>
              If you see something wrong, tell me: <a href={contactHrefs.tel}>{advisor.phone}</a>{' '}
              or <Link href="/contact">send a message</Link>. I will check it against the
              source, fix it, and update the review date on the page.
            </p>

            <h2>Education, not advice for your situation</h2>
            <p>
              These pages explain how Medicare works in general. They cannot tell you what
              is right for you. That takes a conversation about your doctors, your
              prescriptions and where you live. See also <Link href="/how-we-are-paid">how I am paid</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
