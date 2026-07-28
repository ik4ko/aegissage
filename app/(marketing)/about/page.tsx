import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, MapPin, Phone } from 'lucide-react';
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
import { breadcrumbJsonLd } from '@/lib/seo';

const DESCRIPTION = `${advisor.name} provides independent Medicare guidance in ${site.serviceArea}. Here is who he is and how he works.`;
const OG_IMAGE =
  `${site.url}/api/og?title=${encodeURIComponent(`Meet ${advisor.name}`)}` +
  `&kicker=${encodeURIComponent('The person behind the phone number')}` +
  `&subtitle=${encodeURIComponent(`Licensed independent Medicare advisor · ${advisor.basedIn}`)}`;

export const metadata: Metadata = {
  title: `About ${advisor.name}`,
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'profile',
    title: `About ${advisor.name} — ${site.name}`,
    description: `Independent Medicare guidance from ${advisor.name} in ${site.serviceArea}.`,
    url: `${site.url}/about`,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `About ${advisor.name}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About ${advisor.name} — ${site.name}`,
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

      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-paper">
        <div className="container grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
          {/* Not animated: this is the LCP block. See the note in hero.tsx. */}
          <div>
            <Badge tone="ember">The person behind the phone number</Badge>

            <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              Hi — I am {advisor.firstName}.
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink-soft">
              I am an independent Medicare advisor serving {site.serviceArea}. If you
              landed here from a video, this is the page where you decide whether I am
              worth your time. Fair enough. Here is the honest version.
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
            ERIC — PLEASE CONFIRM THIS STORY IS YOURS.
            It reads as a first-person factual account of a real family member
            and it is the emotional centre of the page, so it is left in place
            rather than guessed at. If it was written for you rather than by
            you, replace it with the real reason you started doing this. Do not
            leave an invented personal anecdote on a page carrying your licence.
          */}
          <h2>How I ended up doing this</h2>
          <p>
            My grandmother picked her Medicare coverage off a card that came in the mail.
            It had a big number on it and a smiling couple on a boat. Two years later she
            needed a specialist eighty minutes away, in a hospital that was not in her
            plan&rsquo;s network, and nobody had ever explained to her that the network was
            the thing that mattered.
          </p>
          <p>
            That is not a tragedy. It is a paperwork problem. But it was an expensive,
            frightening paperwork problem for a woman in her seventies, and it happened
            because the only person who talked to her about Medicare was being paid to
            close, not to explain.
          </p>

          <PullQuote attribution={`${advisor.name}, ${advisor.credential}`}>
            I would rather spend forty minutes talking you out of a decision than four
            minutes closing you into one.
          </PullQuote>

          <h2>What &ldquo;independent&rdquo; actually means</h2>
          <p>
            A lot of people call themselves independent. Here is the version that matters
            to you: I am not employed by an insurance company, and no carrier sets quotas
            for me. I am contracted with multiple organizations, which means when we talk
            through your options I have no financial reason to steer you toward one over
            another.
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

          <h2>How I actually work</h2>
          <ul>
            <li>
              <strong>First conversation is a conversation.</strong> No application, no
              screen share, no &ldquo;let me just get a few things from you.&rdquo; You ask,
              I answer.
            </li>
            <li>
              <strong>Your doctors and your prescriptions come first.</strong> Before
              anything else, we write down who you see and what you take. Everything else
              is downstream of that list.
            </li>
            <li>
              <strong>I will tell you to do nothing when that is right.</strong> Sometimes
              the answer is &ldquo;your current coverage is fine, call me in October.&rdquo;
              That answer pays me zero dollars and I give it constantly.
            </li>
            <li>
              <strong>I am still here next year.</strong> The value of an independent agent
              is not the enrollment. It is having someone to call when a drug gets dropped
              from a formulary in November.
            </li>
          </ul>

          {/*
            The invented personality details that used to sit here — coaching
            youth soccer, opinions about diner coffee — were written for Eric,
            not by him. Specific biographical claims about a real person should
            come from that person. Replaced with something true and general.
            Eric: send real details and this becomes a better paragraph.
          */}
          <h2>Where I am</h2>
          <p>
            {advisor.basedIn} is home, and it is where most of my in-person conversations
            happen. The rest are by phone or text, which is how most people prefer it
            anyway — you can ask me something from your kitchen table without booking
            anything or letting anyone into your house.
          </p>
        </Reveal>
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
            {licensedStates.length} states. Local pages:{' '}
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
                  className="flex min-h-touch items-center rounded-xl border-2 border-line bg-cream px-4 text-base font-semibold text-ink-soft transition-colors hover:border-navy/50 hover:text-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
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
