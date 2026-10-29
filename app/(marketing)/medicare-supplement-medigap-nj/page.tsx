import type { Metadata } from 'next';
import Link from 'next/link';
import { ServicePage, serviceMetadata, type ServicePageFaq } from '@/components/marketing/service-page';

/**
 * Service page: Medicare Supplement (Medigap) guidance.
 *
 * Structural and educational only. No carriers, plan prices, rate
 * comparisons or "best plan" language. The timing rules are the federal ones
 * plus New York's continuous open enrollment rule, each with its source in a
 * comment. No New Jersey- or Pennsylvania-specific Medigap rule is stated,
 * because none was verified for this page — the copy says states may add
 * protections and points to the federal floor.
 */

const PATH = '/medicare-supplement-medigap-nj';
const TITLE = 'Medigap (Medicare Supplement) Help in Bergen County, NJ';
const DESCRIPTION =
  'How Medigap works with Original Medicare, the one-time 6-month enrollment window, and how New York’s rules differ from New Jersey’s. Independent broker. No cost to talk.';

export const metadata: Metadata = serviceMetadata({
  path: PATH,
  title: TITLE,
  description: DESCRIPTION,
  kicker: 'Medicare Supplement · NJ, NY & PA',
});

const faqs: ServicePageFaq[] = [
  {
    // Source: https://www.medicare.gov/health-drug-plans/medigap/ready-to-buy/when
    question: 'When is the best time to buy a Medigap policy?',
    answer:
      'Under federal rules, your Medigap Open Enrollment Period is the six months that start the first month you are 65 or older and enrolled in Part B. After it ends, your options to buy a policy may be limited and the policy may cost more. It happens once and does not repeat each year.',
  },
  {
    // Source: https://www.dfs.ny.gov/consumers/health_insurance/information_for_medicare_beneficiaries
    question: 'Are Medigap rules different in New York?',
    answer:
      'Yes. New York requires insurers that sell Medigap to accept an application from a person with Medicare at any time of year, and not to deny a policy or charge more because of health. Outside New York, the federal six-month window at 65 is the one to plan around, and your state health insurance assistance program can tell you whether any extra protections apply.',
  },
  {
    // Source: https://www.medicare.gov/health-drug-plans/medigap/ready-to-buy/when
    question: 'Can I switch from Medicare Advantage to Medigap later?',
    answer:
      'You can return to Original Medicare during the enrollment periods that allow it, but buying a Medigap policy at that point may involve health questions unless you have a guaranteed-issue right. Those rights include your Medicare Advantage plan leaving your area, and trying Medicare Advantage for the first time and switching within the first year.',
  },
  {
    // Source: https://www.medicare.gov/health-drug-plans/medigap/ready-to-buy/when
    question: 'Can I keep a Medigap policy if I join a Medicare Advantage plan?',
    answer:
      'Medigap only works with Original Medicare. It is illegal for anyone to sell you a Medigap policy while you have a Medicare Advantage plan.',
  },
  {
    // Source: https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/your-coverage-options/compare-original-medicare-medicare-advantage
    question: 'Does Medigap cover prescriptions?',
    answer:
      'Drug coverage with Original Medicare comes from a separate Medicare Part D drug plan. If you choose Medigap, the drug plan is a second decision, and your prescriptions should be checked against it.',
  },
  {
    question: 'Do you charge for Medigap guidance?',
    answer: 'No. There is no cost to talk with me, and nothing is enrolled on the first call.',
  },
];

