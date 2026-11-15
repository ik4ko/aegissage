/**
 * Single source of truth for advisor identity, contact channels and
 * licensing facts.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  Keep public advisor identity and contact details here. Nothing else in the
 *  codebase should hardcode a name, phone number or email address.
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * ── Why every env read below uses `|| ` and not `?? ` ─────────────────────
 *
 * `??` falls back only on `undefined`/`null`. An environment variable that
 * exists but is BLANK arrives as an empty string and wins the coalesce, so
 * `?? 'Erekle Niniashvili'` yields `''` rather than the fallback.
 *
 * That is not hypothetical. `.env.example` ships `NEXT_PUBLIC_ADVISOR_PHOTO=`
 * with no value, and anyone who seeds a deployment from it gets a blank
 * override that silently defeats the default — which is what made the
 * advisor's photo render as initials while the code looked correct.
 *
 * `.trim() || fallback` treats blank and whitespace-only the same as unset,
 * which is the behaviour every one of these wants. Do not "simplify" these
 * back to `??`.
 */

/** Digits only — used to build tel: hrefs and the SMS link. */
const RAW_PHONE = process.env.NEXT_PUBLIC_ADVISOR_PHONE?.trim() || '15512029079';
const CONFIGURED_EMAIL =
  process.env.NEXT_PUBLIC_ADVISOR_EMAIL?.trim() || 'contact@aegissage.com';

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^1/, '');
  if (digits.length !== 10) return raw;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export const advisor = {
  /**
   * The one public name. There is no second display name and no nickname
   * field — "Eric" is handled in exactly one place, as `alternateName` on
   * the Person node in lib/seo.ts, and appears nowhere in body copy.
   */
  name: process.env.NEXT_PUBLIC_ADVISOR_NAME?.trim() || 'Erekle Niniashvili',
  firstName: 'Erekle',
  /**
   * "Licensed insurance broker", not "licensed Medicare broker". The license
   * is a state insurance producer license; no license is issued by or named
   * for Medicare, and the second phrasing can read as "licensed by Medicare".
   * Body copy may still say "independent Medicare broker" as a description of
   * the work. Decided by Erekle, Nov 15 2026.
   */
  credential: 'Licensed Independent Insurance Broker',
  email: CONFIGURED_EMAIL,
  emailConfigured: true,
  phoneRaw: RAW_PHONE,
  phone: formatPhone(RAW_PHONE),
  /** E.164, for tel:/sms: hrefs and schema `telephone`. */
  phoneE164: `+${RAW_PHONE.replace(/\D/g, '')}`,
  /**
   * National Producer Number.
   *
   * Published as of Nov 15 2026, at Erekle's direction (this reverses the
   * earlier "NPN stays blank" rule). It is a verifiable regulatory identifier
   * he supplied himself; it is what lets a reader, a directory or an AI
   * assistant confirm that the person on this site is the licensed producer
   * of the same name. Never change it from anything but his own statement.
   * Consumers must still treat `''` as "not published" and render nothing.
   */
  npn: '21599052',
  /**
   * Where the advisor is based, at town granularity.
   *
   * Town and county only. There is no public street address, no office hours
   * and no walk-in location: the Google Business Profile is a service-area
   * profile, so nothing on this site may render a street address, postal
   * code, geo coordinates or opening hours. Stating the town is a factual
   * origin statement and matches the profile; it must never be presented as
   * an office you can visit.
   *
   * Changed from "Bergen County, New Jersey" on Nov 15 2026 so the site, the
   * schema and every off-site profile name the same place.
   */
  basedIn: 'Edgewater, New Jersey',
  basedInTown: 'Edgewater',
  basedInCounty: 'Bergen County',
  basedInRegion: 'NJ',
  /**
   * Languages Erekle works in, in order of strength as he states it.
   * `code` is the BCP 47 tag used for schema and hreflang.
   */
  languages: [
    { code: 'en', name: 'English' },
    { code: 'ka', name: 'Georgian' },
    { code: 'ru', name: 'Russian' },
  ],
  /**
   * NOTE (Aug 13 2026): Louisiana removed — appointment lost, confirmed by
   * Erekle. If it needs to come back, add it here AND nowhere else; every
   * other consumer (lib/states.ts, hero/trust-bar copy, /plans, footer,
   * schema areaServed, llms.txt, sitemap) derives from this array.
   */
  licensedStates: [
    'AL', 'AR', 'AZ', 'FL', 'GA', 'IA', 'IL', 'IN', 'KY', 'MI', 'MN', 'MS',
    'MO', 'NC', 'ND', 'NJ', 'NY', 'OH', 'OK', 'PA', 'SC', 'TN', 'TX', 'VA', 'WV',
  ],
} as const;

