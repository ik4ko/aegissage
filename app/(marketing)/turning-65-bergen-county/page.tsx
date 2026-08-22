import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarClock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { EligibilityQuiz } from '@/components/tools/eligibility-quiz';
import { AdvisorAvatar } from '@/components/marketing/trust-bar';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo';
import { advisor, compliance, contactHrefs, site } from '@/lib/site';

/**
 * Landing page: turning 65 in Bergen County.
 *
 * Built for referral-partner and local-search traffic, which arrives with a
 * specific situation rather than a general question. UTM capture is automatic
 * — <AttributionCapture /> runs in the root layout and is first-touch-only, so
 * a partner link is recorded on arrival and rides along on whatever the
 * visitor eventually submits.
 *
 * ── Copy constraints, applied throughout ─────────────────────────────────
 * No "free benefits", no "guaranteed", no language implying a government
 * connection, and no benefit dollar amounts. Every comparison between
 * Original Medicare, Medicare Advantage and Medigap has to be structurally
 * accurate — those three are not tiers of the same product, and writing them
 * as if they were is the most common way this subject gets misexplained.
 *
 * The page has to be worth reading for someone who never contacts anyone.
 */

const TITLE = 'Turning 65 in Bergen County';
const DESCRIPTION =
  'What actually happens when you turn 65 in Bergen County: which enrollment window applies, what the deadlines are, and how county lines decide your plan options.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/turning-65-bergen-county' },
  openGraph: {
    type: 'article',
    title: `${TITLE} — ${site.name}`,
    description: DESCRIPTION,
    url: `${site.url}/turning-65-bergen-county`,
  },
};

export default function Turning65BergenCountyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: site.url },
          { name: TITLE, url: `${site.url}/turning-65-bergen-county` },
        ])}
      />
      <JsonLd
        data={localBusinessJsonLd({
          path: '/turning-65-bergen-county',
          areaServed: 'Bergen County, New Jersey',
        })}
      />

      <section className="bg-cream">
        <div className="container py-14 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Bergen County, New Jersey
            </p>

            <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
              Turning 65 in Bergen County
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-ink-soft sm:text-xl">
              Most of what happens at 65 is federal and identical everywhere. A small part of
              it is decided by which county you live in — and Bergen is where that part
              actually bites, because so many people here live in New Jersey and see doctors
              in New York.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="xl">
                <Link href={contactHrefs.booking}>
                  <CalendarClock className="h-5 w-5" aria-hidden="true" />
                  Book a time to talk it through
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
          <h2>The seven months that matter</h2>
          <p>
            Your Initial Enrollment Period runs seven months: the three months before your
            birthday month, your birthday month, and the three months after. Signing up in
            the three months <em>before</em> is what gets coverage started on the first day
            of your birthday month. Waiting until after pushes the start date back.
          </p>
          <p>
            If you are still working at 65 and the employer has 20 or more employees, that
            group plan generally pays first and you can usually delay Part B without a
            penalty. Fewer than 20 employees and Medicare generally becomes the primary
            payer — which means delaying Part B can leave gaps the group plan will not fill.
            Retiree coverage and COBRA are not active employment coverage and do not protect
            you from the Part B late enrollment penalty.
          </p>

          <h2>Why the county line matters more than the town line</h2>
          <p>
            Medicare Advantage and Part D plan availability is set by CMS at the county
            level. Every town in Bergen County sees the same list of available plans —
            Fort Lee, Edgewater, Cliffside Park, Ridgewood, all of it. Moving within the
            county does not change which plans exist for you.
          </p>
          <p>
            What does change is which providers are convenient, and that is a separate
            question from which plans exist. A great many people in Bergen County live in
            New Jersey and use New York hospitals and specialists. If that is you, the
            network check is the whole ballgame, and it is done doctor by doctor rather than
            plan by plan.
          </p>

          <h2>Three routes, and they are not tiers</h2>
          <p>
            <strong>Original Medicare</strong> is Parts A and B, administered by the federal
            program. You can see any provider who accepts Medicare, there is no network, and
            there is no annual out-of-pocket maximum on its own. It does not include drug
            coverage.
          </p>
          <p>
            <strong>Medicare Advantage</strong> (Part C) is an alternative way to receive
            your Part A and Part B benefits, offered by private insurers under contract with
            Medicare. These plans have provider networks and an annual out-of-pocket
            maximum, and most include drug coverage. Availability, networks and the drug
            list are set per county and per contract year.
          </p>
          <p>
            <strong>Medigap</strong> (Medicare Supplement) is not an alternative to Original
            Medicare — it works alongside it, covering some of the costs Original Medicare
            leaves to you. You cannot hold a Medigap policy and a Medicare Advantage plan at
            the same time, and Medigap does not include drug coverage, so a Part D plan is a
            separate decision.
          </p>
          <p>
            The trade-off worth understanding early is that Medigap has a one-time window
            when you first enroll in Part B at 65 during which medical underwriting does not
            apply. Outside that window, in most states, an insurer can decline you or charge
            more based on health history. That is a genuine one-way door and it is the
            reason this decision is worth making deliberately rather than by default.
          </p>

          <h2>What I would do first</h2>
          <p>
            Write down your doctors and your prescriptions before you look at a single plan.
            Then find out, in writing, whether the coverage you have now counts as creditable
            drug coverage. Those two facts determine most of what follows, and both are far
            easier to establish now than to reconstruct later.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-line bg-cream">
        <div className="container py-14 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-[-0.02em] text-ink sm:text-4xl">
              Not sure which window applies to you?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Six questions, no email required, and nothing is saved unless you choose to
              send it. It tells you which enrollment window is open and what the deadline is
              — it does not recommend a plan.
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
            If you would rather just talk it through, book a time. It is about an hour, there
            is no fee to you for the conversation, and nothing is enrolled on the call.
          </p>
          <Button asChild size="xl">
            <Link href={contactHrefs.booking}>
              <CalendarClock className="h-5 w-5" aria-hidden="true" />
              Book a time
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
