import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays, MapPin, Languages } from 'lucide-react';
import { ContactActions } from '@/components/marketing/contact-actions';
import { WorkshopRsvpForm } from '@/components/forms/workshop-rsvp-form';
import { JsonLd } from '@/components/seo/json-ld';
import { pageMetadata } from '@/lib/page-metadata';
import { PLAN_ENDING_ANSWER_HREF, planEndingPages } from '@/lib/plan-endings';
import { breadcrumbJsonLd, speakableJsonLd, workshopEventJsonLd } from '@/lib/seo';
import { advisor, compliance, site } from '@/lib/site';
import {
  LANGUAGES,
  WORKSHOP_COVERS,
  WORKSHOP_RULES,
  WORKSHOP_TITLE,
  formatTime,
  formatWorkshopDate,
  isoEnd,
  isoStart,
  upcomingWorkshops,
  workshopLabel,
} from '@/lib/workshops';

/**
 * /workshops: "Your Medicare plan is ending" educational sessions, listed
 * from lib/workshops.ts (rules at the top of that file). Re-rendered hourly
 * so a past session drops off without a deploy.
 */

export const revalidate = 3600;

const PATH = '/workshops';
const H1 = 'Free workshops: your Medicare plan is ending. What to do now.';
const DIRECT_ANSWER =
  'If a letter says your Medicare Advantage plan ends in 2027, come to a free one-hour talk. I explain the dates, what happens if you do nothing, how to keep your doctors and when you can buy Medigap without health questions. No plans are sold and no applications are taken.';

export const metadata: Metadata = pageMetadata({
  title: 'Free workshops: Medicare plan ending in 2027',
  description:
    'Free one-hour educational talks for people whose Medicare Advantage plan ends in 2027: the dates, keeping your doctors, Medigap rights. No sales, no applications.',
  path: PATH,
  kicker: 'Workshops',
  shareTitle: 'Your Medicare plan is ending: free workshops',
});

const linkClass =
  'inline-flex min-h-touch items-center font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep';

export default function WorkshopsPage() {
  const sessions = upcomingWorkshops();
  const url = `${site.url}${PATH}`;
  const description = WORKSHOP_COVERS.join('. ') + '.';

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Workshops', url },
        ])}
      />
      <JsonLd data={speakableJsonLd({ url, name: H1, cssSelector: ['[data-direct-answer]'] })} />
      {sessions.map((w) => (
        <JsonLd
          key={w.id}
          data={workshopEventJsonLd({
            url,
            id: w.id,
            name: `${WORKSHOP_TITLE} (${LANGUAGES[w.language].label})`,
            description,
            startDate: isoStart(w),
            endDate: isoEnd(w),
            venue: w.venue,
            town: w.town,
            state: w.state,
            inLanguage: LANGUAGES[w.language].bcp47,
          })}
        />
      ))}

      <section className="border-b border-line bg-paper">
        <div className="container max-w-3xl py-14 sm:py-20">
          <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
            {H1}
          </h1>
          <p data-direct-answer="" className="mt-5 text-xl leading-relaxed text-ink">
            {DIRECT_ANSWER}
          </p>
          <p className="mt-4 text-lg text-ink-soft">
            Sessions run between December 8, 2026 and February 28, 2027, in English, Georgian or
            Russian. Led by {advisor.name}, a licensed insurance broker based in {advisor.basedIn}.
          </p>
        </div>
      </section>

      <section className="container max-w-3xl py-12 sm:py-16">
        <h2 className="font-display text-3xl font-bold tracking-[-0.025em] text-ink">Upcoming sessions</h2>
        {sessions.length > 0 ? (
          <ul className="mt-6 space-y-5">
            {sessions.map((w) => (
              <li key={w.id} id={w.id} className="scroll-mt-28 rounded-2xl border border-line bg-paper p-6">
                <h3 className="font-display text-2xl font-bold text-ink">{w.venue}</h3>
                <p className="mt-3 flex items-start gap-2 text-lg text-ink">
                  <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                  {formatWorkshopDate(w.date)}, {formatTime(w.start)} to {formatTime(w.end)}
                </p>
                <p className="mt-2 flex items-start gap-2 text-lg text-ink">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                  {[w.room, w.venueAddress, `${w.town}, ${w.state}`].filter(Boolean).join(', ')}
                </p>
                <p className="mt-2 flex items-start gap-2 text-lg text-ink">
                  <Languages className="mt-1 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                  In {LANGUAGES[w.language].label}
                  {w.language === 'en' ? '' : ` (${LANGUAGES[w.language].native})`}
                </p>
                <p className="mt-3">
                  <Link href={`/workshops/flyer/${w.id}`} className={linkClass}>
                    Printable flyer for this session
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl border border-line bg-paper p-6">
            <p className="text-lg leading-relaxed text-ink">
              No sessions are posted yet. Libraries, senior centers and community groups are
              setting dates now. Leave your name below and I will tell you when one is set near
              you, or call me and I will go through your letter with you one-on-one.
            </p>
          </div>
        )}

        <div className="article-body mt-12 max-w-[68ch]">
          <h2>What each session covers</h2>
          <ul>
            {WORKSHOP_COVERS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>What to expect</h2>
          <ul>
            {WORKSHOP_RULES.map((item) => (
              <li key={item}>{item}</li>
            ))}
            <li>Bring your plan letter if you want to follow along. You will not be asked to hand it over.</li>
          </ul>

          <h2>Read before you come</h2>
          <ul className="not-prose space-y-1">
            {planEndingPages.map((page) => (
              <li key={page.slug}>
                <Link href={`/${page.slug}`} className={linkClass}>
                  {page.company} plan ending in 2027
                </Link>
              </li>
            ))}
            <li>
              <Link href={PLAN_ENDING_ANSWER_HREF} className={linkClass}>
                Any plan-ending letter: what it means
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-12" id="rsvp">
          <WorkshopRsvpForm
            sessions={sessions.map((w) => ({ id: w.id, label: workshopLabel(w), language: w.language }))}
          />
        </div>

        <div className="mt-8">
          <p className="text-lg text-ink-soft">
            Rather call or text? {compliance.licensedAgentNotice}
          </p>
          <ContactActions where="workshops" className="mt-4" size="lg" includeEmail={false} />
        </div>

        <div className="article-body mt-12 max-w-[68ch]">
          <h2>Host a session</h2>
          <p>
            Libraries, senior centers, houses of worship and community groups can host a session
            at no cost. Nothing of value changes hands in either direction, and no plan or
            company is named.
          </p>
          <p className="not-prose flex flex-col gap-1">
            <Link href="/partners" className={linkClass}>
              How partnering works
            </Link>
            <Link href="/workshops/flyer" className={linkClass}>
              Blank printable flyer (fill in the date and place)
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
