/**
 * /medicare-questions: 29 short, spoken-style Medicare questions.
 *
 * ── Rules for this file ───────────────────────────────────────────────────
 *  1. Each answer is what a person would want read aloud by a voice
 *     assistant: plain words, at most 50 of them, the answer first.
 *  2. Every answer says the same thing as its `source`, an official page on
 *     medicare.gov, cms.gov, ssa.gov, va.gov or a state or city agency. Every
 *     source URL here is already cited elsewhere on the site and was checked
 *     there (answer pages, glossary, enrollment calendar, town pages).
 *  3. Every question links to the deeper page on this site (`href`).
 *  4. No carrier or plan names, no premiums or dollar amounts, no years, no
 *     "you qualify". Windows are written as rules.
 *  5. `id` is a public anchor (/medicare-questions#id). Never change one.
 *  The page renders these, and the FAQPage schema is built from the same
 *  array, so the visible questions and the schema cannot differ.
 *  scripts/test-medicare-questions.mjs checks rules 1 to 3 and 5.
 */

export const QUESTIONS_REVIEWED = '2026-11-17';

export type SpokenQuestion = {
  id: string;
  question: string;
  answer: string;
  /** The deeper page on this site. */
  href: string;
  hrefLabel: string;
  source: { title: string; url: string };
};

const M = 'https://www.medicare.gov';

