import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { EligibilityQuiz } from '@/components/tools/eligibility-quiz';
import { AdvisorAvatar } from '@/components/marketing/trust-bar';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo';
import { advisor, compliance, contactHrefs, site } from '@/lib/site';

/**
 * Landing page: an annual coverage review.
 *
 * The audience is already on Medicare, which makes it a different page from
 * /turning-65-bergen-county rather than a reskin of it. Someone here is not
 * choosing for the first time; they are deciding whether what they have still
 * fits, usually because something changed or because AEP came round again.
 *
 * ── Copy constraints ─────────────────────────────────────────────────────
 * No "free benefits", no "guaranteed", no language implying a government
 * connection, and no benefit dollar amounts. No claim that a review will save
 * money — it may well conclude that changing nothing is correct, and saying
 * so plainly is the only version of this page worth publishing.
 *
 * UTM capture is automatic via <AttributionCapture /> in the root layout.
 */

const TITLE = 'Medicare coverage review';
const DESCRIPTION =
  'An honest look at whether your current Medicare coverage still fits: what changes each year, what to check, and when changing plans is actually possible.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/medicare-coverage-review' },
  openGraph: {
    type: 'article',
    title: `${TITLE} — ${site.name}`,
    description: DESCRIPTION,
    url: `${site.url}/medicare-coverage-review`,
  },
};

export default function MedicareCoverageReviewPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: site.url },
          { name: TITLE, url: `${site.url}/medicare-coverage-review` },
        ])}
      />
      <JsonLd
        data={localBusinessJsonLd({
          path: '/medicare-coverage-review',
          areaServed: site.serviceArea,
        })}
      />

      <section className="bg-cream">
        <div className="container py-14 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Already on Medicare
            </p>

            <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
              Does what you have still fit?
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-ink-soft sm:text-xl">
              Plans change every year and people do too. A review is not a sales appointment
              — quite often the honest answer is that your current coverage is still the
              right one and you should leave it alone. That is a perfectly good outcome, and
              it is worth an hour to know it rather than assume it.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="xl">
                <Link href={contactHrefs.booking}>
                  <CalendarClock className="h-5 w-5" aria-hidden="true" />
                  Book a review
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-ink-faint">
              No cost and no obligation. Nothing is enrolled on the call.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        <Reveal className="mx-auto max-w-[68ch] article-body">
          <h2>What actually changes from year to year</h2>
          <p>
            If you are in a Medicare Advantage or Part D plan, the insurer can change the
            drug list, the provider network, the cost sharing and the premium for each new
            contract year. Your plan is required to send you an Annual Notice of Change in
            the autumn setting out what is different. It is a dull document and it is the
            single most useful thing you will read about your coverage all year.
          </p>
          <p>
            The three things worth checking against it: whether each of your prescriptions
            is still on the formulary and at what tier, whether your doctors and preferred
            hospital are still in network for next year, and whether the out-of-pocket
            maximum moved. Any one of those changing is a real reason to look; none of them
            changing is a real reason to do nothing.
          </p>

          <h2>When you can actually change something</h2>
          <p>
            The Annual Enrollment Period runs October 15 to December 7, with changes taking
            effect January 1. That is the window most people use.
          </p>
          <p>
            From January 1 to March 31 there is a Medicare Advantage Open Enrollment Period,
            which lets someone already in a Medicare Advantage plan switch to a different one
            or return to Original Medicare. It is narrower than AEP and it is not available
            to everyone.
          </p>
          <p>
            Outside those, a Special Enrollment Period may open because of a move, a loss of
            other coverage, or a change in eligibility for a Medicare Savings Program or
            Extra Help. Whether one applies to you is a question of fact, not of judgement,
            and it is worth establishing before assuming you are stuck until October.
          </p>

          <h2>The part that is genuinely one-way</h2>
          <p>
            Moving from Medicare Advantage back to Original Medicare is generally
            straightforward during the windows above. Adding a Medigap policy afterwards may
            not be.
          </p>
          <p>
            Medigap works alongside Original Medicare rather than replacing it, and outside
            your one-time Medigap open enrollment window — the six months beginning when you
            are 65 and enrolled in Part B — an insurer in most states can use medical
            underwriting. That means health history can affect whether you are accepted and
            what you pay. Some states and some situations create additional rights to buy a
            Medigap policy without underwriting; New Jersey&rsquo;s rules are not identical to
            New York&rsquo;s, which matters here more than it does most places.
          </p>
          <p>
            This is why &ldquo;I will switch later if it does not work out&rdquo; is a reasonable plan in
            one direction and a risky one in the other. Worth knowing which direction you are
            facing before you need to move.
          </p>

          <h2>What a review with me looks like</h2>
          <p>
            Bring your Annual Notice of Change if it has arrived, a list of your
            prescriptions with doses, and the doctors you want to keep. We go through what
            changed, whether it affects you, and whether any window is currently open to you.
            If the answer is that nothing needs to change, that is what I will tell you.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-line bg-cream">
        <div className="container py-14 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-[-0.02em] text-ink sm:text-4xl">
              Not sure which window you are in?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Six questions, no email required, and nothing is saved unless you choose to
              send it. It tells you which enrollment window applies to your situation — it
              does not recommend a plan.
            </p>
          </div>

          <div className="mt-10">
            <EligibilityQuiz />
          </div>
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-3xl border border-line bg-paper p-8 text-center shadow-lift sm:p-10">
          <AdvisorAvatar size={120} className="h-24 w-24 ring-4" />
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{advisor.name}</p>
            <p className="text-base text-ink-faint">
              {advisor.credential} · {advisor.basedIn}
            </p>
          </div>
          <p className="max-w-prose text-lg leading-relaxed text-ink-soft">
            Book an hour and we will go through it together. There is no fee to you for the
            conversation, and nothing is enrolled on the call.
          </p>
          <Button asChild size="xl">
            <Link href={contactHrefs.booking}>
              <CalendarClock className="h-5 w-5" aria-hidden="true" />
              Book a review
            </Link>
          </Button>
          <p className="text-sm text-ink-faint">
            Or call {advisor.phone}. {compliance.licensedAgentNotice}
          </p>
        </Reveal>
      </section>
    </>
  );
}
