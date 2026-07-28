/**
 * First-touch attribution.
 *
 * ── What this stores, and what it deliberately does not ───────────────────
 * Captured once per browser session, on the first page the visitor lands on:
 *
 *   utm_source / utm_medium / utm_campaign / utm_content / utm_term
 *   landing   — the pathname only, never the query string
 *   referrer  — the referring HOST only, never the full URL
 *
 * The referrer is reduced to a host because full referrer URLs routinely
 * carry search terms and occasionally carry identifiers. A host answers the
 * only question worth asking ("did they come from YouTube or from Google")
 * without dragging anything else along.
 *
 * NOTHING here is personal data. No name, email, phone, ZIP, IP, device
 * fingerprint, health information, prescription, provider or Medicare
 * identifier is captured, derived or inferred — not now and not later. If a
 * future change needs one of those to attribute a conversion, the correct
 * answer is that the conversion does not get attributed.
 *
 * ── Why sessionStorage and not a cookie ───────────────────────────────────
 * sessionStorage is first-party, is not transmitted on every request, dies
 * with the tab, and is not shared across sites. It needs no consent banner
 * under any reading of ePrivacy because it is strictly functional and
 * session-scoped. A tracking cookie would need one.
 */

const KEY = 'aegissage:attribution';

/** UTM keys we read. Anything else in the query string is ignored entirely. */
const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type Attribution = Record<string, string>;

/**
 * Shapes that are direct identifiers regardless of which parameter carried
 * them. Anyone can craft `?utm_campaign=551-202-9079` and, without this, that
 * value would be persisted to a database row and sent as an analytics
 * property.
 *
 * The analytics layer has its own equivalent check, but it is disabled in
 * production by design (it throws, and a throw must never break a live page).
 * This one runs everywhere, because this is the boundary where untrusted URL
 * input enters the system — the right place to reject it outright.
 */
const IDENTIFIER_SHAPES = [
  /\d{3}[\s.\-]?\d{3}[\s.\-]?\d{4}/, // US phone
  /\d{3}-\d{2}-\d{4}/, // SSN
  /[\w.+-]+@[\w-]+\.[\w.]+/, // email
  /\b\d{5}(-\d{4})?\b/, // ZIP / ZIP+4
];

/**
 * Values arrive from a URL a stranger controls, and they end up in a database
 * row and an analytics property. Cap the length, strip anything that is not
 * plainly a campaign token, and drop the value entirely if what remains still
 * looks like a person.
 *
 * Dropping rather than masking is deliberate: a partially redacted identifier
 * is still an identifier, and a campaign name is not worth the risk of
 * storing one.
 */
function clean(value: string): string {
  const raw = value.trim().slice(0, 80);

  // Check the RAW value first. Stripping punctuation destroys the very
  // characters some identifiers are recognised by — "a@b.com" becomes
  // "ab.com" and stops looking like an email — so a post-strip check alone
  // would wave those through.
  if (IDENTIFIER_SHAPES.some((shape) => shape.test(raw))) return '';

  const stripped = raw.replace(/[^\w.\-/ ]/g, '');

  // Check again after stripping: separators can be removed in ways that
  // reveal a run of digits the raw form obscured.
  if (IDENTIFIER_SHAPES.some((shape) => shape.test(stripped))) return '';

  return stripped;
}

/**
 * Records first-touch attribution if this session does not already have it.
 * Later pages in the same session do not overwrite it — the first touch is
 * the one that did the work.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return;

  try {
    if (window.sessionStorage.getItem(KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const data: Attribution = {};

    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) {
        const cleaned = clean(value);
        if (cleaned) data[key] = cleaned;
      }
    }

    data.landing = clean(window.location.pathname) || '/';

    /*
      First-touch day, not a precise timestamp.

      Marketing attribution needs to know which campaign week produced a lead,
      not the second it arrived — and a full ISO timestamp is a higher-entropy
      value sitting in a record beside someone's name. The date is enough to
      join a lead to a campaign, and `created_at` on the contact row already
      carries the exact submission time.
    */
    data.firstTouchDate = new Date().toISOString().slice(0, 10);

    if (document.referrer) {
      try {
        const host = new URL(document.referrer).host;
        // Same-site navigation is not a referral worth recording.
        if (host && host !== window.location.host) data.referrer = clean(host);
      } catch {
        // Malformed referrer — skip it rather than store garbage.
      }
    }

    window.sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Private browsing, disabled storage, quota — attribution is a
    // nice-to-have and must never break a page for a visitor.
  }
}

/** Reads first-touch attribution for this session. Empty object if none. */
export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    // Re-validate on read. What went in was sanitized, but this value is in
    // storage a user can edit, and it is about to be persisted server-side.
    const out: Attribution = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v !== 'string') continue;
      const key = clean(k);
      const value = clean(v);
      // Drop empties rather than persisting blank keys — `clean` returns ''
      // for anything that still looked like an identifier after stripping.
      if (key && value) out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}
