import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactActions } from './contact-actions';
import { AdvisorAvatar } from './trust-bar';
import { licensedStates } from '@/lib/states';
import { advisor, site } from '@/lib/site';

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
              Medicare is not complicated.
              <span className="block text-navy">It is just badly explained.</span>
            </h1>

            {/*
              Local focus and the wider licence are two different facts, and
              running them together confused both. The eyebrow above advertises
              26 states while this sentence used to name four areas as the
              whole service area.
            */}
            <p className="mt-6 max-w-xl text-lg text-ink-soft sm:text-xl">
              I am {advisor.firstName}, an independent Medicare advisor based in{' '}
              {advisor.basedIn}. I work most closely with people in {site.serviceArea}, and I
              am licensed in {licensedStates.length} states. A lot of my week is spent undoing
              what a mailer or a TV commercial told someone. Ask me anything, in plain English,
              before you decide anything.
            </p>

            <ContactActions where="hero" className="mt-9" size="xl" includeEmail={false} />

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-base text-ink-faint">
              <span>Or start here, no phone call needed:</span>
              <Link
                href="/tools/eligibility-check"
                className="inline-flex min-h-touch items-center gap-1.5 font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
              >
                Check which enrollment window is yours
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <HeroCard />
        </div>
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <aside className="animate-fade-up rounded-3xl border border-line bg-paper p-7 shadow-lift sm:p-8 lg:mt-0">
      <div className="flex items-center gap-4">
        <AdvisorAvatar size={72} priority />
        <div>
          <p className="font-display text-xl font-semibold text-ink">{advisor.name}</p>
          <p className="text-sm text-ink-faint">
            {advisor.credential}
          </p>
        </div>
      </div>

      <hr className="my-6 border-line" />

      <p className="font-display text-lg font-semibold text-ink">What I actually do</p>
      <ul className="mt-4 space-y-3.5 text-base text-ink-soft">
        {[
          'Tell you which enrollment deadline applies to you, and what happens if you miss it.',
          'Check your doctors and your prescriptions against what is available in your county.',
          'Explain the trade-offs of each route honestly, including the ones I earn nothing from.',
          'Still be here next year, when something changes and you need to look at it again.',
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
      */}
      <p className="mt-6 rounded-xl bg-navy-soft p-4 text-sm leading-relaxed text-navy-deep">
        You never pay me a fee, and you are never obligated to enroll in anything. If you do
        enroll, the insurance company pays the commission, not you. Ask me about it directly
        — it is a fair question and I will answer it.
      </p>

      <Button asChild variant="navy" size="block" className="mt-6">
        <Link href="/about">More about Eric</Link>
      </Button>
    </aside>
  );
}
