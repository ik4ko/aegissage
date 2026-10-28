import type { Metadata } from 'next';
import Link from 'next/link';
import { ServicePage, type ServicePageFaq } from '@/components/marketing/service-page';
import { site } from '@/lib/site';

/**
 * Service page: plan-ending (non-renewal) and plan-change (ANOC) letters.
 *
 * Highest-intent AEP query with no local owner as of Oct 28 2026. Rules
 * stated here are the federal ones and are phrased as "may" wherever the
 * answer depends on the person's situation. No plan names, carriers, or
 * claims about which plans are leaving which county.
 */

const PATH = '/medicare-plan-ending-letter';
const TITLE = 'Medicare Plan Ending or Changing? Letter Help in Bergen County, NJ';
const DESCRIPTION =
  'Got a letter saying your Medicare plan is ending or changing next year? What it means, your deadlines, and your options. Edgewater-based broker. No cost to talk.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: 'article', title: `${TITLE} — ${site.name}`, description: DESCRIPTION, url: `${site.url}${PATH}` },
};

const faqs: ServicePageFaq[] = [
  {
    question: 'My Medicare Advantage plan sent a letter saying it is ending. What happens if I do nothing?',
    answer:
      'If your plan is not renewing, you are generally returned to Original Medicare on January 1. If that plan also covered your prescriptions, you would have no Part D drug coverage unless you join a drug plan. That is why the letter is worth acting on rather than filing away.',
  },
  {
    question: 'How long do I have to choose a new plan if mine is ending?',
    answer:
      'You can choose during the Annual Enrollment Period, October 15 to December 7. People whose plan is not renewing also generally get a special enrollment period that runs from December 8 through the last day of February. Choosing before December 7 means the new coverage starts January 1 with no gap.',
  },
  {
    question: 'Can I buy a Medigap policy if my Medicare Advantage plan is leaving?',
    answer:
      'When a Medicare Advantage plan stops serving your area, federal rules may give you a guaranteed right to buy certain Medigap policies without health questions, for a limited time around the date your coverage ends. The exact window and plans depend on your situation and state, so it is worth checking before you decide.',
  },
  {
    question: 'What is an Annual Notice of Change?',
    answer:
      'It is the letter every Medicare Advantage and Part D plan sends each autumn listing what changes on January 1: premium, drug list, provider network and costs. If something on it affects you, the Annual Enrollment Period is when you can switch.',
  },
  {
    question: 'Can I change plans after December 7?',
    answer:
      'Sometimes. From January 1 to March 31, people already in a Medicare Advantage plan can make one change. A special enrollment period may also apply, for example if your plan ended, you moved, or you have Medicaid or Extra Help.',
  },
  {
    question: 'Do you charge for help with these letters?',
    answer: 'No. There is no cost to talk with me about your letter or your options.',
  },
];

export default function PlanEndingLetterPage() {
  return (
    <ServicePage
      path={PATH}
      name="Plan-ending and plan-change letter help"
      keywordLine="Medicare plan-ending & plan-change letter help · Bergen County, NJ"
      headline="Your plan sent a letter. Here is what it actually means."
      intro={
        <p>
          Every autumn, Medicare plans mail two kinds of letters people tend to set aside: the
          Annual Notice of Change, and — less often — a notice that the plan is ending. Both come
          with real deadlines. Bring me the letter and I will explain what it says, what happens
          if you do nothing, and what your options are.
        </p>
      }
      faqs={faqs}
      related={[
        { href: '/medicare-coverage-review', label: 'Annual plan review during AEP' },
        { href: '/medicare-basics/enrollment-deadlines-that-actually-matter', label: 'Every Medicare deadline on one page' },
        { href: '/medicare-basics/medicare-advantage-vs-medigap', label: 'Medicare Advantage or Medigap?' },
      ]}
    >
      <h2>Two different letters</h2>
      <p>
        <strong>The Annual Notice of Change</strong> arrives every year. It lists what your
        Medicare Advantage or Part D plan is changing on January 1. The plan is not leaving;
        it is just different next year.
      </p>
      <p>
        <strong>A non-renewal notice</strong> means the plan will not be offered in your area
        next year. That one requires a decision, because staying put is not an option.
      </p>

      <h2>What to check first</h2>
      <ul>
        <li>Is each of your prescriptions still covered next year, and at what cost?</li>
        <li>Are your doctors and preferred hospital in the network — including New York providers, if you live in New Jersey and see doctors across the river?</li>
        <li>Did the yearly out-of-pocket maximum or the premium change?</li>
        <li>If your plan is ending, did it include your drug coverage?</li>
      </ul>

      <h2>The dates that matter</h2>
      <p>
        The Annual Enrollment Period runs October 15 to December 7, with changes starting
        January 1. If your plan is ending, a special enrollment period generally continues
        after that, through the end of February. Waiting is allowed, but a gap in drug coverage
        can be costly, so earlier is usually better.
      </p>
      <p>
        Not sure which applies to you? The{' '}
        <Link href="/tools/eligibility-check">enrollment window tool</Link> walks through it,
        or call me and we will read the letter together.
      </p>
    </ServicePage>
  );
}
