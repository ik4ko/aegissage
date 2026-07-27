/**
 * Medicare IQ — the trivia game.
 *
 * This is NOT the eligibility check. That tool is a funnel: it reads someone's
 * situation and ends in a contact CTA. This is a game — a reason to come back,
 * score something, and share it.
 *
 * ── Compliance rules for every question in here ───────────────────────────
 *  1. Answers must be federal facts: enrollment windows, penalty mechanics,
 *     what each Part covers, how the rules work. These are identical for
 *     every carrier and every county.
 *  2. Never a question whose answer is a plan, a premium, a benefit, a star
 *     rating, or a carrier name. Nothing here may read as a plan comparison.
 *  3. Never imply that scoring well replaces advice, or that scoring badly
 *     means someone needs to buy something. The closing copy says the
 *     opposite on purpose.
 *  4. Every question carries a `why` — the game has to teach, or it is just
 *     a quiz with a phone number attached.
 */

export type IqQuestion = {
  /** Stable id, used for dedupe and analytics. Never renumber these. */
  id: string;
  question: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  /** Shown after answering, right or wrong. */
  why: string;
};

export type IqRound = {
  id: string;
  title: string;
  /** One line of framing shown before the first question. */
  blurb: string;
  questions: IqQuestion[];
};

export const IQ_ROUNDS: IqRound[] = [
  {
    id: 'deadlines',
    title: 'Deadlines & Penalties',
    blurb: 'The rules with teeth. Most Medicare regret traces back to one of these.',
    questions: [
      {
        id: 'iep-length',
        question: 'How long is your Initial Enrollment Period?',
        options: ['3 months', '7 months', '12 months', 'It never closes'],
        answer: 1,
        why: 'Seven months: the three months before your birthday month, your birthday month, and the three months after. Enrolling in the first three is what starts coverage on day one of your birthday month.',
      },
      {
        id: 'aep-dates',
        question: 'When does the Annual Enrollment Period run?',
        options: [
          'January 1 – March 31',
          'October 15 – December 7',
          'September 1 – November 30',
          'It varies by state',
        ],
        answer: 1,
        why: 'October 15 to December 7, every year, everywhere. Changes you make take effect January 1.',
      },
      {
        id: 'partb-penalty',
        question: 'The Part B late enrollment penalty lasts for…',
        options: ['One year', 'Three years', 'As long as you have Part B', 'Until you turn 70'],
        answer: 2,
        why: 'It is permanent. 10% is added to your premium for each full year you could have had Part B and did not, and you pay it every month from then on.',
      },
      {
        id: 'cobra-sep',
        question: 'Does COBRA count as active employer coverage for delaying Part B?',
        options: [
          'Yes, it works exactly the same',
          'No — it does not protect you from the penalty',
          'Only if you are over 67',
          'Only for the first 18 months',
        ],
        answer: 1,
        why: 'This is the most expensive misunderstanding in Medicare. COBRA and retiree coverage are not active employment coverage. They do not create a Part B Special Enrollment Period and they do not stop the penalty clock.',
      },
      {
        id: 'partd-gap',
        question: 'How long can you go without creditable drug coverage before a Part D penalty starts?',
        options: ['30 days', '63 days', '6 months', 'There is no penalty'],
        answer: 1,
        why: '63 days. After that a permanent surcharge is added to your Part D premium, calculated from how many months you went uncovered.',
      },
      {
        id: 'anoc',
        question: 'What is the Annual Notice of Change, and when does it arrive?',
        options: [
          'A bill, arriving in January',
          'A notice of what your plan is changing next year, arriving in the fall',
          'A government survey, arriving quarterly',
          'A renewal form you must sign',
        ],
        answer: 1,
        why: 'It lands in September, it looks like junk mail, and it tells you exactly what is changing about your drug list, network and costs. Reading it takes five minutes and is the single best habit in Medicare.',
      },
    ],
  },
  {
    id: 'the-parts',
    title: 'Know Your Alphabet',
    blurb: 'A, B, C, D and the one that is not really a letter.',
    questions: [
      {
        id: 'part-a-covers',
        question: 'Part A is best described as…',
        options: [
          'Doctor visits and outpatient care',
          'Hospital insurance',
          'Prescription drugs',
          'Dental and vision',
        ],
        answer: 1,
        why: 'Part A is hospital insurance: inpatient stays, skilled nursing after a hospital stay, hospice, some home health care. Most people pay no premium for it.',
      },
      {
        id: 'part-b-covers',
        question: 'Which one covers your regular doctor visits?',
        options: ['Part A', 'Part B', 'Part D', 'Medigap'],
        answer: 1,
        why: 'Part B is medical insurance — doctor visits, outpatient care, lab work, preventive services, durable medical equipment. Nearly everyone pays a monthly premium for it.',
      },
      {
        id: 'part-c-is',
        question: 'Medicare Advantage is also known as…',
        options: ['Part B', 'Part C', 'Part D', 'Part F'],
        answer: 1,
        why: 'Part C. It is your Part A and Part B coverage delivered through a private plan approved by Medicare, rather than through the federal program directly.',
      },
      {
        id: 'medigap-with-ma',
        question: 'Can you have a Medigap policy and a Medicare Advantage plan at the same time?',
        options: [
          'Yes, they work together',
          'No — it is one route or the other',
          'Only during AEP',
          'Only in some states',
        ],
        answer: 1,
        why: 'No. Medigap sits alongside Original Medicare. Medicare Advantage replaces how you receive that coverage. Choosing between them is the real fork in the road.',
      },
      {
        id: 'oop-cap',
        question: 'Which has no annual cap on what you can spend out of pocket, on its own?',
        options: [
          'Original Medicare',
          'Medicare Advantage',
          'Both have caps',
          'Neither has a cap',
        ],
        answer: 0,
        why: 'Original Medicare has no out-of-pocket maximum by itself — that gap is precisely why Medigap policies exist. Every Medicare Advantage plan does have a maximum for in-network covered services.',
      },
      {
        id: 'formulary',
        question: 'What is a formulary?',
        options: [
          'The form you fill out to enroll',
          'A plan’s list of covered drugs',
          'Your yearly deductible',
          'The Medicare handbook',
        ],
        answer: 1,
        why: 'A formulary is the list of drugs a plan covers, sorted into tiers. Every plan has a different one, and it can change every contract year — which is why drug coverage is checked drug by drug, not plan by plan.',
      },
    ],
  },
  {
    id: 'myths',
    title: 'Myth or Fact',
    blurb: 'Six things people believe about Medicare. Some of them are true.',
    questions: [
      {
        id: 'auto-enroll',
        question: 'Everyone is automatically enrolled in Medicare at 65.',
        options: ['Myth', 'Fact'],
        answer: 0,
        why: 'Myth. You are enrolled automatically only if you are already drawing Social Security before 65. Everyone else has to sign up, and missing the window is what creates lifetime penalties.',
      },
      {
        id: 'free',
        question: 'Medicare is completely free once you turn 65.',
        options: ['Myth', 'Fact'],
        answer: 0,
        why: 'Myth. Part A is usually premium-free if you paid Medicare taxes for about ten years, but Part B has a monthly premium that nearly everyone pays, and there are deductibles and coinsurance beyond that.',
      },
      {
        id: 'ltc',
        question: 'Medicare covers long-term nursing home care.',
        options: ['Myth', 'Fact'],
        answer: 0,
        why: 'Myth, and an expensive one. Medicare covers limited skilled nursing care after a qualifying hospital stay. Ongoing custodial long-term care is not covered — that is what Medicaid or long-term care insurance is for.',
      },
      {
        id: 'agent-cost',
        question: 'Using a licensed independent agent costs you more than enrolling on your own.',
        options: ['Myth', 'Fact'],
        answer: 0,
        why: 'Myth. Premiums are set by the plan and filed with CMS. They are identical whether you enroll through an agent, through a call center, or by yourself at medicare.gov.',
      },
      {
        id: 'income-premium',
        question: 'Higher earners pay more for Part B.',
        options: ['Myth', 'Fact'],
        answer: 1,
        why: 'Fact. It is called IRMAA — an income-related surcharge on Part B and Part D premiums, based on your tax return from two years ago.',
      },
      {
        id: 'switch-back',
        question: 'You can always switch from Medicare Advantage back to Original Medicare with a Medigap policy.',
        options: ['Myth', 'Fact'],
        answer: 0,
        why: 'Myth. Returning to Original Medicare is allowed, but buying a Medigap policy at that point usually means medical underwriting, and an insurer can decline you. A few states have rules that make this easier, but the details depend on where you live.',
      },
    ],
  },
  {
    id: 'timing',
    title: 'Working, Moving, Changing',
    blurb: 'Life events and the windows they open. Trickier than it looks.',
    questions: [
      {
        id: 'employee-count',
        question: 'The number that decides whether you can safely delay Part B while working is…',
        options: ['5 employees', '20 employees', '50 employees', '100 employees'],
        answer: 1,
        why: 'Twenty. At 20 or more employees, the group plan generally pays first and you can usually delay Part B. Below 20, Medicare generally becomes the primary payer at 65 — and skipping Part B can leave a gap nobody fills.',
      },
      {
        id: 'sep-length',
        question: 'After active employer coverage ends, how long is the Part B Special Enrollment Period?',
        options: ['2 months', '3 months', '8 months', '12 months'],
        answer: 2,
        why: 'Eight months for Part B — but only two months for Part D and Medicare Advantage. People hear "eight months," relax, and miss the shorter clocks.',
      },
      {
        id: 'hsa',
        question: 'What happens to HSA contributions when you enroll in Medicare?',
        options: [
          'Nothing changes',
          'You must stop contributing',
          'You can contribute double',
          'They become tax-free',
        ],
        answer: 1,
        why: 'You must stop. Enrolling in any part of Medicare — including premium-free Part A — ends HSA eligibility, and Part A can be backdated up to six months, which can make earlier contributions retroactively improper.',
      },
      {
        id: 'moving',
        question: 'Moving out of your plan’s service area…',
        options: [
          'Has no effect on your coverage',
          'Opens a Special Enrollment Period',
          'Cancels your Medicare entirely',
          'Requires you to reapply for Part A',
        ],
        answer: 1,
        why: 'It opens a Special Enrollment Period. Your Medicare itself follows you anywhere in the country, but a plan tied to a service area you have left does not.',
      },
      {
        id: 'medigap-window',
        question: 'Your one-time Medigap open enrollment window is how long, and when?',
        options: [
          '6 months, starting when you enroll in Part B at 65 or older',
          '12 months, starting at your 65th birthday',
          '3 months, every year',
          'There is no such window',
        ],
        answer: 0,
        why: 'Six months from when your Part B starts. During it you can buy any Medigap policy sold in your state with no health questions. It does not come back — which is what makes the first decision less reversible than it looks.',
      },
      {
        id: 'ma-oep',
        question: 'The Medicare Advantage Open Enrollment Period (Jan 1 – Mar 31) lets you…',
        options: [
          'Buy a Medigap policy with no health questions',
          'Make one change if you are already in a Medicare Advantage plan',
          'Enroll in Medicare for the first time',
          'Change your Part B premium',
        ],
        answer: 1,
        why: 'One change: switch Medicare Advantage plans, or drop back to Original Medicare and pick up a Part D plan. It does not grant a guaranteed right to buy Medigap.',
      },
    ],
  },
];

