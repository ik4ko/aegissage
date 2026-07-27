import type { Metadata } from 'next';
import Link from 'next/link';
import { PlanComparisonTable } from '@/components/tools/plan-comparison-table';
import { CtaBand } from '@/components/marketing/cta-band';
import { TrustBar } from '@/components/marketing/trust-bar';
import { ShareBar } from '@/components/marketing/share-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TITLE = 'Original Medicare vs. Medicare Advantage, side by side';
const DESCRIPTION =
  'The structural differences between the two routes through Medicare, laid out plainly. No plan names, no rankings — just how each one is built and what that means for you.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/plan-comparison' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent('Original Medicare vs. Medicare Advantage')}&kicker=${encodeURIComponent('Side by side')}&subtitle=${encodeURIComponent('Two routes. One decision that is hard to undo. Here is the honest comparison.')}`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
};

export default function PlanComparisonPage() {
  return (
    <>
      <div className="container py-12 sm:py-16">
        <div className="max-w-3xl">
          <Badge tone="navy">Side by side</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
            Two routes through Medicare. One decision that is hard to undo.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
            Almost every Medicare choice eventually comes down to this fork. Below is how
            the two routes are built — not which one wins, because that depends entirely on
            your doctors, your prescriptions and your tolerance for surprises.
          </p>
        </div>

        <TrustBar className="mt-9 max-w-3xl" />

        <div className="mt-12">
          <PlanComparisonTable />
        </div>

        <div className="mt-12 max-w-3xl">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">
            The part that catches people
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Moving from Original Medicare to a Medicare Advantage plan is generally
            straightforward during an open window. Moving back is where it gets
            complicated: returning to Original Medicare is allowed, but buying a Medigap
            policy at that point usually means medical underwriting, and an insurer can
            decline you.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            That asymmetry is the single most important thing to understand before you
            choose, and it is the thing a thirty-second commercial will never mention.
            Rules differ by state — a few states require guaranteed issue year-round.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/tools/eligibility-check">Check which window is yours →</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/medicare-basics">Read the guides</Link>
            </Button>
          </div>

          <div className="mt-10">
            <ShareBar path="/tools/plan-comparison" title={TITLE} />
          </div>
        </div>
      </div>

      <CtaBand
        where="plan-comparison-cta"
        heading="Want the version that accounts for your doctors?"
        body="Send me your prescription list and the doctors you want to keep. That turns this general table into an actual answer — usually in one call."
      />
    </>
  );
}
