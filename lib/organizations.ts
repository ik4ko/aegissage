/**
 * /for-organizations: one page per kind of organization, written for the
 * person who decides (a billing manager, a growth lead, a practice manager, a
 * senior living director, a program coordinator, an HR lead).
 *
 * ── Rules for this file ───────────────────────────────────────────────────
 *  1. Education and help for people who ask. No plan or carrier names, no
 *     premiums, no "you qualify", no "best".
 *  2. Nothing of value changes hands in either direction, and no organization
 *     ever sends a name, list, chart or record. Every page says so.
 *  3. Scope of Appointment and event rules follow 42 CFR 422.2264(c) as
 *     amended by the CY2027 final rule (FR 2026-06600): educational events
 *     need no SOA; one-on-one plan talk needs an SOA agreed and recorded
 *     first, which can be the same day; no gap is required between a talk
 *     and one-on-one help. See docs/partners/compliance-guardrails.md.
 *  4. `answer` is the 40-50 word direct answer under the H1, for voice and
 *     AI search. FAQ questions are spoken-style and their answers render on
 *     the page; the FAQPage schema is built from the same array.
 *  scripts/test-organizations.mjs checks these rules.
 */
import type { ORGANIZATION_TYPES } from './validations/partner-request';

export type OrgAudience = {
  slug: string;
  /** Search-result title (the site adds " · Aegis Sage"). */
  metaTitle: string;
  description: string;
  kicker: string;
  h1: string;
  answer: string;
  whatIDo: string[];
  whatIDont: string[];
  steps: string[];
  faq: { question: string; answer: string }[];
  /** Four short lines for the printable one-page sheet. */
  sheet: string[];
  formType: (typeof ORGANIZATION_TYPES)[number]['value'];
  related: { href: string; label: string }[];
  /** Optional "why this matters now" section, under the direct answer. */
  why?: { heading: string; paragraphs: string[]; source?: { title: string; url: string } };
  /** Optional short paragraph printed on the one-page sheet. */
  sheetNote?: string;
  /** Optional email the reader can forward inside their organization. */
  forwardEmail?: { subject: string; body: string };
};

export const ORG_HUB_PATH = '/for-organizations';

