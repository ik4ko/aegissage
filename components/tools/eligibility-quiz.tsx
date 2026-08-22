'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ContactForm } from '@/components/forms/contact-form';
import { GlossaryTerm } from '@/components/marketing/glossary-term';
import { TrustBar } from '@/components/marketing/trust-bar';
import { ShareBar } from '@/components/marketing/share-bar';
import {
  QUIZ_QUESTIONS,
  interpretQuiz,
  type QuizAnswers,
} from '@/lib/validations/quiz';
import { trackQuizCompleted, trackQuizStarted, trackQuizStep } from '@/lib/analytics';
import { cn } from '@/lib/utils';

/**
 * An interactive content piece, not a lead form.
 *
 * Rules it follows:
 *  - exactly one question per screen, never a scrolling wall of inputs
 *  - answering advances automatically; no "Next" tax on the reader
 *  - the result is a plain-English read of which enrollment window applies,
 *    with zero plan recommendations and zero benefit claims
 *  - nothing is transmitted anywhere until the visitor fills in the contact
 *    form at the end and checks the consent box
 */
export function EligibilityQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [done, setDone] = useState(false);
  const started = useRef(false);
  const mounted = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const total = QUIZ_QUESTIONS.length;
  const question = QUIZ_QUESTIONS[step];

  // Move focus to the new question so screen reader and keyboard users are not
  // stranded after the screen swaps.
  //
  // Two details matter here. It must not run on the initial mount — there has
  // been no swap yet, and focusing on load scrolls the page out from under the
  // reader. And it must use preventScroll, because the card does not move
  // between steps; letting the browser scroll to the heading would jump the
  // page under the sticky header.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step, done]);

  useEffect(() => {
    if (!done) trackQuizStep(step + 1, QUIZ_QUESTIONS[step].id);
  }, [step, done]);

  const choose = useCallback(
    (value: string) => {
      if (!started.current) {
        started.current = true;
        trackQuizStarted();
      }

      const next = { ...answers, [question.id]: value };
      setAnswers(next);

      if (step + 1 >= total) {
        setDone(true);
        trackQuizCompleted(Object.keys(next).length);
      } else {
        setStep(step + 1);
      }
    },
    [answers, question, step, total],
  );

  function back() {
    if (done) {
      setDone(false);
      setStep(total - 1);
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setDone(false);
  }

  if (done) {
    return <QuizResult answers={answers} onBack={back} onRestart={restart} />;
  }

  const percent = Math.round((step / total) * 100);

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

      <Progress value={percent} className="mt-3" aria-label={`Progress: question ${step + 1} of ${total}`} />

      <div key={question.id} className="mt-9 animate-slide-in">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-3xl font-bold tracking-[-0.025em] text-ink outline-none focus-visible:ring-0 sm:text-4xl"
        >
          {question.prompt}
        </h2>
        {question.help ? (
          <p className="mt-3 text-lg text-ink-soft">{question.help}</p>
        ) : null}

        <div role="group" aria-label={question.prompt} className="mt-8 grid gap-3">
          {question.options.map((option) => {
            const selected = answers[question.id] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => choose(option.value)}
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
                  {option.hint ? (
                    <span className="mt-0.5 block text-base text-ink-faint">{option.hint}</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-ink-faint">
        Nothing you tap here is sent anywhere. Your answers stay in your browser unless you
        choose to send them to me at the end.
      </p>
    </div>
  );
}

function QuizResult({
  answers,
  onBack,
  onRestart,
}: {
  answers: QuizAnswers;
  onBack: () => void;
  onRestart: () => void;
}) {
  const result = interpretQuiz(answers);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  /*
    Answers are stored keyed by QUESTION ID and valued by OPTION VALUE.

    They used to be keyed by the full prompt text and valued by the human
    label — readable in the advisor's email, and unusable for anything else.
    Rewording a question silently orphaned every row written before the edit,
    and any code reading those answers was string-matching prose that a copy
    change could break without a single test failing. Lead scoring reads these
    answers, so that fragility would have shown up as leads quietly grading
    themselves down.

    Ids and values are stable by contract. lib/notify/send-contact-alert.ts
    maps them back to labels at send time, so the email is exactly as readable
    as it was.
  */
  const context: Record<string, string> = {};
  for (const q of QUIZ_QUESTIONS) {
    const value = answers[q.id];
    const option = q.options.find((o) => o.value === value);
    if (option) context[q.id] = option.value;
  }

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone="sage">Your read</Badge>
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
        {result.headline}
      </h2>

      <div className="mt-7 space-y-5">
        {result.points.map((point) => (
          <p key={point} className="text-lg leading-relaxed text-ink-soft">
            {point}
          </p>
        ))}
      </div>

      {result.terms.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-paper p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Terms that came up
          </p>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-base">
            {result.terms.map((term) => (
              <GlossaryTerm key={term} k={term} />
            ))}
          </p>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border-2 border-ember/30 bg-ember-soft p-5">
        <p className="text-base leading-relaxed text-ember-deep">
          <strong className="font-semibold">This is general education, not a decision.</strong>{' '}
          It reflects federal enrollment rules, which are the same everywhere — it does not
          evaluate any specific plan, and it is not a determination of your eligibility.
          Confirm your own dates with Social Security or at medicare.gov, or ask me and I
          will walk you through it.
        </p>
      </div>

      <TrustBar className="mt-8" />

      <div className="mt-8">
        <ContactForm
          source="eligibility-quiz"
          context={context}
          heading="Want me to look at your actual situation?"
          intro="Send this over and I will tell you what I would do in your position — including when the answer is to do nothing yet."
        />
      </div>

      <div className="mt-8">
        <ShareBar
          path="/tools/eligibility-check"
          title="Which Medicare enrollment window applies to you?"
        />
      </div>
    </div>
  );
}
