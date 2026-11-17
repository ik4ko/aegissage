/**
 * The Medicare enrollment calendar at /medicare-enrollment-calendar.
 *
 * ── Rules for this file ───────────────────────────────────────────────────
 *  1. Every window is written as a RULE, not as this year's dates. "October
 *     15 to December 7 each year" is a rule. "October 15, 2026" is not, and
 *     goes stale. No year appears in any `when`, `can` or `starts` field.
 *  2. Every window names the official page that states it. Federal windows
 *     cite medicare.gov; a state rule cites that state's own agency.
 *  3. No carrier or plan names. The star-rating window is described the way
 *     Medicare describes it, with no plan named and no rating claimed.
 *  4. Nothing here says a reader qualifies for a window. It says what the
 *     rule is and sends them to the source, to Medicare or to a person.
 *
 * Checked against every source on CALENDAR_REVIEWED. Re-check each year
 * before October 1, when the fall notices go out.
 */

export const CALENDAR_REVIEWED = '2026-11-16';
export const CALENDAR_PATH = '/medicare-enrollment-calendar';

export type EnrollmentWindow = {
  /** URL anchor. */
  id: string;
  name: string;
  /** Who the window is for. */
  who: string;
  /** When it opens and closes, as a rule. */
  when: string;
  /** What you can do during it. */
  can: string;
  /** When coverage or the change takes effect. */
  starts: string;
  /** Anything that commonly trips people up. Optional. */
  note?: string;
  source: { title: string; site: string; url: string };
  /** Glossary anchor for the window's name, when there is one. */
  glossary?: string;
};

export type CalendarSection = {
  id: string;
  heading: string;
  intro: string;
  windows: EnrollmentWindow[];
};

const M = 'https://www.medicare.gov';
const SIGN_UP = {
  title: 'When does Medicare coverage start?',
  site: 'Medicare.gov',
  url: `${M}/basics/get-started-with-medicare/sign-up/when-does-medicare-coverage-start`,
};
const JOINING = {
  title: 'Joining a plan',
  site: 'Medicare.gov',
  url: `${M}/basics/get-started-with-medicare/get-more-coverage/joining-a-plan`,
};
const SEPS = {
  title: 'Special Enrollment Periods',
  site: 'Medicare.gov',
  url: `${M}/basics/get-started-with-medicare/get-more-coverage/joining-a-plan/special-enrollment-periods`,
};
const MEDIGAP_WHEN = {
  title: 'When can I buy a Medigap policy?',
  site: 'Medicare.gov',
  url: `${M}/health-drug-plans/medigap/ready-to-buy/when`,
};

/** Windows that fall on the same dates every year, for the table at the top. */
export const fixedDates: { dates: string; name: string; anchor: string }[] = [
  { dates: 'January 1 to March 31', name: 'General Enrollment Period (Part A and Part B)', anchor: 'general-enrollment-period' },
  { dates: 'January 1 to March 31', name: 'Medicare Advantage Open Enrollment Period', anchor: 'medicare-advantage-open-enrollment' },
  { dates: 'September', name: 'Plan Annual Notice of Change arrives', anchor: 'annual-notice-of-change' },
  { dates: 'October 15 to December 7', name: 'Open Enrollment', anchor: 'open-enrollment' },
  { dates: 'December 8 to the last day of February', name: 'Window after a plan is not renewed', anchor: 'plan-not-renewed' },
];

