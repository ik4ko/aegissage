import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo';
import { advisor, contactHrefs, site } from '@/lib/site';

const TITLE = 'Accessibility';
const DESCRIPTION = 'The accessibility statement for aegissage.com: what the site aims for, known limits, and how to get help by phone if something does not work for you.';
/** Date this page was last reviewed by Erekle. Update it when the text changes. */
const REVIEWED = 'November 16, 2026';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/accessibility' },
  openGraph: { type: 'website', url: `${site.url}/accessibility`, title: TITLE, description: DESCRIPTION },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: site.url },
          { name: TITLE, url: `${site.url}/accessibility` },
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
            <h2>What I am aiming for</h2>
            <p>
              This site is built for people 65 and older and the family members who help
              them. The goal is to meet the Web Content Accessibility Guidelines (WCAG) 2.1
              at Level AA: large text, strong contrast, large buttons, clear labels on every
              form field, and pages that work with a keyboard and a screen reader.
            </p>

            <h2>Where it stands</h2>
            <p>
              I have not had the site independently audited, so I do not claim that every
              page meets that standard. If something does not work for you, that is a
              defect and I want to know about it.
            </p>

            <h2>If something does not work</h2>
            <p>
              Call or text <a href={contactHrefs.tel}>{advisor.phone}</a>, or{' '}
              <Link href="/contact">send a message</Link>. Tell me which page and what went
              wrong. You never need the website to work with me: everything here can be
              done by phone.
            </p>

            <h2>Other ways to get the same information</h2>
            <ul>
              <li>I can read any page to you over the phone or mail you a printed copy.</li>
              <li>I work in English, Georgian and Russian.</li>
              <li>
                Medicare itself offers materials in large print, braille, audio and other
                languages at 1-800-MEDICARE (TTY 1-877-486-2048).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
