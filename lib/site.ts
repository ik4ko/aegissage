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

export const site = {
  name: 'AegisSage',
  domain: 'aegissage.com',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aegissage.com',
  tagline: 'Straight answers about Medicare, from someone who picks up the phone.',
  description:
    'Independent Medicare guidance for people in New Jersey, New York City, and Philadelphia. Plain-English guides, a free eligibility check, and a real person you can call or text.',
  serviceArea: 'New Jersey, New York City, and Philadelphia',
} as const;

export const advisor = {
  name: process.env.NEXT_PUBLIC_ADVISOR_NAME ?? 'Eric Niniashvili',
  firstName: 'Eric',
  credential: 'Independent Medicare advisor',
  email: CONFIGURED_EMAIL,
  emailConfigured: true,
  phoneRaw: RAW_PHONE,
  phone: formatPhone(RAW_PHONE),
  basedIn: 'New Jersey',
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
  /** Pending verification — replace with the advisor's verified contracted counts. */
  planCount: 47,
  /** Pending verification — replace with the advisor's verified contracted counts. */
  organizationCount: 9,
  medicareGovUrl: 'https://www.medicare.gov',
  medicarePhone: '1-800-MEDICARE',
  medicareTty: '1-877-486-2048',
} as const;

export const nav = [
  { href: '/medicare-basics', label: 'Medicare Basics' },
  { href: '/tools/eligibility-check', label: 'Eligibility Check' },
  { href: '/tools/medicare-iq', label: 'Medicare IQ' },
  { href: '/news', label: 'News' },
  { href: '/blog', label: 'Articles' },
  { href: '/about', label: 'About' },
] as const;
