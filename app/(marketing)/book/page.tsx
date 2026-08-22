import type { Metadata } from 'next';
import { CalendarClock, Clock, Phone } from 'lucide-react';
import { BookingForm } from '@/components/forms/booking-form';
import { Reveal } from '@/components/motion/reveal';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo';
import { advisor, contactHrefs, site } from '@/lib/site';

/**
 * The booking interstitial.
 *
 * Every "Book a time" CTA on the site routes here first. It exists so a
 * booking produces a contacts row, an alert and attribution — see the note in
 * components/forms/booking-form.tsx for why none of that can be recovered
 * after the handoff to Google.
 *
 * ── noindex ──────────────────────────────────────────────────────────────
 * This page has no standalone value in search: it is a step in a flow, not an
 * answer to a query. Someone arriving here cold from Google would land on a
 * form with no context about what they are booking. The pages that should
 * rank are the ones that explain something and then link here.
 */
export const metadata: Metadata = {
  title: 'Book a time',
  description:
    'Book a 60-minute Medicare conversation with Erekle Niniashvili. No cost, no obligation, and no enrollment happens on the call.',
  alternates: { canonical: '/book' },
  robots: { index: false, follow: true },
};

export default function BookPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: site.url },
          { name: 'Book a time', url: `${site.url}/book` },
        ])}
      />

      <section className="container py-14 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Book a time
          </p>

          <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
            Two details, then pick your time.
          </h1>

          {/*
            Says plainly why the fields exist. A form standing between someone
            and a calendar reads as a gate unless it explains itself, and the
            honest reason is mundane: he wants to know who he is meeting and
            how to reach them if something changes.
          */}
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            The calendar is on the next screen. I ask for these first so I know who I am
            meeting and how to reach you if something moves — not to qualify you, and not to
            put you on a list.
          </p>

          <div className="mt-9 rounded-3xl border border-line bg-paper p-7 shadow-lift sm:p-9">
            <BookingForm />
          </div>

          <Reveal className="mt-10 rounded-2xl border border-line bg-cream p-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              What the call actually is
            </h2>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-ink-soft">
              <li className="flex gap-3">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                <span>
                  About an hour, by phone or video — whichever you prefer. Bring your doctors,
                  your prescriptions and your ZIP code if you have them handy. If you do not,
                  we can still talk.
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                <span>
                  You reach {advisor.firstName} directly, not a call center. Nothing is
                  enrolled on the call, and there is no fee to you for the conversation.
                </span>
              </li>
            </ul>

            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              Would rather not schedule? Call or text{' '}
              <a
                href={contactHrefs.tel}
                className="font-semibold text-navy underline decoration-line underline-offset-4 hover:decoration-navy"
              >
                {advisor.phone}
              </a>
              . Calling this number will direct you to a licensed insurance agent.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