export default function MedigapPage() {
  return (
    <ServicePage
      path={PATH}
      name="Medicare Supplement (Medigap) guidance"
      keywordLine="Medicare Supplement (Medigap) guidance · NJ, NY & PA"
      headline="Medigap is mostly a timing decision. Here is the clock."
      areaServed="New Jersey, New York and Pennsylvania"
      intro={
        <p>
          A Medicare Supplement (Medigap) policy sits beside Original Medicare and pays some of
          the costs Medicare leaves to you. You can use any doctor or hospital in the country
          that takes Medicare. The part people miss is the timing: when you buy matters as
          much as what you buy, and the rules are different in New York than in New Jersey.
        </p>
      }
      faqs={faqs}
      related={[
        { href: '/medicare-advantage-plans-nj', label: 'Medicare Advantage plan comparison' },
        { href: '/medicare-part-d-drug-plans-nj', label: 'Part D drug plan review' },
        { href: '/medicare-basics/medicare-advantage-vs-medigap', label: 'Medicare Advantage or Medigap? The trade-off' },
        { href: '/turning-65-bergen-county', label: 'Turning 65 in Bergen County' },
      ]}
    >
      <h2>How Medigap works</h2>
      {/* Source: https://www.medicare.gov/health-drug-plans/medigap */}
      <p>
        You need Original Medicare — Part A and Part B — to buy a Medigap policy. Medicare
        pays its share of a covered bill first, and the Medigap policy pays some or all of what
        is left, depending on the plan.
      </p>
      {/* Source: https://www.medicare.gov/health-drug-plans/medigap/basics */}
      <p>
        Medigap plans are standardized and named by letter. Policies with the same letter offer
        the same basic benefits no matter where you live or which insurance company sells the
        policy. What differs between companies selling the same letter is the price and how
        it changes over time.
      </p>
      {/* Source: https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/your-coverage-options/compare-original-medicare-medicare-advantage */}
      <p>
        Because Medigap follows Original Medicare, there is no network: any doctor or hospital
        in the U.S. that takes Medicare can see you. For someone in Bergen or Hudson County
        with doctors in New York, that is often the deciding point.
      </p>

      <h2>The six-month window, and why it matters</h2>
      {/* Source: https://www.medicare.gov/health-drug-plans/medigap/ready-to-buy/when */}
      <p>
        Federal law gives you a one-time, six-month Medigap Open Enrollment Period. It starts
        the first month you are 65 or older and signed up for Part B. During it you can buy any
        Medigap policy sold in your state without being turned down or charged more for your
        health. After it ends, your options may be limited and the policy may cost more.
      </p>
      {/* Source: https://www.medicare.gov/health-drug-plans/medigap/ready-to-buy/when */}
      <p>
        There are also guaranteed-issue situations later in life — for example, if your
        Medicare Advantage plan leaves your area, or if you joined Medicare Advantage when
        you were first eligible and switch back within the first year. These come with their
        own application windows, generally from 60 days before your other coverage ends to
        63 days after.
      </p>

      <h2>New Jersey, New York and Pennsylvania are not the same</h2>
      {/* Source: https://www.dfs.ny.gov/consumers/health_insurance/information_for_medicare_beneficiaries */}
      <p>
        New York requires insurers that sell Medigap to accept applications at any time of
        year, and not to deny coverage or charge more because of health. That makes switching
        later a very different question in Brooklyn or Queens than it is in Fort Lee.
      </p>
      {/* Source: https://www.medicare.gov/health-drug-plans/medigap/ready-to-buy/when ("Contact your state to find out if your state offers more opportunities") */}
      {/* NJ SHIP: https://www.nj.gov/humanservices/doas/services/q-z/ship/ */}
      <p>
        In New Jersey and Pennsylvania, plan your Medigap decision around the federal window
        at 65. States can add protections of their own, so if you are unsure what applies to
        you, the{' '}
        <a href="https://www.nj.gov/humanservices/doas/services/q-z/ship/" rel="noopener noreferrer" target="_blank">
          New Jersey State Health Insurance Assistance Program
        </a>{' '}
        is a free, neutral place to ask, and so am I.
      </p>

      <h2>What to check before you choose</h2>
      <ul>
        <li>Whether your six-month window is open, and when it closes.</li>
        <li>Which plan letter fits how you use care, compared like-for-like between companies.</li>
        <li>How the premium is set and how it has changed over time.</li>
        <li>A separate Part D plan for your prescriptions — see <Link href="/medicare-part-d-drug-plans-nj">Part D drug plan review</Link>.</li>
      </ul>

      <h2>Mistakes I see most often</h2>
      <ul>
        <li>Letting the six-month window pass without knowing it was open.</li>
        <li>Assuming a Medigap can be added later on the same terms, outside New York.</li>
        <li>Comparing different plan letters as if they were the same coverage.</li>
        <li>Skipping drug coverage because you take no prescriptions today — that can start a permanent penalty.</li>
      </ul>
    </ServicePage>
  );
}
