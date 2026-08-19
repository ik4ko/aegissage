'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Info, ShieldQuestion, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContactActions } from '@/components/marketing/contact-actions';
import { ContactForm } from '@/components/forms/contact-form';
import { GlossaryTerm } from '@/components/marketing/glossary-term';
import { TrustBar } from '@/components/marketing/trust-bar';
import { ShareBar } from '@/components/marketing/share-bar';
import {
  FILING_STATUS_LABELS,
  IRMAA_MAGI_YEAR,
  IRMAA_SOURCE_NOTE,
  IRMAA_TIERS,
  IRMAA_YEAR,
  estimateIrmaa,
  formatMagiDollars,
  formatMagiRange,
  type FilingStatus,
} from '@/lib/irmaa';
import { PART_B_STANDARD_PREMIUM, formatUsd } from '@/lib/medicare-costs';
import { trackIrmaaCalculated, trackIrmaaStarted } from '@/lib/analytics';
import { cn } from '@/lib/utils';

/**
 * IRMAA estimator.
 *
 * ── One screen, not a wizard ──────────────────────────────────────────────
 * The penalty calculator next door is a three-step flow because it needs
 * four dates and a coverage history, and showing all of that at once is what
 * makes people close the tab. This tool needs two answers. Wrapping two
 * inputs in a stepper would add a progress bar, a Continue button and a
 * result screen to reach the same place, and would hide the one thing that
 * makes IRMAA legible: watching the number move as the income figure
 * changes. A wizard is a tool for reducing what is on screen. There is
 * nothing here to reduce.
 *
 * So: both inputs stay visible, the result updates live underneath them, and
 * there is no submit step. Nothing is ever "wrong" mid-typing — an empty
 * field simply shows the standard premium, which is the honest answer for
 * an income of nothing.
 *
 * ── Why the whole bracket table is on screen ──────────────────────────────
 * IRMAA is a cliff, not a slope. One dollar over a threshold applies the
 * full surcharge for twelve months, and the surcharge does not phase in.
 * Showing only the matched row would make the tool look like a smooth curve.
 * The table makes the cliffs visible, and it is also the thing a suspicious
 * reader can check against ssa.gov line by line.
 *
 * ── The distance readout, and what it deliberately does not say ───────────
 * Reporting how far someone sits below the next threshold is a fact about
 * the brackets and genuinely useful. Pairing it with advice — defer the
 * conversion, sell in January, spread the distribution — is tax planning,
 * which is a licensed conversation this page is not. The copy states the
 * gap and stops.
 *
 * ── Privacy ──────────────────────────────────────────────────────────────
 * An income figure is the most sensitive input anywhere on this site. It
 * stays in component state, is never persisted, and never reaches analytics
 * in any form — not the amount, not the bracket. See lib/analytics.ts.
 */

const FILING_OPTIONS: { value: FilingStatus; label: string; hint: string }[] = [
  {
    value: 'single',
    label: 'Single',
    hint: 'Also head of household, or a qualifying surviving spouse',
  },
  {
    value: 'joint',
    label: 'Married, filing jointly',
    hint: 'The thresholds are roughly double the single ones',
  },
  {
    value: 'separate',
    label: 'Married, filing separately',
    hint: 'Far harsher — there is no gentle first step',
  },
];

/** Digits only, so "$120,000" and "120000" and "120,000" all mean the same. */
function parseMagi(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;
  return Number(digits);
}

