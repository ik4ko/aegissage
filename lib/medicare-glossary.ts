/**
 * The Medicare glossary at /medicare-glossary.
 *
 * ── Rules for this file ───────────────────────────────────────────────────
 *  1. Every term has an anchor (`slug`), a 2 to 3 sentence definition in
 *     plain language, and one official source on medicare.gov or cms.gov
 *     that says the same thing. If a definition cannot be sourced there, it
 *     does not go in.
 *  2. Definitions state rules, not this year's numbers. Premiums,
 *     deductibles and income limits change every year and are never written
 *     here. A percentage or a number of months that is part of the rule
 *     itself (20% coinsurance, a 7-month window) is fine.
 *  3. No carrier or plan names, no rankings, nothing that says one kind of
 *     coverage is better than another, and nothing that tells a reader they
 *     qualify for anything.
 *  4. `match` lists the phrases that are auto-linked to this term inside
 *     answer pages (components/marketing/mdx.tsx). Keep them specific: a
 *     phrase that also has an everyday meaning ("network", "premium") is
 *     left out so ordinary sentences are not turned into links.
 *  5. The 16 slugs that lib/glossary.ts uses for its pop-up definitions all
 *     exist here, so each pop-up can link to its full entry.
 *
 * When a source page moves, fix the URL here; the page reads it from here.
 */

export type GlossaryTerm = {
  /** URL anchor: /medicare-glossary#<slug>. Never change one once published. */
  slug: string;
  term: string;
  /** Other names people use for the same thing. Shown, and used in schema. */
  alsoCalled?: string[];
  /** Phrases auto-linked to this entry in answer pages. Longest wins. */
  match: string[];
  definition: string;
  source: { title: string; url: string };
};

/** When every definition below was last checked against its source. */
export const GLOSSARY_REVIEWED = '2026-11-16';

