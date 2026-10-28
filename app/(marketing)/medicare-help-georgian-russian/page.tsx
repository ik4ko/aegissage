import type { Metadata } from 'next';
import { ServicePage, type ServicePageFaq } from '@/components/marketing/service-page';
import { advisor, site } from '@/lib/site';

/**
 * Service page: Medicare help in Georgian and Russian.
 *
 * Supersedes the earlier "Russian content deprioritized" decision: on Oct 28
 * 2026 Erekle listed Georgian and Russian as active service languages for
 * the website and the Google Business Profile. This page is what makes the
 * `knowsLanguage` / `availableLanguage` schema truthful — keep it live as
 * long as those languages are in lib/site.ts.
 *
 * The Georgian and Russian paragraphs carry `lang` attributes so browsers,
 * screen readers and search engines treat them as those languages. Have a
 * native reader proofread them before any expansion.
 */

const PATH = '/medicare-help-georgian-russian';
const TITLE = 'Georgian & Russian-Speaking Medicare Broker in NJ & NY';
const DESCRIPTION =
  'Medicare help in Georgian (ქართულად) and Russian (на русском) from an independent broker in Edgewater, NJ. Serving Bergen and Hudson Counties, Brooklyn and Queens.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: 'article', title: `${TITLE} — ${site.name}`, description: DESCRIPTION, url: `${site.url}${PATH}` },
};

const faqs: ServicePageFaq[] = [
  {
    question: 'Can I talk about Medicare in Georgian or Russian?',
    answer:
      'Yes. I explain Medicare in English, Georgian or Russian — plan comparisons, enrollment at 65, the annual plan review and the letters your plan sends.',
  },
  {
    question: 'Can I call on behalf of my parent?',
    answer:
      'Yes, and many people do. Your parent should be part of the conversation for any decision about their coverage, and we can talk in whichever language is easiest for them.',
  },
  {
    question: 'Which areas do you serve?',
    answer:
      'I am based in Edgewater, New Jersey, and serve Bergen and Hudson Counties, Brooklyn, Queens and Philadelphia, by phone or by appointment. I am licensed in 25 states.',
  },
  {
    question: 'Is there a cost?',
    answer: 'No. There is no cost to talk with me, in any language.',
  },
];

export default function GeorgianRussianPage() {
  return (
    <ServicePage
      path={PATH}
      name="Georgian- and Russian-language Medicare help"
      keywordLine="Georgian & Russian-speaking Medicare broker · NJ, NY & PA"
      headline="Medicare, explained in your own language."
      areaServed="Bergen County and Hudson County, New Jersey; Brooklyn and Queens, New York; Philadelphia, Pennsylvania"
      intro={
        <p>
          Medicare is hard enough in your first language. I help Georgian- and Russian-speaking
          families compare plans, sign up at 65, review coverage each year and make sense of the
          letters plans send — for themselves or for a parent.
        </p>
      }
      faqs={faqs}
      related={[
        { href: '/turning-65-bergen-county', label: 'Turning 65 in Bergen County' },
        { href: '/medicare-basics/helping-a-parent-with-medicare', label: 'Helping a parent with Medicare' },
        { href: '/medicare-plan-ending-letter', label: 'Help with plan-ending and plan-change letters' },
      ]}
    >
      <h2 lang="ka">ქართულად</h2>
      <p lang="ka">
        გამარჯობა! მე ვარ ერეკლე ნინიაშვილი, Medicare-ის დამოუკიდებელი ბროკერი ეჯვოთერიდან,
        ნიუ-ჯერსი. Medicare-ს აგიხსნით ქართულად: Medicare Advantage-ის, Medigap-ისა და Part D-ის
        გეგმების შედარება, რეგისტრაცია 65 წლის ასაკში, გეგმის ყოველწლიური გადახედვა და
        წერილები, რომლებსაც გეგმა გიგზავნით. საუბარი უფასოა. დამირეკეთ ან მომწერეთ:{' '}
        {advisor.phone}.
      </p>

      <h2 lang="ru">На русском</h2>
      <p lang="ru">
        Здравствуйте! Меня зовут Эрекле Ниниашвили, я независимый брокер Medicare из Эджуотера,
        Нью-Джерси. Объясню Medicare на русском языке: сравнение планов Medicare Advantage,
        Medigap и Part D, оформление в 65 лет, ежегодный пересмотр плана и письма, которые
        присылает ваш план. Консультация бесплатная. Звоните или пишите: {advisor.phone}.
      </p>

      <h2>What we can go over together</h2>
      <ul>
        <li>Medicare Advantage, Medigap and Part D options, side by side</li>
        <li>Signing up for Medicare at 65, including if you are still working</li>
        <li>Your plan&apos;s Annual Notice of Change, or a letter saying it is ending</li>
        <li>Medicare together with Medicaid, if you have both</li>
      </ul>
    </ServicePage>
  );
}
