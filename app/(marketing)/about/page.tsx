import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, Languages, MapPin, Phone } from 'lucide-react';
import { AdvisorAvatar } from '@/components/marketing/trust-bar';
import { ContactActions } from '@/components/marketing/contact-actions';
import { CtaBand } from '@/components/marketing/cta-band';
import { PullQuote } from '@/components/marketing/prose';
import { Reveal } from '@/components/motion/reveal';
import { ContactForm } from '@/components/forms/contact-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { advisor, site } from '@/lib/site';
import { licensedStates } from '@/lib/states';
import { locationLandings } from '@/lib/locations';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';

// ~150 chars: Google truncates a search-result description around there.
const LANGUAGES = advisor.languages.map((language) => language.name);
const LANGUAGE_LIST = `${LANGUAGES.slice(0, -1).join(', ')} and ${LANGUAGES[LANGUAGES.length - 1]}`;
const DESCRIPTION = `${advisor.name} of ${site.searchName}: licensed independent insurance broker in ${advisor.basedIn}. Medicare help in ${LANGUAGE_LIST}.`;
const OG_IMAGE =
  `${site.url}/api/og?title=${encodeURIComponent(`Meet ${advisor.name}`)}` +
  `&kicker=${encodeURIComponent('The person behind the phone number')}` +
  `&subtitle=${encodeURIComponent(`${advisor.credential} · ${advisor.basedIn}`)}`;

/*
  Common questions, shown on the page and used for the FAQPage schema from
  the same array so the two cannot drift. Every answer is a fact Erekle gave
  (paid by commission, not every plan, how he checks doctors and drugs,
  in person within about an hour of Edgewater: Nov 26 2026). No plan or
  carrier names, no counts other than the disclaimer's own.
*/
const FAQ: { question: string; answer: string }[] = [
  {
    question: 'How is your help paid for?',
    answer:
      'You do not pay me anything. If you enroll in a plan through me, the insurance company pays me a commission. Your premium is the same whether you enroll through me, through a call center or on your own.',
  },
  {
    question: 'Do I have to enroll in anything?',
    answer:
      'No. You can ask questions, compare options and decide to keep what you have. That is a perfectly good outcome, and it costs you nothing.',
  },
  {
    question: 'Do you offer every Medicare plan?',
    answer:
      'No. I work with some of the organizations that offer plans, not all of them, and the disclosure at the bottom of every page says how many. If a plan I do not offer looks like a better fit, I will tell you. You can always see every option at Medicare.gov or by calling 1-800-MEDICARE.',
  },
  {
    question: 'How do you check my doctors and prescriptions?',
    answer:
      'Before we look at any plan, we write down every doctor you see and every medication you take, with the dose. I check each doctor against each plan’s network and each medication against each plan’s drug list. Then we look at the plans side by side and talk through the trade-offs.',
  },
  {
    question: 'What areas do you serve?',
    answer: `I am licensed in ${advisor.licensedStates.length} states and can help anywhere I am licensed by phone or video. Most of the people I work with live in Bergen and Hudson counties in New Jersey, New York City and Philadelphia.`,
  },
  {
    question: 'Can we meet in person?',
    answer:
      'Yes, within about an hour of Edgewater, which includes Bergen and Hudson counties and New York City. I can come to your home, a library or wherever is easiest, and a family member is welcome. Farther than that, including Philadelphia, we talk by phone or video call. Before we discuss specific plans, Medicare requires me to ask you to agree to a short Scope of Appointment form.',
  },
  {
    question: 'Which languages do you speak?',
    answer:
      'English, Georgian and Russian. Georgian is my native language. If your children help you with Medicare, we can mix languages so everyone follows.',
  },
];