export const orgAudiences: OrgAudience[] = [
  {
    slug: 'billing-teams',
    metaTitle: 'Medicare help for patients: billing teams',
    description:
      'For billing and revenue cycle teams in North Jersey: a free place to send patients with Medicare coverage questions. No payments, no patient lists.',
    kicker: 'Billing and revenue cycle teams',
    h1: 'Medicare help for your patients, so your billing team does not have to give it',
    answer:
      'When a patient’s Medicare coverage is confusing, has changed, or they are not sure they are eligible yet, your staff can give them my number. I help the patient directly, for free, only when the patient asks. No money changes hands either way, and you never send me patient information.',
    whatIDo: [
      'Explain to the patient, in plain words, how their Medicare coverage works and who pays first.',
      'Help a patient who wants to change plans during a window they are allowed to use.',
      'Explain when someone can sign up for Medicare and where to do it, so they are not left uncovered.',
      'Point patients to free counseling and to Medicare itself when that is the better fit.',
      'Speak with patients in English, Georgian or Russian.',
    ],
    whatIDont: [
      'I do not handle claims, appeals or billing for your practice.',
      'I do not receive patient names, lists, charts or account information, and I will not accept them.',
      'I do not pay or receive anything for a referral, and I do not give gifts or meals.',
      'I do not tell a patient they qualify for anything before a licensed review of their situation.',
      'I do not steer patients toward any insurance company.',
    ],
    steps: [
      'Your staff mention that a licensed insurance broker helps with Medicare questions at no cost, and give the patient my number or a printed sheet.',
      'The patient decides whether to call. Nothing is sent from your office to me.',
      'If the patient wants to talk about specific plans, they agree to a Scope of Appointment first and I record it. That can be the same day.',
      'I explain what I find, including when the patient’s current coverage is the right answer.',
    ],
    faq: [
      {
        question: 'Can our billing staff refer patients with Medicare questions to a broker?',
        answer:
          'Yes, as long as nothing of value changes hands and no patient information is shared. Staff can mention that a licensed broker helps for free and give the patient the number. The patient chooses whether to call.',
      },
      {
        question: 'Does the broker see our patients’ records or balances?',
        answer:
          'No. I never receive records, balances or lists from your office. Anything I learn comes from the patient, by their choice, after they contact me.',
      },
      {
        question: 'What if a patient’s plan changed and the claim was denied?',
        answer:
          'The claim stays with your billing process. I can help the patient understand their current coverage and, if they are allowed to change plans, help them choose coverage that fits going forward.',
      },
    ],
    sheet: [
      'Free Medicare help for your patients, at their request',
      'Coverage questions, plan changes, and when to sign up',
      'No payments either way, no patient lists, no records',
      'English, Georgian and Russian',
    ],
    formType: 'billing',
    related: [
      { href: '/answers/how-to-switch-medicare-plans', label: 'How to switch Medicare plans' },
      { href: '/answers/medicare-and-medicaid-together', label: 'Medicare and Medicaid together' },
      { href: '/medicare-questions', label: '30 Medicare questions, answered plainly' },
    ],
  },
  {
    slug: 'medical-groups',
    metaTitle: 'Medicare education for medical groups',
    description:
      'For growth and outreach teams at senior-focused medical groups in New Jersey: patient education talks and plan-neutral help keeping their doctors.',
    kicker: 'Senior-focused primary care and medical groups',
    h1: 'Medicare education for your patients, from a licensed broker who names no plan',
    answer:
      'I give your patients plain Medicare education talks and, for anyone who asks, one-on-one help checking which plans include the doctors they want to keep or changing plans in an allowed window. I name no insurance company in talks, and your group pays nothing and receives nothing.',
    whatIDo: [
      'Hold patient education talks in a community room or online: the parts of Medicare, the enrollment windows, and how to read a plan letter.',
      'For patients who ask, check which plans available to them include the doctors they want to keep.',
      'Help patients who are allowed to change plans, including people who have both Medicare and Medicaid.',
      'Send your team a plain outline of every talk ahead of time for approval.',
      'Work in English, Georgian and Russian.',
    ],
    whatIDont: [
      'I do not favor plans your group contracts with, and I do not promise any plan will include a doctor next year.',
      'I do not meet patients in exam rooms or treatment areas.',
      'I do not take patient lists or schedules, and your staff never collect forms for me.',
      'I do not pay or accept anything of value, including meals.',
      'I do not sell or take applications at an educational talk.',
    ],
    steps: [
      'Tell me what your patients ask about most, and we pick a date and a common area, or a video talk.',
      'I send the outline for your approval. No plan or company is named.',
      'At the talk I teach and answer questions. Anyone who wants one-on-one help can contact me, the same day if they like.',
      'Before any one-on-one plan talk, the patient agrees to a Scope of Appointment and I record it. No waiting period is required.',
    ],
    faq: [
      {
        question: 'Can a broker give a Medicare talk at our medical group?',
        answer:
          'Yes, if it is an educational talk in a common area or online, with no plan names and no applications. No Scope of Appointment is needed for an educational talk.',
      },
      {
        question: 'Can patients get one-on-one help the same day as the talk?',
        answer:
          'Yes. Medicare no longer requires a gap between a talk and one-on-one help, or a 48-hour wait. The patient agrees to a Scope of Appointment first, and I record it.',
      },
      {
        question: 'Will you steer patients toward plans our group takes?',
        answer:
          'No. I check what the patient wants checked, usually their own doctors, across the plans I can offer, and I tell them where to see every plan, including ones I do not offer.',
      },
    ],
    sheet: [
      'Medicare education talks for your patients, no plan names',
      'Plan-neutral help keeping their doctors, at their request',
      'Same-day one-on-one help after a recorded Scope of Appointment',
      'No fees, no gifts, no patient lists',
    ],
    formType: 'medical-group',
    related: [
      { href: '/answers/how-to-check-if-a-doctor-is-in-a-medicare-plan', label: 'How to check if a doctor is in a Medicare plan' },
      { href: '/answers/medicare-advantage-plan-ending-non-renewal-letter', label: 'When a Medicare Advantage plan is ending' },
      { href: '/partners', label: 'How partnering works, and the rules I follow' },
    ],
  },
  {
    slug: 'new-practices',
    metaTitle: 'A free Medicare resource for a new practice',
    description:
      'Opening a clinic or practice in New Jersey or New York City? Give Medicare patients a free, plan-neutral place for coverage questions from day one.',
    kicker: 'New clinics and practices',
    h1: 'A Medicare resource for your new practice’s patients, from the first day',
    answer:
      'When you open, new patients bring Medicare questions your front desk should not have to answer. I can be the place you send them: plain-language guides at the desk, a number to give out, and a short talk at your opening. No fees and no paperwork for your team.',
    whatIDo: [
      'Provide printed, plan-neutral Medicare guides for your waiting room or front desk.',
      'Give a short Medicare education talk at an open house or community event.',
      'Help patients who contact me with signing up, choosing coverage, or checking that your practice is in a plan’s network.',
      'Answer your front desk’s general questions about how Medicare works, so they can point people in the right direction.',
      'Work in English, Georgian and Russian.',
    ],
    whatIDont: [
      'I do not handle your credentialing or contracting with insurance companies.',
      'I do not receive patient information or lists. Patients contact me themselves.',
      'I do not pay for placement or referrals, and I accept nothing in return.',
      'I do not promise patients that any plan includes your practice.',
      'I do not name or favor any insurance company in guides or talks.',
    ],
    steps: [
      'Tell me your opening date, your town and who your patients are.',
      'I bring printed guides and, if you want one, a short talk for your opening event.',
      'Patients who want help call or text me. Nothing is sent from your office.',
      'Any one-on-one plan talk starts with a Scope of Appointment the patient agrees to, which I record. It can be the same day.',
    ],
    faq: [
      {
        question: 'Is there a free Medicare resource for a new clinic’s patients?',
        answer:
          'Yes. I provide plan-neutral printed guides and a phone number your staff can give out, and patients get help at no cost. Your practice pays nothing and receives nothing.',
      },
      {
        question: 'Can you check whether patients’ plans include our new practice?',
        answer:
          'When a patient asks, I can check plan directories for your practice by name and confirm with your office, the same way I check any doctor. Networks change, so I never promise one will stay.',
      },
      {
        question: 'Do you speak with patients in languages other than English?',
        answer:
          'Yes. I work in English, Georgian and Russian. For any other language, 1-800-MEDICARE offers free interpreters.',
      },
    ],
    sheet: [
      'A free Medicare resource for your patients from day one',
      'Plan-neutral guides for your front desk',
      'A short Medicare talk for your opening event',
      'No fees, no placement payments, no patient information',
    ],
    formType: 'new-practice',
    related: [
      { href: '/medicare-checklist', label: 'The printable Medicare appointment checklist' },
      { href: '/answers/turning-65-new-jersey', label: 'Turning 65 in New Jersey' },
      { href: '/medicare-questions', label: '30 Medicare questions, answered plainly' },
    ],
  },
  {
    slug: 'senior-living',
    metaTitle: 'Free Medicare help for senior living in NJ',
    description:
      'For senior living and assisted living in New Jersey: Medicare education days for residents and families, plus same-day one-on-one help for anyone who asks.',
    kicker: 'Senior living and assisted living',
    h1: 'Medicare education days for your residents, with one-on-one help for anyone who asks',
    answer:
      'I hold Medicare education days for residents and their families, and the same day I can meet one-on-one with anyone who asks, after we agree on and record a Scope of Appointment. I visit a resident’s room only when the resident invites me. There is no cost to your community.',
    whatIDo: [
      'Give an education talk for residents and families: what changes when someone moves, the enrollment windows, and how to read plan letters.',
      'Meet one-on-one, the same day, with residents who ask, in a common area or a private room you provide.',
      'Help families sort out coverage when a parent moves in, including people who have both Medicare and Medicaid.',
      'Leave plain-language guides with your family services or admissions team.',
      'Work in English, Georgian and Russian.',
    ],
    whatIDont: [
      'I do not visit a resident’s room unless the resident invites me.',
      'I do not take resident lists, room numbers or records, and staff never sign anyone up for a meeting.',
      'I do not bring gifts or meals, or pay for space or referrals.',
      'I do not take applications or present plans during the education talk.',
      'I do not name or favor any insurance company.',
    ],
    steps: [
      'We choose a date and a common room. I send the talk outline for your approval.',
      'You announce it as an education day. No sign-up sheet is needed.',
      'I give the talk and answer questions. No Scope of Appointment is needed for the talk itself.',
      'Residents who want one-on-one help can meet me the same day. We agree on a Scope of Appointment first and I record it.',
    ],
    faq: [
      {
        question: 'Can a Medicare broker hold an education day at our senior living community?',
        answer:
          'Yes. An educational talk with no plan names and no applications needs no Scope of Appointment. I send the outline ahead of time for your approval.',
      },
      {
        question: 'Can residents get one-on-one Medicare help the same day?',
        answer:
          'Yes. Medicare no longer requires a waiting period or a gap after a talk. The resident agrees to a Scope of Appointment, I record it, and we meet in a common area, or in their room if they invite me.',
      },
      {
        question: 'Does moving into our community change a resident’s Medicare plan?',
        answer:
          'It can. A move can mean a plan no longer serves where the resident lives, and it can open a window to change plans. I help residents and families check this.',
      },
    ],
    sheet: [
      'Medicare education days for residents and families',
      'Same-day one-on-one help after a recorded Scope of Appointment',
      'Resident rooms only when the resident invites me',
      'No cost, no gifts, no resident lists',
    ],
    formType: 'senior-living',
    related: [
      { href: '/answers/moving-between-new-jersey-new-york-pennsylvania', label: 'Moving with Medicare' },
      { href: '/answers/medicare-and-medicaid-together', label: 'Medicare and Medicaid together' },
      { href: '/partners', label: 'How partnering works, and the rules I follow' },
    ],
  },
  {
    slug: 'community-programs',
    metaTitle: 'Medicare talks in English, Georgian, Russian',
    description:
      'A Medicare education speaker for town senior programs, libraries and community groups in New Jersey and New York City, in English, Georgian or Russian.',
    kicker: 'Town senior programs and community organizations',
    h1: 'A Medicare education speaker for your members, in English, Georgian or Russian',
    answer:
      'I give plain Medicare education talks for town senior programs, libraries, and community and religious organizations, in English, Georgian or Russian. I name no insurance company, take no applications and need no sign-up sheet. Anyone who wants one-on-one help can contact me afterward. There is no cost.',
    whatIDo: [
      'Give a 45-minute talk with time for questions: the parts of Medicare, sign-up timing, the penalties, and where to check things yourself.',
      'Give the same talk in Georgian or Russian for communities that prefer it.',
      'Leave printed, plain-language guides for members who could not attend.',
      'Return each fall to explain what changes in the October to December window.',
      'Help members one-on-one, by their choice, after the talk or another day.',
    ],
    whatIDont: [
      'I do not name or favor any insurance company or plan.',
      'I do not take member lists, pass around sign-up sheets or collect contact details at the talk.',
      'I do not take applications at an educational talk.',
      'I do not pay for space or offer gifts or meals.',
      'I do not use your organization’s name or logo unless you ask me to, in writing.',
    ],
    steps: [
      'Tell me your group, the language you would like and a few possible dates.',
      'I send a plain outline for your approval. No plan or company is named.',
      'I give the talk and answer questions. No Scope of Appointment is needed for an educational talk.',
      'Members who want personal help contact me themselves, the same day if they like.',
    ],
    faq: [
      {
        question: 'Is there a Medicare education speaker who speaks Russian or Georgian?',
        answer:
          'Yes. I give Medicare talks in Russian and Georgian, as well as in English, for community and religious organizations in New Jersey and New York City, at no cost.',
      },
      {
        question: 'Does a Medicare talk at our senior center need any forms?',
        answer:
          'No. An educational talk with no plan names and no applications needs no Scope of Appointment, and I do not use sign-up sheets.',
      },
      {
        question: 'What does a Medicare education talk cover?',
        answer:
          'The parts of Medicare and what each pays for, when to sign up and the penalties for waiting, the fall enrollment window, and where to check everything on Medicare.gov.',
      },
    ],
    sheet: [
      'Medicare education talks for your members',
      'In English, Georgian or Russian',
      'No plan names, no sign-up sheets, no sales',
      'No cost to your organization',
    ],
    formType: 'community',
    related: [
      { href: '/medicare-help-georgian-russian', label: 'Medicare help in Georgian and Russian' },
      { href: '/medicare-enrollment-calendar', label: 'The Medicare enrollment calendar' },
      { href: '/medicare-glossary', label: 'The Medicare glossary' },
    ],
  },
  {
    slug: 'employers',
    metaTitle: 'Medicare help for employees turning 65',
    description:
      'For employers and HR in New Jersey and New York: plain Medicare help for employees turning 65, people working past 65, and retirees. No employee lists.',
    kicker: 'Employers and HR teams',
    h1: 'Medicare help for your employees turning 65 and your retirees',
    answer:
      'Employees turning 65 and new retirees ask HR when to sign up for Medicare and how it works with your plan. I explain the timing in a short talk or one-on-one for anyone who asks, so no one pays a late Part B penalty by mistake. There is no cost.',
    whatIDo: [
      'Give a short lunch-hour or online talk on Medicare at 65: Part B timing, working past 65, COBRA, and retiree coverage.',
      'Meet one-on-one with employees or retirees who ask, by phone, video or in person.',
      'Explain how Medicare and group coverage work together in general terms, using Medicare’s own rules.',
      'Provide a plain guide HR can share with anyone approaching 65.',
      'Work in English, Georgian and Russian.',
    ],
    whatIDont: [
      'I do not advise on your group plan’s design or pricing.',
      'I do not receive employee lists, ages or benefits data. Employees contact me themselves.',
      'I do not pay or accept anything of value.',
      'I do not sell at an educational talk or take applications there.',
      'I do not name or favor any insurance company.',
    ],
    steps: [
      'Tell me roughly how many employees or retirees are near 65 and what they ask HR about.',
      'We set a talk, in person or online. I send the outline for your approval.',
      'Employees who want personal help contact me directly. HR shares nothing.',
      'Before any one-on-one plan talk, the employee agrees to a Scope of Appointment and I record it. It can be the same day.',
    ],
    faq: [
      {
        question: 'Who can help our employees with Medicare when they turn 65?',
        answer:
          'A licensed insurance broker can explain the timing and options at no cost. I give a short talk or meet one-on-one with anyone who asks, and HR never shares employee information.',
      },
      {
        question: 'Do employees working past 65 need to sign up for Part B?',
        answer:
          'Often not right away if they have group coverage from current work, but it depends on the employer’s size. I explain the rule using Medicare’s own guidance so no one pays a lasting penalty.',
      },
      {
        question: 'Does COBRA give retiring employees more time to sign up for Medicare?',
        answer:
          'No. The 8-month window to sign up for Part B starts when the job or the job coverage ends, not when COBRA ends. This is the mistake I see most often.',
      },
    ],
    sheet: [
      'Medicare help for employees turning 65 and retirees',
      'Part B timing, working past 65, COBRA and retiree coverage',
      'Short talks and one-on-one help for anyone who asks',
      'No cost, no employee lists',
    ],
    formType: 'employer',
    related: [
      { href: '/answers/medicare-while-still-working', label: 'Still working at 65' },
      { href: '/answers/cobra-and-medicare', label: 'COBRA and Medicare' },
      { href: '/answers/retiree-coverage-and-medicare', label: 'Retiree coverage and Medicare' },
    ],
  },
  {
    slug: 'plan-endings',
    metaTitle: '2027 plan endings: patient access and billing',
    description:
      'For hospital patient access, financial counselors and medical billing companies: free, plan-neutral help for patients whose Medicare plan ends in 2027.',
    kicker: 'Hospital patient access and billing companies',
    h1: 'When a patient’s Medicare Advantage plan ends, give them one number to call',
    answer:
      'Some patients’ Medicare Advantage plans end December 31, 2026. In January that shows up as eligibility and claim problems. Your counselors can give those patients my number. I help each patient who asks, at no cost, compare coverage that includes their doctors. No fees, no lists, no steering.',
    why: {
      heading: 'Why this matters to your team in January',
      paragraphs: [
        'When a Medicare Advantage plan is not renewed, the member keeps Medicare but loses that plan on December 31. A patient who does nothing has Original Medicare from January 1, with no drug coverage. A patient who chooses late, up to February 28, 2027, gets new coverage from the first of the following month.',
        'For your team that can mean January and February visits registered to a plan that no longer covers the patient, eligibility checks that do not match the card the patient shows, and patients surprised at the pharmacy counter.',
        'Patients also ask your counselors which plan to pick. Your staff should not have to answer that. I can, plan-neutrally, with Original Medicare as one of the choices.',
      ],
      source: {
        title: 'Special Enrollment Periods (plan contract not renewed) — Medicare.gov',
        url: 'https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan/special-enrollment-periods',
      },
    },
    whatIDo: [
      'Explain the patient’s plan-ending letter, the dates, and what happens if they do nothing.',
      'Check, for each plan offered in their county, whether their doctors, hospital and prescriptions are included, before they choose.',
      'Explain Original Medicare and the Medigap rights that open when a plan ends, alongside Medicare Advantage options.',
      'Point patients to Medicare and their state SHIP when that fits better.',
      'Work in English, Georgian and Russian, by phone, text or in person.',
    ],
    whatIDont: [
      'I do not charge your organization or the patient. I am paid by the insurance company only if a patient enrolls through me.',
      'I do not pay referral fees or give gifts or meals, and I accept nothing of value.',
      'I do not take patient lists, schedules, records or account information, and I will not accept them.',
      'I do not steer patients to any insurance company, including the ones your organization contracts with.',
      'I do not handle claims, appeals or billing.',
    ],
    steps: [
      'Your counselor or billing representative tells the patient that a licensed broker helps with plan-ending letters at no cost, and gives them the printed sheet or my number.',
      'The patient decides whether to contact me. Nothing is sent from your office.',
      'Before we talk about specific plans, the patient agrees to a Scope of Appointment and I record it. It can be the same day.',
      'I compare what is offered for their doctors and prescriptions, including staying with Original Medicare. The patient decides.',
    ],
    faq: [
      {
        question: 'Can our financial counselors give patients a broker’s number?',
        answer:
          'Yes, if nothing of value changes hands and no patient information is shared. Counselors can say a licensed broker helps at no cost and give the number. The patient chooses whether to call.',
      },
      {
        question: 'What happens to a patient whose plan ends and who does nothing?',
        answer:
          'They keep Medicare. From January 1, 2027 they have Original Medicare, Part A and Part B, with no drug coverage until they join a drug plan. They can still choose new coverage until February 28, 2027.',
      },
      {
        question: 'Will you favor the plans our hospital is in network with?',
        answer:
          'No. I check whether each patient’s own doctors and hospital are in a plan’s network, because that is what patients ask. I favor no company and receive nothing from your organization.',
      },
      {
        question: 'Can you talk to a group of patients about plan endings?',
        answer:
          'Yes. I give educational talks on plan-ending letters with no plan names and no applications. One-on-one help afterward starts with a Scope of Appointment, which can be the same day.',
      },
    ],
    sheet: [
      'Help for patients whose Medicare Advantage plan ends in 2027',
      'Doctors and prescriptions checked before they choose',
      'No fees either way, no patient lists, no steering',
      'English, Georgian and Russian',
    ],
    sheetNote:
      'Plans that are not renewed end December 31, 2026. A patient who does nothing has Original Medicare from January 1 with no drug coverage. Patients can choose new coverage until February 28, 2027.',
    forwardEmail: {
      subject: 'A place to send patients whose Medicare plan is ending',
      body: [
        'Team,',
        'Some of our Medicare Advantage patients have letters saying their plan ends December 31, 2026. A patient who does nothing has Original Medicare from January 1 with no drug coverage, and we may see eligibility and claim problems in January.',
        'When a patient asks which plan to choose, we can give them a neutral place to go. Erekle Niniashvili is a licensed insurance broker in Edgewater who helps patients at no cost, checks their doctors and prescriptions before they choose, and favors no company. He works in English, Georgian and Russian.',
        'We send him nothing. The patient calls (551) 202-9079 or visits aegissage.com/for-organizations/plan-endings. Calling this number will direct you to a licensed insurance agent.',
        'No fees or anything of value change hands either way.',
      ].join('\n\n'),
    },
    formType: 'billing',
    related: [
      { href: '/answers/medicare-advantage-plan-ending-non-renewal-letter', label: 'What a plan-ending letter means' },
      { href: '/answers/how-to-check-if-a-doctor-is-in-a-medicare-plan', label: 'How to check if a doctor is in a plan' },
      { href: '/medicare-questions', label: '30 Medicare questions, answered plainly' },
    ],
  },
];

export function getOrgAudience(slug: string) {
  return orgAudiences.find((a) => a.slug === slug);
}
