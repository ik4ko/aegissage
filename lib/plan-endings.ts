/**
 * Plan-ending pages: one page per company whose 2027 non-renewal letters
 * people in our area are receiving.
 *
 *   /braven-health-plan-ending-2027
 *   /aetna-medicare-plan-ending-2027
 *
 * ── Rules for these pages (Erekle, Nov 18 2026) ───────────────────────────
 *  - Facts only, each one cited: CMS / medicare.gov, the company's own member
 *    material, the State of New Jersey, or trade press (Becker's).
 *  - No member counts, no "thousands affected", no logos.
 *  - No urgency beyond the factual dates. No plan recommendation. Every page
 *    says that staying with Original Medicare is one of the choices.
 *  - The company is named because the letter the reader holds names it. No
 *    other company or plan is named on these pages.
 *  - The TPMO disclaimer on these routes states the Bergen County figures as
 *    "in Bergen County, NJ" (lib/tpmo.ts, FALLBACK_SCOPE_ROUTES).
 *
 * The visible questions and the FAQPage schema are built from the same
 * `sections` array, so they cannot disagree. The first paragraph of each
 * section is the spoken answer (Speakable). scripts/test-plan-endings.mjs
 * checks lengths, sources and banned wording.
 */

export type Source = { title: string; url: string };

export type PlanEndingSection = {
  /** Spoken-style question, used as the H2 and as the FAQ question. */
  question: string;
  /** The short answer: first paragraph, FAQ answer, Speakable. 25 to 60 words. */
  answer: string;
  /** Optional detail below the answer. */
  points?: string[];
  /** Optional internal link under the section. */
  link?: { href: string; label: string };
};

export type PlanEndingPage = {
  slug: string;
  /** The company named in the reader's letter. */
  company: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** 40 to 50 words. Answers the question before anything else on the page. */
  directAnswer: string;
  sections: PlanEndingSection[];
  sources: Source[];
  /** ISO date the sources were last checked. */
  reviewed: string;
};

/* ── Shared sources ─────────────────────────────────────────────────────── */

export const SOURCES = {
  sep: {
    title: 'Special Enrollment Periods (plan contract not renewed) — Medicare.gov',
    url: 'https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan/special-enrollment-periods',
  },
  joining: {
    title: 'Joining a plan — Medicare.gov',
    url: 'https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan',
  },
  medigapWhen: {
    title: 'When can I buy Medigap? (guaranteed issue rights) — Medicare.gov',
    url: 'https://www.medicare.gov/health-drug-plans/medigap/ready-to-buy/when',
  },
  planFinder: {
    title: 'Find health and drug plans — Medicare.gov',
    url: 'https://www.medicare.gov/plan-compare/',
  },
  njShip: {
    title: 'State Health Insurance Assistance Program (SHIP) — New Jersey Division of Aging Services',
    url: 'https://www.nj.gov/humanservices/doas/services/q-z/ship/',
  },
  beckersExits: {
    title: "18 payers exiting Medicare Advantage in 2027 — Becker's Payer Issues, Oct. 20, 2026",
    url: 'https://www.beckerspayer.com/payer/medicare-advantage/10-payers-exiting-medicare-advantage-in-2027/',
  },
  beckersLandscape: {
    title: "Medicare Advantage looks stable for 2027. Underneath, it's shifting — Becker's Payer Issues, Oct. 1, 2026",
    url: 'https://www.beckerspayer.com/payer/medicare-advantage/medicare-advantage-looks-stable-for-2027-underneath-its-shifting/',
  },
  njChart2027: {
    title: '2027 New Jersey Medicare Advantage plans chart (prepared Oct. 22, 2026) — NJ Division of Aging Services',
    url: 'https://www.nj.gov/humanservices/doas/documents/2027-new-jersey-medicare-advantage-plans-with-part-and-without-d-prescription-coverage-10-22.pdf',
  },
  aetnaMemberGuide: {
    title: 'Aetna Medicare 2027 guide for members whose plan is ending — Aetna',
    url: 'https://www.aetna.com/content/dam/aetna/pdfs/wwwaetnamedicarecomSSL/individual/website/2027-medicare-guidebook.pdf',
  },
} as const satisfies Record<string, Source>;

