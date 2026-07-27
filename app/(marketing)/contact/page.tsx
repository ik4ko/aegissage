import type { Metadata } from 'next';
import { ContactForm } from '@/components/forms/contact-form';
import { ContactActions } from '@/components/marketing/contact-actions';
import { TrustBar } from '@/components/marketing/trust-bar';
import { SocialLinks } from '@/components/marketing/social-links';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo';
import { advisor, site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Call, text, or email ${advisor.name} for plain-English Medicare guidance. No fee and no obligation to enroll.`,
  alternates: { canonical: '/contact' },
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
            heading={`Reach ${advisor.name.split(' ')[0]}`}
            intro="Include your ZIP code, the doctors you want to keep, and the question you are carrying."
          />
        </div>
      </section>
    </>
  );
}