export const site = {
  /**
   * "Aegis Sage", two words. The domain is one word; the brand is two. This
   * must match the Google Business Profile and every other public profile
   * character for character, because a mismatch between the site, its schema
   * and its profiles is what stops search engines and AI assistants from
   * resolving them to one business. `legacyName` exists only as schema
   * `alternateName` so the old one-word spelling still resolves.
   */
  name: 'Aegis Sage',
  legacyName: 'AegisSage',
  /**
   * ── Canonical host ──────────────────────────────────────────────────────
   * `www.aegissage.com` is the host Vercel serves with a 200. The apex
   * `aegissage.com` issues a 308 to it on every path, verified live.
   *
   * Canonicals, sitemap entries, JSON-LD @ids and OG image URLs must all
   * point at the host that answers directly. Previously they pointed at the
   * apex, so every self-referencing canonical on the site resolved through
   * a redirect and the sitemap advertised 52 URLs that all bounced.
   *
   * `domain` stays as the bare apex on purpose — it is display text (the OG
   * card footer and nothing else), where "aegissage.com" is the brand and
   * "www." is noise. It is never used to build a URL.
   */
  domain: 'aegissage.com',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aegissage.com',
  /**
   * No response-time or availability promise in the tagline. "Someone who
   * picks up the phone" reads as a guarantee of pickup, and there is one
   * person behind this number — some calls will go to voicemail. "A real
   * person, not a call center" says the true thing instead.
   */
  tagline: 'Straight answers about Medicare, from a real person instead of a call center.',
  /**
   * State count is interpolated from advisor.licensedStates.length rather
   * than hardcoded — this string previously said "26 states" as a literal
   * and would have silently gone stale the moment a license was added or
   * dropped (which is exactly what happened; it dropped to 25 on Aug 13
   * 2026 and this line was the one place that hadn't caught up).
   */
  description:
    `Independent Medicare help from Erekle Niniashvili. Plain-English guides, a free eligibility check, and someone you can call or text with a question. Based in Edgewater, New Jersey and licensed in ${advisor.licensedStates.length} states.`,
  /**
   * Search-result description, ~150 chars. `description` above is longer and
   * still used for Open Graph and Twitter, where there is room for it. Google
   * truncates around 155, so the homepage was being cut mid-sentence.
   */
  metaDescription:
    'Independent Medicare help from Erekle Niniashvili. Plain-English guides, a free eligibility check, and a real person you can call or text.',
  /** Search-result title. The full tagline runs 91 chars in <title>. */
  shortTitle: 'Aegis Sage — Independent Medicare help in plain English',
  serviceArea: 'Bergen and Hudson counties in New Jersey, New York City, and Philadelphia',
} as const;

export const contactHrefs = {
  tel: `tel:${advisor.phoneE164}`,
  sms: `sms:${advisor.phoneE164}`,
  mailto: advisor.emailConfigured ? `mailto:${advisor.email}` : '#contact-email',
  /**
   * Every "Book a time" CTA points HERE, not straight at Google.
   *
   * /book is an on-domain interstitial that records who is booking, captures
   * UTM attribution, and takes a real consent tick before handing off to
   * Google Calendar. Booking used to go direct, which produced no contacts
   * row, no alert and no attribution for the highest-intent action on the
   * site.
   *
   * Attribution is why the interstitial has to exist rather than being solved
   * on the Google side: an Appointment Schedule link has no documented way to
   * carry UTM parameters through and hand them back, so anything not captured
   * before the redirect is gone.
   *
   * Internal route — do NOT give these links target="_blank".
   */
  booking: '/book',
  /**
   * Google Calendar Appointment Schedule — 60-minute Medicare consultation
   * slots. Added Aug 14 2026.
   *
   * This is the SHARE link, and it is now a FALLBACK only. /book opens
   * `bookingCalendarEmbed` in a dialog over the page and sends someone here
   * only when the browser cannot do that. Do not link to it from anywhere
   * else: a direct link skips attribution and consent capture, which is the
   * entire reason the interstitial exists.
   */
  bookingCalendar: 'https://calendar.app.google/pNjYuj1JK6i2ATrN6',
  /**
   * The same appointment schedule in Google's embeddable form — the URL
   * behind Calendar → Booking pages → Options → Sharing options → Website
   * embed. /book loads it in an <iframe> inside a modal dialog, so booking
   * never navigates away from the page.
   *
   * ── The two parts that matter ──────────────────────────────────────────
   * The ID is the same schedule the share link above resolves to, so the two
   * describe one calendar — but they are NOT interchangeable. `?gv=true` is
   * what makes Google serve the embeddable view; without it the page renders
   * its full standalone chrome inside our dialog. And only the embeddable
   * view is served without framing restrictions, so the share link cannot be
   * put in the iframe even if you wanted to.
   *
   * If the appointment schedule is ever recreated in Calendar, BOTH of these
   * change. Re-copy this from Sharing options rather than editing the ID by
   * hand — a stale ID here fails as an empty dialog, not as an error.
   */
  bookingCalendarEmbed:
    'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2-9Z8ubWuB9eMp2xuO1rhtZHRCsid2-G0hWGqkvfno7Aq2T5tvoxxNJdNlol8EHZKfUuNNpmME?gv=true',
} as const;

