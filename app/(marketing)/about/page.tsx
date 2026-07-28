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

const DESCRIPTION = `${advisor.name} is an independent Medicare advisor based in ${advisor.basedIn}. Medicare and Medicaid only, for people 65+ and anyone with Parts A and B. Here is who he is and how he works.`;
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
              I am an independent Medicare advisor based in {advisor.basedIn}, working
              mostly with people in {site.serviceArea} and licensed in{' '}
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
            Eric's own account, given by him directly. Every fact below came
            from him: the country of origin, the 2000 arrival, Edgewater, the
            agency job alongside independent work for family, and that this is
            his second year. Do not embellish it and do not add detail he has
            not given.

            "Georgia" is stated as the country every time it appears. GA is one
            of the 26 licensed states, so an unqualified "I am from Georgia"
            reads as the state to exactly the audience this page is for.
          */}
          <h2>How I ended up doing this</h2>
          <p>
            I am from Georgia — the small country on the Black Sea, not the state. I came
            to the United States in 2000 and have been in the Edgewater and New York City
            area ever since. My full name is Erekle Niniashvili. Most people here call
            me Eric, and the people who have known me longest call me Ika.
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

          <h2>Who I work with</h2>
          <p>
            Medicare and Medicaid, and only that. If you are 65 or older, or you already
            have Medicare Parts A and B at any age, you are who I help. That is all I do —
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

          <h2>How I actually work</h2>
          <ul>
            <li>
              <strong>Over the phone, or I come to you.</strong> Whichever you prefer. If
              you would rather do this at your own kitchen table than on the phone, say so
              and I will come out.
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
