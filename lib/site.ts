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

/**
 * ── Canonical host ────────────────────────────────────────────────────────
 * `www.aegissage.com` is the host Vercel serves with a 200. The apex
 * `aegissage.com` issues a 308 to it on every path, verified live.
 *
 * Canonicals, sitemap entries, JSON-LD @ids and OG image URLs must all point
 * at the host that answers directly. Previously they pointed at the apex, so
 * every self-referencing canonical on the site resolved through a redirect
 * and the sitemap advertised 52 URLs that all bounced.
 *
 * `domain` stays as the bare apex on purpose — it is display text (the OG
 * card footer and nothing else), where "aegissage.com" is the brand and
 * "www." is noise. It is never used to build a URL.
 */
export const site = {
  name: 'AegisSage',
  domain: 'aegissage.com',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aegissage.com',
  tagline: 'Straight answers about Medicare, from someone who picks up the phone.',
  description:
    'Independent Medicare guidance for people in Bergen County, New Jersey, New York City, and Philadelphia. Plain-English guides, a free eligibility check, and a real person you can call or text.',
  serviceArea: 'Bergen County, New Jersey, New York City, and Philadelphia',
} as const;

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
   */
  basedIn: 'Bergen County, New Jersey',
  licensedStates: [
    'AL', 'AR', 'AZ', 'FL', 'GA', 'IA', 'IL', 'IN', 'KY', 'LA', 'MI', 'MN', 'MS',
    'MO', 'NC', 'ND', 'NJ', 'NY', 'OH', 'OK', 'PA', 'SC', 'TN', 'TX', 'VA', 'WV',
  ],
} as const;

export const contactHrefs = {
  tel: `tel:+${advisor.phoneRaw.replace(/\D/g, '')}`,
  sms: `sms:+${advisor.phoneRaw.replace(/\D/g, '')}`,
  mailto: advisor.emailConfigured ? `mailto:${advisor.email}` : '#contact-email',
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
  { href: '/medicare-basics', label: 'Medicare Basics' },
  { href: '/tools/eligibility-check', label: 'Eligibility Check' },
  { href: '/tools/medicare-iq', label: 'Medicare IQ' },
  { href: '/news', label: 'News' },
  { href: '/blog', label: 'Articles' },
  { href: '/videos', label: 'Videos' },
  { href: '/about', label: 'About' },
] as const;