export const social = {
  youtube: 'https://www.youtube.com/@65MAPD',
  instagram: 'https://www.instagram.com/aegissage',
} as const;

/**
 * Every public profile that is the same person or business as this site.
 * Drives schema `sameAs` (lib/seo.ts) and nothing else.
 *
 * ── Blank means "URL not supplied yet", never "guess it" ──────────────────
 * A wrong `sameAs` URL tells a search engine that someone else's profile is
 * this business. Each blank below is a profile Erekle has confirmed exists
 * but whose exact URL he has not pasted in. Fill them from the address bar
 * of the live profile; do not construct one from a handle.
 *
 * `publicProfiles` below drops the blanks, so an unfilled entry renders
 * nothing.
 */
export const profiles = {
  myMedicareBroker: 'https://mymedicarebroker.com/agent/erekle-niniashvili',
  youtube: social.youtube,
  instagram: social.instagram,
  googleBusinessProfile: '',
  facebook: '',
  linkedin: '',
  x: '',
  nextdoor: '',
  bingPlaces: '',
  appleBusinessConnect: '',
  yelp: '',
  bbb: '',
  patch: '',
  medicareAgentsHub: '',
} as const;

export const publicProfiles: string[] = Object.values(profiles).filter(
  (url) => url.trim().length > 0,
);

/**
 * CMS Medicare Communications and Marketing Guidelines (MCMG) require a
 * Third Party Marketing Organization to state the scope of what it offers on
 * every marketing touchpoint. This string is rendered by <DisclaimerFooter />
 * and nowhere else — do not inline it into a page.
 *
 * The plan/organization counts must be re-verified each contract year and the
 * "current as of" date updated below.
 */
export const compliance = {
  currentAsOf: 'August 2026',
  medicareGovUrl: 'https://www.medicare.gov',
  medicarePhone: '1-800-MEDICARE',
  medicareTty: '1-877-486-2048',
  /**
   * CMS marketing guidance requires that any material publishing an agent's
   * phone number tell the reader that calling it reaches a licensed
   * insurance agent — so that a call to a broker is never mistaken for a
   * call to Medicare, to a plan, or to a neutral government help line.
   *
   * VERBATIM. Do not reword, abbreviate, or soften it to "you'll reach me"
   * or similar. "Licensed insurance agent" is the phrase that carries the
   * meaning; a friendlier paraphrase drops exactly the disclosure being
   * required.
   *
   * Rendered adjacent to the primary phone CTA in the hero and in the footer
   * contact block. It does NOT need to sit beside every tel: link on a page.
   */
  licensedAgentNotice: 'Calling this number will direct you to a licensed insurance agent.',
} as const;

/**
 * ── TPMO organization and product counts, by area ─────────────────────────
 *
 * The standardized TPMO disclaimer (42 CFR 422.2267(e)(41)) states how many
 * organizations this agent represents and how many products they offer "in
 * your area". Both numbers are contract facts that differ by county and by
 * contract year, so they are stored per area, each with the date it was
 * counted.
 *
 * ── The rule (set by Erekle, Nov 15 2026) ─────────────────────────────────
 *  1. Every count comes from a dated Sunfire recount. Never guessed, rounded,
 *     incremented by hand, carried over from a previous year, or inferred
 *     from a carrier list.
 *  2. MEDICARE ADVANTAGE AND PART D PRODUCTS ONLY, from organizations Erekle
 *     is appointed and certified with for the plan year being sold. Medigap
 *     products are not part of this disclosure.
 *  3. Recount every October 1 and whenever contracting changes (a carrier
 *     added or lost), and update `countDate` in the same commit.
 *  4. An area with no recount is `null`. It then falls back to
 *     `TPMO_FALLBACK_AREA`; it never gets a placeholder number.
 *
 * `countDate` is ISO: 'YYYY-MM-DD', or 'YYYY-MM' when only the month is
 * known. lib/tpmo-guard.ts prints a build warning when a count is more than
 * 12 months old or predates the most recent October 1.
 *
 * ── Open question, with Pinnacle compliance (Nov 2026) ────────────────────
 * Whether pages about one area must carry that area's own counts, and how a
 * page covering several counties (New York City) should state them. Until
 * that is answered: a page mapped to an area in lib/tpmo.ts uses that area's
 * counts when they exist, and everything else falls back to Bergen County.
 * The fallback is a known gap on pages about other places, not a settled
 * reading of the rule.
 */
