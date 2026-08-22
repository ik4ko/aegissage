/**
 * Normalised matching for "is this the same person who contacted me before?"
 *
 * Best-effort by design. There is no unique index behind this and no attempt
 * at identity resolution — it exists so that someone who submitted the contact
 * form last week and books a call today updates that row instead of creating a
 * second one that looks like a stranger.
 *
 * ── Why normalising matters ───────────────────────────────────────────────
 * The same person reaches the site as "Pat@Example.com " and "pat@example.com",
 * and as "(551) 202-9079", "551-202-9079" and "+15512029079". Raw equality
 * misses every one of those pairs, and a missed match is a duplicate contact
 * — which reads as two separate leads and gets two separate follow-ups.
 *
 * Nothing here is a security control. Do not use these values as a key, an
 * identifier, or anything an attacker could supply to reach another person's
 * row: the booking path only ever matches a row in order to update its
 * booking_status, never to read it back out.
 */

/** Lowercased and trimmed, or null when there is nothing to match on. */
export function normalizeEmail(email: string | null | undefined): string | null {
  const value = email?.trim().toLowerCase();
  return value ? value : null;
}

/**
 * Digits only, with a leading US country code dropped.
 *
 * "+1 (551) 202-9079" and "551.202.9079" both become "5512029079". Anything
 * that is not a plausible 10-digit US number returns null rather than a
 * partial string — a 4-digit fragment would match far too broadly.
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  const digits = phone?.replace(/\D/g, '') ?? '';
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return local.length === 10 ? local : null;
}
