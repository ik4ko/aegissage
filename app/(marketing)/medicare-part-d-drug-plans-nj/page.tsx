import type { Metadata } from 'next';
import Link from 'next/link';
import { ServicePage, serviceMetadata, type ServicePageFaq } from '@/components/marketing/service-page';

/**
 * Service page: Part D prescription drug plan review.
 *
 * Structural and educational only. No plan names, carriers, premiums,
 * deductibles or dollar figures — the national base beneficiary premium and
 * the out-of-pocket cap change every year, so the penalty and the cap are
 * described by how they work, not by amount. No condition or medication is
 * collected or named; "your prescriptions" stays generic.
 */

const PATH = '/medicare-part-d-drug-plans-nj';
const TITLE = 'Part D Drug Plan Review in Bergen County, NJ';
const DESCRIPTION =
  'Checking your prescriptions, doses and pharmacy against Medicare Part D drug lists, and how the late enrollment penalty works. Edgewater-based broker. No cost to talk.';

export const metadata: Metadata = serviceMetadata({
  path: PATH,
  title: TITLE,
  description: DESCRIPTION,
  kicker: 'Part D · Bergen County, NJ',
});

const faqs: ServicePageFaq[] = [
  {
    // Source: https://www.medicare.gov/health-drug-plans/part-d/what-drug-plans-cover/how-drug-plans-work
    question: 'Why does my Part D plan need to be reviewed every year?',
    answer:
      'Each plan has its own list of covered drugs, and plans can change that list and their costs from one year to the next. A plan that fit your prescriptions this year may treat them differently next year, which is why the yearly Annual Notice of Change is worth reading.',
  },
  {
    // Source: https://www.medicare.gov/health-drug-plans/part-d/basics/costs
    question: 'What is the Part D late enrollment penalty?',
    answer:
      'If, after your Initial Enrollment Period, you go 63 days or more in a row without Medicare drug coverage or other creditable drug coverage, a penalty may be added to your premium. It is based on how many full months you went uncovered, and you generally pay it for as long as you have Medicare drug coverage.',
  },
  {
    // Source: https://www.medicare.gov/health-drug-plans/open-enrollment
    question: 'When can I change my Part D plan?',
    answer:
      'During Open Enrollment, October 15 to December 7, you can join, switch or drop a Medicare drug plan, with changes starting January 1. Some situations, such as moving or losing other drug coverage, can open a special enrollment period.',
  },
  {
    // Source: https://www.medicare.gov/health-drug-plans/part-d/what-drug-plans-cover/pharmacies
    question: 'Does it matter which pharmacy I use?',
    answer:
      'It can. Plans have networks of pharmacies, and some only cover your drugs, or offer a lower price, at pharmacies in their network. Your usual pharmacy, or a mail-order option, should be checked against the plan.',
  },
  {
    // Source: https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/your-coverage-options/compare-original-medicare-medicare-advantage
    question: 'Do I need a separate Part D plan if I have Medicare Advantage?',
    answer:
      'Usually not. Most Medicare Advantage plans include drug coverage. With Original Medicare, with or without a Medigap policy, drug coverage comes from a separate Part D plan.',
  },
  {
    question: 'Do you charge for a Part D review?',
    answer: 'No. There is no cost to talk with me, and nothing is enrolled on the first call.',
  },
];

export default function PartDPage() {
  return (
    <ServicePage
      path={PATH}
      name="Part D prescription drug plan review"
      keywordLine="Part D prescription drug plan review · Bergen County, NJ"
      headline="There is no best Part D plan. There is the one that fits your prescriptions this year."
      areaServed="Bergen County, New Jersey"
      intro={
        <p>
          Medicare drug plans each have their own list of covered drugs, their own pharmacy
          network and their own costs — and all three can change every January. A Part D
          review is simple to describe: your prescriptions, doses and pharmacy, checked
          against the plans available in your county.
        </p>
      }
      faqs={faqs}
      related={[
        { href: '/medicare-advantage-plans-nj', label: 'Medicare Advantage plan comparison' },
        { href: '/medicare-supplement-medigap-nj', label: 'Medigap (Medicare Supplement) guidance' },
        { href: '/tools/penalty-calculator', label: 'Estimate a late enrollment penalty' },
        { href: '/medicare-coverage-review', label: 'Annual plan review during AEP' },
      ]}
    >
      <h2>How Part D works</h2>
      {/* Source: https://www.medicare.gov/health-drug-plans/part-d/what-drug-plans-cover/how-drug-plans-work */}
      <p>
        Part D is Medicare drug coverage offered by private plans approved by Medicare. You
        get it either as a standalone drug plan alongside Original Medicare, or built into
        most Medicare Advantage plans. Each plan’s list of covered drugs is called a
        formulary. Plans choose which drugs they cover within Medicare’s rules, and they can
        change the list — during the year they must give you notice before a change affects
        a drug you take.
      </p>
      {/* Source: https://www.medicare.gov/health-drug-plans/part-d/basics/costs */}
      <p>
        Medicare also sets a yearly cap on what you pay out of pocket for covered drugs. The
        amount is updated each year, so check the current figure on medicare.gov rather than
        relying on an older article.
      </p>

      <h2>What a review actually checks</h2>
      <ul>
        <li>Every prescription, with its exact dose and how often you fill it.</li>
        <li>Whether each one is on the plan’s drug list, and on which tier.</li>
        <li>Rules attached to a drug, such as prior approval or quantity limits.</li>
        <li>Your pharmacy — including whether you fill prescriptions in New York — and mail order.</li>
        <li>The total yearly cost for your drugs, not only the monthly premium.</li>
      </ul>
      <p>
        You can bring the bottles, or the list on the{' '}
        <Link href="/medicare-checklist">printable Medicare checklist</Link>. Nothing about
        your health needs to be shared on this website; the review happens in conversation.
      </p>

      <h2>When you can enroll or change</h2>
      {/* Source: https://www.medicare.gov/health-drug-plans/open-enrollment */}
      <p>
        Open Enrollment runs October 15 to December 7, and changes take effect January 1.
        You can join a drug plan when you first get Medicare, and some life events open a
        special enrollment period. The{' '}
        <Link href="/tools/eligibility-check">enrollment window tool</Link> shows which
        window applies to you.
      </p>

      <h2>The penalty people find out about too late</h2>
      {/* Source: https://www.medicare.gov/health-drug-plans/part-d/basics/costs */}
      <p>
        After your Initial Enrollment Period, a stretch of 63 days or more in a row without
        Medicare drug coverage or other creditable drug coverage can add a late enrollment
        penalty to your premium. It is calculated from the number of full months you went
        uncovered, and it generally lasts as long as you have Medicare drug coverage — even
        if you switch plans.
      </p>
      <p>
        If you are covered through an employer or union, keep the creditable coverage notice
        they send each year; it is how you show you had drug coverage. The{' '}
        <Link href="/tools/penalty-calculator">penalty calculator</Link> estimates the amount
        from your dates.
      </p>

      <h2>Mistakes I see most often</h2>
      <ul>
        <li>Choosing the lowest premium without checking the drug list.</li>
        <li>Keeping the same plan for years without reading the Annual Notice of Change.</li>
        <li>Skipping drug coverage because you take few prescriptions today.</li>
        <li>Assuming every pharmacy is in every plan’s network.</li>
      </ul>
    </ServicePage>
  );
}