const M = 'https://www.medicare.gov';

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: 'original-medicare',
    term: 'Original Medicare',
    match: ['Original Medicare'],
    definition:
      'Original Medicare is the coverage run by the federal government. It includes Part A and Part B. With it you can use any doctor or hospital in the country that takes Medicare.',
    source: {
      title: 'Parts of Medicare',
      url: `${M}/basics/get-started-with-medicare/medicare-basics/parts-of-medicare`,
    },
  },
  {
    slug: 'part-a',
    term: 'Part A',
    alsoCalled: ['Hospital Insurance'],
    match: ['Medicare Part A', 'Part A'],
    definition:
      'Part A is hospital insurance. It helps cover inpatient care in a hospital, care in a skilled nursing facility, hospice care and home health care. Most people pay no monthly premium for Part A because they or a spouse paid Medicare taxes long enough while working.',
    source: {
      title: 'Parts of Medicare',
      url: `${M}/basics/get-started-with-medicare/medicare-basics/parts-of-medicare`,
    },
  },
  {
    slug: 'part-b',
    term: 'Part B',
    alsoCalled: ['Medical Insurance'],
    match: ['Medicare Part B', 'Part B'],
    definition:
      'Part B is medical insurance. It helps cover services from doctors and other health care providers, outpatient care, durable medical equipment and many preventive services. Part B has a monthly premium.',
    source: {
      title: 'Parts of Medicare',
      url: `${M}/basics/get-started-with-medicare/medicare-basics/parts-of-medicare`,
    },
  },
  {
    slug: 'part-c',
    term: 'Medicare Advantage',
    alsoCalled: ['Part C', 'Medicare Advantage Plan'],
    match: ['Medicare Advantage plans', 'Medicare Advantage plan', 'Medicare Advantage', 'Part C'],
    definition:
      'A Medicare Advantage Plan is another way to get your Part A and Part B coverage. It is offered by a private company that contracts with Medicare. You need both Part A and Part B to join one, and you must live in the plan’s service area.',
    source: {
      title: 'Medicare Advantage & other health plans',
      url: `${M}/health-drug-plans/health-plans`,
    },
  },
  {
    slug: 'part-d',
    term: 'Part D',
    alsoCalled: ['Medicare drug coverage'],
    match: ['Medicare Part D', 'Part D', 'Medicare drug plan'],
    definition:
      'Part D helps cover the cost of prescription drugs. You get it by joining a separate Medicare drug plan alongside Original Medicare, or by joining a Medicare Advantage Plan that includes drug coverage. The plans are run by private insurance companies that follow rules set by Medicare.',
    source: {
      title: 'Parts of Medicare',
      url: `${M}/basics/get-started-with-medicare/medicare-basics/parts-of-medicare`,
    },
  },
  {
    slug: 'medigap',
    term: 'Medigap',
    alsoCalled: ['Medicare Supplement Insurance'],
    match: ['Medicare Supplement Insurance', 'Medicare Supplement', 'Medigap'],
    definition:
      'Medigap is extra insurance you can buy from a private company to help pay your share of costs in Original Medicare, such as copayments, coinsurance and deductibles. Policies are standardized and named by letter, so two policies with the same letter have the same basic benefits. Medigap works only with Original Medicare, not with a Medicare Advantage Plan.',
    source: { title: 'Get Medigap Basics', url: `${M}/health-drug-plans/medigap/basics` },
  },
  {
    slug: 'iep',
    term: 'Initial Enrollment Period',
    match: ['Initial Enrollment Period'],
    definition:
      'Your Initial Enrollment Period is your first chance to sign up for Medicare. For most people it lasts 7 months: it starts 3 months before the month you turn 65 and ends 3 months after that month.',
    source: {
      title: 'When does Medicare coverage start?',
      url: `${M}/basics/get-started-with-medicare/sign-up/when-does-medicare-coverage-start`,
    },
  },
  {
    slug: 'gep',
    term: 'General Enrollment Period',
    match: ['General Enrollment Period'],
    definition:
      'The General Enrollment Period runs from January 1 to March 31 each year. It is for people who did not sign up for Part B (or for Part A, if they have to buy it) when they were first able to and who do not have a Special Enrollment Period. Coverage starts the month after you sign up, and a late enrollment penalty may apply.',
    source: {
      title: 'When does Medicare coverage start?',
      url: `${M}/basics/get-started-with-medicare/sign-up/when-does-medicare-coverage-start`,
    },
  },
  {
    slug: 'sep',
    term: 'Special Enrollment Period',
    match: ['Special Enrollment Periods', 'Special Enrollment Period'],
    definition:
      'A Special Enrollment Period is a limited time when you can sign up for Medicare or change your plan outside the usual periods because something happened in your life, such as moving or losing other coverage. What you can change and how long you have depend on the event.',
    source: {
      title: 'Special Enrollment Periods',
      url: `${M}/basics/get-started-with-medicare/get-more-coverage/joining-a-plan/special-enrollment-periods`,
    },
  },
  {
    slug: 'aep',
    term: 'Open Enrollment',
    alsoCalled: ['Annual Enrollment Period', 'Open Enrollment Period'],
    match: ['Annual Enrollment Period', 'Medicare Open Enrollment Period', 'Medicare Open Enrollment'],
    definition:
      'Open Enrollment runs from October 15 to December 7 each year. During it you can join, drop or switch a Medicare Advantage Plan or a Medicare drug plan, or move between Original Medicare and Medicare Advantage. Changes take effect on January 1.',
    source: { title: 'Open Enrollment', url: `${M}/health-drug-plans/open-enrollment` },
  },
  {
    slug: 'ma-oep',
    term: 'Medicare Advantage Open Enrollment Period',
    match: ['Medicare Advantage Open Enrollment Period'],
    definition:
      'This period runs from January 1 to March 31 each year and is only for people who are already in a Medicare Advantage Plan. You can switch to another Medicare Advantage Plan, or drop your plan and return to Original Medicare and join a separate drug plan. The change starts the first of the month after the plan gets your request.',
    source: {
      title: 'Joining a plan',
      url: `${M}/basics/get-started-with-medicare/get-more-coverage/joining-a-plan`,
    },
  },
  {
    slug: 'medigap-oep',
    term: 'Medigap Open Enrollment Period',
    match: ['Medigap Open Enrollment Period'],
    definition:
      'Your Medigap Open Enrollment Period is a one-time, 6-month period that starts the first month you have Part B and are 65 or older. During it you can buy any Medigap policy sold in your state, and the company cannot turn you down because of health problems. It does not repeat each year.',
    source: { title: 'Get Medigap Basics', url: `${M}/health-drug-plans/medigap/basics` },
  },
  {
    slug: 'guaranteed-issue',
    term: 'Guaranteed issue right',
    match: ['guaranteed issue rights', 'guaranteed issue right', 'guaranteed issue'],
    definition:
      'A guaranteed issue right is a situation in which an insurance company must sell you certain Medigap policies even if you have health problems. Federal law gives these rights in specific cases, for example when your Medicare Advantage Plan leaves Medicare or you move out of its service area. Each right has a deadline to apply.',
    source: {
      title: 'When can I buy a Medigap policy?',
      url: `${M}/health-drug-plans/medigap/ready-to-buy/when`,
    },
  },
  {
    slug: 'underwriting',
    term: 'Medical underwriting',
    match: ['medical underwriting'],
    definition:
      'Medical underwriting is when an insurance company looks at your health before it decides whether to sell you a policy and what to charge. A company can use it for a Medigap application when you are outside your Medigap Open Enrollment Period and do not have a guaranteed issue right.',
    source: { title: 'Get Medigap costs', url: `${M}/health-drug-plans/medigap/basics/costs` },
  },
  {
    slug: 'late-enrollment-penalty',
    term: 'Late enrollment penalty',
    match: ['late enrollment penalties', 'late enrollment penalty'],
    definition:
      'A late enrollment penalty is an amount added to your monthly premium when you sign up after you were first able to and did not have other qualifying coverage. It is not a one-time fee. For Part B and Part D it usually lasts as long as you have that coverage, and it grows the longer you waited.',
    source: {
      title: 'Avoid late enrollment penalties',
      url: `${M}/basics/costs/medicare-costs/avoid-penalties`,
    },
  },
  {
    slug: 'creditable-coverage',
    term: 'Creditable drug coverage',
    alsoCalled: ['Creditable prescription drug coverage', 'Creditable coverage'],
    match: [
      'creditable prescription drug coverage',
      'creditable drug coverage',
      'creditable coverage',
    ],
    definition:
      'Creditable drug coverage is prescription drug coverage that is expected to pay, on average, at least as much as Medicare drug coverage. Your plan must tell you each year whether your coverage is creditable. If you go 63 days or more without Medicare drug coverage or other creditable coverage, you may pay a Part D late enrollment penalty later.',
    source: {
      title: 'Creditable prescription drug coverage',
      url: `${M}/health-drug-plans/part-d/basics/creditable-coverage`,
    },
  },
  {
    slug: 'premium',
    term: 'Premium',
    match: [],
    definition:
      'A premium is the amount you pay each month for coverage, whether or not you use any services that month. Part B has a premium, and Medicare Advantage Plans, drug plans and Medigap policies may each have their own.',
    source: {
      title: 'What does Medicare cost?',
      url: `${M}/basics/get-started-with-medicare/medicare-basics/what-does-medicare-cost`,
    },
  },
  {
    slug: 'deductible',
    term: 'Deductible',
    match: [],
    definition:
      'A deductible is the amount you pay for covered care before your coverage starts to pay. In Original Medicare, Part A has a deductible for each benefit period and Part B has one each year. The amounts change every year.',
    source: {
      title: 'What does Medicare cost?',
      url: `${M}/basics/get-started-with-medicare/medicare-basics/what-does-medicare-cost`,
    },
  },
  {
    slug: 'coinsurance',
    term: 'Coinsurance',
    match: ['coinsurance'],
    definition:
      'Coinsurance is your share of the cost of a covered service, stated as a percentage. For most services covered by Part B in Original Medicare, you pay 20% of the Medicare-approved amount after you meet your deductible.',
    source: {
      title: 'Compare Original Medicare & Medicare Advantage',
      url: `${M}/basics/get-started-with-medicare/get-more-coverage/your-coverage-options/compare-original-medicare-medicare-advantage`,
    },
  },
  {
    slug: 'copayment',
    term: 'Copayment',
    alsoCalled: ['Copay'],
    match: ['copayments', 'copayment'],
    definition:
      'A copayment is an amount you pay as your share of the cost of a covered service or prescription. It is usually a set amount, not a percentage. Plans decide their own copayments, and drug plans often set a different copayment for each tier of drugs.',
    source: {
      title: 'How do drug plans work?',
      url: `${M}/health-drug-plans/part-d/what-drug-plans-cover/how-drug-plans-work`,
    },
  },
  {
    slug: 'moop',
    term: 'Out-of-pocket limit',
    alsoCalled: ['Maximum out-of-pocket'],
    match: ['maximum out-of-pocket', 'out-of-pocket limit'],
    definition:
      'An out-of-pocket limit is the most you pay in a year for covered Medicare services in a Medicare Advantage Plan. Once you reach it, you pay nothing for covered services for the rest of the year. Original Medicare has no yearly limit unless you have other coverage, such as Medigap.',
    source: {
      title: 'Compare Original Medicare & Medicare Advantage',
      url: `${M}/basics/get-started-with-medicare/get-more-coverage/your-coverage-options/compare-original-medicare-medicare-advantage`,
    },
  },
  {
    slug: 'irmaa',
    term: 'IRMAA',
    alsoCalled: ['Income-Related Monthly Adjustment Amount'],
    match: ['Income-Related Monthly Adjustment Amount', 'IRMAA'],
    definition:
      'IRMAA stands for Income-Related Monthly Adjustment Amount. It is an extra amount some people with higher incomes pay for Part B and Part D. Social Security decides whether it applies and sends a notice that explains the decision and how to appeal it.',
    source: {
      title: 'Initial IRMAA Determination',
      url: `${M}/basics/forms-publications-mailings/mailings/costs-and-coverage/initial-income-related-monthly-adjustment-amount-notice`,
    },
  },
  {
    slug: 'formulary',
    term: 'Formulary',
    alsoCalled: ['Drug list'],
    match: ['formulary', 'formularies'],
    definition:
      'A formulary is a plan’s list of covered drugs. Each plan chooses its own list within Medicare’s rules, and a plan can change its list during the year. Check a plan’s formulary for the drugs you take before you join.',
    source: {
      title: 'How do drug plans work?',
      url: `${M}/health-drug-plans/part-d/what-drug-plans-cover/how-drug-plans-work`,
    },
  },
  {
    slug: 'drug-tier',
    term: 'Drug tier',
    match: ['drug tiers', 'drug tier'],
    definition:
      'Many plans place the drugs on their list into levels called tiers. In general, a drug in a lower tier costs you less than a drug in a higher tier. Each plan can set up its tiers in its own way.',
    source: {
      title: 'How do drug plans work?',
      url: `${M}/health-drug-plans/part-d/what-drug-plans-cover/how-drug-plans-work`,
    },
  },
  {
    slug: 'prior-authorization',
    term: 'Prior authorization',
    alsoCalled: ['Prior approval'],
    match: ['prior authorization'],
    definition:
      'Prior authorization is approval that you or your prescriber must get from a plan before the plan will cover certain drugs or services. You or your prescriber can ask the plan for an exception.',
    source: {
      title: 'Drug plan rules',
      url: `${M}/health-drug-plans/part-d/what-drug-plans-cover/plan-rules`,
    },
  },
  {
    slug: 'step-therapy',
    term: 'Step therapy',
    match: ['step therapy'],
    definition:
      'Step therapy is a plan rule that asks you to first try a certain less expensive drug on the plan’s list before the plan will cover a more expensive one. Your prescriber can ask the plan for an exception.',
    source: {
      title: 'Drug plan rules',
      url: `${M}/health-drug-plans/part-d/what-drug-plans-cover/plan-rules`,
    },
  },
  {
    slug: 'network',
    term: 'Network',
    alsoCalled: ['Provider network'],
    match: ['provider network', 'plan’s network', "plan's network"],
    definition:
      'A network is the group of doctors, hospitals and other providers that have agreed to work with a plan. Some plans cover care only from providers in the network, except in an emergency. Others also cover care outside the network, usually at a higher cost to you.',
    source: {
      title: 'Health Maintenance Organizations (HMOs)',
      url: `${M}/health-drug-plans/health-plans/your-health-plan-options/HMO`,
    },
  },
  {
    slug: 'hmo',
    term: 'HMO',
    alsoCalled: ['Health Maintenance Organization'],
    match: ['Health Maintenance Organization', 'HMO'],
    definition:
      'An HMO is a type of Medicare Advantage Plan. In general you must get your care from doctors, hospitals and other providers in the plan’s network, except for emergency care, urgent care when you are out of the area, and temporary dialysis when you are out of the area.',
    source: {
      title: 'Health Maintenance Organizations (HMOs)',
      url: `${M}/health-drug-plans/health-plans/your-health-plan-options/HMO`,
    },
  },
  {
    slug: 'ppo',
    term: 'PPO',
    alsoCalled: ['Preferred Provider Organization'],
    match: ['Preferred Provider Organization', 'PPO'],
    definition:
      'A PPO is a type of Medicare Advantage Plan with a network of doctors, hospitals and other providers. You pay less when you use providers in the network. You can generally go outside the network for covered services, but you will usually pay more.',
    source: {
      title: 'Preferred Provider Organizations (PPOs)',
      url: `${M}/health-drug-plans/health-plans/your-health-plan-options/PPO`,
    },
  },
  {
    slug: 'snp',
    term: 'Special Needs Plan',
    alsoCalled: ['SNP'],
    match: ['Special Needs Plans', 'Special Needs Plan'],
    definition:
      'A Special Needs Plan is a type of Medicare Advantage Plan for a specific group of people, such as people who also have Medicaid or people who live in certain institutions. These plans shape their benefits, providers and drug lists around the group they serve, and every one of them must include drug coverage. You can stay in one only while you still meet its conditions.',
    source: {
      title: 'Special Needs Plans (SNP)',
      url: `${M}/health-drug-plans/health-plans/your-health-plan-options/SNP`,
    },
  },
  {
    slug: 'dual-eligible',
    term: 'Dually eligible',
    alsoCalled: ['Dual eligible'],
    match: ['dually eligible', 'dual eligible'],
    definition:
      'People who have both Medicare and full-benefit Medicaid are called dually eligible. Medicare pays first for services it covers, and Medicaid pays last, after Medicare and any other health insurance.',
    source: { title: 'Medicaid', url: `${M}/basics/costs/help/medicaid` },
  },
  {
    slug: 'medicaid',
    term: 'Medicaid',
    match: ['Medicaid'],
    definition:
      'Medicaid is a joint federal and state program that helps cover medical costs for people with limited income and resources. It offers some benefits Medicare does not normally cover, such as nursing home care and personal care services. Each state sets its own rules for who can get it.',
    source: { title: 'Medicaid', url: `${M}/basics/costs/help/medicaid` },
  },
  {
    slug: 'msp',
    term: 'Medicare Savings Program',
    match: ['Medicare Savings Programs', 'Medicare Savings Program'],
    definition:
      'Medicare Savings Programs are run by the states. They help people with limited income and resources pay Part A and Part B premiums, and in some cases deductibles, coinsurance and copayments. You apply through your state, which decides which program fits.',
    source: {
      title: 'Medicare Savings Programs',
      url: `${M}/basics/costs/help/medicare-savings-programs`,
    },
  },
  {
    slug: 'lis',
    term: 'Extra Help',
    alsoCalled: ['Low-Income Subsidy'],
    match: ['Extra Help'],
    definition:
      'Extra Help is a Medicare program that helps people with limited income and resources pay Part D premiums, deductibles, coinsurance and other drug costs. Some people get it automatically, and others have to apply.',
    source: { title: 'Help with drug costs', url: `${M}/basics/costs/help/drug-costs` },
  },
  {
    slug: 'assignment',
    term: 'Assignment',
    alsoCalled: ['Accepting assignment'],
    match: ['accepts assignment', 'accept assignment', 'accepting assignment'],
    definition:
      'A doctor or other provider who accepts assignment agrees to take the Medicare-approved amount as full payment for a covered service. They charge you only the Medicare deductible and coinsurance, and they send the claim to Medicare for you. This applies to Original Medicare.',
    source: {
      title: 'Does your provider accept Medicare as full payment?',
      url: `${M}/basics/costs/medicare-costs/provider-accept-Medicare`,
    },
  },
  {
    slug: 'service-area',
    term: 'Service area',
    match: ['service area'],
    definition:
      'A service area is the place where a plan accepts members. You must live in a plan’s service area to join it. If you move out of it, you get a Special Enrollment Period to choose new coverage.',
    source: {
      title: 'Special Enrollment Periods',
      url: `${M}/basics/get-started-with-medicare/get-more-coverage/joining-a-plan/special-enrollment-periods`,
    },
  },
  {
    slug: 'anoc',
    term: 'Annual Notice of Change',
    alsoCalled: ['ANOC', 'Plan Annual Notice of Change'],
    match: ['Annual Notice of Change'],
    definition:
      'If you are in a Medicare plan, the plan sends you a Plan Annual Notice of Change each fall. It lists the changes in coverage and costs that will take effect in January. Read it to decide whether the plan will still meet your needs next year.',
    source: {
      title: 'Plan Annual Notice of Change (ANOC)',
      url: `${M}/basics/forms-publications-mailings/mailings/costs-and-coverage/upcoming-plan-changes`,
    },
  },
  {
    slug: 'eoc',
    term: 'Evidence of Coverage',
    alsoCalled: ['EOC'],
    match: ['Evidence of Coverage'],
    definition:
      'If you are in a Medicare plan, the plan sends you an Evidence of Coverage each year, usually in the fall. It gives the details of what the plan covers and how much you pay.',
    source: {
      title: 'Evidence of Coverage (EOC)',
      url: `${M}/basics/forms-publications-mailings/mailings/costs-and-coverage/evidence-of-coverage`,
    },
  },
  {
    slug: 'cobra',
    term: 'COBRA',
    match: ['COBRA'],
    definition:
      'COBRA is a federal law that may let you keep your employer group health plan for a limited time after your job ends or after you lose coverage as a spouse or dependent. COBRA does not give you more time to sign up for Part B. The 8-month window to sign up without a penalty starts when the work or the coverage from that work ends, whether or not you choose COBRA.',
    source: {
      title: 'COBRA coverage',
      url: `${M}/basics/get-started-with-medicare/medicare-basics/working-past-65/cobra-coverage`,
    },
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find((entry) => entry.slug === slug);
}

export const GLOSSARY_PATH = '/medicare-glossary';

export function glossaryHref(slug: string): string {
  return `${GLOSSARY_PATH}#${slug}`;
}
