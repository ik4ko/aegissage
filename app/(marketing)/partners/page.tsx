import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { breadcrumbJsonLd } from '@/lib/seo';
import { withShareCard } from '@/lib/page-metadata';
import { advisor, contactHrefs, site } from '@/lib/site';

/**
 * /partners: for organizations whose members, patients, residents, clients
 * or employees ask them Medicare questions.
 *
 * ── Rules for this page (see docs/partners/compliance-guardrails.md) ──────
 *  - Plan-neutral. No carrier names, plan names, premiums or benefits.
 *  - No referral fees, gifts or anything of value in either direction.
 *  - Partners never send names, lists or records. The person contacts
 *    Erekle themselves, by phone or the form.
 *  - No form on this page collects anything about a third party.
 *  - Pending Pinnacle review before the partner kit is used.
 */

const TITLE = 'For organizations: a Medicare resource for the people you serve';
const DESCRIPTION = `How medical groups, senior living communities, town senior programs, elder law firms and employers can point people to ${advisor.name} of ${site.searchName} for plan-neutral Medicare education. No fees, no lists.`;

export const metadata: Metadata = withShareCard(
  {
    title: 'For partner organizations',
    description: DESCRIPTION.slice(0, 158),
    alternates: { canonical: '/partners' },
    openGraph: { type: 'website', url: `${site.url}/partners`, title: TITLE, description: DESCRIPTION },
  },
  { path: '/partners', kicker: 'For organizations' },
);

const WHO = [
  {
    heading: 'Medical groups and primary care practices',
    body: 'Patients ask front-desk staff and care coordinators which coverage to pick. Staff should not be answering that. You can give patients a neutral place to take the question.',
  },
  {
    heading: 'Senior living communities',
    body: 'A move often changes which coverage is available, and it opens a window to change. Residents and their families usually find that out late.',
  },
  {
    heading: 'Town senior programs and libraries',
    body: 'I give educational talks: how the parts of Medicare fit together, what the enrollment periods are, how to read a plan letter. No plan is named and nobody is enrolled.',
  },
  {
    heading: 'Elder law and estate planning firms',
    body: 'Medicare questions come up beside the legal ones: a parent turning 65, a move to be near family, coverage ending. I handle the Medicare part and send the client back to you.',
  },
  {
    heading: 'Employers and HR teams',
    body: 'Employees working past 65 and people about to retire need to know how Medicare fits with the group plan and when to sign up for Part B. I explain the timing; I do not advise on your group plan.',
  },
] as const;

const HOW = [
  'You tell the person that a licensed broker is available for Medicare questions and give them my phone number or this website. A printed card or a line in your newsletter is enough.',
  'The person decides whether to contact me. They call, or they use the contact form themselves.',
  'You never send me a name, a list, a chart or a phone number. I do not ask for one and I will not accept one.',
  'Before any conversation about specific plans, the person agrees in writing to what we will discuss. That is a Medicare rule, and it protects them.',
  'I tell them what I find, including when staying where they are is the right answer.',
] as const;

const NOT = [
  'No referral fees, gifts, meals or anything else of value, to you or from you.',
  'No patient, resident, client or employee information shared with me.',
  'No steering toward a particular insurance company. I do not name companies in talks or handouts.',
  'No sales at educational talks: no plan presentations, no enrollment forms, no sign-up sheets that collect contact details.',
  'No use of your name or logo to suggest you endorse me, unless you ask for it in writing.',
] as const;

export default function PartnersPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: site.url },
          { name: 'For partner organizations', url: `${site.url}/partners` },
        ])}
      />

      <section className="border-b border-line bg-paper">
        <div className="container max-w-3xl py-14 sm:py-20">
          <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
            {TITLE}
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-ink-soft">
            I am {advisor.name}, a licensed insurance broker in {advisor.basedIn}. I work only on
            Medicare, in English, Georgian and Russian. If people ask your staff Medicare
            questions, you can point them to me. It costs you nothing and it costs them nothing.
          </p>
        </div>
      </section>

      <section className="container max-w-3xl py-12 sm:py-16">
        <div className="article-body">
          <h2>Who this is for</h2>
        </div>
        <ul className="mt-6 space-y-5">
          {WHO.map((item) => (
            <li key={item.heading} className="rounded-2xl border border-line bg-paper p-6">
              <h3 className="font-display text-2xl font-bold text-ink">{item.heading}</h3>
              <p className="mt-2 text-lg text-ink-soft">{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="article-body mt-12 max-w-[68ch]">
          <h2>How pointing someone to me works</h2>
          <ol>
            {HOW.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <h2>What I do not do</h2>
          <ul>
            {NOT.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h2>What an educational talk covers</h2>
          <p>
            Forty-five minutes, then questions. The parts of Medicare and what each pays for. The
            enrollment periods and the penalties for missing them. How Original Medicare with a
            supplement differs from Medicare Advantage, in general terms. Where to check
            everything yourself on Medicare.gov. I send the outline ahead of time so you can
            approve it.
          </p>

          <h2>Talk to me about your organization</h2>
          <p>
            Call or write and tell me who you serve. I will send a one-page summary of what I do
            and do not handle, and my license details.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={contactHrefs.tel}>Call {advisor.phone}</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Send a message</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
