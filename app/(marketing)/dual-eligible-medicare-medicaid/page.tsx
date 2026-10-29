import type { Metadata } from 'next';
import { ServicePage, serviceMetadata, type ServicePageFaq } from '@/components/marketing/service-page';

/**
 * Service page: people with both Medicare and Medicaid.
 *
 * CLAUDE.md: D-SNP pages are educational only. No form, no condition
 * capture, no statement that anyone qualifies for Medicaid, a Medicare
 * Savings Program, Extra Help or a D-SNP. Eligibility is decided by the
 * state (Medicaid) and SSA (Extra Help); this page says so.
 */

const PATH = '/dual-eligible-medicare-medicaid';
const TITLE = 'Dual-Eligible Medicare & Medicaid Plan Help in Bergen County, NJ';
const DESCRIPTION =
  'Have both Medicare and Medicaid? How dual-eligible plans (D-SNPs) work, when you can change, and what to check. Help in English, Georgian and Russian.';

export const metadata: Metadata = serviceMetadata({
  path: PATH,
  title: TITLE,
  description: DESCRIPTION,
  kicker: 'Medicare + Medicaid · NJ & NY',
});

const faqs: ServicePageFaq[] = [
  {
    question: 'What does dual-eligible mean?',
    answer:
      'It means you have Medicare and also get help from Medicaid. Some people have full Medicaid coverage; others get help only with Medicare costs such as the Part B premium, through a Medicare Savings Program.',
  },
  {
    question: 'What is a D-SNP?',
    answer:
      'A Dual-Eligible Special Needs Plan is a type of Medicare Advantage plan only for people who have both Medicare and Medicaid. It is designed to coordinate the two. Whether one is a good fit depends on your doctors, prescriptions and the plans offered in your county.',
  },
  {
    question: 'Can people with Medicaid change Medicare plans outside the Annual Enrollment Period?',
    answer:
      'Often, yes. Since 2025, people with Medicaid or Extra Help have a monthly special enrollment period that allows certain changes, such as moving to Original Medicare with a standalone drug plan, or into certain plans built for dual-eligible people. Which changes apply depends on your situation.',
  },
  {
    question: 'Can you tell me if I qualify for Medicaid?',
    answer:
      'No. Medicaid eligibility is decided by your state, and Extra Help by Social Security. I can explain how those programs work with Medicare and where to apply, and review your Medicare options once you know your status.',
  },
  {
    question: 'Is there a cost for a dual-eligible plan review?',
    answer: 'No. There is no cost to talk with me.',
  },
];

export default function DualEligiblePage() {
  return (
    <ServicePage
      path={PATH}
      name="Dual-eligible (Medicare and Medicaid) plan review"
      keywordLine="Dual-eligible Medicare + Medicaid plan review · Bergen & Hudson Counties, NJ"
      headline="Medicare and Medicaid together, explained plainly."
      intro={
        <p>
          If you have both Medicare and Medicaid, your choices work differently from everyone
          else&apos;s — including when you are allowed to change. I explain how the two fit
          together, what dual-eligible plans are, and what to check before you switch anything.
        </p>
      }
      faqs={faqs}
      related={[
        { href: '/medicare-basics/the-four-parts-in-plain-english', label: 'The four parts of Medicare, in plain English' },
        { href: '/medicare-coverage-review', label: 'Annual plan review during AEP' },
        { href: '/medicare-help-georgian-russian', label: 'Medicare help in Georgian and Russian' },
      ]}
    >
      <h2>How Medicare and Medicaid fit together</h2>
      <p>
        Medicare pays first for most medical care. Medicaid can then help with what Medicare
        leaves behind — premiums, deductibles, coinsurance — and may cover some things Medicare
        does not, such as certain long-term care. How much Medicaid covers depends on your
        level of eligibility and your state.
      </p>

      <h2>What a dual-eligible review covers</h2>
      <ul>
        <li>Whether your doctors and hospitals take the plan you are considering</li>
        <li>Whether your prescriptions are covered, and how Extra Help affects drug costs</li>
        <li>How your current Medicaid benefits would work with each Medicare option</li>
        <li>When you are allowed to make a change, and what happens if you do nothing</li>
      </ul>

      <h2>A note on the calls and mailers</h2>
      <p>
        People with Medicaid get a lot of Medicare advertising, much of it urgent and vague.
        No legitimate plan requires you to decide on the phone today. If a call or mailer
        pressures you, write down the name and number and talk it over with someone you trust
        before you change anything.
      </p>
    </ServicePage>
  );
}
