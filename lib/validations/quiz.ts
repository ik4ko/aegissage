import { z } from 'zod';

/**
 * The eligibility check is an educational tool, not an application. It never
 * tells anyone they are "approved", "qualified for savings", or that a
 * particular plan is better — it explains which enrollment window applies to
 * their situation and what the deadlines are.
 */

export type QuizOption = {
  value: string;
  label: string;
  /** Optional clarifier shown under the option label. */
  hint?: string;
};

export type QuizQuestion = {
  id: string;
  /** The question as a person would actually ask it. */
  prompt: string;
  /** One-line framing under the prompt. */
  help?: string;
  options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  /*
    Timing goes FIRST on purpose.

    It is the highest-signal answer in the flow and the one most likely to be
    lost to abandonment, so it is asked before anyone has had a chance to give
    up. It is also the only question that separates an urgent lead from a
    planner: `age: 'turning-65'` spans a full twelve months, which is far too
    coarse to act on.

    `just-researching` is how someone says "do not chase me" without the site
    having to overload preferred_contact — that column is a channel, and
    putting intent in it would corrupt what it means.
  */
  {
    id: 'timing',
    prompt: 'When do you need this sorted out?',
    help: 'A rough answer is fine. It decides how much of a hurry you are actually in.',
    options: [
      { value: 'now', label: 'Now — I have a deadline coming up', hint: 'Or one I think I may have missed' },
      { value: '1-3-months', label: 'In the next month or three' },
      { value: 'later', label: 'Further out — I am planning ahead' },
      { value: 'just-researching', label: 'Just reading for now', hint: 'No need for anyone to follow up' },
    ],
  },
  {
    id: 'age',
    prompt: 'Where are you in the countdown to 65?',
    help: 'Your timing decides which enrollment window is open to you.',
    options: [
      { value: 'under-64', label: 'Under 64', hint: 'Planning ahead' },
      { value: 'turning-65', label: 'Turning 65 within the next 12 months' },
      { value: 'over-65', label: 'Already 65 or older' },
      { value: 'disability', label: 'Under 65 and on Social Security Disability', hint: 'Medicare usually starts after 24 months of benefits' },
    ],
  },
  {
    id: 'employer',
    prompt: 'Do you have health coverage through an employer right now?',
    help: 'This includes coverage through a spouse who is still working.',
    options: [
      { value: 'yes-large', label: 'Yes — the employer has 20 or more employees' },
      { value: 'yes-small', label: 'Yes — the employer has fewer than 20 employees' },
      { value: 'retiree-cobra', label: 'I have retiree coverage or COBRA', hint: 'These are treated differently from active employment' },
      { value: 'no', label: 'No employer coverage' },
    ],
  },
  {
    id: 'enrolled',
    prompt: 'Are you enrolled in any part of Medicare today?',
    options: [
      { value: 'none', label: 'Not yet — nothing at all' },
      { value: 'a-only', label: 'Part A only' },
      { value: 'a-and-b', label: 'Both Part A and Part B' },
      { value: 'unsure', label: 'I honestly am not sure' },
    ],
  },
  {
    id: 'drugs',
    prompt: 'Do you take prescription medications regularly?',
    help: 'Drug coverage rules have their own deadlines and their own penalty.',
    options: [
      { value: 'none', label: 'None right now' },
      { value: 'few', label: 'One to three' },
      { value: 'several', label: 'Four or more' },
      { value: 'unsure', label: 'Not sure / it varies' },
    ],
  },
  {
    id: 'priority',
    prompt: 'What matters most to you as you sort this out?',
    help: 'There is no wrong answer — it just tells me where to start.',
    options: [
      { value: 'doctors', label: 'Keeping my current doctors' },
      { value: 'predictable', label: 'Predictable monthly costs' },
      { value: 'travel', label: 'Coverage that travels with me' },
      { value: 'simple', label: 'Keeping the whole thing simple' },
    ],
  },
];

export const quizAnswersSchema = z.record(
  z.string().max(40),
  z.string().max(60),
);

export type QuizAnswers = z.infer<typeof quizAnswersSchema>;

export type QuizResult = {
  /** The headline outcome — a window and a deadline, never an endorsement. */
  headline: string;
  /** Two to four short paragraphs explaining what applies and why. */
  points: string[];
  /** Terms worth surfacing as glossary chips alongside the result. */
  terms: string[];
};

/**
 * Deterministic, rules-based read of the answers. Everything here is a
 * statement about *enrollment windows and deadlines* — federal rules that are
 * the same for every carrier — never a statement about which plan is better.
 */
