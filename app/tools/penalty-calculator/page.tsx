import type { Metadata } from 'next';
import { PenaltyCalculator } from '@/components/tools/penalty-calculator';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/badge';
import { breadcrumbJsonLd } from '@/lib/seo';
import { COSTS_YEAR } from '@/lib/medicare-costs';
import { site } from '@/lib/site';

const TITLE = 'What would a Medicare late enrollment penalty cost you?';
// ~150 chars: Google truncates a search-result description around there.
const DESCRIPTION =
  'Estimate the Part B and Part D late enrollment penalties in plain dollars, using the current CMS figures. No signup, no email, nothing sent anywhere.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/penalty-calculator' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent('What would a late penalty actually cost?')}&kicker=${encodeURIComponent(`Free · ${COSTS_YEAR} figures · No email`)}&subtitle=${encodeURIComponent('Part B and Part D, in plain dollars per month.')}`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
};

export default function PenaltyCalculatorPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Penalty Calculator', url: `${site.url}/tools/penalty-calculator` },
        ])}
      />
      <div className="container py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Badge tone="ember">Free · {COSTS_YEAR} figures · about 3 minutes</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">
            Find out what a late penalty would actually cost you.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Medicare&rsquo;s late enrollment penalties are permanent, which is why they are
            worth understanding before a deadline rather than after one. Answer a few dates
            and you will see the real monthly figure — or, just as often, that you do not owe
            anything at all. Nothing is sent anywhere unless you decide to send it.
          </p>
          <p className="mt-4 rounded-xl border-2 border-ember/30 bg-ember-soft p-4 text-base font-semibold leading-relaxed text-ember-deep">
            This tool gives a plain-English estimate using the {COSTS_YEAR} CMS figures. It is
            not an official Medicare determination, bill, or decision about your penalty,
            eligibility, or enrollment. For your specific situation, contact Medicare or a
            licensed Medicare broker.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            The estimate cannot conclusively determine whether a Special Enrollment Period,
            Medicare Savings Program, employer coverage, creditable drug coverage, or Extra
            Help applies. Extra Help generally means no Part D late-enrollment penalty, while
            IRMAA is a separate factor that may change what you pay.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Official {COSTS_YEAR} examples: 14 full Part D uncovered months estimates $5.50 per
            month; 24 full Part B delayed months estimates a 20% penalty and a $243.50 standard
            monthly premium including the penalty.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            For Part D, the penalty trigger is generally 63 or more consecutive days without
            Part D or other creditable drug coverage; this calculator does not subtract those
            first 63 days from the full uncovered-month estimate.
          </p>
        </div>

        <div className="mt-12">
          <PenaltyCalculator />
        </div>
      </div>
    </>
  );
}