export const questionGroups: { heading: string; questions: SpokenQuestion[] }[] = [
  {
    heading: 'Signing up',
    questions: [
      {
        id: 'when-can-i-sign-up',
        question: 'When can I sign up for Medicare?',
        answer:
          'Your first chance is a seven-month window around your 65th birthday. It starts three months before your birthday month and ends three months after it. Signing up early in that window means your coverage can start on time.',
        href: '/answers/turning-65-new-jersey',
        hrefLabel: 'Turning 65 in New Jersey, step by step',
        source: { title: 'When can I sign up for Medicare?', url: `${M}/basics/get-started-with-medicare/sign-up/when-can-i-sign-up-for-medicare` },
      },
      {
        id: 'automatic-enrollment',
        question: 'Will I be signed up for Medicare automatically?',
        answer:
          'Usually yes, if you already get Social Security or Railroad Retirement benefits before you turn 65. You are then enrolled in Part A and Part B, and your card comes in the mail. If you do not get those benefits yet, you sign up yourself.',
        href: '/answers/turning-65-new-jersey',
        hrefLabel: 'What to do at 65, in order',
        source: { title: 'Original Medicare (Part A and B) eligibility and enrollment', url: 'https://www.cms.gov/medicare/enrollment-renewal/original-part-a-b' },
      },
      {
        id: 'how-to-sign-up',
        question: 'How do I sign up for Medicare Part A and Part B?',
        answer:
          'Through Social Security. You can apply online at ssa.gov, call Social Security, or visit a local Social Security office. Medicare itself does not process the sign-up, and a broker cannot do it for you.',
        href: '/medicare-enrollment-calendar',
        hrefLabel: 'Every Medicare enrollment window',
        source: { title: 'Original Medicare (Part A and B) eligibility and enrollment', url: 'https://www.cms.gov/medicare/enrollment-renewal/original-part-a-b' },
      },
      {
        id: 'when-coverage-starts',
        question: 'When does my Medicare coverage start?',
        answer:
          'It depends on when you sign up. If you sign up in the three months before your birthday month, coverage usually starts the first day of your birthday month. If you sign up later, it starts the month after you sign up.',
        href: '/medicare-enrollment-calendar',
        hrefLabel: 'The enrollment calendar',
        source: { title: 'When does Medicare coverage start?', url: `${M}/basics/get-started-with-medicare/sign-up/when-does-medicare-coverage-start` },
      },
      {
        id: 'still-working',
        question: 'Do I need Part B if I am still working at 65?',
        answer:
          'Maybe not. If you have group health coverage from your own or your spouse’s current job, you can often wait without a penalty. The size of the employer decides which coverage pays first, so check that before you decide.',
        href: '/answers/medicare-while-still-working',
        hrefLabel: 'Still working at 65',
        source: { title: 'Working past 65', url: `${M}/basics/get-started-with-medicare/medicare-basics/working-past-65` },
      },
      {
        id: 'cobra',
        question: 'Does COBRA give me more time to sign up for Medicare?',
        answer:
          'No. COBRA does not count as coverage from current work. Your eight-month window to sign up for Part B starts when the job or the job coverage ends, not when COBRA ends.',
        href: '/answers/cobra-and-medicare',
        hrefLabel: 'COBRA and Medicare',
        source: { title: 'COBRA coverage', url: `${M}/basics/get-started-with-medicare/medicare-basics/working-past-65/cobra-coverage` },
      },
      {
        id: 'late-penalty',
        question: 'What happens if I sign up for Part B late?',
        answer:
          'You may pay a late enrollment penalty for as long as you have Part B. It grows with each full year you could have had Part B but did not. Part D has its own separate penalty.',
        href: '/tools/penalty-calculator',
        hrefLabel: 'Estimate a late enrollment penalty',
        source: { title: 'Avoid late enrollment penalties', url: `${M}/basics/costs/medicare-costs/avoid-penalties` },
      },
    ],
  },
  {
    heading: 'Choosing and changing coverage',
    questions: [
      {
        id: 'original-or-advantage',
        question: 'What is the difference between Original Medicare and Medicare Advantage?',
        answer:
          'Original Medicare is run by the government and works with any doctor who accepts Medicare. Medicare Advantage is offered by private companies approved by Medicare, usually with a network and often with drug coverage built in.',
        href: '/tools/plan-comparison',
        hrefLabel: 'Original Medicare and Medicare Advantage, side by side',
        source: { title: 'Joining a plan', url: `${M}/basics/get-started-with-medicare/get-more-coverage/joining-a-plan` },
      },
      {
        id: 'fall-window',
        question: 'When can I change my Medicare plan?',
        answer:
          'Every year from October 15 to December 7, anyone with Medicare can change their health or drug plan. The new coverage starts January 1. Other windows open after certain events, like a move.',
        href: '/answers/how-to-switch-medicare-plans',
        hrefLabel: 'How to switch Medicare plans',
        source: { title: 'Open Enrollment', url: `${M}/health-drug-plans/open-enrollment` },
      },
      {
        id: 'after-january-first',
        question: 'Can I change my Medicare Advantage plan after January 1?',
        answer:
          'Yes, once. From January 1 to March 31 each year, if you are in a Medicare Advantage plan, you can switch to another one or go back to Original Medicare and add a drug plan.',
        href: '/answers/medicare-enrollment-periods-explained',
        hrefLabel: 'Medicare enrollment periods explained',
        source: { title: 'Joining a plan', url: `${M}/basics/get-started-with-medicare/get-more-coverage/joining-a-plan` },
      },
      {
        id: 'moving',
        question: 'What happens to my Medicare plan if I move?',
        answer:
          'Original Medicare goes with you anywhere in the country. A Medicare Advantage or drug plan may not, because plans serve set areas. If you move out of your plan’s area, you get a special window to choose a new one.',
        href: '/answers/moving-between-new-jersey-new-york-pennsylvania',
        hrefLabel: 'Moving between New Jersey, New York and Pennsylvania',
        source: { title: 'Special Enrollment Periods', url: `${M}/basics/get-started-with-medicare/get-more-coverage/joining-a-plan/special-enrollment-periods` },
      },
      {
        id: 'plan-ending',
        question: 'My Medicare Advantage plan is ending. What do I do?',
        answer:
          'Read the letter, then choose a new plan during the special window it describes. If you do nothing, you go back to Original Medicare, and you may need to add a drug plan yourself.',
        href: '/answers/medicare-advantage-plan-ending-non-renewal-letter',
        hrefLabel: 'Your plan is ending: what the letter means',
        source: { title: 'Special Enrollment Periods', url: `${M}/basics/get-started-with-medicare/get-more-coverage/joining-a-plan/special-enrollment-periods` },
      },
      {
        id: 'doctor-in-plan',
        question: 'How do I check if my doctor takes my Medicare plan?',
        answer:
          'With Original Medicare, ask the office whether the doctor accepts Medicare. With a Medicare Advantage plan, check the plan’s directory and call the doctor’s office too, using the plan’s exact name.',
        href: '/answers/how-to-check-if-a-doctor-is-in-a-medicare-plan',
        hrefLabel: 'How to check if your doctor is in a plan',
        source: { title: 'Does your provider accept Medicare as full payment?', url: `${M}/basics/costs/medicare-costs/provider-accept-Medicare` },
      },
      {
        id: 'annual-notice',
        question: 'What is the Annual Notice of Change?',
        answer:
          'It is a letter your plan sends each fall listing what will be different next year, like costs, covered drugs and the network. Read it before December 7, so you can change plans if you need to.',
        href: '/medicare-glossary#anoc',
        hrefLabel: 'Annual Notice of Change in the glossary',
        source: { title: 'Upcoming plan changes', url: `${M}/basics/forms-publications-mailings/mailings/costs-and-coverage/upcoming-plan-changes` },
      },
    ],
  },
  {
    heading: 'Medigap',
    questions: [
      {
        id: 'what-is-medigap',
        question: 'What is Medigap?',
        answer:
          'Medigap is extra insurance sold by private companies that helps pay costs Original Medicare does not, like coinsurance and deductibles. It works only with Original Medicare, not with Medicare Advantage.',
        href: '/answers/medigap-new-jersey',
        hrefLabel: 'Medigap in New Jersey',
        source: { title: 'Medigap basics', url: `${M}/health-drug-plans/medigap/basics` },
      },
      {
        id: 'when-to-buy-medigap',
        question: 'When should I buy a Medigap policy?',
        answer:
          'In your six-month Medigap open enrollment period, which starts the month you are 65 or older and have Part B. During those months, a company cannot turn you down or charge you more because of your health.',
        href: '/answers/medigap-new-jersey',
        hrefLabel: 'When you can buy Medigap in New Jersey',
        source: { title: 'When can I buy Medigap?', url: `${M}/health-drug-plans/medigap/ready-to-buy/when` },
      },
      {
        id: 'medigap-new-york',
        question: 'Can I buy Medigap any time in New York?',
        answer:
          'Yes. New York requires Medigap companies to sell to you all year, whatever your health. New Jersey does not work that way after your first six months, so the rules change if you move across the river.',
        href: '/answers/medigap-underwriting-new-jersey-new-york',
        hrefLabel: 'Medigap underwriting in New Jersey and New York',
        source: { title: 'HIICAP: Medicare Supplement Insurance (New York State Office for the Aging)', url: 'https://aging.ny.gov/system/files/documents/2026/03/hiicap-notebook-mod-7-medicare-supplement-insurance-medigap-2026_0.pdf' },
      },
    ],
  },
  {
    heading: 'Costs and help paying',
    questions: [
      {
        id: 'help-paying',
        question: 'Is there help paying for Medicare?',
        answer:
          'Yes, for people with limited income and savings. Medicare Savings Programs can pay the Part B premium, and Extra Help lowers drug costs. Your state Medicaid office can help you apply.',
        href: '/answers/extra-help-medicare-savings-programs-new-jersey',
        hrefLabel: 'Help paying Medicare costs in New Jersey',
        source: { title: 'Medicare Savings Programs', url: `${M}/basics/costs/help/medicare-savings-programs` },
      },
      {
        id: 'extra-help',
        question: 'What is Extra Help?',
        answer:
          'Extra Help is a federal program that lowers what people with limited income and savings pay for Part D drug coverage, including premiums and copays. People with Medicaid get it automatically.',
        href: '/medicare-glossary#lis',
        hrefLabel: 'Extra Help in the glossary',
        source: { title: 'Help with drug costs', url: `${M}/basics/costs/help/drug-costs` },
      },
      {
        id: 'higher-income',
        question: 'Will I pay more for Medicare if my income is higher?',
        answer:
          'You might. People with higher incomes pay an extra amount, called IRMAA, for Part B and Part D. Social Security decides from your tax return and sends a notice that explains the decision and how to appeal.',
        href: '/tools/irmaa-calculator',
        hrefLabel: 'Check the IRMAA brackets',
        source: { title: 'Initial IRMAA Determination', url: `${M}/basics/forms-publications-mailings/mailings/costs-and-coverage/initial-income-related-monthly-adjustment-amount-notice` },
      },
      {
        id: 'medicare-and-medicaid',
        question: 'Can I have Medicare and Medicaid at the same time?',
        answer:
          'Yes. Medicare pays first and Medicaid pays last, often covering costs Medicare leaves. People with both get Extra Help for drugs automatically and have more chances during the year to change plans.',
        href: '/answers/medicare-and-medicaid-together',
        hrefLabel: 'Medicare and Medicaid together',
        source: { title: 'Medicaid', url: `${M}/basics/costs/help/medicaid` },
      },
      {
        id: 'broker-cost',
        question: 'Does it cost anything to use a Medicare broker?',
        answer:
          'Not with me. Licensed brokers are paid by insurance companies when someone enrolls. Plans must charge the same premium however you join, through a broker, the plan itself, or Medicare.gov.',
        href: '/how-we-are-paid',
        hrefLabel: 'How I am paid',
        source: { title: 'Plan marketing rules', url: `${M}/health-drug-plans/health-plans/your-coverage-options/plan-marketing-rules` },
      },
    ],
  },
  {
    heading: 'Other coverage',
    questions: [
      {
        id: 'veterans',
        question: 'Do veterans need Medicare if they have VA health care?',
        answer:
          'You can have both, and the VA encourages veterans to sign up for Medicare when they are eligible. Medicare and the VA do not pay for the same service, so each time you get care, you choose which one to use.',
        href: '/answers/va-health-care-and-medicare',
        hrefLabel: 'VA health care and Medicare',
        source: { title: 'VA health care and other insurance', url: 'https://www.va.gov/resources/va-health-care-and-other-insurance/' },
      },
      {
        id: 'retiree-coverage',
        question: 'How does retiree coverage work with Medicare?',
        answer:
          'Medicare usually pays first and retiree coverage pays second. You may need both Part A and Part B to get full retiree benefits, and joining a Medicare plan can end some retiree coverage, so ask the plan first.',
        href: '/answers/retiree-coverage-and-medicare',
        hrefLabel: 'Retiree coverage and Medicare',
        source: { title: 'Retiree insurance', url: `${M}/basics/get-started-with-medicare/medicare-basics/working-past-65/retiree-insurance` },
      },
    ],
  },
  {
    heading: 'Getting help',
    questions: [
      {
        id: 'help-new-york-city',
        question: 'Where can I get free Medicare help in New York City?',
        answer:
          'From HIICAP, run by NYC Aging. Its counselors give free, private Medicare help. Call Aging Connect at 212-244-6469 and ask for HIICAP.',
        href: '/answers/medicare-help-new-york-city',
        hrefLabel: 'Medicare help in Brooklyn, Queens and New York City',
        source: { title: 'Health Insurance Assistance (NYC Aging)', url: 'https://www.nyc.gov/site/dfta/services/health-insurance-assistance.page' },
      },
      {
        id: 'help-philadelphia',
        question: 'Where can I get Medicare help in Philadelphia?',
        answer:
          'Pennsylvania offers free Medicare counseling through PA MEDI, and help paying for prescriptions through PACE and PACENET for people who qualify by income. Philadelphia is its own county for Medicare plans.',
        href: '/answers/medicare-help-philadelphia',
        hrefLabel: 'Medicare help in Philadelphia',
        source: { title: 'PACE program (Pennsylvania Department of Aging)', url: 'https://www.pa.gov/agencies/aging/aging-programs-and-services/pace-program' },
      },
      {
        id: 'other-languages',
        question: 'Can I get Medicare help in Russian or Georgian?',
        answer:
          'Yes. 1-800-MEDICARE can connect you with an interpreter in any language at no cost. I also explain Medicare myself in English, Georgian and Russian.',
        href: '/medicare-help-georgian-russian',
        hrefLabel: 'Medicare help in Georgian and Russian',
        source: { title: 'Get Medicare information in other languages', url: `${M}/about-us/other-languages` },
      },
      {
        id: 'what-to-bring',
        question: 'What should I bring to a Medicare appointment?',
        answer:
          'Your Medicare card, a list of your medicines with doses, your doctors and pharmacies, and any letters from your current coverage. You never need to give bank details or your Social Security number just to get information.',
        href: '/answers/what-to-bring-to-a-medicare-appointment',
        hrefLabel: 'What to bring to a Medicare appointment',
        source: { title: 'Your Medicare card', url: `${M}/basics/get-started-with-medicare/using-medicare/your-medicare-card` },
      },
      {
        id: 'check-an-agent',
        question: 'How do I know a Medicare agent is trustworthy?',
        answer:
          'Check the agent’s license with your state, ask how they are paid, and ask which companies they work with. A good agent never pressures you, never asks for your Medicare number before you are ready.',
        href: '/answers/how-to-choose-medicare-agent-bergen-hudson-county',
        hrefLabel: 'How to choose and check a Medicare agent',
        source: { title: 'Plan marketing rules', url: `${M}/health-drug-plans/health-plans/your-coverage-options/plan-marketing-rules` },
      },
    ],
  },
];

export const allQuestions: SpokenQuestion[] = questionGroups.flatMap((group) => group.questions);
