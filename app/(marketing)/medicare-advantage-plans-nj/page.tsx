import type { Metadata } from 'next';
import Link from 'next/link';
import { ServicePage, serviceMetadata, type ServicePageFaq } from '@/components/marketing/service-page';

/**
 * Service page: Medicare Advantage comparison help.
 *
 * Structural and educational only. No plan names, carriers, premiums, "$0",
 * star ratings, extra-benefit amounts or eligibility statements — those are
 * county-and-contract-year facts and none are verified here.
 *
 * Every rule stated below carries its source in a comment. If a rule cannot
 * be checked on medicare.gov or a state SHIP / regulator page, it does not go
 * on this page.
 */

const PATH = '/medicare-advantage-plans-nj';
const TITLE = 'Medicare Advantage Plan Help in Bergen County, NJ';
const DESCRIPTION =
  'How Medicare Advantage plans work, what to check before you enroll — including New York doctors — and when you can change. Edgewater-based broker. No cost to talk.';

export const metadata: Metadata = serviceMetadata({
  path: PATH,
  title: TITLE,
  description: DESCRIPTION,
  kicker: 'Medicare Advantage · Bergen & Hudson, NJ',
});

const faqs: ServicePageFaq[] = [
  {
    // Source: https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/your-coverage-options/compare-original-medicare-medicare-advantage
    question: 'I live in New Jersey but my doctors are in New York. Can a Medicare Advantage plan cover that?',
    answer:
      'It depends on the plan. Medicare Advantage plans usually work through a provider network, and a plan offered in a New Jersey county may or may not include a specific New York doctor or hospital. The only reliable answer is to check each provider by name against each plan before you enroll.',
  },
  {
    // Source: https://www.medicare.gov/health-drug-plans/open-enrollment
    question: 'When can I join or switch Medicare Advantage plans?',
    answer:
      'When you first get Medicare, and each year during Open Enrollment, October 15 to December 7, with changes starting January 1. If you are already in a Medicare Advantage plan, you can also make one change between January 1 and March 31. Certain life events, such as moving out of your plan’s service area, can open a special enrollment period.',
  },
  {
    // Source: https://www.medicare.gov/health-drug-plans/medigap/ready-to-buy/when
    question: 'Can I have a Medicare Advantage plan and a Medigap policy at the same time?',
    answer:
      'No. Medigap only works with Original Medicare, and it is illegal for anyone to sell you a Medigap policy while you have a Medicare Advantage plan.',
  },
  {
    // Source: https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/your-coverage-options/compare-original-medicare-medicare-advantage
    question: 'Does a Medicare Advantage plan include drug coverage?',
    answer:
      'Most do, which means you would not join a separate Part D plan. Each plan has its own drug list and pharmacy network, so your prescriptions and pharmacy should be checked against the specific plan.',
  },
  {
    // Source: https://www.medicare.gov/health-drug-plans/medigap/ready-to-buy/when
    question: 'If I try Medicare Advantage and do not like it, can I go back?',
    answer:
      'You can return to Original Medicare during the enrollment periods that allow it. Buying a Medigap policy afterwards is the harder part: outside your Medigap open enrollment period or a guaranteed-issue situation, an insurer in most states can ask health questions. That is worth understanding before your first choice.',
  },
  {
    question: 'Do you charge for help comparing Medicare Advantage plans?',
    answer: 'No. There is no cost to talk with me, and nothing is enrolled on the first call.',
  },
];