export type TpmoAreaCount = {
  organizationCount: number;
  productCount: number;
  /** ISO date of the Sunfire recount: 'YYYY-MM-DD' or 'YYYY-MM'. */
  countDate: string;
  /** Where the numbers came from, for the next person to re-pull them. */
  source: string;
};

export const TPMO_AREAS = {
  'bergen-nj': 'Bergen County, New Jersey',
  'kings-ny': 'Kings County (Brooklyn), New York',
  'queens-ny': 'Queens County, New York',
  'new-york-ny': 'New York County (Manhattan), New York',
  'bronx-ny': 'Bronx County, New York',
  'richmond-ny': 'Richmond County (Staten Island), New York',
  'philadelphia-pa': 'Philadelphia County, Pennsylvania',
} as const;

export type TpmoAreaKey = keyof typeof TPMO_AREAS;

export const TPMO_FALLBACK_AREA: TpmoAreaKey = 'bergen-nj';

export const tpmoCountsByArea: Record<TpmoAreaKey, TpmoAreaCount | null> = {
  /*
    ── PENDING RECOUNT (Nov 15 2026) ──────────────────────────────────────
    These are the August 2026 figures that were already live, kept unchanged
    at Erekle's direction until his same-day Sunfire recount arrives. Two
    known problems, both fixed by that recount:

      - 65 was counted as 26 Medicare Advantage + 39 Medigap. Medigap does
        not belong in this number (rule 2 above).
      - The October recount this comment's predecessor called for has not
        been entered, so the figures predate the current plan year.

    Replace all three values together. Do not edit one number on its own.
  */
  'bergen-nj': {
    organizationCount: 6,
    productCount: 65,
    countDate: '2026-08',
    source: 'Sunfire, appointed carriers only, Bergen County NJ (August 2026)',
  },
  // Awaiting Erekle's per-county Sunfire recount. Leave null until then.
  'kings-ny': null,
  'queens-ny': null,
  'new-york-ny': null,
  'bronx-ny': null,
  'richmond-ny': null,
  'philadelphia-pa': null,
};

export const nav = [
  { href: '/medicare-basics', label: 'Basics' },
  { href: '/answers', label: 'Answers' },
  { href: '/medicare-checklist', label: 'Checklist' },
  // "Enrollment Check" says what it answers; "Eligibility Check" was read as
  // a means test rather than a deadline lookup.
  { href: '/tools/eligibility-check', label: 'Enrollment Check' },
  { href: '/tools/medicare-iq', label: 'Medicare IQ' },
  { href: '/news', label: 'News' },
  { href: '/blog', label: 'Articles' },
  { href: '/videos', label: 'Videos' },
  { href: '/about', label: 'About' },
] as const;

/**
 * Header nav.
 *
 * ── History, so this is not "fixed" back and forth ────────────────────────
 * Aug 14 2026 trimmed this from eight items to four, on the grounds that
 * eight read as clutter and two pairs read as duplicates even though they
 * are not: Checklist is a prep document while Enrollment Check is a "which
 * window am I in" quiz, and News is short-form updates while Articles is
 * long-form guides.
 *
 * Aug 2026 (this pass) restores Basics and Enrollment Check, at Erekle's
 * direction, giving six. The reasoning that dropped them still holds for
 * News and Videos, which stay out of the header. Enrollment Check comes
 * back because it is the primary conversion tool on the site and the hero's
 * filled CTA points at it — burying the site's main self-serve action in
 * the footer worked against the page's own hierarchy.
 *
 * The Checklist/Enrollment Check adjacency the Aug 14 note warned about is
 * real and is now shipped deliberately. If they test as confusing, the fix
 * is clearer labels rather than dropping one — both pages have real content
 * and real search traffic.
 *
 * `nav` above is unchanged and still drives the footer, so News and Videos
 * keep a real internal link. An orphaned page is worse for SEO than a
 * decluttered header is good for it.
 */
export const headerNav = [
  { href: '/medicare-basics', label: 'Basics' },
  { href: '/medicare-checklist', label: 'Checklist' },
  { href: '/tools/eligibility-check', label: 'Enrollment Check' },
  { href: '/tools/medicare-iq', label: 'Medicare IQ' },
  { href: '/blog', label: 'Articles' },
  { href: '/about', label: 'About' },
] as const;
