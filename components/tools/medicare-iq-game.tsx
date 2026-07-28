'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Flame, RotateCcw, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShareBar } from '@/components/marketing/share-bar';
import { ContactActions } from '@/components/marketing/contact-actions';
import { TrustBar } from '@/components/marketing/trust-bar';
import {
  IQ_ROUNDS,
  roundForPlay,
  scoreVerdict,
  shuffleOptions,
  type IqRound,
} from '@/lib/medicare-iq';
import { readProgress, recordRound, type IqProgress } from '@/lib/medicare-iq-storage';
import { trackIqAnswer, trackIqComplete, trackIqStart } from '@/lib/analytics';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

/**
 * The Medicare IQ game.
 *
 * Distinct from the eligibility check in every way that matters: it scores
 * you, it teaches after each answer, it rotates question sets so a return
 * visit is not the same six questions, and it never asks for anything.
 *
 * Interaction rules inherited from the rest of the site: one question per
 * screen, 48px+ targets, focus moved on screen change with preventScroll,
 * and the whole thing works with zero animation under prefers-reduced-motion.
 */

type Phase = 'intro' | 'playing' | 'done';

export function MedicareIqGame() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>('intro');
  const [progress, setProgress] = useState<IqProgress | null>(null);
  const [round, setRound] = useState<IqRound>(IQ_ROUNDS[0]);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isBest, setIsBest] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  /*
   * localStorage is client-only; read after mount so SSR and first paint match.
   *
   * react-hooks/set-state-in-effect is suppressed deliberately here. The rule
   * is right in general, but this is the mount-only external-store read it
   * cannot distinguish: the value does not exist during SSR, so seeding it
   * from useState's initializer would render server and client differently and
   * produce a hydration mismatch. Restructuring this to useSyncExternalStore
   * would satisfy the rule, but it is a real refactor of a working, stateful
   * tool and does not belong in a performance/SEO pass.
   */
  useEffect(() => {
    const p = readProgress();
    /* eslint-disable react-hooks/set-state-in-effect */
    setProgress(p);
    setRound(roundForPlay(p.plays));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (phase !== 'intro') headingRef.current?.focus({ preventScroll: true });
  }, [phase, step]);

  const question = round.questions[step];
  const total = round.questions.length;

  // Option order varies per play but is stable within a question, so the
  // buttons do not reshuffle underneath someone mid-decision.
  const seed = useMemo(() => (progress?.plays ?? 0) * 31 + step, [progress?.plays, step]);
  const { options, answer } = useMemo(
    () => (question ? shuffleOptions(question, seed) : { options: [], answer: 0 }),
    [question, seed],
  );

  const start = useCallback(() => {
    setPhase('playing');
    setStep(0);
    setScore(0);
    setPicked(null);
    trackIqStart(round.id);
  }, [round.id]);

  function pick(index: number) {
    if (picked !== null) return; // Already answered this one.
    setPicked(index);
    const correct = index === answer;
    if (correct) setScore((s) => s + 1);
    trackIqAnswer(round.id, question.id, correct);
  }

  function next() {
    if (step + 1 >= total) {
      const { progress: updated, isBest: best } = recordRound(round.id, score, total);
      setProgress(updated);
      setIsBest(best);
      setPhase('done');
      trackIqComplete(round.id, score, total);
      return;
    }
    setStep((s) => s + 1);
    setPicked(null);
  }

  function playAnother() {
    const plays = progress?.plays ?? 0;
    setRound(roundForPlay(plays));
    setStep(0);
    setScore(0);
    setPicked(null);
    setIsBest(false);
    setPhase('playing');
    trackIqStart(roundForPlay(plays).id);
  }

  // ── Intro ───────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border border-line bg-paper p-7 shadow-card sm:p-9">
          <Badge tone="ember">{round.title}</Badge>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
            How well do you actually know Medicare?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{round.blurb}</p>
          <p className="mt-3 text-base text-ink-faint">
            {total} questions. You find out why after each one. No signup, no email — your
            score stays in this browser.
          </p>

          {progress && progress.plays > 0 ? (
            <dl className="mt-7 grid grid-cols-3 gap-3">
              <Stat icon={Trophy} label="Personal best" value={`${progress.bestPct}%`} />
              <Stat icon={Flame} label="Day streak" value={String(progress.streak)} />
              <Stat icon={RotateCcw} label="Rounds played" value={String(progress.plays)} />
            </dl>
          ) : null}

          <Button size="block" className="mt-8" onClick={start}>
            Start the round
          </Button>
        </div>
      </div>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const verdict = scoreVerdict(score, total);
    const shareParams = new URLSearchParams({
      score: String(score),
      of: String(total),
      round: round.id,
    });

    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border border-line bg-paper p-7 shadow-card sm:p-9">
          <Badge tone="sage">{round.title}</Badge>

          <p className="mt-5 font-display text-6xl font-bold tracking-[-0.04em] text-navy">
            {score}
            <span className="text-3xl text-ink-faint"> / {total}</span>
          </p>

          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-ink outline-none focus-visible:ring-0 sm:text-4xl"
          >
            {verdict.title}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-ink-soft">{verdict.body}</p>

          {isBest && (progress?.plays ?? 0) > 1 ? (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-ember-soft px-4 py-2 text-base font-semibold text-ember-deep">
              <Trophy className="h-5 w-5" aria-hidden="true" />
              New personal best
            </p>
          ) : null}

          {progress ? (
            <dl className="mt-7 grid grid-cols-3 gap-3">
              <Stat icon={Trophy} label="Personal best" value={`${progress.bestPct}%`} />
              <Stat icon={Flame} label="Day streak" value={String(progress.streak)} />
              <Stat icon={RotateCcw} label="Rounds played" value={String(progress.plays)} />
            </dl>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={playAnother} size="lg">
              Play another round →
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/medicare-basics">Read the guides</Link>
            </Button>
          </div>

          <div className="mt-8 border-t border-line pt-7">
            <ShareBar
              path={`/tools/medicare-iq?${shareParams.toString()}`}
              title={`I scored ${score}/${total} on the Medicare IQ quiz`}
            />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border-2 border-navy/20 bg-navy-soft p-6">
          <p className="text-base leading-relaxed text-navy-deep">
            <strong className="font-semibold">A good score is not a substitute for advice,
            and a bad one does not mean you need to buy anything.</strong>{' '}
            This is trivia about federal rules. What actually applies to you depends on your
            doctors, your prescriptions and your county — which is a conversation, not a quiz.
          </p>
          <ContactActions where="medicare-iq-result" className="mt-5" size="md" />
        </div>

        <TrustBar className="mt-8" />
      </div>
    );
  }

  // ── Playing ─────────────────────────────────────────────────────────────
  const answered = picked !== null;
  const percent = Math.round((step / total) * 100);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <p className="text-base font-semibold text-ink-soft">
          Question {step + 1} of {total}
        </p>
        <p className="text-base font-semibold text-navy">
          Score {score}
        </p>
      </div>

      <Progress
        value={percent}
        className="mt-3"
        aria-label={`Progress: question ${step + 1} of ${total}`}
      />

      <div className="mt-9">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl font-bold tracking-[-0.025em] text-ink outline-none focus-visible:ring-0 sm:text-3xl"
        >
          {question.question}
        </h2>

        <div role="group" aria-label={question.question} className="mt-7 grid gap-3">
          {options.map((option, index) => {
            const isAnswer = index === answer;
            const isPicked = index === picked;

            return (
              <button
                key={option}
                type="button"
                onClick={() => pick(index)}
                disabled={answered}
                aria-pressed={isPicked}
                className={cn(
                  'flex min-h-[3.75rem] w-full items-center gap-4 rounded-2xl border-2 p-4 text-left text-lg font-semibold transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30',
                  'disabled:cursor-default',
                  !answered && 'border-line bg-paper text-ink hover:border-navy/50 hover:bg-navy-soft/40',
                  // After answering, always mark the correct option — being
                  // told only "wrong" teaches nothing.
                  answered && isAnswer && 'border-sage bg-sage-soft text-ink',
                  answered && isPicked && !isAnswer && 'border-ember bg-ember-soft text-ink',
                  answered && !isAnswer && !isPicked && 'border-line bg-paper text-ink-faint',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-full border-2',
                    answered && isAnswer && 'border-sage bg-sage text-white',
                    answered && isPicked && !isAnswer && 'border-ember bg-ember text-white',
                    (!answered || (!isAnswer && !isPicked)) && 'border-ink/25',
                  )}
                >
                  {answered && isAnswer ? <Check className="h-5 w-5" strokeWidth={3} /> : null}
                  {answered && isPicked && !isAnswer ? (
                    <X className="h-5 w-5" strokeWidth={3} />
                  ) : null}
                </span>
                <span className="min-w-0">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation. Announced politely so a screen reader hears the
            teaching moment without losing the reader's place. */}
        <AnimatePresence initial={false}>
          {answered ? (
            <motion.div
              key="why"
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={reduced ? {} : { opacity: 1, height: 'auto' }}
              exit={reduced ? {} : { opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div
                role="status"
                className="mt-6 rounded-2xl border-2 border-navy/20 bg-navy-soft p-5"
              >
                <p className="font-display text-lg font-semibold text-navy-deep">
                  {picked === answer ? 'Correct.' : 'Not quite.'}
                </p>
                <p className="mt-2 text-base leading-relaxed text-navy-deep">{question.why}</p>
              </div>

              <Button size="block" className="mt-5" onClick={next}>
                {step + 1 >= total ? 'See my score' : 'Next question'}
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-ember" aria-hidden="true" />
      <dd className="mt-2 font-display text-2xl font-bold text-ink">{value}</dd>
      <dt className="mt-0.5 text-sm text-ink-faint">{label}</dt>
    </div>
  );
}
