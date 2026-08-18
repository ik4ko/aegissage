'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ContactActions } from '@/components/marketing/contact-actions';
import { ContactForm } from '@/components/forms/contact-form';
import { GlossaryTerm } from '@/components/marketing/glossary-term';
import { TrustBar } from '@/components/marketing/trust-bar';
import { ShareBar } from '@/components/marketing/share-bar';
import {
  COSTS_SOURCE_NOTE,
  COSTS_YEAR,
  PART_B_STANDARD_PREMIUM,
  PART_D_BASE_PREMIUM,
  estimatePartBPenalty,
  estimatePartDPenalty,
  formatUsd,
  type CoverageAnswer,
  type PenaltyEstimate,
  type PenaltyInput,
  type YearMonth,
} from '@/lib/medicare-costs';
import { trackPenaltyCalculated, trackPenaltyStarted, trackPenaltyStep } from '@/lib/analytics';
import { cn } from '@/lib/utils';

/**
 * Late enrollment penalty estimator.
 *
 * ── What this is allowed to say ───────────────────────────────────────────
 * A dollar figure carries more authority than prose, and this audience is
 * being asked to act on it. So the tool states an ESTIMATE of a federal
 * surcharge and nothing else: no plan is named, no carrier is named, no
 * premium other than the CMS standard figures is quoted, and it never tells
 * anyone what to enrol in. Every number traces back to lib/medicare-costs.ts.
 *
 * ── Why it errs low ───────────────────────────────────────────────────────
 * The gap math applies the Initial Enrollment Period and the Special
 * Enrollment Period before counting a single month, and Part D's 63-day
 * grace is rounded up to three whole months. Telling someone they owe a
 * penalty they do not owe would be the worst outcome here, so every
 * ambiguity resolves toward a smaller number.
 *
 * ── Privacy ──────────────────────────────────────────────────────────────
 * Dates entered here are never sent to analytics. lib/analytics.ts throws in
 * development on any property key that looks like a date of birth or an age,
 * and a Medicare eligibility month is exactly that. The events below carry a
 * step index and coarse booleans — never a date, never a dollar amount tied
 * to a person.
 */

type Section = 'b' | 'd';

type Answers = {
  eligible: Partial<YearMonth>;
  coverage?: CoverageAnswer;
  coverageEnded: Partial<YearMonth>;
  enrolled: Partial<YearMonth>;
  notYetEnrolled: boolean;
};

const EMPTY: Answers = {
  eligible: {},
  coverageEnded: {},
  enrolled: {},
  notYetEnrolled: false,
};

const COVERAGE_OPTIONS: {
  value: CoverageAnswer;
  label: (section: Section) => string;
  hint: (section: Section) => string;
}[] = [
  {
    value: 'throughout',
    label: () => 'Yes — right up until I signed up',
    hint: (s) =>
      s === 'b'
        ? 'An employer plan through a job you or your spouse were still working'
        : 'Drug coverage your plan told you in writing was "creditable"',
  },
  {
    value: 'ended',
    label: () => 'Yes — but it ended before I signed up',
    hint: () => 'I will ask when it ended on the next screen',
  },
  {
    value: 'never',
    label: () => 'No, I did not have that coverage',
    hint: () => 'Retiree coverage and COBRA do not count here',
  },
  {
    value: 'unsure',
    label: () => 'I am not sure',
    hint: () => 'I will show the worst case and flag it as an estimate',
  },
];

/**
 * Steps are resolved at render rather than being a fixed array, because the
 * "when did it end" screen only exists when the person said their coverage
 * ended. A fixed array with a skipped index makes the progress bar lie.
 */