export const metadata: Metadata = {
  title: { absolute: `${advisor.name} | ${site.searchName}, ${advisor.basedInTown} NJ` },
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'profile',
    title: `${advisor.name} | ${site.searchName}`,
    description: `Independent Medicare guidance from ${advisor.name} in ${site.serviceArea}.`,
    url: `${site.url}/about`,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `About ${advisor.name}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${advisor.name} | ${site.searchName}`,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'About', url: `${site.url}/about` },
        ])}
      />
      {/*
        ProfilePage ties this URL to the Person node declared sitewide in
        lib/seo.ts (same @id), so "the About page" and "the licensed producer"
        resolve to one entity instead of two.
      */}
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          '@id': `${site.url}/about#profile`,
          url: `${site.url}/about`,
          name: `About ${advisor.name}`,
          inLanguage: 'en-US',
          mainEntity: { '@id': `${site.url}#advisor` },
          about: { '@id': `${site.url}#advisor` },
        }}
      />

      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-paper">
        <div className="container grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
          {/* Not animated: this is the LCP block. See the note in hero.tsx. */}
          <div>
            <Badge tone="ember">The person behind the phone number</Badge>

            <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              <span className="mb-3 block font-sans text-lg font-semibold tracking-normal text-ink-soft sm:text-xl">
                {advisor.name} · {site.searchName}
              </span>
              Hi — I am {advisor.firstName}.
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink-soft">
              I am a licensed independent insurance broker based in {advisor.basedIn}{' '}
              ({advisor.basedInCounty}). I work mostly with people in{' '}
              {site.serviceArea}, in {LANGUAGE_LIST}, and I am licensed in{' '}
              {licensedStates.length} states. If you landed here from a video, this is the
              page where you decide whether I am worth your time. Fair enough — here is the
              honest version.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-base text-ink-soft">
              <span className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-sage" aria-hidden="true" />
                Licensed in {licensedStates.length} states
              </span>
              <span className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-sage" aria-hidden="true" />
                Independent Medicare guidance
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sage" aria-hidden="true" />
                {advisor.basedIn}
              </span>
              <span className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-sage" aria-hidden="true" />
                <Link
                  href="/medicare-help-georgian-russian"
                  className="inline-flex min-h-touch items-center underline decoration-line underline-offset-4 hover:decoration-navy"
                >
                  {LANGUAGE_LIST}
                </Link>
              </span>
              {advisor.npn ? (
                <span className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-sage" aria-hidden="true" />
                  National Producer Number (NPN) {advisor.npn}
                </span>
              ) : null}
            </div>

            <ContactActions where="about-hero" className="mt-9" size="xl" />
          </div>

          <Reveal direction="right" className="lg:sticky lg:top-28">
            <div className="rounded-3xl border border-line bg-cream p-7 text-center shadow-card">
              <div className="flex justify-center">
                <AdvisorAvatar size={148} priority />
              </div>
              <p className="mt-5 font-display text-2xl font-bold text-ink">{advisor.name}</p>
              <p className="mt-1 text-base text-ink-faint">{advisor.credential}</p>
              {advisor.npn ? (
                <p className="mt-1 text-base text-ink-faint">NPN {advisor.npn}</p>
              ) : null}
              <a
                href={`tel:+${advisor.phoneRaw.replace(/\D/g, '')}`}
                className="mt-5 flex min-h-touch items-center justify-center gap-2 rounded-xl bg-navy px-5 font-semibold text-white hover:bg-navy-deep"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                {advisor.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Story ─────────────────────────────────────────────────────── */}
      <section id="contact" className="container py-14 sm:py-20">
        <Reveal className="mx-auto max-w-[68ch] article-body">
          {/*
            Erekle's own account, given by him directly. Every fact below came
            from him: the country of origin, the 2000 arrival, Edgewater, the
            agency job alongside independent work for family, and that this is
            his second year. The paragraph about his mother is his own account
            (Nov 26 2026): first time on Medicare, her doctors and where she
            lives, her medications, plans compared side by side, the one that
            fit chosen, going into her third year on it and happy with it.
            Do not embellish it and do not add detail he has not given.

            "Georgia" is stated as the country every time it appears. GA is one
            of the 26 licensed states, so an unqualified "I am from Georgia"
            reads as the state to exactly the audience this page is for.
          */}
          <h2>How I ended up doing this</h2>
          <p>
            I am from Georgia — the small country on the Black Sea, not the state. I came
            to the United States in 2000 and have been in the Edgewater and New York City
            area ever since. My full name is Erekle Niniashvili. The people who have known
            me longest call me Ika.
          </p>
          <p>
            I got into this working at a Medicare agency, which is where I learned the
            mechanics of it. At the same time, on my own, I was helping my own family and
            people close to me sort out their coverage. That second part is the part that
            taught me the most. When it is someone you love, you do not skim the summary —
            you sit down and go through every plan available to them until you actually
            know which one fits.
          </p>
          <p>
            The clearest example is my mother. When she was new to Medicare, we went through
            it together, one step at a time. First her doctors and where she lives, then
            every medication she takes. Then we put the plans available to her side by side
            and picked the one that fit what she actually needed. She is going into her
            third year on that plan, and she has been happy with it.
          </p>
          <p>
            That is the same process I use for you. It is the only one I trust, because it
            is the one I built for people I could not afford to get wrong.
          </p>

          <PullQuote attribution={`${advisor.name}, ${advisor.credential}`}>
            I go through your options the same way I went through them for my own family.
          </PullQuote>

          <p>
            Being straight with you: this is my second year in the Medicare industry. I
            would rather you hear that from me than wonder. What I can tell you is that I
            do this one thing and nothing else, I take the time it takes, and I will say
            &ldquo;I do not know, let me find out&rdquo; before I will guess at something
            that affects your coverage.
          </p>

          <h2 id="credentials" className="scroll-mt-28">
            Credentials you can check
          </h2>
          <ul>
            <li>
              <strong>License.</strong> Licensed insurance broker. My resident license is in
              New Jersey.
            </li>
            <li>
              <strong>National Producer Number (NPN).</strong> {advisor.npn}
            </li>
            <li>
              <strong>Licensed in {advisor.licensedStates.length} states.</strong>{' '}
              {advisor.licensedStates.join(', ')}
            </li>
            <li>
              <strong>Languages.</strong> {LANGUAGE_LIST}
            </li>
            <li>
              <strong>Time in Medicare.</strong> I have worked in Medicare for{' '}
              {advisor.medicareExperience}.
            </li>
          </ul>
          <p>
            You do not have to take my word for the license. Look it up by my name or NPN:
          </p>
          <ul>
            {advisor.licenseLookup.map((lookup) => (
              <li key={lookup.href}>
                <a
                  href={lookup.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="link-row"
                >
                  {lookup.label}
                </a>
              </li>
            ))}
          </ul>
          <p>
            See also <Link href="/how-we-are-paid">how I am paid</Link> and the{' '}
            <Link href="/editorial-policy">editorial policy</Link> for this site.
          </p>

          <h2>Who I work with</h2>
          <p>
            Medicare, and Medicaid for people who also have Medicare. If you are 65 or
            older, or you already have Medicare Parts A and B at any age, you are who I help. That is all I do —
            I am not selling you another kind of insurance alongside it.
          </p>

          <h2>What &ldquo;independent&rdquo; actually means</h2>
          <p>
            A lot of people call themselves independent. Here is the version that matters
            to you: I am not signed to a single carrier and no insurance company sets
            quotas for me. I am contracted with a number of the major organizations, so
            when we go through your options I have no reason to push you toward one company
            over another. What I recommend comes out of what I find for you, not out of who
            I work for.
          </p>
          <p>
            I do get paid — by the insurance company, if you enroll in something. That is
            how nearly every Medicare agent in the country works, and you should know it.
            What it does not do is change your price: the premium is the same whether you
            enroll through me, through a call center, or by yourself. And my help costs you
            nothing either way.
          </p>
          <p>
            What I cannot do is offer you every plan that exists in your county. Nobody can
            — no agent is contracted with everything. That is precisely why the disclosure
            at the bottom of every page on this site exists, and why I will always tell you
            when the right move is to look at something I do not carry.
          </p>

          <h2>Where to read before you call</h2>
          <p>
            Most questions have a plain answer already written down. The{' '}
            <Link href="/answers">Medicare answers</Link> take one question per page, the{' '}
            <Link href="/medicare-glossary">glossary</Link> explains 40 terms in two or three
            sentences each, and the{' '}
            <Link href="/medicare-enrollment-calendar">enrollment calendar</Link> lists every
            window and when it opens. For the short version, the{' '}
            <Link href="/medicare-questions">30 Medicare questions</Link> page answers each
            one in a few sentences. Each one names the official source it was checked
            against.
          </p>

          <h2>How I actually work</h2>
          <ul>
            <li>
              <strong>By phone, by video, or in person.</strong> Within about an hour of
              Edgewater, which includes Bergen and Hudson counties and New York City, I can
              come to you. If you would rather do this at your own kitchen table than on the
              phone, say so. Farther than that, including Philadelphia, we talk by phone or
              video call.
            </li>
            <li>
              <strong>Your doctors and your prescriptions come first.</strong> Before
              anything else, we write down who you see and what you take. Everything else
              is downstream of that list.
            </li>
            <li>
              <strong>I go through the plans available to you, properly.</strong> Not the
              first two that look reasonable. I compare what is actually offered in your
              county against that list of yours, then tell you which one I think fits best
              and exactly why I think so.
            </li>
            <li>
              <strong>Ask as many times as you want.</strong> Call, text or email as often
              as you like, and there is no charge for any of it. If you only want to
              understand your options and compare a few plans with no intention of changing
              anything, that is a completely fine reason to contact me.
            </li>
            <li>
              <strong>I will tell you to do nothing when that is right.</strong> Sometimes
              the answer is &ldquo;your current coverage is fine, call me in October.&rdquo;
              That answer pays me nothing, and it is still the right answer.
            </li>
            <li>
              <strong>I am still here next year.</strong> The value of an independent agent
              is not the enrollment. It is having someone to call when a drug gets dropped
              from a formulary in November.
            </li>
          </ul>

        </Reveal>
      </section>

      {/* ── Common questions ──────────────────────────────────────────── */}
      <section className="border-t border-line bg-cream" aria-labelledby="faq">
        <div className="container py-14 sm:py-16">
          <Reveal className="mx-auto max-w-[68ch] article-body">
            <h2 id="faq" className="scroll-mt-28">
              Common questions
            </h2>
            {FAQ.map((item) => (
              <div key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Licensing ─────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-paper">
        <div className="container py-14 sm:py-16">
          <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
            Service area and licensing
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">
            I serve people in {site.serviceArea}, and hold active health licenses in{' '}
            {licensedStates.length} states.
            {advisor.npn ? (
              <>
                {' '}
                My National Producer Number is {advisor.npn}; you can look it up with your
                state insurance department to confirm my license.
              </>
            ) : null}{' '}
            Local pages:{' '}
            {locationLandings.map((location, index) => (
              <span key={location.slug}>
                {index > 0 ? ', ' : ''}
                <Link
                  href={`/medicare-${location.slug}`}
                  className="font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
                >
                  {location.name}
                </Link>
              </span>
            ))}
            .
          </p>
          </Reveal>

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {licensedStates.map((state) => (
              <li key={state.code}>
                <Link
                  href={`/plans/${state.slug}`}
                  className="flex min-h-touch items-center rounded-xl border-2 border-line bg-cream px-4 text-base font-semibold text-ink-soft transition-colors hover:border-navy/50 hover:text-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy"
                >
                  {state.name}
                </Link>
              </li>
            ))}
          </ul>

          <Button asChild variant="outline" size="lg" className="mt-9">
            <Link href="/medicare-basics">See what I have written →</Link>
          </Button>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────────── */}
      <section className="container py-14 sm:py-20">
        <Reveal className="mx-auto max-w-2xl">
          <ContactForm
            source="about"
            heading="Ask me something"
            intro="No obligation, no pitch. If I am not the right person to help, I will tell you that too."
          />
        </Reveal>
      </section>

      <CtaBand
        where="about-cta"
        heading="The fastest way to know if I am legit is to call me."
        body="Ten minutes on the phone will tell you more than any page I could write. You will not get a script."
      />
    </>
  );
}
