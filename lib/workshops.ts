/**
 * "Your Medicare plan is ending" workshops: the session list behind
 * /workshops, the Event schema and the printable flyers.
 *
 * ── How to add a session ──────────────────────────────────────────────────
 * Add one object to `workshops` below and deploy. Nothing else changes:
 * the page lists it, it gets its own Event schema, its own RSVP choice and
 * its own flyer at /workshops/flyer/{id}. Past sessions drop off by
 * themselves (the page re-renders hourly).
 *
 *   {
 *     id: 'fort-lee-library-2026-12-10',      // lowercase, dashes, unique
 *     date: '2026-12-10',                      // YYYY-MM-DD
 *     start: '10:30', end: '11:30',            // 24-hour, Eastern time
 *     venue: 'Fort Lee Public Library',        // the host's public name
 *     venueAddress: '320 Main Street',         // optional, the VENUE's public address
 *     town: 'Fort Lee', state: 'NJ',
 *     language: 'en',                          // 'en' | 'ka' | 'ru'
 *     room: 'Community room',                  // optional
 *     hostConfirmed: '2026-11-20',             // date the host confirmed in writing
 *   }
 *
 * ── Rules (42 CFR 422.2264(c), CY2027; docs/partners/compliance-guardrails.md) ──
 *  - These are EDUCATIONAL events. No plan or company named in the talk, no
 *    plan presentation, no applications taken. No Scope of Appointment is
 *    needed to attend.
 *  - One-on-one plan help after a talk is allowed the same day, in the same
 *    place, only after a Scope of Appointment is agreed and recorded.
 *  - Only list a session once the host has confirmed it. Never list a venue
 *    because it seems likely to say yes.
 *  - Sessions run inside the plan-ending window: December 8, 2026 to
 *    February 28, 2027 (scripts/test-workshops.mjs checks this).
 *  - `venueAddress` is the host's public address. It is never Erekle's, and
 *    it is shown on the page and flyer only, never put in schema (the site
 *    publishes no street address in schema at all).
 */

export type WorkshopLanguage = 'en' | 'ka' | 'ru';

export type Workshop = {
  id: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  venueAddress?: string;
  room?: string;
  town: string;
  state: 'NJ' | 'NY' | 'PA';
  language: WorkshopLanguage;
  /** ISO date the host confirmed in writing. */
  hostConfirmed: string;
};

export const WORKSHOP_TITLE = 'Your Medicare plan is ending: what to do now';

/** The window these sessions run in. */
export const WORKSHOP_WINDOW = { from: '2026-12-08', to: '2027-02-28' } as const;

export const LANGUAGES: Record<WorkshopLanguage, { label: string; native: string; bcp47: string }> = {
  en: { label: 'English', native: 'English', bcp47: 'en' },
  ka: { label: 'Georgian', native: 'ქართული', bcp47: 'ka' },
  ru: { label: 'Russian', native: 'Русский', bcp47: 'ru' },
};

/**
 * Confirmed sessions. Empty until a host confirms one: the page then says
 * no sessions are posted yet and offers the blank flyer and the request form.
 */
export const workshops: Workshop[] = [];

/** What every session covers. Shown on the page and the flyer. */
export const WORKSHOP_COVERS = [
  'What the letter saying your plan is ending means, and what it does not mean',
  'The dates: December 31 for coverage on January 1, and the special window to February 28, 2027',
  'What happens if you do nothing',
  'How to check that your doctors and prescriptions are covered before you choose',
  'When you can buy a Medigap policy without health questions',
  'Where to get help at no cost, including Medicare and your state SHIP',
] as const;

export const WORKSHOP_RULES = [
  'This is an educational session. No plan or insurance company is recommended, and no applications are taken.',
  'You do not need to sign anything or share your Medicare number to attend.',
  'If you want help with your own plan choice afterward, you can ask for a one-on-one appointment. We agree in writing on what we will discuss first.',
] as const;

/* ── Helpers ────────────────────────────────────────────────────────────── */

/** Eastern offset for a date: -05:00 in winter, -04:00 in summer (US rules). */
export function easternOffset(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const firstSunday = (month: number) => 1 + ((7 - new Date(Date.UTC(y, month, 1)).getUTCDay()) % 7);
  const day = Date.UTC(y, m - 1, d);
  const dstStart = Date.UTC(y, 2, firstSunday(2) + 7); // second Sunday in March
  const dstEnd = Date.UTC(y, 10, firstSunday(10)); // first Sunday in November
  return day >= dstStart && day < dstEnd ? '-04:00' : '-05:00';
}

export function isoStart(w: Workshop): string {
  return `${w.date}T${w.start}:00${easternOffset(w.date)}`;
}

export function isoEnd(w: Workshop): string {
  return `${w.date}T${w.end}:00${easternOffset(w.date)}`;
}

/** "Thursday, December 10, 2026" */
export function formatWorkshopDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "10:30 a.m." */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'p.m.' : 'a.m.';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Sessions that have not ended yet, soonest first. */
export function upcomingWorkshops(now: Date = new Date()): Workshop[] {
  return workshops
    .filter((w) => new Date(isoEnd(w)).getTime() > now.getTime())
    .sort((a, b) => isoStart(a).localeCompare(isoStart(b)));
}

export function getWorkshop(id: string): Workshop | undefined {
  return workshops.find((w) => w.id === id);
}

export function workshopLabel(w: Workshop): string {
  return `${formatWorkshopDate(w.date)}, ${formatTime(w.start)} — ${w.venue}, ${w.town} (${LANGUAGES[w.language].label})`;
}
