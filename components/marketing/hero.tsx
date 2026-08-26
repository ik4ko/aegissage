import Link from 'next/link';
import { ArrowRight, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactActions } from './contact-actions';
import { AdvisorAvatar } from './trust-bar';
import { licensedStates } from '@/lib/states';
import { advisor, compliance, contactHrefs, site } from '@/lib/site';

/**
 * The homepage hook. Built around the person, not a funnel: a claim someone
 * would actually say out loud, then the two fastest ways to reach him, with
 * the contact details sitting directly under the buttons.
 *
 * ── Why the headline column does not animate ──────────────────────────────
 * This block used `animate-fade-up`, which starts at `opacity: 0` and fills
 * backwards. An element that is transparent is not a valid Largest
 * Contentful Paint candidate, so the biggest above-the-fold text was excluded
 * from LCP until the animation had run. Measured mobile LCP was ~3.0s with
 * the animation and no network request finishing after 1.5s — the delay was
 * entirely paint-side.
 *
 * The card below the headline still animates: it is lower in the column, it
 * is not the LCP candidate, and the movement there costs nothing.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Soft radial wash — decorative only, never carries meaning. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 h-[36rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(18,62,99,0.10),transparent_70%)]"
      />

      <div className="container relative py-14 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            {/*
              Derived from lib/states.ts, never hardcoded. This read "23 more
              states" as a literal, which happened to be right only while the
              list held 26 entries — it would have quietly gone wrong the first
              time a licence was added or dropped.
            */}
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Independent · NJ · NY · PA and {licensedStates.length - 3} more states
            </p>

            <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl">
              Medicare decisions affect more than
              <span className="block text-navy">a card in your wallet.</span>
            </h1>

            {/*
              Local focus and the wider licence are two different facts, and
              running them together confused both. The eyebrow above advertises
              the full licensed-state count while this sentence used to name
              four areas as the whole service area.
            */}
            {/*
              The subheading answers "why should I care", the paragraphs below
              answer "who are you". The longer version of who he is and where
              he works lives on /about, which this page links to twice.
            */}
            <p className="mt-6 max-w-xl text-lg text-ink-soft sm:text-xl">
              They affect the doctors you trust, the prescriptions you take, and the
              peace of mind your family depends on.
            </p>

            {/*
              `basedIn` is county-level on purpose and the state count is
              derived — see lib/site.ts and lib/states.ts. Neither may be
              hardcoded here: the count read "26 states" as a literal once and
              was still saying it after a licence lapsed.
            */}
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              I&rsquo;m {advisor.name}, an independent Medicare broker in {advisor.basedIn},
              licensed in {licensedStates.length} states. I work with Medicare Advantage,
              Medicare Supplement, and Part D.
            </p>

            <p className="mt-4 max-w-xl text-lg text-ink-soft">
              In 2025 I helped my own mother get her Medicare card for the first time. The
              way I walked her through it is the same way I do it for everyone &mdash; one
              person at a time, no rushing, no script.
            </p>

            {/*
              The filled primary is the coverage review, not the quiz. It used
              to point at /tools/eligibility-check, which is a five-question
              self-serve screen — a fine tool, but the label promised a review
              with a person and the destination did not deliver one. The quiz
              is still reachable from the tools hub below.

              /medicare-coverage-review is already in HAND_AUTHORED_ZIP_ROUTES
              (lib/tpmo.ts) because it collects a ZIP, so pointing the busiest
              CTA on the site at it does not change which disclaimer variant
              anyone sees.
            */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild size="xl">
                <Link href="/medicare-coverage-review">
                  Start a private Medicare review
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <a href={contactHrefs.tel}>
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Call {advisor.firstName} &mdash; {advisor.phone}
                </a>
              </Button>
            </div>

            {/*
              The number moved onto the button itself, so this line no longer
              repeats it. It must not be reworded into a promise that the call
              is answered — one person holds this phone and some calls go to
              voicemail. See the tagline note in lib/site.ts.
            */}
            <p className="mt-4 text-base text-ink-faint">No menus, no queue.</p>

            {/*
              Required CMS disclosure for published agent phone numbers. Sits
              with the phone CTA rather than in the disclaimer block at the
              foot of the page, because the point is that someone sees it
              before they dial, not after. Verbatim — see lib/site.ts.
            */}
            <p className="mt-2 text-sm text-ink-faint">{compliance.licensedAgentNotice}</p>
          </div>

          <HeroCard />
        </div>
      </div>
    </section>
  );
}

