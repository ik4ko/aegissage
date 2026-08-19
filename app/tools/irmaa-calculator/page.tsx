import type { Metadata } from 'next';
import { IrmaaCalculator } from '@/components/tools/irmaa-calculator';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/badge';
import { breadcrumbJsonLd } from '@/lib/seo';
import { IRMAA_MAGI_YEAR, IRMAA_YEAR } from '@/lib/irmaa';
import { site } from '@/lib/site';

const TITLE = 'Would you owe a Medicare IRMAA surcharge?';
// ~150 chars: Google truncates a search-result description around there.
const DESCRIPTION =
  'Check your Medicare Part B and Part D income surcharge against the current IRMAA brackets, and see how far you are from the next one. No email required.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/irmaa-calculator' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent('Would you owe an IRMAA surcharge?')}&kicker=${encodeURIComponent(`Free · ${IRMAA_YEAR} brackets · No email`)}&subtitle=${encodeURIComponent('Part B and Part D income surcharges, in plain dollars.')}`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
};

export default function IrmaaCalculatorPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'IRMAA Calculator', url: `${site.url}/tools/irmaa-calculator` },
        ])}
      />
      <div className="container py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Badge tone="navy">Free · {IRMAA_YEAR} brackets · about 2 minutes</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">
            Find out whether your income adds a surcharge to your Medicare premium.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Above a certain income, Social Security adds an amount to both your Part B and Part D
            premiums. It is called IRMAA, it is decided by your tax return from two years ago, and
            it arrives as a notice most people are not expecting. Enter one figure and you will see
            exactly where you land — and how much room there is before the next threshold.
          </p>
          <p className="mt-4 rounded-xl border-2 border-ember/30 bg-ember-soft p-4 text-base font-semibold leading-relaxed text-ember-deep">
            This tool gives a plain-English estimate using the {IRMAA_YEAR} brackets and your{' '}
            {IRMAA_MAGI_YEAR} income. It is not a bill or an official determination — Social
            Security decides the actual amount from the figure the IRS reports to them.
          </p>
        </div>

        <div className="mt-12">
          <IrmaaCalculator />
        </div>
      </div>
    </>
  );
}
