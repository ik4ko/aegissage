import type { Metadata } from 'next';
import { withShareCard } from '@/lib/page-metadata';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo';
import { advisor, contactHrefs, site } from '@/lib/site';

const TITLE = 'How I am paid';
const DESCRIPTION = 'A plain-language account of how Erekle Niniashvili of Aegis Sage Medicare is paid: by the insurance company, at no cost to you, with no change to your premium.';
/** Date this page was last reviewed by Erekle. Update it when the text changes. */
const REVIEWED = 'November 16, 2026';

export const metadata: Metadata = withShareCard(
  {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/how-we-are-paid' },
    openGraph: { type: 'website', url: `${site.url}/how-we-are-paid`, title: TITLE, description: DESCRIPTION },
  },
  { path: '/how-we-are-paid', kicker: 'How I am paid' },
);

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: site.url },
          { name: TITLE, url: `${site.url}/how-we-are-paid` },
        ])}
      />
      <div className="container py-14 sm:py-20">
        <div className="mx-auto max-w-[68ch]">
          <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
            {TITLE}
          </h1>
          <p className="mt-4 text-base text-ink-soft">
            By <Link href="/about#credentials" className="underline">{advisor.name}</Link>, licensed
            insurance broker, NPN {advisor.npn}. Last reviewed {REVIEWED}.
          </p>
          <div className="article-body mt-10">
            <h2>The short version</h2>
            <p>
              You do not pay me. If you enroll in a plan through me, the insurance company
              that offers the plan pays me a commission. Your premium is the same whether
              you enroll through me, through another broker, or on your own.
            </p>

            <h2>What that means for you</h2>
            <ul>
              <li>Talking with me costs nothing, whether or not you enroll in anything.</li>
              <li>There is no fee for a review, a comparison or a second opinion.</li>
              <li>I am paid only if you enroll in a plan through me.</li>
              <li>
                If staying with what you have is the right answer, I will tell you so. I am
                not paid for that, and that is fine.
              </li>
            </ul>

            <h2>What you should know about the incentive</h2>
            <p>
              Being paid by insurance companies is a conflict of interest, and you should
              know it exists. Commissions are not the same for every type of plan. I can
              only be paid by companies I am contracted with, and I am not contracted with
              all of them. The notice at the bottom of every page says how many
              organizations and products I represent.
            </p>
            <p>
              You can see every plan available where you live, including ones I do not
              offer, at <a href="https://www.medicare.gov/plan-compare/">Medicare.gov</a> or
              by calling 1-800-MEDICARE.
            </p>

            <h2>What I never do</h2>
            <ul>
              <li>Charge you a fee.</li>
              <li>Pay or accept referral fees for sending people to me.</li>
              <li>Ask for your Medicare number, Social Security number or bank details on this site.</li>
            </ul>

            <h2>Questions</h2>
            <p>
              Ask me directly: <a href={contactHrefs.tel}>{advisor.phone}</a> or{' '}
              <Link href="/contact">send a message</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
