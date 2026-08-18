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
 * ── Three screens, and the count never changes ────────────────────────────
 * An earlier version asked eligibility, coverage and enrollment separately
 * for Part B and again for Part D — six screens, eight if coverage had
 * ended, with the total visibly growing mid-flow as the optional screens
 * appeared. Two things were wrong with that for this audience:
 *
 *   • it asked for the eligibility date twice, while its own help text said
 *     the second answer is the same as the first. A repeated question reads
 *     as "it did not save" and is where people give up, and
 *   • a progress bar whose finish line moves is disorienting for anyone,
 *     and worse for someone already anxious about the subject.
 *
 * Now: birthday, enrollment dates, coverage. Fixed at three. The follow-up
 * about when coverage ended is revealed INSIDE screen three rather than
 * being a fourth screen, which is what keeps the total honest.
 *
 * ── Why it asks for a birthday, not an eligibility date ───────────────────
 * Everybody knows their birthday. Almost nobody can name the month they
 * "became eligible for Medicare", and asking for it invites a guess that
 * silently changes the dollar figure. Eligibility is derived: the month
 * someone turns 65.
 *
 * ── Why the coverage question survived the simplification ─────────────────
 * It is the one question that cannot be dropped. Somebody who worked to 70
 * with an employer plan owes nothing at all; without asking, the tool would
 * tell them they owe thousands. Overstating a permanent surcharge to a
 * worried person is the worst failure available here, so every ambiguity
 * resolves downward and "not sure" is labelled a worst case.
 *
 * ── Privacy ──────────────────────────────────────────────────────────────
 * A birth month is a date of birth, and lib/analytics.ts throws in
 * development on any property shaped like one. Nothing here reaches
 * analytics but a step index and coarse booleans. The contact form does
 * carry the dates, because that is a deliberate send behind a consent box.
 */

const STEPS = ['born', 'enrolled', 'coverage'] as const;
type Step = (typeof STEPS)[number];

const MEDICARE_AGE = 65;

type Answers = {
  born: Partial<YearMonth>;
  partB: Partial<YearMonth>;
  partBNotYet: boolean;
  partD: Partial<YearMonth>;
  partDNotYet: boolean;
  coverage?: CoverageAnswer;
  coverageEnded: Partial<YearMonth>;
};

const EMPTY: Answers = {
  born: {},
  partB: {},
  partBNotYet: false,
  partD: {},
  partDNotYet: false,
  coverageEnded: {},
};

