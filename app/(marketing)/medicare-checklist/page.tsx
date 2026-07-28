import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardList, Phone, Pill, Stethoscope } from 'lucide-react';
import { ContactActions } from '@/components/marketing/contact-actions';
import { CtaBand } from '@/components/marketing/cta-band';
import { PrintButton } from '@/components/marketing/print-button';
import { ResourceCard } from '@/components/marketing/resource-card';
import { TrustBar } from '@/components/marketing/trust-bar';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { getApprovedResources } from '@/lib/resources';
import { advisor, site } from '@/lib/site';

/**
 * Free Medicare preparation checklist.
 *
 * ── Why nothing is collected here ─────────────────────────────────────────
 * This is a worksheet you fill in ON PAPER. There is no form, no email gate,
 * no download wall, and no field that sends anything anywhere. That is a
 * deliberate design decision, not an omission.
 *
 * The worksheet asks a visitor to write down prescriptions and doctors —
 * exactly the categories this site refuses to collect. Putting that behind an
 * email capture would mean building an intake for health information in order
 * to hand someone a piece of paper. Printing it locally means the sensitive
 * part never leaves their kitchen table, and they bring it to the call.
 *
 * If email capture is ever added here, consent to receive a reply and consent
 * to marketing must be separate, unticked checkboxes. Do not bundle them.
 *
 * ── Compliance boundary ───────────────────────────────────────────────────
 * General preparation guidance only. No plan names, no carriers, no premiums,
 * no benefit claims, no eligibility determinations, no "best for you"
 * language. Every item is either a federal structural fact or a question the
 * reader should ask — never an answer this site supplies.
 */

const TITLE = 'The free Medicare appointment checklist';
const DESCRIPTION =
  'A printable worksheet for getting ready to talk about Medicare: your doctors, your prescriptions, your ZIP code, your enrollment window, and the questions worth asking. No email required.';

const OG_IMAGE =
  `${site.url}/api/og?title=${encodeURIComponent('The free Medicare appointment checklist')}` +
  `&kicker=${encodeURIComponent('Print it and bring it')}` +
  `&subtitle=${encodeURIComponent('Doctors, prescriptions, ZIP code, deadlines, and the questions to ask.')}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/medicare-checklist' },
  openGraph: {
    type: 'article',
    title: `${TITLE} · ${site.name}`,
    description: DESCRIPTION,
    url: `${site.url}/medicare-checklist`,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} · ${site.name}`,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

/** Worksheet blocks. Blank lines are for handwriting, so counts matter. */
const WORKSHEET = [
  {
    icon: Stethoscope,
    heading: 'Doctors and facilities you want to keep',
    hint: 'Full name of the practice, the town it is in, and what they treat you for. Include specialists you see once a year — those are the ones people forget.',
    lines: 6,
  },
  {
    icon: Pill,
    heading: 'Every prescription you take',
    hint: 'Exact name, dose, and how often. The dose matters: the same drug at two strengths can sit on two different tiers.',
    lines: 8,
  },
  {
    icon: ClipboardList,
    heading: 'Your basics',
    hint: 'ZIP code and county, whether you have Part A and Part B yet, and any coverage you have now (employer, retiree, VA, Medicaid, COBRA).',
    lines: 5,
  },
] as const;

const QUESTIONS = [
  'Which enrollment window am I actually in right now, and when does it close?',
  'If I do nothing this year, what happens automatically?',
  'Are all of my doctors reachable under what I am considering — checked by name, not by guess?',
  'Is every one of my prescriptions covered, and at what tier?',
  'What happens if I travel, or spend part of the year in another state?',
  'What would it take to change my mind later, and is that door open or closed?',
  'What does this cost me beyond the monthly premium?',
  'What are you not able to offer me, and where would I go to see those options?',
];

const FAQ = [
  {
    question: 'Do I have to give my email to get the Medicare checklist?',
    answer:
      'No. The checklist is on the page and printable directly from your browser. There is no email gate, no download form, and nothing to sign up for.',
  },
  {
    question: 'What should I bring to a Medicare appointment?',
    answer:
      'Your ZIP code and county, a list of every doctor and facility you want to keep, and every prescription you take with its exact dose. Also bring details of any coverage you have now, such as employer, retiree, VA or Medicaid coverage.',
  },
  {
    question: 'Why does the ZIP code matter so much for Medicare?',
    answer:
      'Medicare Advantage and Part D plans are approved by CMS to operate in specific service areas, and those service areas are drawn from counties. Which plans you can choose from is decided at the county level, so your address determines your options.',
  },
  {
    question: 'Should I write my prescriptions down before comparing plans?',
    answer:
      'Yes, with the exact dose. The same drug at two different strengths can sit on two different formulary tiers, which changes what it costs you. Keep the list on paper — you do not need to send it to anyone to start.',
  },
];

