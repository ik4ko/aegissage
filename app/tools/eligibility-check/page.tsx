import type { Metadata } from 'next';
import { EligibilityQuiz } from '@/components/tools/eligibility-quiz';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/badge';
import { breadcrumbJsonLd } from '@/lib/seo';
import { site } from '@/lib/site';

const TITLE = 'Which Medicare enrollment window is yours?';
const DESCRIPTION =
  'Five questions, one per screen. A plain-English read of which Medicare enrollment window applies to your situation and what happens if you miss it. No signup, no email required.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/eligibility-check' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent(TITLE)}&kicker=${encodeURIComponent('Free · 2 minutes · No email')}&subtitle=${encodeURIComponent('Five questions. One per screen. Straight answer at the end.')}`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
};

export default function EligibilityCheckPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Eligibility Check', url: `${site.url}/tools/eligibility-check` },
        ])}
      />
      <div className="container py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Badge tone="ember">Free · about 2 minutes</Badge>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">
          Let us find out which Medicare deadline is actually yours.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          Most of the panic around Medicare comes from not knowing which clock you are on.
          Five questions and you will know. Nothing is sent anywhere unless you decide to
          send it.
        </p>
      </div>

      <div className="mt-12">
        <EligibilityQuiz />
      </div>
      </div>
    </>
  );
}