export default function MedicareAdvantagePage() {
  return (
    <ServicePage
      path={PATH}
      name="Medicare Advantage plan comparison"
      keywordLine="Medicare Advantage plan comparison · Bergen & Hudson Counties, NJ"
      headline="Medicare Advantage, checked against your doctors — on both sides of the river."
      areaServed="Bergen County and Hudson County, New Jersey"
      intro={
        <p>
          A Medicare Advantage plan replaces how your Medicare is run: one private plan,
          usually with a provider network, often with drug coverage built in. Whether that
          works for you comes down to your doctors, your prescriptions and your county — and
          in Bergen and Hudson Counties, often to whether a New York doctor is in the network.
        </p>
      }
      faqs={faqs}
      related={[
        { href: '/medicare-supplement-medigap-nj', label: 'Medigap (Medicare Supplement) guidance' },
        { href: '/medicare-part-d-drug-plans-nj', label: 'Part D drug plan review' },
        { href: '/medicare-basics/medicare-advantage-vs-medigap', label: 'Medicare Advantage or Medigap? The trade-off' },
        { href: '/tools/plan-comparison', label: 'Original Medicare vs. Medicare Advantage, side by side' },
      ]}
    >
      <h2>How Medicare Advantage works</h2>
      {/* Source: https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/your-coverage-options/compare-original-medicare-medicare-advantage */}
      <p>
        Medicare Advantage (Part C) plans are offered by private companies approved by
        Medicare. Instead of Original Medicare paying your doctors directly, the plan does.
        Most plans include Part D drug coverage. Every plan has a yearly limit on what you pay
        for covered Medicare services, which Original Medicare on its own does not have.
      </p>
      <p>
        The trade-off is choice of provider. With Original Medicare you can see any doctor or
        hospital in the country that takes Medicare. With Medicare Advantage you may need to
        use the plan’s network, and you may need a referral to see a specialist.
      </p>

      <h2>The New York doctor question</h2>
      <p>
        Many people in Edgewater, Fort Lee, Cliffside Park, Jersey City and the rest of Bergen
        and Hudson Counties have doctors in Manhattan or elsewhere in New York. That is
        common here and it is the check people most often skip. A plan you can join is set by
        the New Jersey county you live in; whether it includes a provider across the Hudson
        is a separate question, and it varies by plan and by year.
      </p>
      <p>
        So the check is done by name: each doctor, each specialist, the hospital you would
        want to go to, and your pharmacy. I will not guess on a web page whether a given
        practice is in a given network — that is exactly the kind of thing that changes.
      </p>

      <h2>What to check before you enroll</h2>
      <ul>
        <li>Every doctor and specialist you want to keep, by name, including any in New York.</li>
        <li>The hospital you would want to use.</li>
        <li>Each prescription and dose, against the plan’s drug list.</li>
        <li>Your pharmacy, and whether it is in the plan’s network.</li>
        <li>Whether specialists need a referral, and which services need approval first.</li>
        <li>The yearly out-of-pocket limit and the costs when you use care — not only the premium.</li>
      </ul>

      <h2>When you can enroll or change</h2>
      {/* Source: https://www.medicare.gov/health-drug-plans/open-enrollment */}
      <p>
        Open Enrollment runs October 15 to December 7 each year, and changes take effect
        January 1. During it you can join, switch or drop a Medicare Advantage plan, or move
        between Medicare Advantage and Original Medicare.
      </p>
      {/* Source: https://www.medicare.gov/publications/11219-Understanding-Medicare-Advantage-Medicare-Drug-Plan-Enrollment-Periods.pdf */}
      <p>
        If you are already in a Medicare Advantage plan, the Medicare Advantage Open Enrollment
        Period, January 1 to March 31, allows one change: to another Medicare Advantage plan,
        or back to Original Medicare with a separate drug plan. Outside those windows you
        generally need a special enrollment period, such as moving out of your plan’s service
        area. Not sure which applies? The{' '}
        <Link href="/tools/eligibility-check">enrollment window tool</Link> walks through it.
      </p>

      <h2>Mistakes I see most often</h2>
      <ul>
        <li>Choosing on the monthly premium and never checking the doctors.</li>
        <li>Assuming a plan a neighbor or relative likes will fit your prescriptions.</li>
        <li>Not realizing that going back to a Medigap policy later may involve health questions.</li>
        <li>Setting aside the Annual Notice of Change each autumn — see <Link href="/medicare-plan-ending-letter">what those letters mean</Link>.</li>
      </ul>
    </ServicePage>
  );
}