/* ── Sections every plan-ending page shares ─────────────────────────────── */

function sharedSections(company: string): PlanEndingSection[] {
  return [
    {
      question: 'What are the dates I need to know?',
      answer:
        'Your plan covers you through December 31, 2026. Choose new coverage by December 31 and it starts January 1, 2027. Because your plan is not renewing, you can still choose until February 28, 2027, but coverage then starts the first of the following month.',
      points: [
        'October 15 to December 7, 2026: Open Enrollment, open to everyone with Medicare.',
        'By December 31, 2026: choose new coverage so it starts January 1, 2027.',
        'December 8, 2026 to February 28, 2027: the Special Enrollment Period Medicare gives people whose plan is not renewed.',
        'January 1, 2027: if you have not joined another plan, you have Original Medicare (Part A and Part B) with no drug coverage.',
      ],
    },
    {
      question: 'What happens if I do nothing?',
      answer:
        'You keep Medicare. On January 1, 2027 you are moved to Original Medicare, Part A and Part B, with no prescription drug coverage until you join a drug plan. You would also have no supplemental coverage unless you buy it.',
    },
    {
      question: 'How do I keep my doctors?',
      answer:
        'Check each doctor by name before you choose. Make a list of your doctors, specialists, hospital and pharmacy. For any Medicare Advantage plan you consider, look each one up in that plan’s 2027 directory and call the office to confirm. Original Medicare works with any provider that accepts Medicare.',
      points: [
        'Ask each office: “Do you accept this plan for 2027?” Use the exact plan name, not just the company name.',
        'Check your prescriptions and pharmacy in Medicare’s plan finder at medicare.gov/plan-compare.',
        'A plan that looks similar to the one you have now can have a different network and a different drug list.',
      ],
      link: {
        href: '/answers/how-to-check-if-a-doctor-is-in-a-medicare-plan',
        label: 'How to check if a doctor is in a plan',
      },
    },
    {
      question: 'Can I buy a Medigap policy without health questions?',
      answer:
        'Yes, if you switch to Original Medicare. When a Medicare Advantage plan leaves Medicare or your area, federal rules give you the right to buy certain Medigap policies sold in your state without health questions. Apply as early as 60 days before your coverage ends and no later than 63 days after.',
      points: [
        'If your coverage ends December 31, 2026, 63 days after is March 4, 2027.',
        'The right does not apply if you join another Medicare Advantage plan instead.',
        `Keep the letter from ${company}. You may need a copy with your Medigap application to show your coverage ended.`,
        'Your state may give you more rights than the federal ones. New Jersey SHIP can tell you what applies.',
      ],
    },
    {
      question: 'What should I bring when we talk?',
      answer:
        `Bring the letter from ${company}, your current plan card and your Medicare card, a list of your prescriptions with doses, and the names of your doctors, specialists and pharmacy. If you get Extra Help or Medicaid, bring that letter too. You do not need bank details.`,
      link: { href: '/medicare-checklist', label: 'Printable appointment checklist' },
    },
    {
      question: 'Who can help me for free?',
      answer:
        'Medicare at 1-800-MEDICARE (TTY 1-877-486-2048) and New Jersey SHIP at 1-800-792-8820 help at no cost and do not sell insurance. I am a licensed insurance broker. I also do not charge you; I am paid by the insurance company if you enroll in a plan.',
      link: { href: '/how-we-are-paid', label: 'How I am paid' },
    },
  ];
}

const REVIEWED = '2026-11-18';