/*
  ── Why this card no longer animates ────────────────────────────────────────
  It used `animate-fade-up`, justified in the note above on the grounds that
  the card "is not the LCP candidate, and the movement there costs nothing".
  That stopped being true once the card led with a real portrait: fade-up
  starts at opacity 0, and a transparent element is not a valid Largest
  Contentful Paint candidate — the same defect that was fixed on the <h1>.

  On a phone the card stacks directly under the headline and the portrait is
  the biggest image above the fold, so it is a genuine LCP contender. Leaving
  the animation on would have re-introduced the exact bug the file already
  documents, and it also meant the face visibly popped in after hydration.
*/
function HeroCard() {
  return (
    <aside className="rounded-3xl border border-line bg-paper p-7 shadow-lift sm:p-8 lg:mt-0">
      {/*
        The portrait leads the card rather than sitting inline beside the
        name. At 72px it read as a UI avatar; the whole pitch of this site is
        that you reach a specific person rather than a call centre, so the
        face is worth real space. Stacked rather than side-by-side because a
        144px circle beside text squeezes the name into a narrow column.
      */}
      <div className="flex flex-col items-start gap-4">
        <AdvisorAvatar
          size={160}
          responsive
          className="h-32 w-32 ring-4 sm:h-40 sm:w-40"
          priority
        />
        <div>
          <p className="font-display text-2xl font-semibold text-ink">{advisor.name}</p>
          <p className="text-base text-ink-faint">
            {advisor.credential}
          </p>
        </div>
      </div>

      <hr className="my-6 border-line" />

      <p className="font-display text-lg font-semibold text-ink">What I help with</p>
      {/*
        Each line leads with the reader's own stake — their doctors, their
        drugs, their money — rather than with the product.

        On the budget line: this deliberately does NOT say "$0 premium".
        CLAUDE.md forbids stating or implying a $0 premium before a licensed
        review, and lib/content-guard.ts rejects the same phrasing in article
        frontmatter. "A plan with no monthly premium still has costs" makes
        the same point without asserting a plan exists at that price.
      */}
      <ul className="mt-4 space-y-3.5 text-base text-ink-soft">
        {[
          'Your doctors — before anything changes, we check whether the people treating you are still in network.',
          'Your prescriptions — every plan covers drugs differently. We look at yours specifically, not a general list.',
          'Your budget — a plan with no monthly premium still has costs. I will show you where the real numbers are.',
          'Your options — Medicare Advantage, Medicare Supplement, Part D. I will explain the trade-offs and let you decide.',
        ].map((item) => (
          <li key={item} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember"
            />
            {item}
          </li>
        ))}
      </ul>

      {/*
        Says how he is actually paid. "No fee to you" on its own reads as "I
        have no financial stake in this", which is not true of any independent
        agent — carriers pay a commission on enrollment. Naming that is what
        makes the "no fee" part credible instead of evasive.

        The independence sentence sits in the middle ON PURPOSE. Admitting
        that carriers pay the commission raises the reader's obvious next
        question — does the money decide what he recommends — and this
        paragraph used to leave it hanging. The answer belongs immediately
        after the admission and before "ask me about it", not somewhere else
        on the page. Do not move it out or the disclosure goes back to being
        half an argument.

        Uncontracted ("I am", "it is") to match the rest of this box.
      */}
      <p className="mt-6 rounded-xl bg-navy-soft p-4 text-sm leading-relaxed text-navy-deep">
        You never pay me a fee, and you are never obligated to enroll in anything. If you do
        enroll, the insurance company pays the commission, not you. I am independent, which
        means no carrier tells me what to recommend. Ask me about it directly — it is a fair
        question and I will answer it.
      </p>

      <Button asChild variant="navy" size="block" className="mt-6">
        <Link href="/about">More about Erekle</Link>
      </Button>
    </aside>
  );
}