export const TOTAL_QUESTIONS_PER_ROUND = IQ_ROUNDS[0].questions.length;

/**
 * Which round to serve. Rotates on play count so a returning visitor gets a
 * different set each time, wrapping around after the last one.
 */
export function roundForPlay(playCount: number): IqRound {
  return IQ_ROUNDS[playCount % IQ_ROUNDS.length];
}

export function roundById(id: string | undefined): IqRound | undefined {
  return IQ_ROUNDS.find((r) => r.id === id);
}

/**
 * Deterministic shuffle from a seed, so the option order varies between plays
 * without the answer position being guessable. Myth/Fact rounds are left
 * alone — shuffling a two-option question just makes it read oddly.
 */
export function shuffleOptions(
  question: IqQuestion,
  seed: number,
): { options: string[]; answer: number } {
  if (question.options.length <= 2) {
    return { options: question.options, answer: question.answer };
  }

  const indices = question.options.map((_, i) => i);
  let s = seed + question.id.length;

  for (let i = indices.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return {
    options: indices.map((i) => question.options[i]),
    answer: indices.indexOf(question.answer),
  };
}

/** The closing line. Never congratulatory in a way that discourages asking. */
export function scoreVerdict(score: number, total: number): { title: string; body: string } {
  const pct = score / total;

  if (pct === 1) {
    return {
      title: 'Perfect score.',
      body: 'You know this better than most people selling it. Try another round — the question sets rotate.',
    };
  }
  if (pct >= 0.75) {
    return {
      title: 'Strong.',
      body: 'You have got the shape of it. The ones that trip people up are usually the timing questions, not the vocabulary.',
    };
  }
  if (pct >= 0.5) {
    return {
      title: 'Solid middle.',
      body: 'Which is genuinely fine — this system is confusing by construction, not because you missed something obvious.',
    };
  }
  return {
    title: 'Plenty to learn here.',
    body: 'That puts you with almost everyone. None of this is intuitive, and nobody is born knowing it.',
  };
}
