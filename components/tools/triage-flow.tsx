'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { trackTriageCompleted, trackTriageStarted, trackTriageStep } from '@/lib/analytics';

type Stage = 'turning-65' | 'already-medicare' | 'coverage-change';
type Intent = 'learn' | 'dates' | 'compare' | 'talk';
type Option<T extends string> = { value: T; label: string; hint?: string };

const STAGES: Option<Stage>[] = [
  { value: 'turning-65', label: 'Turning 65 soon', hint: 'Starting from the beginning' },
  { value: 'already-medicare', label: 'Already on Medicare', hint: 'Reviewing what you have' },
  { value: 'coverage-change', label: 'Losing or changing coverage', hint: 'A move or life event changed things' },
];

const INTENTS: Record<Stage, Option<Intent>[]> = {
  'turning-65': [
    { value: 'learn', label: 'Understand the basics first' },
    { value: 'dates', label: 'Figure out my enrollment dates' },
    { value: 'talk', label: 'Talk through my situation' },
  ],
  'already-medicare': [
    { value: 'compare', label: 'Compare my coverage options' },
    { value: 'learn', label: 'Understand a Medicare term or rule' },
    { value: 'talk', label: 'Talk through a specific question' },
  ],
  'coverage-change': [
    { value: 'dates', label: 'Understand my timing' },
    { value: 'compare', label: 'See what options may be available' },
    { value: 'talk', label: 'Tell Eric what changed' },
  ],
};

const RESULTS: Record<Intent, { headline: string; body: string; href: string; cta: string }> = {
  learn: { headline: 'Start with the plain-English guides.', body: 'Read the short explanations first, then bring Eric the question that remains.', href: '/medicare-basics', cta: 'Open Medicare Basics' },
  dates: { headline: 'Start with your enrollment window.', body: 'A few timing details can change the next step. The eligibility check keeps the questions focused.', href: '/tools/eligibility-check', cta: 'Check my enrollment window' },
  compare: { headline: 'See the trade-offs side by side.', body: 'The comparison tool gives you the structure. Eric can help you apply it to your doctors, prescriptions, and ZIP code.', href: '/tools/plan-comparison', cta: 'Compare the two routes' },
  talk: { headline: 'Bring the real question to Eric.', body: 'Tell him what changed, what you want to keep, and where you are stuck. There is no fee or obligation.', href: '/contact', cta: 'Contact Eric' },
};

/** A two-step routing aid, intentionally modeled on the eligibility quiz. */
export function TriageFlow() {
  const [stage, setStage] = useState<Stage | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const started = useRef(false);

  useEffect(() => {
    trackTriageStep(stage ? 2 : 1, stage ? 'intent' : 'stage');
  }, [stage]);

  function chooseStage(value: Stage) {
    if (!started.current) {
      started.current = true;
      trackTriageStarted();
    }
    setStage(value);
    setIntent(null);
  }

  function chooseIntent(value: Intent) {
    setIntent(value);
    trackTriageCompleted(value);
  }

  function restart() {
    setStage(null);
    setIntent(null);
  }

  const result = intent ? RESULTS[intent] : null;
  const step = result ? 3 : stage ? 2 : 1;

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-lift sm:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone="ember">A quick way in</Badge>
        {step > 1 ? <button type="button" onClick={restart} className="inline-flex min-h-touch items-center gap-1.5 rounded-lg px-2 text-base font-semibold text-white/80 transition-colors hover:text-white"><RotateCcw className="h-4 w-4" aria-hidden="true" />Start over</button> : null}
      </div>
      <Progress value={(step / 3) * 100} className="mt-4 bg-white/15 [&>div]:bg-ember" aria-label={`Triage progress: step ${step} of 3`} />

      {!stage ? (
        <TriageQuestion heading="Where are you in the Medicare journey?" options={STAGES} onChoose={chooseStage} />
      ) : !result ? (
        <TriageQuestion heading="What would help most right now?" options={INTENTS[stage]} onChoose={chooseIntent} back={() => setStage(null)} />
      ) : (
        <div className="mt-8 animate-fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-soft">Your next step</p>
          <h3 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{result.headline}</h3>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/80">{result.body}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="lg"><Link href={result.href}>{result.cta} <ArrowRight className="h-5 w-5" aria-hidden="true" /></Link></Button>
            <button type="button" onClick={() => setIntent(null)} className="inline-flex min-h-touch items-center gap-2 rounded-xl px-5 text-base font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Change answer</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TriageQuestion<T extends string>({ heading, options, onChoose, back }: { heading: string; options: Option<T>[]; onChoose: (value: T) => void; back?: () => void }) {
  return (
    <div className="mt-8">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-2xl font-bold tracking-[-0.025em] sm:text-3xl">{heading}</h3>
        {back ? <button type="button" onClick={back} className="inline-flex min-h-touch shrink-0 items-center gap-1 text-base font-semibold text-white/75 hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</button> : null}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {options.map((option) => <button key={option.value} type="button" onClick={() => onChoose(option.value)} className="group min-h-[5.25rem] rounded-2xl border-2 border-white/20 bg-white/5 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-ember hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"><span className="block text-lg font-semibold">{option.label}</span>{option.hint ? <span className="mt-1 block text-sm text-white/60">{option.hint}</span> : null}</button>)}
      </div>
    </div>
  );
}
