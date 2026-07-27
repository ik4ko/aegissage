/**
 * Single source of truth for advisor identity, contact channels and
 * licensing facts.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  BEFORE LAUNCH: every value marked PLACEHOLDER must be replaced with the
 *  advisor's real details. Nothing else in the codebase hardcodes a name,
 *  phone number, email address or NPN — change it here and it changes
 *  everywhere, including OG images, schema.org markup and tel:/mailto: links.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Digits only — used to build tel: hrefs and the SMS link. */
const RAW_PHONE = process.env.NEXT_PUBLIC_ADVISOR_PHONE ?? '19085550142'; // PLACEHOLDER

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^1/, '');
  if (digits.length !== 10) return raw;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export const site = {
  name: 'AegisSage',
  domain: 'aegissage.com',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aegissage.com',
  tagline: 'Straight answers about Medicare, from someone who picks up the phone.',
  description:
    'Independent Medicare guidance from a licensed advisor in New Jersey, serving 20+ states. Plain-English guides, a free eligibility check, and a real person you can call or text.',
} as const;

export const advisor = {
  /** PLACEHOLDER */
  name: process.env.NEXT_PUBLIC_ADVISOR_NAME ?? 'Daniel Reyes',
  /** PLACEHOLDER */
  credential: 'Licensed Independent Medicare Advisor',
  /** PLACEHOLDER — National Producer Number. Must be the advisor's real NPN. */
  npn: process.env.NEXT_PUBLIC_ADVISOR_NPN ?? '19204471',
  /** PLACEHOLDER */
  email: process.env.NEXT_PUBLIC_ADVISOR_EMAIL ?? 'dan@aegissage.com',
  phoneRaw: RAW_PHONE,
  phone: formatPhone(RAW_PHONE),
  basedIn: 'Westfield, New Jersey',
  yearsLicensed: 11,
  /** Every state where the advisor holds an active health license. */
  licensedStates: [
    'NJ', 'NY', 'PA', 'CT', 'DE', 'MD', 'VA', 'NC', 'SC', 'GA',
    'FL', 'OH', 'MI', 'IN', 'TN', 'TX', 'AZ', 'NV', 'CO', 'CA',
    'MA', 'RI',
  ],
} as const;

export const contactHrefs = {
  tel: `tel:+${advisor.phoneRaw.replace(/\D/g, '')}`,
  sms: `sms:+${advisor.phoneRaw.replace(/\D/g, '')}`,
  mailto: `mailto:${advisor.email}`,
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
  /** PLACEHOLDER — replace with the advisor's verified contracted counts. */
  planCount: 47,
  /** PLACEHOLDER — replace with the advisor's verified contracted counts. */
  organizationCount: 9,
  medicareGovUrl: 'https://www.medicare.gov',
  medicarePhone: '1-800-MEDICARE',
  medicareTty: '1-877-486-2048',
} as const;

export const nav = [
  { href: '/medicare-basics', label: 'Medicare Basics' },
  { href: '/tools/eligibility-check', label: 'Eligibility Check' },
  { href: '/tools/plan-comparison', label: 'Compare Coverage' },
  { href: '/blog', label: 'Articles' },
  { href: '/about', label: 'About' },
] as const;