export const planEndingPages: PlanEndingPage[] = [
  {
    slug: 'braven-health-plan-ending-2027',
    company: 'Braven Health',
    title: 'Braven Health Medicare Advantage plan ending in 2027',
    metaTitle: 'Braven Health plan ending in 2027? Your dates and choices',
    metaDescription:
      'Braven Health is leaving Medicare Advantage for 2027. You keep Medicare. Choose by December 31 for January 1 coverage, or by February 28, 2027.',
    h1: 'Your Braven Health Medicare Advantage plan is ending. Here is what to do.',
    directAnswer:
      'If your Braven Health letter says your Medicare Advantage plan is not renewing, your coverage ends December 31, 2026. You keep Medicare. Choose by December 31 for new coverage starting January 1. You can still choose until February 28, 2027. Doing nothing means Original Medicare without drug coverage.',
    sections: [
      {
        question: 'What does the Braven Health non-renewal letter mean?',
        answer:
          'It means the plan you have now will not be offered in 2027. Becker’s reports, from CMS data, that Braven Health, a New Jersey company partly owned by Horizon Blue Cross Blue Shield of New Jersey, is leaving Medicare Advantage for 2027.',
        points: [
          'Braven Health offered plans in all 21 New Jersey counties in 2026, according to Becker’s.',
          'Braven Health does not appear in the State of New Jersey’s chart of 2027 Medicare Advantage plans, prepared October 22, 2026.',
          'You do not lose Medicare. Only this plan is ending.',
        ],
      },
      {
        question: 'Does Braven Health still offer any plans?',
        answer:
          'Read your own letter: it says whether anything is offered to you. Becker’s reports that Horizon Blue Cross Blue Shield of New Jersey, one of Braven’s owners, will stay in Medicare Advantage in 2027 only through special needs plans. Those are for people who meet specific conditions, such as having both Medicare and Medicaid.',
        link: { href: '/answers/medicare-and-medicaid-together', label: 'Medicare and Medicaid together' },
      },
      ...sharedSections('Braven Health'),
    ],
    sources: [
      SOURCES.beckersExits,
      SOURCES.beckersLandscape,
      SOURCES.njChart2027,
      SOURCES.sep,
      SOURCES.joining,
      SOURCES.medigapWhen,
      SOURCES.planFinder,
      SOURCES.njShip,
    ],
    reviewed: REVIEWED,
  },
  {
    slug: 'aetna-medicare-plan-ending-2027',
    company: 'Aetna',
    title: 'Aetna Medicare Advantage plan ending in 2027',
    metaTitle: 'Aetna Medicare plan ending in 2027? Your dates and choices',
    metaDescription:
      'Got a letter that your Aetna Medicare Advantage plan ends in 2027? You keep Medicare. Choose by December 31 for January 1, or by February 28, 2027.',
    h1: 'Your Aetna Medicare Advantage plan is ending. Here is what to do.',
    directAnswer:
      'If Aetna wrote that your Medicare Advantage plan will not be available in 2027, your coverage ends December 31, 2026. You keep Medicare. Choose by December 31 for new coverage starting January 1. You can still choose until February 28, 2027. Doing nothing means Original Medicare without drug coverage.',
    sections: [
      {
        question: 'What does the Aetna plan-ending letter mean?',
        answer:
          'It means the specific plan you have now will not be offered where you live in 2027. Aetna’s own 2027 guide for these members says the current plan “will no longer be available in 2027” and that people can enroll in a new plan until February 28, 2027.',
        points: [
          'Aetna’s guide asks members to enroll by December 31 so there is no gap in coverage.',
          'You do not lose Medicare. Only this plan is ending.',
        ],
      },
      {
        question: 'Is Aetna leaving Medicare?',
        answer:
          'No. Becker’s reports that Aetna will sell Medicare Advantage plans in 2027, while pulling standard plans from 123 counties, leaving two states entirely, and cutting 20 PPO plans. Your letter, not the news, tells you whether your plan in your county is ending.',
        points: [
          'The letter may point you to other plans from the same company. You can choose any plan offered in your county, from any company, or Original Medicare.',
        ],
      },
      ...sharedSections('Aetna'),
    ],
    sources: [
      SOURCES.aetnaMemberGuide,
      SOURCES.beckersLandscape,
      SOURCES.sep,
      SOURCES.joining,
      SOURCES.medigapWhen,
      SOURCES.planFinder,
      SOURCES.njShip,
    ],
    reviewed: REVIEWED,
  },
];

export const PLAN_ENDING_PATHS = planEndingPages.map((page) => `/${page.slug}`);

export function getPlanEndingPage(slug: string): PlanEndingPage {
  const page = planEndingPages.find((p) => p.slug === slug);
  if (!page) throw new Error(`lib/plan-endings.ts: no plan-ending page "${slug}"`);
  return page;
}

/** The general answer page these pages sit under. */
export const PLAN_ENDING_ANSWER_HREF = '/answers/medicare-advantage-plan-ending-non-renewal-letter';
