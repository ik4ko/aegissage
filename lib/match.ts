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
 * row.
 *
 * The booking path does now read ONE column back off the matched row —
 * `context`, so that the update can merge the booking's attribution into it
 * rather than discarding it. That value never leaves the server: it is merged
 * and written straight back, and the browser still only ever sees a bare
 * `{ ok, persisted, matched }`. Keep it that way. A matcher this loose must
 * not become a way to read another person's stored data, so if something ever
 * needs more of the matched row than this, that is the point at which to give
 * the table a real unique key — not to widen the select.
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