export const calendarSections: CalendarSection[] = [
  {
    id: 'signing-up',
    heading: 'Signing up for Part A and Part B',
    intro:
      'These windows are about getting Medicare itself. You sign up through Social Security, not through a plan.',
    windows: [
      {
        id: 'initial-enrollment-period',
        name: 'Initial Enrollment Period',
        glossary: 'iep',
        who: 'People turning 65.',
        when: 'It lasts 7 months. It starts 3 months before the month you turn 65 and ends 3 months after the month you turn 65.',
        can: 'Sign up for Part A and Part B for the first time.',
        starts:
          'If you sign up before the month you turn 65, Part B starts the month you turn 65. If you sign up that month or in the 3 months after, it starts the next month. Coverage always starts on the first of a month.',
        note: 'If you miss this window you may have to wait to sign up and pay a late enrollment penalty for as long as you have Part B.',
        source: SIGN_UP,
      },
      {
        id: 'disability',
        name: 'Medicare before 65 because of a disability',
        who: 'People under 65 who get disability benefits from Social Security or the Railroad Retirement Board.',
        when: 'After you have been getting disability benefits for 24 months. If you have ALS, as soon as your disability benefits start.',
        can: 'Get Part A and Part B. People in this situation already have Part A when Medicare starts.',
        starts: 'When the 24 months are complete, or with the first disability benefit for ALS.',
        source: {
          title: 'When can I sign up for Medicare?',
          site: 'Medicare.gov',
          url: `${M}/basics/get-started-with-medicare/sign-up/when-can-i-sign-up-for-medicare`,
        },
      },
      {
        id: 'general-enrollment-period',
        name: 'General Enrollment Period',
        glossary: 'gep',
        who: 'People who did not sign up when they were first able to and do not have a Special Enrollment Period.',
        when: 'January 1 to March 31 each year.',
        can: 'Sign up for Part B, and for Part A if you have to pay a premium for it.',
        starts: 'The month after you sign up.',
        note: 'A late enrollment penalty may apply.',
        source: SIGN_UP,
      },
      {
        id: 'employer-coverage-sep',
        name: 'Special Enrollment Period after coverage from a job',
        glossary: 'sep',
        who: 'People who had group health coverage from their own or a spouse’s current job when they turned 65.',
        when: 'It starts the first month after your Initial Enrollment Period ends. It ends 8 months after the job or the group health plan coverage ends, whichever happens first.',
        can: 'Sign up for Part B (and Part A, if you have to buy it) without a late enrollment penalty.',
        starts: 'Generally the first month after you sign up.',
        note: 'COBRA is not treated as coverage from a current job. Choosing COBRA does not change when this window ends. Retiree coverage does not create this window either.',
        source: SIGN_UP,
      },
      {
        id: 'exceptional-situations',
        name: 'Special Enrollment Periods for exceptional situations',
        glossary: 'sep',
        who: 'People who missed a chance to sign up because they lost Medicaid, were affected by a declared disaster or emergency, were given wrong information by an employer or health plan, were released from incarceration, or faced another exceptional condition.',
        when: 'Each has its own length. After losing Medicaid: until 6 months after the Medicaid coverage ends. After a disaster or emergency: until 6 months after the declaration ends. After wrong information: 6 months from the day you tell Social Security. After release from incarceration: through the last day of the 12th month after the month of release. For other exceptional conditions you must contact Social Security to ask.',
        can: 'Sign up for Part B (and Part A, if you have to buy it) without a late enrollment penalty.',
        starts: 'Generally the month after you sign up.',
        source: SIGN_UP,
      },
    ],
  },
  {
    id: 'plans',
    heading: 'Joining or changing a Medicare Advantage or drug plan',
    intro:
      'You can join, switch or drop a Medicare Advantage Plan or a Medicare drug plan only at certain times. You need both Part A and Part B to join a Medicare Advantage Plan, and either one to join a drug plan.',
    windows: [
      {
        id: 'initial-enrollment-period-plans',
        name: 'Initial Enrollment Period, for plans',
        glossary: 'iep',
        who: 'People who are new to Medicare.',
        when: 'The same 7 months as your Initial Enrollment Period for Part A and Part B.',
        can: 'Join a Medicare Advantage Plan or a Medicare drug plan.',
        starts:
          'If the plan gets your request before your Part A or Part B starts, the plan starts the same day. If it gets your request after, the plan starts the first of the next month.',
        source: JOINING,
      },
      {
        id: 'new-to-part-b',
        name: 'New to Part B',
        who: 'People who already have Part A and add Part B later.',
        when: 'It starts 3 months before the month you first have both Part A and Part B. You then have 2 months after you first have both to join a plan.',
        can: 'Join a Medicare Advantage Plan, with or without drug coverage.',
        starts: 'Generally the first of the month after the plan gets your request.',
        source: JOINING,
      },
      {
        id: 'first-three-months',
        name: 'First 3 months in a Medicare Advantage Plan',
        who: 'People who joined a Medicare Advantage Plan during their Initial Enrollment Period.',
        when: 'Within the first 3 months you have both Part A and Part B.',
        can: 'Change to another Medicare Advantage Plan, or go back to Original Medicare with or without a drug plan.',
        starts: 'The first of the month after the plan gets your request.',
        source: JOINING,
      },
      {
        id: 'open-enrollment',
        name: 'Open Enrollment',
        glossary: 'aep',
        who: 'Everyone with Medicare.',
        when: 'October 15 to December 7 each year.',
        can: 'Join, drop or switch a Medicare Advantage Plan. Join, drop or switch a Medicare drug plan. Switch between Original Medicare and Medicare Advantage.',
        starts: 'January 1 of the next year. The plan must get your request by December 7.',
        note: 'If you switch to Original Medicare, there are limits on when you can add a Medigap policy. See the Medigap section below.',
        source: {
          title: 'Open Enrollment',
          site: 'Medicare.gov',
          url: `${M}/health-drug-plans/open-enrollment`,
        },
      },
      {
        id: 'medicare-advantage-open-enrollment',
        name: 'Medicare Advantage Open Enrollment Period',
        glossary: 'ma-oep',
        who: 'Only people who are already in a Medicare Advantage Plan.',
        when: 'January 1 to March 31 each year.',
        can: 'Switch to another Medicare Advantage Plan, or drop your plan and return to Original Medicare. If you return to Original Medicare you can also join a separate drug plan.',
        starts: 'The first of the month after the plan gets your request.',
        source: JOINING,
      },
      {
        id: 'moving',
        name: 'Special Enrollment Period after a move',
        glossary: 'sep',
        who: 'People who move out of their plan’s service area, or move somewhere with new plan options.',
        when: 'If you tell your plan before you move, it starts the month before the month you move and continues for 2 full months after. If you tell your plan after, it starts when you move and continues for 2 full months after.',
        can: 'Switch to a new Medicare Advantage Plan or drug plan. If you moved out of a Medicare Advantage Plan’s service area, you can also go back to Original Medicare.',
        starts: 'Generally the first of the month after the plan gets your request.',
        source: SEPS,
      },
      {
        id: 'leaving-employer-coverage-plans',
        name: 'Special Enrollment Period after employer or union coverage ends',
        glossary: 'sep',
        who: 'People who leave coverage from an employer or union, including COBRA.',
        when: 'For 2 full months after the month the coverage ends.',
        can: 'Join a Medicare Advantage Plan or a Medicare drug plan.',
        starts: 'Generally the first of the month after the plan gets your request.',
        note: 'This window is for joining a plan. The window to sign up for Part B itself is separate and is listed above.',
        source: SEPS,
      },
      {
        id: 'losing-drug-coverage',
        name: 'Special Enrollment Period after losing creditable drug coverage',
        glossary: 'creditable-coverage',
        who: 'People who lose other drug coverage that was creditable through no choice of their own, or are told it is no longer creditable.',
        when: 'For 2 full months after the month you lose the coverage or are told it is no longer creditable, whichever is later.',
        can: 'Join a Medicare drug plan or a Medicare Advantage Plan with drug coverage.',
        starts: 'Generally the first of the month after the plan gets your request.',
        source: SEPS,
      },
      {
        id: 'medicaid-extra-help',
        name: 'People with Medicaid or Extra Help',
        glossary: 'lis',
        who: 'People who have Medicare and Medicaid, or who get Extra Help with drug costs.',
        when: 'Once each calendar month.',
        can: 'Switch to a different Medicare drug plan, or drop a Medicare Advantage Plan with drug coverage and return to Original Medicare with a separate drug plan.',
        starts: 'The first day of the next month.',
        note: 'If you are no longer eligible for Medicaid or Extra Help, you have 3 full months to change plans, counted from the date you lose eligibility or the date you are told, whichever is later.',
        source: SEPS,
      },
      {
        id: 'plan-not-renewed',
        name: 'When your plan is not renewed',
        glossary: 'sep',
        who: 'People whose Medicare Advantage Plan or drug plan will not have a contract with Medicare next year.',
        when: 'December 8 to the last day of February of the following year.',
        can: 'Switch to another plan. If you do not join another Medicare Advantage Plan before your plan ends, you are enrolled in Original Medicare.',
        starts: 'Generally the first of the month after the new plan gets your request.',
        note: 'This comes on top of Open Enrollment, which is when most people in this situation choose new coverage so that it starts January 1.',
        source: SEPS,
      },
      {
        id: 'first-year-trial',
        name: 'First year in a Medicare Advantage Plan you joined at 65',
        who: 'People who joined a Medicare Advantage Plan when they were first eligible for Medicare at 65.',
        when: 'For 12 months after you join the Medicare Advantage Plan for the first time.',
        can: 'Drop the plan and return to Original Medicare. You have special rights to buy a Medigap policy for a limited time.',
        starts: 'Generally the first of the month after your request.',
        source: SEPS,
      },
      {
        id: 'institution',
        name: 'Living in an institution',
        who: 'People who live in, or recently moved out of, an institution such as a nursing home or a rehabilitation hospital.',
        when: 'For as long as you live in the institution and for 2 full months after the month you move out.',
        can: 'Join, switch or drop a Medicare Advantage Plan or drug plan.',
        starts: 'Generally the first of the month after the plan gets your request.',
        source: SEPS,
      },
      {
        id: 'star-rating',
        name: 'Special Enrollment Period for a plan with Medicare’s highest quality rating',
        glossary: 'sep',
        who: 'People who live where a Medicare Advantage Plan or drug plan has an overall quality rating of 5 stars from Medicare.',
        when: 'One time between December 8 of the year before the plan year and November 30 of the plan year.',
        can: 'Join or switch to a plan with that rating, if one is offered where you live.',
        starts: 'Generally the first of the month after the plan gets your request.',
        note: 'Ratings are set by Medicare each year and are shown on Medicare.gov. If you move from a plan with drug coverage to one without, you may lose drug coverage and may pay a Part D late enrollment penalty later.',
        source: SEPS,
      },
    ],
  },
  {
    id: 'medigap',
    heading: 'Buying a Medigap policy',
    intro:
      'Medigap has its own timing, set by federal law and added to by some states. It is not part of Open Enrollment in the fall.',
    windows: [
      {
        id: 'medigap-open-enrollment',
        name: 'Medigap Open Enrollment Period',
        glossary: 'medigap-oep',
        who: 'People who are 65 or older and have Part B.',
        when: 'A one-time period of 6 months. It starts the first month you have Part B and are 65 or older.',
        can: 'Buy any Medigap policy sold in your state. The company cannot turn you down because of health problems.',
        starts: 'Set by the policy you buy.',
        note: 'It does not repeat each year. If you delay Part B because of coverage from a current job, this period waits and starts when your Part B starts.',
        source: {
          title: 'Get Medigap Basics',
          site: 'Medicare.gov',
          url: `${M}/health-drug-plans/medigap/basics`,
        },
      },
      {
        id: 'guaranteed-issue',
        name: 'Guaranteed issue rights',
        glossary: 'guaranteed-issue',
        who: 'People in specific situations, for example when a Medicare Advantage Plan leaves Medicare or stops covering where they live, or they move out of its service area and switch to Original Medicare.',
        when: 'You can apply as early as 60 days before your coverage ends and no later than 63 days after it ends.',
        can: 'Buy certain Medigap policies without being turned down because of health problems.',
        starts: 'After the earlier coverage ends.',
        note: 'These are federal rights. Your state may give you more; ask your State Insurance Department.',
        source: MEDIGAP_WHEN,
      },
      {
        id: 'medigap-new-york',
        name: 'New York: Medigap at any time',
        who: 'People with Medicare who live in New York.',
        when: 'At any time of the year.',
        can: 'Apply for a Medigap policy. New York requires any insurer that sells Medigap to accept a Medicare enrollee’s application at any time throughout the year.',
        starts: 'Set by the policy you buy.',
        source: {
          title: 'Medicare Insurance Coverage Information for Consumers',
          site: 'New York State Department of Financial Services',
          url: 'https://www.dfs.ny.gov/consumers/health_insurance/information_for_medicare_beneficiaries',
        },
      },
      {
        id: 'medigap-new-jersey-under-65',
        name: 'New Jersey: Medigap for people under 65 with a disability',
        who: 'New Jersey residents who become eligible for Medicare because of a disability before age 65.',
        when: 'Within 12 months after enrolling in Part B, for people who became eligible for Medicare on or after January 1, 2020.',
        can: 'Apply for the Medicare Supplement plan that New Jersey law requires to be offered to them. One program covers people under 50 and another covers people 50 through 64.',
        starts: 'Set by the policy you buy.',
        note: 'New Jersey otherwise follows the federal 6-month Medigap Open Enrollment Period.',
        source: {
          title: 'Medicare Supplement Coverage for Individuals Eligible for Medicare due to Disability',
          site: 'New Jersey Department of Banking and Insurance',
          url: 'https://www.nj.gov/dobi/division_insurance/medsuppunder50/intro.html',
        },
      },
      {
        id: 'medigap-pennsylvania',
        name: 'Pennsylvania: the federal 6-month period',
        who: 'People with Medicare who live in Pennsylvania.',
        when: 'A 6-month period that starts the first month you have Part B and are 65 or older.',
        can: 'Buy a Medigap policy sold in Pennsylvania.',
        starts: 'Set by the policy you buy.',
        source: {
          title: 'Medigap - Medicare Supplement Coverage',
          site: 'Pennsylvania Insurance Department',
          url: 'https://www.pa.gov/agencies/insurance/consumer-help-center/learn-about-insurance/health-insurance/medicare-supplement',
        },
      },
    ],
  },
  {
    id: 'every-year',
    heading: 'Mail to watch for every year',
    intro: 'Two plan documents arrive in the fall, before Open Enrollment starts.',
    windows: [
      {
        id: 'annual-notice-of-change',
        name: 'Plan Annual Notice of Change',
        glossary: 'anoc',
        who: 'Everyone in a Medicare Advantage Plan or a Medicare drug plan.',
        when: 'Your plan sends it each fall. Medicare lists September as when to expect it.',
        can: 'Read the changes in coverage and costs that take effect in January and decide whether the plan will still meet your needs. If it does not arrive, contact your plan.',
        starts: 'The changes it describes take effect in January.',
        source: {
          title: 'Plan Annual Notice of Change (ANOC)',
          site: 'Medicare.gov',
          url: `${M}/basics/forms-publications-mailings/mailings/costs-and-coverage/upcoming-plan-changes`,
        },
      },
      {
        id: 'evidence-of-coverage',
        name: 'Evidence of Coverage',
        glossary: 'eoc',
        who: 'Everyone in a Medicare Advantage Plan or a Medicare drug plan.',
        when: 'Your plan sends it each year, usually in the fall.',
        can: 'Check the details of what the plan covers and how much you pay.',
        starts: 'It describes the plan year that starts in January.',
        source: {
          title: 'Evidence of Coverage (EOC)',
          site: 'Medicare.gov',
          url: `${M}/basics/forms-publications-mailings/mailings/costs-and-coverage/evidence-of-coverage`,
        },
      },
    ],
  },
];

export const allWindows: EnrollmentWindow[] = calendarSections.flatMap((section) => section.windows);