export function interpretQuiz(answers: QuizAnswers): QuizResult {
  const { timing, age, employer, enrolled, drugs } = answers;
  const points: string[] = [];
  const terms = new Set<string>();

  let headline = 'Here is which Medicare window applies to you.';

  if (age === 'under-64') {
    headline = 'You are early — and early is the cheap seat.';
    points.push(
      'Your Initial Enrollment Period has not opened yet. It begins three months before the month you turn 65 and runs for seven months total.',
    );
    points.push(
      'The useful thing to do now is not to shop. It is to write down your doctors and your prescriptions, and to find out in writing whether your current coverage counts as creditable drug coverage.',
    );
    terms.add('iep').add('creditable-coverage');
  } else if (age === 'turning-65') {
    headline = 'Your Initial Enrollment Period is the window that matters.';
    points.push(
      'It runs seven months: the three months before your birthday month, your birthday month, and the three months after. Signing up in the three months *before* is what gets your coverage started the first day of your birthday month.',
    );
    terms.add('iep');
  } else if (age === 'disability') {
    headline = 'Disability puts you on a different clock than the 65 rule.';
    points.push(
      'Medicare generally begins in the 25th month of Social Security Disability benefits, and it starts automatically — you do not have to apply for it separately.',
    );
    points.push(
      'You get a second Initial Enrollment Period later, when you turn 65. That reopens choices that may have been limited the first time around, including Medigap in most states.',
    );
    terms.add('iep').add('medigap');
  } else {
    headline = 'You are past 65, so your options depend on what you already have.';
    points.push(
      'If you are already enrolled, the Annual Enrollment Period from October 15 to December 7 is when you can change Medicare Advantage or Part D coverage for the following year.',
    );
    terms.add('aep');
  }

  if (employer === 'yes-large') {
    points.push(
      'Because the employer has 20 or more employees, that group plan generally pays first and you can usually delay Part B without a late penalty. When the job or the coverage ends, an eight-month Special Enrollment Period opens for Part B.',
    );
    terms.add('sep').add('part-b');
  } else if (employer === 'yes-small') {
    points.push(
      'With fewer than 20 employees, Medicare generally becomes the primary payer at 65 — which means delaying Part B can leave you with gaps the group plan will not fill. This is the single most expensive misunderstanding I see.',
    );
    terms.add('part-b');
  } else if (employer === 'retiree-cobra') {
    points.push(
      'Retiree coverage and COBRA are not active employment coverage. They do not protect you from the Part B late enrollment penalty, and COBRA does not create a Special Enrollment Period for Part B. Treat your 65th birthday as the real deadline.',
    );
    terms.add('part-b').add('sep');
  } else if (employer === 'no') {
    points.push(
      'With no employer coverage in the picture, there is nothing to coordinate around: your enrollment dates are simply your enrollment dates, and missing them is what creates lifetime penalties.',
    );
    terms.add('part-b');
  }

  if (enrolled === 'unsure') {
    points.push(
      'Not knowing what you are enrolled in is normal and easy to fix — your Medicare card and your Social Security account both say plainly. Worth confirming before any other decision.',
    );
  } else if (enrolled === 'a-only') {
    points.push(
      'Part A alone leaves outpatient care uncovered. Whether adding Part B now is the right move depends entirely on whether you have active employer coverage, which is exactly the question above.',
    );
    terms.add('part-a').add('part-b');
  }

  if (drugs === 'several' || drugs === 'few') {
    points.push(
      'Because you take prescriptions, drug coverage is not an afterthought. Every plan covers a different list of drugs and can change that list each year, so this is checked drug by drug, not plan by plan.',
    );
    terms.add('part-d').add('formulary');
  } else if (drugs === 'none') {
    points.push(
      'Even with no prescriptions today, going without creditable drug coverage builds a Part D late enrollment penalty that is permanent once it starts. That is usually the argument for not skipping it.',
    );
    terms.add('part-d').add('creditable-coverage');
  }

  /*
    Timing changes the urgency of the advice, never the advice itself. The
    windows and deadlines above are federal and identical regardless of how
    someone answered this; this only says which end of them to look at first.
  */
  if (timing === 'now') {
    points.push(
      'You said you are working against a deadline. If you are unsure which one applies or whether it has already passed, that is the first thing worth confirming — some windows can be reopened and some cannot, and which is which depends on why you missed it.',
    );
  } else if (timing === 'just-researching') {
    points.push(
      'You said you are reading rather than deciding, so nothing here needs acting on today. The one thing worth doing early is getting your creditable-coverage status in writing, because that is the fact that is hardest to reconstruct later.',
    );
    terms.add('creditable-coverage');
  }

  return { headline, points, terms: [...terms] };
}

/**
 * Quiz answers rendered as "Question? — Answer" lines for the advisor's email.
 *
 * Storage moved to ids and values so lead scoring could rely on them; this
 * maps back to the wording a person actually saw. An answer whose id or value
 * is no longer in QUIZ_QUESTIONS is skipped rather than printed raw — a stale
 * id from an old row should not put `enrolled: a-only` in front of Erekle as
 * if it were a sentence.
 *
 * Lives here rather than in lib/lead-score.ts so that scoreLead() has no
 * imports at all and stays a pure, standalone function.
 */
export function describeQuizAnswers(answers: Record<string, string>): string[] {
  const lines: string[] = [];
  for (const question of QUIZ_QUESTIONS) {
    const value = answers[question.id];
    if (!value) continue;
    const option = question.options.find((o) => o.value === value);
    if (!option) continue;
    lines.push(`${question.prompt} — ${option.label}`);
  }
  return lines;
}

/** Question ids, so non-quiz keys in `context` can be told apart from answers. */
export const QUIZ_QUESTION_IDS: ReadonlySet<string> = new Set(
  QUIZ_QUESTIONS.map((q) => q.id),
);
