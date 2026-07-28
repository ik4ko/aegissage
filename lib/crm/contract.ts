import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  WEBSITE → AGENT FACTORY LEAD INGEST CONTRACT
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  This file is the single source of truth for the wire format between
 *  aegissage.com (Supabase project oofxhxsjfyuqegicczbu) and the Agent
 *  Factory dashboard (Supabase project grtnjhwekvkyawacunde).
 *
 *  A copy of the schema and the signature verification lives on the
 *  receiving side. If you change anything here, change it there in the same
 *  commit or deliveries will start failing signature or schema validation.
 *
 * ── Why this does NOT post to /api/medicare-crm ───────────────────────────
 *  The dashboard's existing CRM route is guarded by `requireMedicareOperator`,
 *  which carries this comment:
 *
 *    "Medicare data is PHI-adjacent and must stay on the operator-session
 *     lane. This intentionally rejects the global MACHINE_API_TOKEN lane,
 *     which is broader than the Medicare CRM's authorization boundary."
 *
 *  That boundary is correct and this integration respects it. A public
 *  website must not hold a credential that can read `ag_clients`, which
 *  contains dates of birth and Medicare Beneficiary Identifiers.
 *
 *  Instead the website posts to a narrow, purpose-built ingest endpoint that
 *  can write ONLY to `ag_website_leads` and can read nothing. It authenticates
 *  with its own dedicated shared secret, following the same self-authorizing
 *  pattern the dashboard already uses for /api/orchestrator/cron and
 *  /api/loops/tick via CRON_SECRET.
 *
 * ── Why leads do NOT go into ag_clients ───────────────────────────────────
 *  `ag_clients` is a qualified-client table with date_of_birth and
 *  medicare_beneficiary_identifier columns. A web form submission is an
 *  unqualified enquiry from someone who may never become a client. Writing
 *  one into `ag_clients` would pollute the book of business, and would put an
 *  unverified stranger's record in the same table as real PHI. A human
 *  promotes a lead to a client after qualification — that is a decision, not
 *  an insert.
 */

/** Bump when the wire format changes. The receiver records what it accepted. */
export const LEAD_CONTRACT_VERSION = '1.0.0';

/**
 * Consent snapshot travelling with the lead.
 *
 * Three independent permissions, each with its own timestamp and the version
 * of the wording that was actually shown. The receiving system must never
 * infer one from another — in particular it must never treat
 * `preferred_contact: 'text'` as SMS permission.
 */
export const leadConsentSchema = z.object({
  /** Permission to receive a reply to this specific request. Always true. */
  reply: z.literal(true),
  replyAt: z.string().datetime(),
  replyTextVersion: z.string().max(40),

  /** Standalone permission for automated SMS. Never inferred. */
  sms: z.boolean(),
  smsAt: z.string().datetime().nullable(),
  smsTextVersion: z.string().max(40).nullable(),

  /** Standalone permission for future marketing/educational email. */
  marketing: z.boolean(),
  marketingAt: z.string().datetime().nullable(),
  marketingTextVersion: z.string().max(40).nullable(),
});

export const leadPayloadSchema = z.object({
  contractVersion: z.string().max(20),

  /** Primary key of the row in the website's public.contacts. */
  websiteSubmissionId: z.string().uuid(),
  /** Stable dedupe key. A repeat MUST NOT create a second lead. */
  sourceLeadId: z.string().max(120),

  submittedAt: z.string().datetime(),

  name: z.string().max(80),
  email: z.string().max(160).nullable(),
  phone: z.string().max(40).nullable(),
  zip: z.string().max(10).nullable(),

  preferredContact: z.enum(['phone', 'text', 'email']),
  topic: z.string().max(120).nullable(),
  message: z.string().max(2000).nullable(),

  /** Which page produced it: 'contact-form', 'location-bergen-county', etc. */
  sourcePage: z.string().max(80),

  /**
   * First-touch attribution. Sanitized on the website in lib/attribution.ts:
   * UTM tokens, a pathname and a referring host only. Values matching an
   * identifier shape are dropped there, not masked.
   */
  attribution: z.record(z.string(), z.string()).default({}),

  consent: leadConsentSchema,
});

export type LeadPayload = z.infer<typeof leadPayloadSchema>;

/**
 * Fields the website must NEVER transmit, restated as a runtime check.
 *
 * The website does not collect any of these, so this should be unreachable.
 * It exists because "we don't collect that" is a property of today's form,
 * and this is a wire contract that will outlive today's form. If a future
 * field lands in `context` and gets spread into a payload, this fails loudly
 * instead of shipping PHI across a project boundary.
 */
const PROHIBITED_KEYS = [
  'dob',
  'date_of_birth',
  'dateOfBirth',
  'birth',
  'mbi',
  'medicare_beneficiary_identifier',
  'medicareNumber',
  'ssn',
  'diagnosis',
  'condition',
  'conditions',
  'prescription',
  'prescriptions',
  'medication',
  'medications',
  'doctor',
  'doctors',
  'provider',
  'physician',
  'health',
];

export function assertNoProhibitedFields(payload: LeadPayload): void {
  const scan = (obj: Record<string, unknown>, path: string) => {
    for (const key of Object.keys(obj)) {
      if (PROHIBITED_KEYS.includes(key.toLowerCase())) {
        throw new Error(
          `[crm-contract] refusing to transmit prohibited field "${path}${key}". ` +
            'Health and Medicare identifiers must never cross this boundary.',
        );
      }
    }
  };

  scan(payload.attribution, 'attribution.');
}

// ── Request signing ────────────────────────────────────────────────────────

/**
 * HMAC-SHA256 over `${timestamp}.${body}`.
 *
 * The timestamp is inside the signed material so a captured request cannot be
 * replayed later — the receiver rejects anything outside its freshness window.
 * Signing the raw body (not a parsed object) means both sides agree on exactly
 * the bytes that were authenticated.
 */
export function signPayload(rawBody: string, timestamp: string, secret: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
}

/** Constant-time comparison. A plain `===` here leaks the secret by timing. */
export function verifySignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  secret: string,
  toleranceSeconds = 300,
): boolean {
  const age = Math.abs(Date.now() - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds * 1000) return false;

  const expected = signPayload(rawBody, timestamp, secret);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const SIGNATURE_HEADER = 'x-aegissage-signature';
export const TIMESTAMP_HEADER = 'x-aegissage-timestamp';
export const IDEMPOTENCY_HEADER = 'x-aegissage-idempotency-key';