function stepsFor(answers: Record<Section, Answers>): { section: Section; kind: string }[] {
  const steps: { section: Section; kind: string }[] = [];
  for (const section of ['b', 'd'] as Section[]) {
    steps.push({ section, kind: 'eligible' });
    steps.push({ section, kind: 'coverage' });
    if (answers[section].coverage === 'ended') {
      steps.push({ section, kind: 'coverage-ended' });
    }
    steps.push({ section, kind: 'enrolled' });
  }
  return steps;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function PenaltyCalculator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<Section, Answers>>({
    b: { ...EMPTY },
    d: { ...EMPTY },
  });
  const [done, setDone] = useState(false);
  const started = useRef(false);
  const mounted = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const steps = useMemo(() => stepsFor(answers), [answers]);
  const total = steps.length;
  const current = steps[Math.min(step, total - 1)];

  // Move focus to the new question so keyboard and screen reader users are
  // not stranded after the screen swaps. Skipped on first mount, and
  // preventScroll stops the page jumping under the sticky header.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step, done]);

  useEffect(() => {
    if (!done && current) trackPenaltyStep(step + 1, current.kind);
  }, [step, done, current]);

  function update(section: Section, patch: Partial<Answers>) {
    if (!started.current) {
      started.current = true;
      trackPenaltyStarted();
    }
    setAnswers((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
  }

  function advance() {
    if (step + 1 >= total) {
      setDone(true);
      return;
    }
    setStep(step + 1);
  }

  function back() {
    if (done) {
      setDone(false);
      setStep(total - 1);
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  }

  function restart() {
    setAnswers({ b: { ...EMPTY }, d: { ...EMPTY } });
    setStep(0);
    setDone(false);
  }

  if (done) {
    return <PenaltyResult answers={answers} onBack={back} onRestart={restart} />;
  }

  const percent = Math.round((step / total) * 100);
  const sectionAnswers = answers[current.section];
  const label = current.section === 'b' ? 'Part B — doctor and hospital coverage' : 'Part D — prescription drug coverage';

  /* Each screen decides for itself whether it has enough to continue, so the
     button is never enabled over an incomplete date. */
  const ready =
    current.kind === 'eligible'
      ? isComplete(sectionAnswers.eligible)
      : current.kind === 'coverage'
        ? Boolean(sectionAnswers.coverage)
        : current.kind === 'coverage-ended'
          ? isComplete(sectionAnswers.coverageEnded)
          : sectionAnswers.notYetEnrolled || isComplete(sectionAnswers.enrolled);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <p className="text-base font-semibold text-ink-soft">
          Question {step + 1} of {total}
        </p>
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            className="inline-flex min-h-touch items-center gap-1.5 rounded-lg px-2 text-base font-semibold text-navy hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Back
          </button>
        ) : null}
      </div>

      <Progress
        value={percent}
        className="mt-3"
        aria-label={`Progress: question ${step + 1} of ${total}`}
      />

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
        {label}
      </p>

      <div key={`${current.section}-${current.kind}`} className="mt-3 animate-slide-in">
        {current.kind === 'eligible' ? (
          <DateQuestion
            headingRef={headingRef}
            prompt={
              current.section === 'b'
                ? 'When did you first become eligible for Medicare?'
                : 'When did you first become eligible for drug coverage?'
            }
            help={
              current.section === 'b'
                ? 'For most people this is the month they turned 65. If Medicare started because of disability, use the month it began.'
                : 'For almost everyone this is the same month as the answer above.'
            }
            value={sectionAnswers.eligible}
            onChange={(v) => update(current.section, { eligible: v })}
          />
        ) : null}

        {current.kind === 'coverage' ? (
          <ChoiceQuestion
            headingRef={headingRef}
            prompt={
              current.section === 'b'
                ? 'Did you have employer coverage through a job during that time?'
                : 'Did you have creditable prescription drug coverage during that time?'
            }
            help={
              current.section === 'b'
                ? 'Coverage through a current employer with 20 or more employees — yours or a spouse’s. Retiree coverage and COBRA do not count.'
                : 'Coverage a plan confirmed in writing was at least as good as Medicare’s. Employer, union and VA drug coverage often is.'
            }
            section={current.section}
            value={sectionAnswers.coverage}
            onChange={(v) => update(current.section, { coverage: v })}
          />
        ) : null}

        {current.kind === 'coverage-ended' ? (
          <DateQuestion
            headingRef={headingRef}
            prompt="When did that coverage end?"
            help="The last month it was active. The clock that matters starts after this, not at 65."
            value={sectionAnswers.coverageEnded}
            onChange={(v) => update(current.section, { coverageEnded: v })}
          />
        ) : null}

        {current.kind === 'enrolled' ? (
          <DateQuestion
            headingRef={headingRef}
            prompt={
              current.section === 'b'
                ? 'When did you enroll in Part B?'
                : 'When did you enroll in a Part D drug plan?'
            }
            help="If you have not signed up yet, choose the option below instead."
            value={sectionAnswers.enrolled}
            disabled={sectionAnswers.notYetEnrolled}
            onChange={(v) => update(current.section, { enrolled: v, notYetEnrolled: false })}
            extra={
              <button
                type="button"
                onClick={() =>
                  update(current.section, {
                    notYetEnrolled: !sectionAnswers.notYetEnrolled,
                    enrolled: {},
                  })
                }
                aria-pressed={sectionAnswers.notYetEnrolled}
                className={cn(
                  'mt-4 flex min-h-[3.5rem] w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30',
                  sectionAnswers.notYetEnrolled
                    ? 'border-navy bg-navy-soft'
                    : 'border-line bg-paper hover:border-navy/50 hover:bg-navy-soft/40',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors',
                    sectionAnswers.notYetEnrolled ? 'border-navy bg-navy' : 'border-ink/30',
                  )}
                >
                  {sectionAnswers.notYetEnrolled ? (
                    <span className="h-3 w-3 rounded-full bg-white" />
                  ) : null}
                </span>
                <span className="text-lg font-semibold text-ink">
                  I have not signed up yet
                </span>
              </button>
            }
          />
        ) : null}

        <Button size="xl" className="mt-8" disabled={!ready} onClick={advance}>
          {step + 1 >= total ? 'See the estimate' : 'Continue'}
        </Button>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-ink-faint">
        Nothing you enter here is sent anywhere. Your dates stay in your browser unless you
        choose to send them to me at the end.
      </p>
    </div>
  );
}