export default function MedicareChecklistPage() {
  const resources = getApprovedResources();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Medicare checklist', url: `${site.url}/medicare-checklist` },
        ])}
      />
      <JsonLd data={faqJsonLd(FAQ)} />

      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-paper print:border-0">
        <div className="container py-14 sm:py-20 print:py-0">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
              Free · No email required
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              Everything worth writing down before you talk to anyone about Medicare.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
              Most Medicare conversations go badly for one reason: nobody wrote anything
              down first. Print this, fill it in at your kitchen table, and you will get a
              better answer from me — or from anyone else you talk to.
            </p>
            <p className="mt-4 rounded-xl border-2 border-sage/40 bg-sage-soft p-4 text-base leading-relaxed text-ink print:hidden">
              <strong>Nothing on this page is collected.</strong> There is no form here.
              Your doctors and prescriptions stay on your paper — bring them to the
              conversation instead of typing them into a website.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 print:hidden">
              <PrintButton resource="medicare-checklist" />
              <Button asChild variant="outline" size="lg">
                <Link href="/tools/eligibility-check">Check your enrollment window</Link>
              </Button>
            </div>
          </div>

          <TrustBar className="mt-9 max-w-3xl print:hidden" />
        </div>
      </section>

      {/* ── Worksheet ─────────────────────────────────────────────────── */}
      <section className="container py-14 sm:py-16 print:py-0">
        <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
          Part one: the worksheet
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          These three lists decide almost every Medicare question. Fill them in before
          anything else.
        </p>

        <div className="mt-9 grid gap-6 lg:grid-cols-3">
          {WORKSHEET.map(({ icon: Icon, heading, hint, lines }) => (
            <section
              key={heading}
              className="break-inside-avoid rounded-2xl border-2 border-line bg-paper p-6"
            >
              <h3 className="flex items-center gap-3 font-display text-xl font-bold text-ink">
                <Icon className="h-6 w-6 shrink-0 text-navy" aria-hidden="true" />
                {heading}
              </h3>
              <p className="mt-2.5 text-base leading-relaxed text-ink-soft">{hint}</p>
              <div className="mt-5 space-y-5" aria-hidden="true">
                {Array.from({ length: lines }).map((_, i) => (
                  <div key={i} className="border-b border-line" />
                ))}
              </div>
              {/* The ruled lines are decoration for print; describe them once
                  for anyone not looking at the page. */}
              <p className="sr-only">
                {lines} blank lines are provided here for writing your answers by hand.
              </p>
            </section>
          ))}
        </div>
      </section>

      {/* ── Questions ─────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-paper print:border-0">
        <div className="container py-14 sm:py-16 print:py-0">
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
            Part two: questions worth asking
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">
            Ask these of me, or of any agent, or of 1-800-MEDICARE. A good answer to
            the last one tells you the most.
          </p>

          <ol className="mt-9 grid gap-4 md:grid-cols-2">
            {QUESTIONS.map((question, index) => (
              <li
                key={question}
                className="flex break-inside-avoid gap-4 rounded-2xl border border-line bg-cream p-5"
              >
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy font-display text-lg font-bold text-white"
                >
                  {index + 1}
                </span>
                <span className="text-base leading-relaxed text-ink">{question}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Where to check independently ──────────────────────────────── */}
      <section className="container py-14 sm:py-16 print:hidden">
        <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
          Part three: check it yourself
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          You should never have to take one agent&rsquo;s word for anything. These are the
          official and independent places to verify what you are told. None of them pays
          me anything, and none of them is selling you a plan.
        </p>

        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.url} resource={resource} where="medicare-checklist" />
          ))}
        </div>
      </section>

      {/* ── Print-only contact block ──────────────────────────────────── */}
      <section className="container hidden py-8 print:block">
        <h2 className="font-display text-2xl font-bold text-ink">
          When you are ready to talk it through
        </h2>
        <p className="mt-2 text-base text-ink-soft">
          {advisor.name}, {advisor.credential} · {advisor.phone} · {advisor.email}
        </p>
        <p className="mt-1 text-base text-ink-soft">{site.domain}</p>
      </section>

      <section className="container py-6 print:hidden">
        <div className="rounded-2xl border-2 border-navy/20 bg-navy-soft p-6 sm:p-8">
          <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-navy-deep">
            <Phone className="h-6 w-6" aria-hidden="true" />
            Filled it in? That is the whole appointment.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink">
            Call or text me with that page in front of you and we can get through it in
            one conversation. No fee, no obligation, and no pressure to enroll in
            anything.
          </p>
          <ContactActions where="checklist-cta" className="mt-6" size="lg" />
        </div>
      </section>

      <CtaBand
        where="checklist-band"
        heading="Bring the list. I will bring the answers."
        body={`Call or text ${advisor.phone}. If I am not the right person to help, I will tell you that too.`}
      />
    </>
  );
}