/** Thousands separators while typing — a seven-figure number is unreadable raw. */
function formatWhileTyping(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

export function IrmaaCalculator() {
  const [rawMagi, setRawMagi] = useState('');
  const [filing, setFiling] = useState<FilingStatus>('single');
  const started = useRef(false);

  const magi = parseMagi(rawMagi);
  const hasIncome = magi !== null;
  const estimate = useMemo(() => estimateIrmaa(magi ?? 0, filing), [magi, filing]);

  function touch() {
    if (started.current) return;
    started.current = true;
    trackIrmaaStarted();
  }

  /*
    Live input means a keystroke-per-event would be noise, and would also
    stream a rough income shape into analytics one digit at a time even
    though no single event carries it. Settling for a beat and sending one
    coarse event avoids both. Nothing in the payload describes the amount.
  */
  useEffect(() => {
    if (!hasIncome) return;
    const timer = setTimeout(() => {
      trackIrmaaCalculated({ surcharge: !estimate.isStandard, filing });
    }, 1200);
    return () => clearTimeout(timer);
  }, [hasIncome, estimate.isStandard, filing]);

  const tiers = IRMAA_TIERS[filing];

  /* Sent to the advisor only when the visitor fills the form and ticks
     consent — which is why this one may carry the figure. */
  const context: Record<string, string> = {
    'Filing status': FILING_STATUS_LABELS[filing],
    [`${IRMAA_MAGI_YEAR} MAGI entered`]: hasIncome ? formatMagiDollars(magi) : 'not given',
    'IRMAA bracket': hasIncome
      ? `${estimate.tierIndex + 1} of ${estimate.tierCount}`
      : 'not calculated',
    'Monthly surcharge': hasIncome ? `${formatUsd(estimate.monthlySurcharge)}/mo` : 'not calculated',
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* ── Inputs ─────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border-2 border-line bg-paper p-6 sm:p-8">
        <label htmlFor="irmaa-magi" className="block">
          <span className="font-display text-xl font-semibold text-ink">
            Your {IRMAA_MAGI_YEAR} income
          </span>
          <span className="mt-1 block text-base text-ink-soft">
            The figure from your {IRMAA_MAGI_YEAR} tax return — adjusted gross income plus any
            tax-exempt interest. A close estimate is fine.
          </span>
        </label>

        <div className="relative mt-4">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 font-display text-2xl font-bold text-ink-faint"
          >
            $
          </span>
          <input
            id="irmaa-magi"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={formatWhileTyping(rawMagi)}
            onChange={(e) => {
              touch();
              setRawMagi(e.target.value);
            }}
            className="min-h-touch w-full rounded-xl border-2 border-line bg-cream py-3 pl-11 pr-5 font-display text-2xl font-bold tracking-[-0.02em] text-ink transition-colors hover:border-navy/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
          />
        </div>

        <fieldset className="mt-8">
          <legend className="font-display text-xl font-semibold text-ink">
            How did you file that year?
          </legend>
          <p className="mt-1 text-base text-ink-soft">
            The thresholds are different for each, and married-filing-separately is not a
            halfway point between the other two.
          </p>

          <div className="mt-4 grid gap-3">
            {FILING_OPTIONS.map((option) => {
              const selected = filing === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    touch();
                    setFiling(option.value);
                  }}
                  aria-pressed={selected}
                  className={cn(
                    'group flex min-h-touch w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30',
                    selected
                      ? 'border-navy bg-navy-soft'
                      : 'border-line bg-cream hover:border-navy/50 hover:bg-navy-soft/40',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors',
                      selected ? 'border-navy bg-navy' : 'border-ink/30 group-hover:border-navy/60',
                    )}
                  >
                    {selected ? <span className="h-3 w-3 rounded-full bg-white" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold text-ink">{option.label}</span>
                    <span className="mt-0.5 block text-base text-ink-faint">{option.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/*
        The result is announced politely rather than assertively: it changes
        on every keystroke, and an assertive region would interrupt a screen
        reader user mid-word each time a digit lands.
      */}
      <div aria-live="polite" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge tone={estimate.isStandard ? 'sage' : 'ember'}>
            {hasIncome ? 'Your estimate' : `${IRMAA_YEAR} figures`}
          </Badge>
          {hasIncome ? (
            <span className="text-base font-semibold text-ink-faint">
              Bracket {estimate.tierIndex + 1} of {estimate.tierCount}
            </span>
          ) : null}
        </div>

        <h2 className="mt-5 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
          {!hasIncome
            ? 'Enter an income figure to see where it lands.'
            : estimate.isStandard
              ? 'No IRMAA surcharge at this income.'
              : `About ${formatUsd(estimate.monthlySurcharge)} a month on top of the standard premium.`}
        </h2>

        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          {!hasIncome
            ? `The brackets below are the ${IRMAA_YEAR} figures. Your ${IRMAA_MAGI_YEAR} return is what decides which row applies to you.`
            : estimate.isStandard
              ? `Your ${IRMAA_MAGI_YEAR} income is under the first threshold, so you pay the standard Part B premium of ${formatUsd(PART_B_STANDARD_PREMIUM)} and nothing extra on Part D.`
              : `That is roughly ${formatUsd(estimate.yearlySurcharge)} a year in surcharges, on top of the standard premium and on top of whatever your drug plan charges.`}
        </p>

        {/* ── The three figures ────────────────────────────────────────── */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <FigureCard
            title="Part B premium"
            subtitle="Doctor and hospital coverage"
            amount={estimate.partBPremium}
            highlight={estimate.partBSurcharge > 0}
            detail={
              estimate.partBSurcharge > 0
                ? `${formatUsd(PART_B_STANDARD_PREMIUM)} standard + ${formatUsd(estimate.partBSurcharge)} surcharge`
                : 'The standard premium, with nothing added'
            }
          />
          <FigureCard
            title="Part D surcharge"
            subtitle="Prescription drug coverage"
            amount={estimate.partDSurcharge}
            highlight={estimate.partDSurcharge > 0}
            detail={
              estimate.partDSurcharge > 0
                ? 'Added to your drug plan premium, and paid to Medicare separately'
                : 'Nothing added to your drug plan premium'
            }
          />
        </div>

        {!estimate.isStandard ? (
          <div className="mt-4 rounded-2xl border-2 border-ember/40 bg-ember-soft p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ember-deep">
              Combined, over a year
            </p>
            <p className="mt-2 font-display text-4xl font-bold tracking-[-0.03em] text-ember-deep">
              {formatUsd(estimate.yearlySurcharge)}
            </p>
            <p className="mt-3 text-base leading-relaxed text-ember-deep">
              That is the surcharge alone. Including the standard premium, Part B and the Part D
              adjustment come to about{' '}
              <strong className="font-semibold">{formatUsd(estimate.yearlyTotal)}</strong> for the
              year — before your drug plan&rsquo;s own premium, which varies by plan.
            </p>
          </div>
        ) : null}

        {/* ── Distance to the next cliff ───────────────────────────────── */}
        {hasIncome && estimate.nextTierAt !== null ? (
          <div className="mt-4 rounded-2xl border-2 border-navy/25 bg-navy-soft p-6">
            <p className="flex items-start gap-3 text-lg font-semibold text-navy-deep">
              <TrendingUp className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
              {estimate.amountUnderNextTier === 0
                ? 'You are right at the next threshold.'
                : `${formatMagiDollars(estimate.amountUnderNextTier ?? 0)} more income would put you in the next bracket.`}
            </p>
            <p className="mt-3 text-base leading-relaxed text-navy-deep">
              The next bracket starts at {formatMagiDollars(estimate.nextTierAt)} and carries a
              surcharge of about{' '}
              <strong className="font-semibold">
                {formatUsd(estimate.nextTierMonthlySurcharge ?? 0)} a month
              </strong>{' '}
              — {formatUsd((estimate.nextTierMonthlySurcharge ?? 0) * 12)} a year. IRMAA has no
              phase-in: a single dollar over the line applies the whole of it, for the whole year.
            </p>
            <p className="mt-3 text-base leading-relaxed text-navy-deep/80">
              That is a fact about the brackets, not a suggestion about what to do with your
              income. Anything involving a Roth conversion, a property sale or a withdrawal
              schedule is a conversation for your tax professional.
            </p>
          </div>
        ) : null}

        {hasIncome && estimate.isTopTier ? (
          <div className="mt-4 rounded-2xl border border-line bg-paper p-5">
            <p className="text-base leading-relaxed text-ink-soft">
              This is the highest bracket, so there is no further threshold above it. The
              surcharge does not keep climbing with income beyond this point.
            </p>
          </div>
        ) : null}
      </div>

      {/* ── The whole table ──────────────────────────────────────────────── */}
      <div className="mt-8 rounded-2xl border border-line bg-paper p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
          {IRMAA_YEAR} brackets · {FILING_STATUS_LABELS[filing]}
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left text-base">
            <caption className="sr-only">
              {IRMAA_YEAR} IRMAA brackets for {FILING_STATUS_LABELS[filing]}, showing the income
              range and the monthly Part B and Part D surcharges for each.
            </caption>
            <thead>
              <tr className="border-b-2 border-line">
                <th scope="col" className="py-2 pr-4 font-semibold text-ink-soft">
                  {IRMAA_MAGI_YEAR} income
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold text-ink-soft">
                  Part B
                </th>
                <th scope="col" className="py-2 text-right font-semibold text-ink-soft">
                  Part D
                </th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, index) => {
                const isYours = hasIncome && index === estimate.tierIndex;
                return (
                  <tr
                    key={tier.minMagi}
                    className={cn(
                      'border-b border-line last:border-0',
                      isYours && 'bg-navy-soft font-semibold',
                    )}
                  >
                    <th scope="row" className="py-3 pr-4 font-normal text-ink">
                      {formatMagiRange(tier)}
                      {isYours ? (
                        <span className="ml-2 whitespace-nowrap text-sm font-semibold text-navy">
                          ← you
                        </span>
                      ) : null}
                    </th>
                    <td className="py-3 pr-4 text-right tabular-nums text-ink">
                      {formatUsd(PART_B_STANDARD_PREMIUM + tier.partBSurcharge)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-ink">
                      {tier.partDSurcharge > 0 ? `+ ${formatUsd(tier.partDSurcharge)}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-faint">
          Part B figures are the full monthly premium. Part D figures are the surcharge only —
          added to whatever your chosen drug plan charges, and billed by Medicare rather than by
          the plan. Ranges are shown to the dollar because the brackets genuinely work that way.
        </p>

        {filing === 'separate' ? (
          <p className="mt-4 rounded-xl border-2 border-ember/30 bg-ember-soft p-4 text-base leading-relaxed text-ember-deep">
            <strong className="font-semibold">
              These are the figures for a couple who lived together at any point that year.
            </strong>{' '}
            If you filed separately and lived apart from your spouse for the entire tax year,
            Social Security uses the single table instead — a very different answer. That
            exception is narrow and worth confirming with Social Security rather than assuming.
          </p>
        ) : null}
      </div>

      {/* ── The two-year lookback ────────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border-2 border-navy/20 bg-navy-soft/50 p-6">
        <p className="flex items-start gap-3 text-lg font-semibold text-navy-deep">
          <Info className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
          Your {IRMAA_YEAR} premium is set by your {IRMAA_MAGI_YEAR} tax return.
        </p>
        <p className="mt-3 text-base leading-relaxed text-navy-deep">
          Social Security looks back two years, because that is the most recent return the IRS has
          finished processing when premiums are set. So a year with an unusually high income — a
          house sale, a large distribution, a final year of full-time work — shows up on your
          premium two years later, often long after you had stopped thinking about it. It also
          means the surcharge falls away on its own once a normal year works through the same
          two-year lag.
        </p>
      </div>

      {/* ── SSA-44 ───────────────────────────────────────────────────────── */}
      <div className="mt-4 rounded-2xl border border-line bg-paper p-6">
        <p className="flex items-start gap-3 text-lg font-semibold text-ink">
          <ShieldQuestion className="mt-0.5 h-6 w-6 shrink-0 text-navy" aria-hidden="true" />
          If your income has since dropped, there is a form for that.
        </p>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Social Security will reconsider the surcharge when a specific life-changing event caused
          the drop — retirement or reduced work hours, the death of a spouse, marriage or divorce,
          loss of a pension, or loss of income-producing property. The form is{' '}
          <strong className="font-semibold text-ink">SSA-44</strong>, &ldquo;Medicare
          Income-Related Monthly Adjustment Amount — Life-Changing Event&rdquo;, and it is filed
          with Social Security along with evidence of the change.
        </p>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Worth knowing that a merely lower income does not qualify on its own — the reduction has
          to trace to one of the listed events. Retiring is the one that applies to most people
          who land here, and it is also the one most often left unfiled because nobody mentions it.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
          Terms that came up
        </p>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-base">
          <GlossaryTerm k="irmaa" />
          <GlossaryTerm k="part-b" />
          <GlossaryTerm k="part-d" />
          <GlossaryTerm k="lis" />
        </p>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-ember/30 bg-ember-soft p-5">
        <p className="text-base leading-relaxed text-ember-deep">
          <strong className="font-semibold">
            This is a plain-English estimate, not a bill and not a determination.
          </strong>{' '}
          Social Security decides what any surcharge actually is, using the income figure the IRS
          reported to them — which may differ from what you entered here, and which uses a
          modified adjusted gross income that adds back tax-exempt interest and certain other
          items. Figures use the {IRMAA_YEAR} brackets published by {IRMAA_SOURCE_NOTE}, and they
          change annually. If you are billed a surcharge you did not expect, Social Security sends
          a notice explaining which return it used — start there rather than here.
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-navy-deep/20 bg-navy-deep p-6 text-white shadow-lift sm:p-8">
        <h3 className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
          {estimate.isStandard && hasIncome
            ? 'Worth knowing where the line sits'
            : 'Talk through what this means for your plan choice'}
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-white/80">
          {estimate.isStandard && hasIncome
            ? 'No surcharge today does not mean no surcharge in two years — the return that sets your premium has usually already been filed. Ten minutes now is cheaper than a surprise notice later.'
            : 'A surcharge does not change which plan is right for you, but it does change what the whole year costs — and that is worth having on the table before you choose one.'}
        </p>
        <ContactActions where="irmaa-calculator-result" className="mt-6" size="lg" onDark />
      </div>

      <TrustBar className="mt-8" />

      <div className="mt-8">
        <ContactForm
          source="irmaa-calculator"
          context={context}
          heading="Want me to look at this alongside your actual plan costs?"
          intro="Send it over and I will tell you what I see — including whether an SSA-44 is worth filing, and what the surcharge does to the total cost of the plans you are weighing."
        />
      </div>

      <div className="mt-8">
        <ShareBar
          path="/tools/irmaa-calculator"
          title="Would I owe a Medicare IRMAA surcharge?"
        />
      </div>

      <p className="mt-8 text-sm leading-relaxed text-ink-faint">
        Nothing you enter here is sent anywhere. Your income figure stays in your browser unless
        you choose to send it to me at the end.
      </p>
    </div>
  );
}

function FigureCard({
  title,
  subtitle,
  amount,
  detail,
  highlight,
}: {
  title: string;
  subtitle: string;
  amount: number;
  detail: string;
  highlight: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-5',
        highlight ? 'border-ember/40 bg-ember-soft' : 'border-line bg-paper',
      )}
    >
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      <p className="text-sm text-ink-faint">{subtitle}</p>

      <p
        className={cn(
          'mt-4 font-display text-3xl font-bold tracking-[-0.03em] tabular-nums',
          highlight ? 'text-ember-deep' : 'text-ink',
        )}
      >
        {formatUsd(amount)}
        <span className="text-lg font-semibold"> /month</span>
      </p>

      <p className="mt-3 text-sm leading-relaxed text-ink-faint">{detail}</p>
    </div>
  );
}