function isComplete(value: Partial<YearMonth>): value is YearMonth {
  return typeof value.year === 'number' && typeof value.month === 'number';
}

/** Month + year selects. Deliberately not a date picker: a native calendar
 *  asks for a day this tool does not use, and is the least usable control on
 *  a phone for the age group this site serves. */
function DateQuestion({
  headingRef,
  prompt,
  help,
  value,
  onChange,
  disabled,
  extra,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  prompt: string;
  help?: string;
  value: Partial<YearMonth>;
  onChange: (value: Partial<YearMonth>) => void;
  disabled?: boolean;
  extra?: React.ReactNode;
}) {
  /*
    The year list is derived from COSTS_YEAR, not from `new Date()`.

    This <select> IS server-rendered, so calling new Date() here would bake the
    build year into the static HTML and then disagree with the client the first
    time someone loads the page after New Year — a hydration mismatch that
    would appear once a year and be miserable to reproduce. COSTS_YEAR is
    already on an annual update cycle (see lib/medicare-costs.ts), so hanging
    the range off it keeps the two in step by construction.

    Bounded below at 1990 because nobody is entering a Medicare date older
    than that, and a shorter list is easier to scroll on a phone.
  */
  const years = useMemo(
    () => Array.from({ length: COSTS_YEAR + 1 - 1990 + 1 }, (_, i) => COSTS_YEAR + 1 - i),
    [],
  );

  const selectClass =
    'min-h-touch w-full rounded-xl border-2 border-line bg-paper px-4 text-lg text-ink transition-colors hover:border-navy/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30 disabled:opacity-50';

  return (
    <>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-3xl font-bold tracking-[-0.025em] text-ink outline-none focus-visible:ring-0 sm:text-4xl"
      >
        {prompt}
      </h2>
      {help ? <p className="mt-3 text-lg text-ink-soft">{help}</p> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-base font-semibold text-ink-soft">Month</span>
          <select
            className={cn(selectClass, 'mt-2')}
            disabled={disabled}
            value={value.month ?? ''}
            onChange={(e) =>
              onChange({ ...value, month: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Choose a month</option>
            {MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-base font-semibold text-ink-soft">Year</span>
          <select
            className={cn(selectClass, 'mt-2')}
            disabled={disabled}
            value={value.year ?? ''}
            onChange={(e) =>
              onChange({ ...value, year: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Choose a year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      {extra}
    </>
  );
}

function ChoiceQuestion({
  headingRef,
  prompt,
  help,
  section,
  value,
  onChange,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  prompt: string;
  help?: string;
  section: Section;
  value?: CoverageAnswer;
  onChange: (value: CoverageAnswer) => void;
}) {
  return (
    <>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-3xl font-bold tracking-[-0.025em] text-ink outline-none focus-visible:ring-0 sm:text-4xl"
      >
        {prompt}
      </h2>
      {help ? <p className="mt-3 text-lg text-ink-soft">{help}</p> : null}

      <div role="group" aria-label={prompt} className="mt-8 grid gap-3">
        {COVERAGE_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={cn(
                'group flex min-h-[4.25rem] w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30',
                selected
                  ? 'border-navy bg-navy-soft'
                  : 'border-line bg-paper hover:border-navy/50 hover:bg-navy-soft/40',
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
                <span className="block text-lg font-semibold text-ink">
                  {option.label(section)}
                </span>
                <span className="mt-0.5 block text-base text-ink-faint">
                  {option.hint(section)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function toInput(answers: Answers): PenaltyInput | null {
  if (!isComplete(answers.eligible) || !answers.coverage) return null;
  if (!answers.notYetEnrolled && !isComplete(answers.enrolled)) return null;

  return {
    eligible: answers.eligible,
    coverage: answers.coverage,
    coverageEnded: isComplete(answers.coverageEnded) ? answers.coverageEnded : undefined,
    enrolled: answers.notYetEnrolled ? null : (answers.enrolled as YearMonth),
  };
}

function PenaltyResult({
  answers,
  onBack,
  onRestart,
}: {
  answers: Record<Section, Answers>;
  onBack: () => void;
  onRestart: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  /*
    Read once, on the client, at the moment the result is built.

    This branch never renders on the server — it is reachable only after the
    visitor has answered every question — so there is no build-time date to
    mismatch on hydration. It matters because for someone who has not enrolled
    yet, "today" is the end of the gap being measured.
  */
  const [today] = useState<YearMonth>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const inputB = toInput(answers.b);
  const inputD = toInput(answers.d);
  const partB = inputB ? estimatePartBPenalty(inputB, today) : null;
  const partD = inputD ? estimatePartDPenalty(inputD, today) : null;

  const totalMonthly = (partB?.monthlyPenalty ?? 0) + (partD?.monthlyPenalty ?? 0);
  const owesSomething = totalMonthly > 0;
  const uncertain = Boolean(partB?.uncertain || partD?.uncertain);
  const stillAccruing = Boolean(partB?.stillAccruing || partD?.stillAccruing);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    /* Booleans and a bucket only. No dates, no dollar figure tied to a
       person — see the privacy note at the top of this file. */
    trackPenaltyCalculated({
      owes: owesSomething,
      uncertain,
      stillAccruing,
    });
  }, [owesSomething, uncertain, stillAccruing]);

  /* Human-readable summary for the advisor's notification email. This one
     DOES carry the dates, because the visitor is deliberately sending them
     to a person and has ticked the consent box on the form. */
  const context: Record<string, string> = {
    'Part B estimate': partB ? `${formatUsd(partB.monthlyPenalty)}/mo` : 'not calculated',
    'Part D estimate': partD ? `${formatUsd(partD.monthlyPenalty)}/mo` : 'not calculated',
    'Part B months uncovered': String(partB?.uncoveredMonths ?? 0),
    'Part D months uncovered': String(partD?.uncoveredMonths ?? 0),
    'Still not enrolled': stillAccruing ? 'yes' : 'no',
  };

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone={owesSomething ? 'ember' : 'sage'}>Your estimate</Badge>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-touch items-center gap-1.5 rounded-lg px-3 text-base font-semibold text-navy hover:underline"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Back
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-touch items-center gap-1.5 rounded-lg px-3 text-base font-semibold text-ink-soft hover:underline"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Start over
          </button>
        </div>
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 font-display text-3xl font-bold tracking-[-0.03em] text-ink outline-none focus-visible:ring-0 sm:text-4xl"
      >
        {owesSomething
          ? `About ${formatUsd(totalMonthly)} a month, on top of your premium.`
          : 'Based on these dates, no late penalty applies.'}
      </h2>

      {owesSomething ? (
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          That is roughly {formatUsd(totalMonthly * 12)} a year, added to what you would
          otherwise pay.
        </p>
      ) : (
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          The dates you gave fall inside the enrollment windows the rules allow, so there is
          nothing to add to your premium. That is worth confirming rather than assuming —
          the windows are the part people misremember.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <PenaltyCard
          title="Part B"
          subtitle="Doctor and hospital coverage"
          estimate={partB}
          basis={`10% of the ${formatUsd(PART_B_STANDARD_PREMIUM)} standard premium for each full 12 months`}
          detail={
            partB && partB.uncoveredMonths > 0
              ? `${partB.uncoveredMonths} months counted · ${partB.fullYears} full ${partB.fullYears === 1 ? 'year' : 'years'} charged`
              : undefined
          }
        />
        <PenaltyCard
          title="Part D"
          subtitle="Prescription drug coverage"
          estimate={partD}
          basis={`1% of the ${formatUsd(PART_D_BASE_PREMIUM)} base premium for each uncovered month`}
          detail={
            partD && partD.uncoveredMonths > 0
              ? `${partD.uncoveredMonths} uncovered months counted`
              : undefined
          }
        />
      </div>

      {owesSomething ? (
        <div className="mt-8 rounded-2xl border-2 border-ember/40 bg-ember-soft p-6">
          <p className="flex items-start gap-3 text-lg font-semibold text-ember-deep">
            <TriangleAlert className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
            This is permanent. It is added every single month, for as long as you have the
            coverage.
          </p>
          <p className="mt-3 text-base leading-relaxed text-ember-deep">
            A late enrollment penalty is not a one-off fee and it does not expire after a
            few years. It is folded into the premium for life. The Part D amount also moves
            each year, because it is a percentage of a base premium CMS resets annually —
            so it can grow after it starts.
          </p>
          {stillAccruing ? (
            <p className="mt-3 text-base font-semibold leading-relaxed text-ember-deep">
              And because you have not enrolled yet, this figure is still growing. Every
              further month adds to it.
            </p>
          ) : null}
        </div>
      ) : null}

      {uncertain ? (
        <div className="mt-6 rounded-2xl border border-line bg-paper p-5">
          <p className="text-base leading-relaxed text-ink-soft">
            <strong className="font-semibold text-ink">You answered &ldquo;not sure&rdquo; on coverage.</strong>{' '}
            The figure above assumes you had none, which is the worst case. If you did have
            employer or creditable drug coverage in that window, the real number is lower —
            possibly zero. Your old plan can confirm it in writing, and that letter is worth
            finding before you do anything else.
          </p>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-line bg-paper p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
          Terms that came up
        </p>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-base">
          <GlossaryTerm k="part-b" />
          <GlossaryTerm k="part-d" />
          <GlossaryTerm k="creditable-coverage" />
          <GlossaryTerm k="iep" />
          <GlossaryTerm k="sep" />
        </p>
      </div>

      {/*
        Same tone as the site's disclosure component: name the limit plainly,
        say who actually decides, and point at the authority rather than
        hedging with legal boilerplate nobody reads.
      */}
      <div className="mt-6 rounded-2xl border-2 border-ember/30 bg-ember-soft p-5">
        <p className="text-base leading-relaxed text-ember-deep">
          <strong className="font-semibold">This is a plain-English estimate, not a bill and not a determination.</strong>{' '}
          Social Security and CMS decide what any penalty actually is, using their record of
          your dates and your coverage — which may differ from what you entered here. Special
          circumstances, and rules that apply to disability, TRICARE, VA and international
          coverage, can change the answer entirely. Figures use the {COSTS_YEAR} amounts
          published by {COSTS_SOURCE_NOTE}, and they change annually. Confirm your own
          position with Social Security or at medicare.gov before acting on it.
        </p>
      </div>

      {/*
        The booking CTA sits directly under the number, before the trust bar
        and before the form. Someone who has just been told they owe a
        permanent surcharge has one useful next step, and burying it under
        two more blocks is how a tool like this fails at its actual job.
      */}
      <div className="mt-8 rounded-3xl border border-navy-deep/20 bg-navy-deep p-6 text-white shadow-lift sm:p-8">
        <h3 className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
          Talk this through before you enroll
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-white/80">
          {owesSomething
            ? 'A penalty you already owe cannot be undone, but the date you enroll still changes what happens next — and "not sure" answers are worth turning into real ones before you file anything.'
            : 'No penalty on these dates is good news. Worth ten minutes to confirm the windows are what you think they are, before a deadline decides for you.'}
        </p>
        <ContactActions where="penalty-calculator-result" className="mt-6" size="lg" onDark />
      </div>

      <TrustBar className="mt-8" />

      <div className="mt-8">
        <ContactForm
          source="penalty-calculator"
          context={context}
          heading="Want me to check these dates against your actual record?"
          intro="Send this over and I will tell you what I see — including when the answer is that you owe nothing and can stop worrying about it."
        />
      </div>

      <div className="mt-8">
        <ShareBar
          path="/tools/penalty-calculator"
          title="What would a Medicare late enrollment penalty actually cost me?"
        />
      </div>
    </div>
  );
}

function PenaltyCard({
  title,
  subtitle,
  estimate,
  basis,
  detail,
}: {
  title: string;
  subtitle: string;
  estimate: PenaltyEstimate | null;
  basis: string;
  detail?: string;
}) {
  const amount = estimate?.monthlyPenalty ?? 0;

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-5',
        amount > 0 ? 'border-ember/40 bg-ember-soft' : 'border-line bg-paper',
      )}
    >
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      <p className="text-sm text-ink-faint">{subtitle}</p>

      <p
        className={cn(
          'mt-4 font-display text-3xl font-bold tracking-[-0.03em]',
          amount > 0 ? 'text-ember-deep' : 'text-ink',
        )}
      >
        {formatUsd(amount)}
        <span className="text-lg font-semibold"> /month</span>
      </p>

      {detail ? <p className="mt-2 text-sm text-ink-soft">{detail}</p> : null}
      <p className="mt-3 text-sm leading-relaxed text-ink-faint">{basis}</p>
    </div>
  );
}
