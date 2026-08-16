/**
 * Single source of truth for advisor identity, contact channels and
 * licensing facts.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  Keep public advisor identity and contact details here. Nothing else in the
 *  codebase should hardcode a name, phone number or email address.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Digits only — used to build tel: hrefs and the SMS link. */
const RAW_PHONE = process.env.NEXT_PUBLIC_ADVISOR_PHONE ?? '15512029079';
const CONFIGURED_EMAIL =
  process.env.NEXT_PUBLIC_ADVISOR_EMAIL?.trim() || 'erekleniniashvili@gmail.com';

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^1/, '');
  if (digits.length !== 10) return raw;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export const advisor = {
  name: process.env.NEXT_PUBLIC_ADVISOR_NAME ?? 'Eric Niniashvili',
  firstName: 'Eric',
  credential: 'Independent Medicare advisor',
  email: CONFIGURED_EMAIL,
  emailConfigured: true,
  phoneRaw: RAW_PHONE,
  phone: formatPhone(RAW_PHONE),
  /**
   * Where the advisor is based, at county granularity.
   *
   * This is deliberately a county, not a street address. No verified public
   * address, office hours or Google Business Profile exists for this advisor,
   * so nothing on this site may render a postal address, geo coordinates or
   * opening hours. Stating the county of origin is a factual origin statement;
   * it must never be presented as a walk-in office.
   *
   * NOTE (Aug 2026): a Google Business Profile now exists for the practice.
   * Re-evaluate this constraint once that profile carries a verified address
   * — do not add one here until it does.
   */
  basedIn: 'Bergen County, New Jersey',
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
  name: 'AegisSage',
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
    `Independent Medicare help from Eric Niniashvili. Plain-English guides, a free eligibility check, and someone you can call or text with a question. Based in Bergen County, New Jersey and licensed in ${advisor.licensedStates.length} states.`,
  /**
   * Search-result description, ~150 chars. `description` above is longer and
   * still used for Open Graph and Twitter, where there is room for it. Google
   * truncates around 155, so the homepage was being cut mid-sentence.
   */
  metaDescription:
    'Independent Medicare help from Eric Niniashvili. Plain-English guides, a free eligibility check, and a real person you can call or text.',
  /** Search-result title. The full tagline runs 91 chars in <title>. */
  shortTitle: 'AegisSage — Independent Medicare help in plain English',
  serviceArea: 'Bergen County, New Jersey, New York City, and Philadelphia',
} as const;

export const contactHrefs = {
  tel: `tel:+${advisor.phoneRaw.replace(/\D/g, '')}`,
  sms: `sms:+${advisor.phoneRaw.replace(/\D/g, '')}`,
  mailto: advisor.emailConfigured ? `mailto:${advisor.email}` : '#contact-email',
  /**
   * Google Calendar Appointment Schedule — 60-minute Medicare consultation
   * slots. Added Aug 14 2026. This is a public Google-hosted booking page,
   * not a page on this site, so it opens in a new tab rather than routing
   * internally.
   */
  booking: 'https://calendar.app.google/pNjYuj1JK6i2ATrN6',
} as const;

export const social = {
  youtube: 'https://www.youtube.com/@65MAPD',
  instagram: 'https://www.instagram.com/aegissage',
} as const;

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
  currentAsOf: 'January 2026',
  medicareGovUrl: 'https://www.medicare.gov',
  medicarePhone: '1-800-MEDICARE',
  medicareTty: '1-877-486-2048',
} as const;

/**
 * ── Why there are no plan/organization counts here ────────────────────────
 *
 * CMS model TPMO language includes a sentence of the form "Currently we
 * represent N organizations which offer M products in your area." Those two
 * numbers are contract facts specific to this advisor and change every
 * contract year. They were previously hardcoded to unverified placeholder
 * values and rendered publicly on every page as a factual disclosure, which
 * is worse than omitting them: a wrong count is an inaccurate CMS disclosure.
 *
 * The disclaimer now carries the required "we do not offer every plan
 * available in your area" scope limitation and the required 1-800-MEDICARE /
 * medicare.gov referral, without asserting a count that cannot be verified.
 *
 * TO RESTORE THE COUNTS: add `organizationCount` and `planCount` above with
 * the advisor's verified contracted figures, then render them in
 * <DisclaimerFooter />. Do not guess. Do not round. Re-verify annually
 * alongside `currentAsOf`.
 */

export const nav = [
  { href: '/medicare-basics', label: 'Basics' },
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
 * Header nav — a trimmed subset of `nav` above.
 *
 * Added Aug 14 2026: eight items in the header read as clutter, and two
 * pairs read as duplicates even though they aren't (Checklist is a prep
 * document; Enrollment Check is a "which window am I in" quiz — News is
 * short-form updates; Articles is long-form guides). Rather than delete
 * either page — both have real content and real SEO value — this trims
 * what the HEADER shows while `nav` above (unchanged) still drives the
 * footer, so every page keeps at least one real internal link pointing at
 * it. An orphaned page (no internal links) is worse for SEO than a
 * decluttered header is good for it.
 *
 * Dropped from the header, still live and still linked from the footer:
 * Basics, Enrollment Check, News, Videos.
 */
export const headerNav = [
  { href: '/about', label: 'About Me' },
  { href: '/medicare-checklist', label: 'Checklist' },
  { href: '/tools/medicare-iq', label: 'Medicare IQ' },
  { href: '/blog', label: 'Articles' },
] as const;
