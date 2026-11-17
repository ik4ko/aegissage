import type { Metadata } from 'next';
import { ContactForm } from '@/components/forms/contact-form';
import { ContactActions } from '@/components/marketing/contact-actions';
import { TrustBar } from '@/components/marketing/trust-bar';
import { SocialLinks } from '@/components/marketing/social-links';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo';
import { advisor, site } from '@/lib/site';

const DESCRIPTION = `Call, text, or email ${advisor.name} for plain-English Medicare guidance. No fee and no obligation to enroll.`;
const OG_IMAGE =
  `${site.url}/api/og?title=${encodeURIComponent('Ask a Medicare question')}` +
  `&kicker=${encodeURIComponent('No pressure')}` +
  `&subtitle=${encodeURIComponent(`Call or text ${advisor.phone}. You get ${advisor.firstName}, not a queue.`)}`;

export const metadata: Metadata = {
  title: 'Contact',
  description: DESCRIPTION,
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    title: `Contact ${advisor.firstName} · ${site.name}`,
    description: DESCRIPTION,
    url: `${site.url}/contact`,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `Contact ${advisor.name}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Contact ${advisor.firstName} · ${site.name}`,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Contact', url: `${site.url}/contact` },
        ])}
      />
      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
              No pressure
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              Ask a Medicare question.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
              Tell me what you are trying to figure out. I will answer plainly, and if I am
              not the right person to help, I will say so.
            </p>
            <ContactActions where="contact-hero" className="mt-8" size="lg" />
            <SocialLinks className="mt-5" />
          </div>
          <TrustBar className="mt-9 max-w-3xl" />
        </div>
      </section>
      <section className="container py-14 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <ContactForm
            source="contact"
            heading={`Reach ${advisor.firstName}`}
            intro="Include your ZIP code, the doctors you want to keep, and the question you are carrying."
          />
        </div>
      </section>

      {/*
        What happens after you get in touch. Added Nov 17 2026 (SEO audit M4):
        the page had 96 words, and "how do I reach a Medicare broker, and what
        happens then" is a question people ask out loud.
      */}
      <section className="border-t border-line bg-paper">
        <div className="container py-14 sm:py-16">
          <div className="article-body mx-auto max-w-[68ch]">
            <h2>What happens when you get in touch</h2>
            <p>
              You reach me, {advisor.name}, not a call center. If I miss your call, I call
              you back. There is no fee to talk, and talking does not sign you up for anything.
            </p>
            <h3>How we can talk</h3>
            <p>
              By phone at {advisor.phone}, by text, or by email at {advisor.email}. I meet
              people in person in Bergen and Hudson counties in New Jersey. For New York City
              and Philadelphia, we talk by phone or video call. I speak English, Georgian and
              Russian, and a family member is always welcome to join.
            </p>
            <h3>What to have ready</h3>
            <p>
              Your ZIP code, a list of the doctors you want to keep, and your medicines with
              their doses. If you got a letter from Medicare or your plan, keep it nearby. You
              will never need to give me your Social Security number or bank details to get
              an answer.
            </p>
            <h3>Before we talk about specific plans</h3>
            <p>
              Medicare rules require me to ask your permission before we discuss specific
              plans. It is called a Scope of Appointment, and it only records which kinds of
              coverage you want to hear about. You can say no, and you can stop at any time.
            </p>
            <h3>Free help that is not me</h3>
            <p>
              Your state&rsquo;s SHIP office gives free, neutral Medicare counseling, and
              1-800-MEDICARE (1-800-633-4227) answers questions every day. I am happy to point
              you to either one.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
