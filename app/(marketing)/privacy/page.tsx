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
            To reply to you, and to keep an accurate record of that conversation. Nothing
            else. I do not sell, rent or trade your information, and I do not pass it to
            other agents, other agencies, or lead-generation companies.
          </p>

          <h2>Where your request goes</h2>
          <p>
            When you submit a form, two things happen. Your request is stored in a private
            database, and it is routed into the secure agency workflow {advisor.firstName}{' '}
            uses to run his practice — the same system that tracks who has been answered,
            what was discussed, and what happens next. That is how a request gets followed
            up instead of getting lost in an inbox.
          </p>
          <p>
            That workflow is {advisor.firstName}&rsquo;s own system. It is not a shared
            marketplace, it is not a lead exchange, and no other agent or agency has access
            to it. Routing your request into it does not make it available to anyone else.
          </p>
          <p>
            A small number of service providers handle your information on my behalf,
            strictly to make this work: the database host that stores submissions, and the
            email and text-message providers that deliver replies. They process it under
            contract and are not permitted to use it for their own purposes.
          </p>

          <h2>Text messages</h2>
          <p>
            <strong>
              I will not text you unless you specifically tick the box giving permission
              for text messages.
            </strong>{' '}
            That is a separate, optional checkbox. Giving me your phone number is not
            permission to text you, and choosing &ldquo;text me back&rdquo; as your
            preferred way to be reached is not permission for automated messages either.
          </p>
          <p>
            If you do tick it: messages come from {advisor.name} at {site.name}, some may
            be automated, message frequency varies, and message and data rates may apply.
            Reply <strong>STOP</strong> at any time to opt out, or <strong>HELP</strong>{' '}
            for help. An opt-out is permanent until you text START — submitting the form
            again does not undo it.
          </p>
          <p>
            Permission to receive marketing or educational emails is a third, separate
            checkbox. You can give me permission to reply to you without agreeing to either
            of the others.
          </p>

          <h2>Requests submitted before July 2026</h2>
          <p>
            If you contacted me before this notice was updated, your information is still
            handled under the terms you originally agreed to. I have not applied the newer
            permissions to older submissions, and I do not send automated text messages or
            marketing email to anyone who was not specifically asked.
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
