import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/json-ld';
import { advisor, compliance, site } from '@/lib/site';
import { breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy notice',
  description: `How ${site.name} handles the information you send through this site.`,
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

/**
 * Plain-language privacy notice. Linked from the disclaimer footer, which is
 * the only place required disclosures live.
 *
 * Keep this in sync with what the code actually does:
 *  - /api/contact stores submissions in Supabase `contacts`
 *  - lib/notify emails/texts the advisor
 *  - lib/analytics records events with no personal data attached
 */
export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Privacy notice', url: `${site.url}/privacy` },
        ])}
      />
      <div className="container py-14 sm:py-20">
      <div className="mx-auto max-w-[68ch]">
        <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
          Privacy notice
        </h1>
        <p className="mt-4 text-base text-ink-faint">
          Last updated {compliance.currentAsOf}
        </p>

        <div className="article-body mt-10">
          <h2>The short version</h2>
          <p>
            I collect only what you type into a form on this site, I use it only to answer
            you, and I do not sell or share it with anyone. There is no login here and
            nothing you read is tracked to you personally.
          </p>

          <h2>What gets collected</h2>
          <ul>
            <li>
              <strong>What you submit.</strong> If you fill in a contact form, I receive
              your name and whichever of email, phone, ZIP code and message you chose to
              provide, plus the answers you attached from the eligibility check if you sent
              them.
            </li>
            <li>
              <strong>Technical details attached to a submission.</strong> The IP address
              and browser user agent are stored with the submission, used only to block
              abuse of the form.
            </li>
            <li>
              <strong>Anonymous usage measurements.</strong> Page views and events such as
              &ldquo;someone reached step 3 of the eligibility check&rdquo; are recorded
              without any personal information. Your quiz answers are never sent to the
              analytics service.
            </li>
          </ul>

          <h2>What does not get collected</h2>
          <p>
            The eligibility check runs entirely in your browser. Nothing you tap in it
            leaves your device unless you fill in the contact form at the end and check the
            consent box. There are no advertising trackers, no data brokers, and no
            third-party marketing pixels on this site.
          </p>

          <h2>How it is used</h2>
          <p>
            To reply to you, and for nothing else. Submissions are stored in a private
            database and sent to {advisor.name} by email and text message so he can respond
            quickly. I do not sell, rent or trade your information, and I do not pass it to
            other agents or to lead-generation companies.
          </p>

          <h2>Text messages</h2>
          <p>
            If you ask to be contacted by text, message and data rates may apply. Reply
            STOP at any time and I will stop texting you.
          </p>

          <h2>Removing your information</h2>
          <p>
            Email <a href={`mailto:${advisor.email}`}>{advisor.email}</a> or call{' '}
            {advisor.phone} and ask me to delete your information. I will do it and confirm
            when it is done.
          </p>

          <h2>Questions</h2>
          <p>
            Ask me directly at <a href={`mailto:${advisor.email}`}>{advisor.email}</a>. For
            questions about Medicare itself rather than this site, {compliance.medicarePhone}{' '}
            and medicare.gov are always available to you, 24 hours a day.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
