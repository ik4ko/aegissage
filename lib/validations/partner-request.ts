import { z } from 'zod';

/**
 * Organization request form (/partners and /for-organizations pages).
 *
 * This is a business-to-business form: a practice manager, a senior living
 * director, an HR lead or a program coordinator asks for a talk, a resource or
 * a help day. It is NOT a consumer lead form, so it carries no Part A/B
 * question and no consumer consent boxes (CLAUDE.md lead-form rules apply to
 * people asking about their own Medicare).
 *
 * ── Never personal information about seniors ─────────────────────────────
 * The form asks only about the organization and the person writing. It has no
 * field for a patient, resident, member or employee, and the free-text box is
 * checked for things that look like a Social Security number, a Medicare
 * number (MBI) or a date of birth. If one is found the request is refused
 * with a plain message, before anything is emailed or written to the Sheet.
 * Partners never send names, lists or records (docs/partners/compliance-guardrails.md).
 */

export const ORGANIZATION_TYPES = [
  { value: 'billing', label: 'Billing or revenue cycle team' },
  { value: 'medical-group', label: 'Primary care practice or medical group' },
  { value: 'new-practice', label: 'New clinic or practice that is opening' },
  { value: 'senior-living', label: 'Senior living or assisted living community' },
  { value: 'community', label: 'Town senior program, library, or community or religious organization' },
  { value: 'employer', label: 'Employer or HR team' },
  { value: 'other', label: 'Other organization' },
] as const;

export const REQUEST_KINDS = [
  { value: 'education-talk', label: 'A Medicare education talk for a group' },
  { value: 'help-day', label: 'A help day with one-on-one appointments for people who ask' },
  { value: 'printed-guides', label: 'Printed plain-language Medicare guides to have on hand' },
  { value: 'referral-resource', label: 'A place to send people who ask us Medicare questions' },
  { value: 'other', label: 'Something else' },
] as const;

const typeValues = ORGANIZATION_TYPES.map((t) => t.value) as [string, ...string[]];
const kindValues = REQUEST_KINDS.map((k) => k.value) as [string, ...string[]];

// 123-45-6789, 123 45 6789 or nine digits in a row. Not a ZIP+4 (07020-1234).
const SSN = /\b\d{3}-\d{2}-\d{4}\b|\b\d{3} \d{2} \d{4}\b|\b\d{9}\b/;
// Medicare Beneficiary Identifier: 11 characters, positions fixed by CMS.
const MBI = /\b[1-9][AC-HJKMNP-RT-Y][AC-HJKMNP-RT-Y0-9]\d[AC-HJKMNP-RT-Y][AC-HJKMNP-RT-Y0-9]\d[AC-HJKMNP-RT-Y]{2}\d{2}\b/i;
const DOB = /\b(?:dob|date of birth|born)\b|\b(0?[1-9]|1[0-2])[/-](0?[1-9]|[12]\d|3[01])[/-](19|20)\d{2}\b/i;

/** True when free text looks like it carries a senior's personal identifiers. */
export function looksLikePersonalInfo(text: string): boolean {
  return SSN.test(text) || MBI.test(text) || DOB.test(text);
}

export const PERSONAL_INFO_MESSAGE =
  'Please leave out anything about a patient, resident or employee, such as a name with a date of birth, a Medicare number or a Social Security number. Tell me about your organization only.';

export const partnerRequestSchema = z
  .object({
    organization: z.string().trim().min(2, 'Please enter the organization name.').max(160),
    organizationType: z.enum(typeValues, { message: 'Please choose the kind of organization.' }),
    contactName: z.string().trim().min(2, 'Please enter your name.').max(120),
    role: z.string().trim().max(120).optional().default(''),
    email: z.string().trim().email('Please enter a work email address.').max(200),
    phone: z.string().trim().max(40).optional().default(''),
    town: z.string().trim().min(2, 'Please enter the town or city.').max(120),
    requests: z.array(z.enum(kindValues)).min(1, 'Please choose at least one thing you would like.'),
    timing: z.string().trim().max(200).optional().default(''),
    message: z.string().trim().max(1500).optional().default(''),
    sourcePage: z.string().trim().max(200).optional().default(''),
    // Honeypot: real people never see or fill this.
    website: z.string().max(200).optional(),
  })
  .superRefine((value, ctx) => {
    for (const field of ['message', 'timing', 'role'] as const) {
      if (looksLikePersonalInfo(value[field])) {
        ctx.addIssue({ code: 'custom', path: [field], message: PERSONAL_INFO_MESSAGE });
      }
    }
  });

export type PartnerRequest = z.infer<typeof partnerRequestSchema>;