const COVERAGE_OPTIONS: { value: CoverageAnswer; label: string; hint: string }[] = [
  {
    value: 'throughout',
    label: 'Yes — right up until I signed up',
    hint: 'A plan through a job you or your husband or wife were still working',
  },
  {
    value: 'ended',
    label: 'Yes — but it ended before I signed up',
    hint: 'For example, you kept working past 65 and then retired',
  },
  {
    value: 'never',
    label: 'No, I did not have that kind of coverage',
    hint: 'Retiree coverage and COBRA do not count for this',
  },
  {
    value: 'unsure',
    label: 'I am not sure',
    hint: 'I will show the worst case and mark it clearly',
  },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isComplete(value: Partial<YearMonth>): value is YearMonth {
  return typeof value.year === 'number' && typeof value.month === 'number';
}

/** The month someone turns 65 — what Medicare eligibility is derived from. */
function eligibilityFrom(born: YearMonth): YearMonth {
  return { year: born.year + MEDICARE_AGE, month: born.month };
}

export function PenaltyCalculator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const started = useRef(false);
  const mounted = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const total = STEPS.length;
  const current = STEPS[step];

  // Move focus to the new question so keyboard and screen reader users are not
  // stranded after the screen swaps. Skipped on first mount, and preventScroll
  // stops the page jumping under the sticky header.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step, done]);

  useEffect(() => {
    if (!done) trackPenaltyStep(step + 1, current);
  }, [step, done, current]);

  function update(patch: Partial<Answers>) {
    if (!started.current) {
      started.current = true;
      trackPenaltyStarted();
    }
    setError(null);
    setAnswers((prev) => ({ ...prev, ...patch }));
  }

  /**
   * What is missing on this screen, phrased as something to do.
   *
   * The button is never disabled. A dead button with no message is the most
   * likely place to lose a 65-year-old — they tap, nothing happens, and they
   * conclude the site is broken. Pressing Continue always does something,
   * even if that something is saying which box is still empty.
   */
  function whatIsMissing(): string | null {
    if (current === 'born') {
      if (!isComplete(answers.born)) return 'Please choose both the month and the year you were born.';
      return null;
    }
    if (current === 'enrolled') {
      const bOk = answers.partBNotYet || isComplete(answers.partB);
      const dOk = answers.partDNotYet || isComplete(answers.partD);
      if (!bOk && !dOk) return 'Please answer both — or tick “I have not signed up yet” for either one.';
      if (!bOk) return 'Please finish the Part B date, or tick “I have not signed up yet”.';
      if (!dOk) return 'Please finish the drug plan date, or tick “I have not signed up yet”.';
      return null;
    }
    if (!answers.coverage) return 'Please choose one of the four answers above.';
    if (answers.coverage === 'ended' && !isComplete(answers.coverageEnded)) {
      return 'Please choose the month and year that coverage ended.';
    }
    return null;
  }

  function advance() {
    const missing = whatIsMissing();
    if (missing) {
      setError(missing);
      return;
    }
    setError(null);
    if (step + 1 >= total) {
      setDone(true);
      return;
    }
    setStep(step + 1);
  }

  function back() {
    setError(null);
    if (done) {
      setDone(false);
      setStep(total - 1);
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  }

  function restart() {
    setAnswers({ ...EMPTY });
    setError(null);
    setStep(0);
    setDone(false);
  }

  if (done) {
    return <PenaltyResult answers={answers} onBack={back} onRestart={restart} />;
  }

  const percent = Math.round((step / total) * 100);
  const eligible = isComplete(answers.born) ? eligibilityFrom(answers.born) : null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <p className="text-base font-semibold text-ink-soft">
          Step {step + 1} of {total}
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
        aria-label={`Progress: step ${step + 1} of ${total}`}
      />

      <div key={current} className="mt-8 animate-slide-in">
        {current === 'born' ? (
          <>
            <Heading ref={headingRef}>When were you born?</Heading>
            <p className="mt-3 text-lg text-ink-soft">
              The month and year is all I need. Medicare eligibility normally starts the
              month you turn 65, so this saves you working that date out yourself.
            </p>
            <MonthYear
              legend="Date of birth"
              value={answers.born}
              onChange={(born) => update({ born })}
              yearFrom={COSTS_YEAR - 100}
              yearTo={COSTS_YEAR - 50}
            />
            {eligible ? (
              <p className="mt-5 rounded-xl bg-navy-soft p-4 text-base text-navy-deep">
                That means your Medicare eligibility started around{' '}
                <strong className="font-semibold">
                  {MONTHS[eligible.month - 1]} {eligible.year}
                </strong>
                , when you turned {MEDICARE_AGE}.
              </p>
            ) : null}
          </>
        ) : null}

        {current === 'enrolled' ? (
          <>
            <Heading ref={headingRef}>When did you sign up?</Heading>
            <p className="mt-3 text-lg text-ink-soft">
              Two dates, on one screen. If you have not signed up for one of them yet, tick
              the box underneath it — that is a normal answer, not a wrong one.
            </p>

            <div className="mt-8 space-y-8">
              <EnrollmentBlock
                title="Part B"
                subtitle="Doctor and hospital coverage"
                value={answers.partB}
                notYet={answers.partBNotYet}
                onChange={(partB) => update({ partB, partBNotYet: false })}
                onNotYet={() => update({ partBNotYet: !answers.partBNotYet, partB: {} })}
              />
              <EnrollmentBlock
                title="Part D"
                subtitle="Prescription drug plan"
                value={answers.partD}
                notYet={answers.partDNotYet}
                onChange={(partD) => update({ partD, partDNotYet: false })}
                onNotYet={() => update({ partDNotYet: !answers.partDNotYet, partD: {} })}
              />
            </div>
          </>
        ) : null}

        {current === 'coverage' ? (
          <>
            <Heading ref={headingRef}>
              Did you have health coverage through a job after you turned 65?
            </Heading>
            <p className="mt-3 text-lg text-ink-soft">
              This is the question that decides whether you owe anything at all. Coverage
              through a current employer with 20 or more people — yours, or your husband or
              wife&rsquo;s — usually protects you completely.
            </p>

            <div role="group" aria-label="Coverage after 65" className="mt-8 grid gap-3">
              {COVERAGE_OPTIONS.map((option) => {
                const selected = answers.coverage === option.value;
                return (
                  <div key={option.value}>
                    <button
                      type="button"
                      onClick={() => update({ coverage: option.value })}
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
                        <span className="block text-lg font-semibold text-ink">{option.label}</span>
                        <span className="mt-0.5 block text-base text-ink-faint">{option.hint}</span>
                      </span>
                    </button>

                    {/*
                      Revealed in place rather than as a fourth screen. Making
                      it a screen is what used to push the total from three to
                      four halfway through, which is the moving-goalposts
                      problem this rewrite exists to remove.
                    */}
                    {selected && option.value === 'ended' ? (
                      <div className="mt-3 rounded-2xl border-2 border-navy/20 bg-navy-soft/40 p-5">
                        <p className="text-base font-semibold text-ink">
                          When did that coverage end?
                        </p>
                        <p className="mt-1 text-base text-ink-faint">
                          The last month it was active.
                        </p>
                        <MonthYear
                          legend="Month and year coverage ended"
                          value={answers.coverageEnded}
                          onChange={(coverageEnded) => update({ coverageEnded })}
                          yearFrom={1990}
                          yearTo={COSTS_YEAR + 1}
                          compact
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {/*
          The error is announced, not just coloured — a visitor using a screen
          reader gets told what is missing at the same moment a sighted one
          sees it.
        */}
        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border-2 border-ember/40 bg-ember-soft p-4 text-base font-semibold text-ember-deep"
          >
            {error}
          </p>
        ) : null}

        <Button size="xl" className="mt-8" onClick={advance}>
          {step + 1 >= total ? 'Show me the estimate' : 'Continue'}
        </Button>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-ink-faint">
        Nothing you enter here is sent anywhere. Your dates stay in your browser unless you
        choose to send them to me at the end.
      </p>
    </div>
  );
}

const Heading = function Heading({
  ref,
  children,
}: {
  ref: React.RefObject<HTMLHeadingElement | null>;
  children: React.ReactNode;
}) {
  return (
    <h2
      ref={ref}
      tabIndex={-1}
      className="font-display text-3xl font-bold tracking-[-0.025em] text-ink outline-none focus-visible:ring-0 sm:text-4xl"
    >
      {children}
    </h2>
  );
};

/**
 * Month and year selects.
 *
 * Deliberately not a date picker: a native calendar asks for a day this tool
 * never uses, and it is the least usable control on a phone for this age
 * group. Two labelled dropdowns are boring and hard to get wrong.
 */
function MonthYear({
  legend,
  value,
  onChange,
  yearFrom,
  yearTo,
  compact,
}: {
  legend: string;
  value: Partial<YearMonth>;
  onChange: (value: Partial<YearMonth>) => void;
  yearFrom: number;
  yearTo: number;
  compact?: boolean;
}) {
  /*
    Ranges are derived from COSTS_YEAR, never from new Date(). These selects
    are server-rendered, so a build-time year baked into static HTML would
    disagree with the client on the first visit after New Year — a hydration
    mismatch that surfaces once a year and is miserable to reproduce.
  */
  const years = useMemo(
    () => Array.from({ length: yearTo - yearFrom + 1 }, (_, i) => yearTo - i),
    [yearFrom, yearTo],
  );

  const selectClass =
    'min-h-touch w-full rounded-xl border-2 border-line bg-paper px-4 text-lg text-ink transition-colors hover:border-navy/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30';

  return (
    <fieldset className={compact ? 'mt-4' : 'mt-8'}>
      <legend className="sr-only">{legend}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-base font-semibold text-ink-soft">Month</span>
          <select
            className={cn(selectClass, 'mt-2')}
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
    </fieldset>
  );
}

function EnrollmentBlock({
  title,
  subtitle,
  value,
  notYet,
  onChange,
  onNotYet,
}: {
  title: string;
  subtitle: string;
  value: Partial<YearMonth>;
  notYet: boolean;
  onChange: (value: Partial<YearMonth>) => void;
  onNotYet: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-line bg-paper p-5">
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      <p className="text-base text-ink-faint">{subtitle}</p>

      <div className={cn('transition-opacity', notYet && 'pointer-events-none opacity-40')}>
        <MonthYear
          legend={`Month and year you enrolled in ${title}`}
          value={value}
          onChange={onChange}
          yearFrom={1990}
          yearTo={COSTS_YEAR + 1}
          compact
        />
      </div>

      <button
        type="button"
        onClick={onNotYet}
        aria-pressed={notYet}
        className={cn(
          'mt-4 flex min-h-touch w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30',
          notYet ? 'border-navy bg-navy-soft' : 'border-line hover:border-navy/50',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-colors',
            notYet ? 'border-navy bg-navy' : 'border-ink/30',
          )}
        >
          {notYet ? <span className="h-2.5 w-2.5 rounded-sm bg-white" /> : null}
        </span>
        <span className="text-base font-semibold text-ink">
          I have not signed up for {title} yet
        </span>
      </button>
    </div>
  );
}

function buildInput(answers: Answers, which: 'partB' | 'partD'): PenaltyInput | null {
  if (!isComplete(answers.born) || !answers.coverage) return null;

  const notYet = which === 'partB' ? answers.partBNotYet : answers.partDNotYet;
  const enrolled = answers[which];
  if (!notYet && !isComplete(enrolled)) return null;

  return {
    eligible: eligibilityFrom(answers.born),
    coverage: answers.coverage,
    coverageEnded: isComplete(answers.coverageEnded) ? answers.coverageEnded : undefined,
    enrolled: notYet ? null : (enrolled as YearMonth),
  };
}

function describe(value: Partial<YearMonth>, notYet: boolean): string {
  if (notYet) return 'not signed up yet';
  if (!isComplete(value)) return 'not given';
  return `${MONTHS[value.month - 1]} ${value.year}`;
}

function PenaltyResult({
  answers,
  onBack,
  onRestart,
}: {
  answers: Answers;
  onBack: () => void;
  onRestart: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  /*
    Read once, on the client, at the moment the result is built. This branch
    never renders on the server — it is reachable only after every question is
    answered — so there is no build-time date to mismatch on hydration. It
    matters because for someone who has not enrolled, "today" is the open end
    of the gap being measured.
  */
  const [today] = useState<YearMonth>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const inputB = buildInput(answers, 'partB');
  const inputD = buildInput(answers, 'partD');
  const partB = inputB ? estimatePartBPenalty(inputB, today) : null;
  const partD = inputD ? estimatePartDPenalty(inputD, today) : null;

  const totalMonthly = (partB?.monthlyPenalty ?? 0) + (partD?.monthlyPenalty ?? 0);
  const owesSomething = totalMonthly > 0;
  const uncertain = Boolean(partB?.uncertain || partD?.uncertain);
  const stillAccruing = Boolean(partB?.stillAccruing || partD?.stillAccruing);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    /* Booleans only. No dates, no dollar figure tied to a person. */
    trackPenaltyCalculated({ owes: owesSomething, uncertain, stillAccruing });
  }, [owesSomething, uncertain, stillAccruing]);

  const eligible = isComplete(answers.born) ? eligibilityFrom(answers.born) : null;
  const coverageLabel =
    COVERAGE_OPTIONS.find((o) => o.value === answers.coverage)?.label ?? 'not given';

  /* Sent to the advisor only when the visitor fills the form and ticks
     consent — which is why this one may carry the dates. */
  const context: Record<string, string> = {
    'Turned 65': eligible ? `${MONTHS[eligible.month - 1]} ${eligible.year}` : 'not given',
    'Part B enrolled': describe(answers.partB, answers.partBNotYet),
    'Part D enrolled': describe(answers.partD, answers.partDNotYet),
    'Coverage after 65': coverageLabel,
    'Part B estimate': partB ? `${formatUsd(partB.monthlyPenalty)}/mo` : 'not calculated',
    'Part D estimate': partD ? `${formatUsd(partD.monthlyPenalty)}/mo` : 'not calculated',
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

      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        {owesSomething
          ? `That is roughly ${formatUsd(totalMonthly * 12)} a year, added to what you would otherwise pay.`
          : 'The dates you gave fall inside the windows the rules allow, so there is nothing to add to your premium. Worth confirming rather than assuming — the windows are the part people misremember.'}
      </p>

      {/*
        A short read-back of what the number was built from, in place of a
        separate review screen. Someone told they owe a permanent surcharge
        should be able to see the inputs without walking backwards through
        the form to find a typo.
      */}
      <div className="mt-8 rounded-2xl border border-line bg-paper p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
          What this is based on
        </p>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-base sm:grid-cols-2">
          <Row label="You turned 65" value={context['Turned 65']} />
          <Row label="Coverage after 65" value={coverageLabel} />
          <Row label="Part B signed up" value={context['Part B enrolled']} />
          <Row label="Part D signed up" value={context['Part D enrolled']} />
        </dl>
        <p className="mt-4 text-base text-ink-faint">
          Wrong anywhere? Use <strong className="font-semibold text-ink-soft">Back</strong> above
          to change it.
        </p>
      </div>

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
            A late enrollment penalty is not a one-off fee and it does not expire after a few
            years. It is folded into the premium for life. The Part D amount also moves each
            year, because it is a percentage of a base premium CMS resets annually — so it can
            grow after it starts.
          </p>
          {stillAccruing ? (
            <p className="mt-3 text-base font-semibold leading-relaxed text-ember-deep">
              And because you have not signed up yet, this figure is still growing. Every
              further month adds to it.
            </p>
          ) : null}
        </div>
      ) : null}

      {uncertain ? (
        <div className="mt-6 rounded-2xl border border-line bg-paper p-5">
          <p className="text-base leading-relaxed text-ink-soft">
            <strong className="font-semibold text-ink">You answered &ldquo;not sure&rdquo; about coverage.</strong>{' '}
            The figure above assumes you had none, which is the worst case. If you did have
            employer coverage in that window, the real number is lower — possibly zero. Your
            old plan can confirm it in writing, and that letter is worth finding before you do
            anything else.
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

      <div className="mt-6 rounded-2xl border-2 border-ember/30 bg-ember-soft p-5">
        <p className="text-base leading-relaxed text-ember-deep">
          <strong className="font-semibold">This is a plain-English estimate, not a bill and not a determination.</strong>{' '}
          Social Security and CMS decide what any penalty actually is, using their record of
          your dates and your coverage — which may differ from what you entered here. It
          assumes eligibility began at {MEDICARE_AGE}; if yours began earlier through
          disability, or if TRICARE, VA or coverage from outside the country is involved, the
          answer can change entirely. Figures use the {COSTS_YEAR} amounts published by{' '}
          {COSTS_SOURCE_NOTE}, and they change annually. Confirm your own position with Social
          Security or at medicare.gov before acting on it.
        </p>
      </div>

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 border-b border-line py-2 sm:border-0 sm:py-0">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
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
