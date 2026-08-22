/**
 * Consent wording versions.
 *
 * ── What this column is for ───────────────────────────────────────────────
 * `consent_text_version` on a stored contact records WHICH WORDING the
 * visitor actually agreed to. If a consent claim is ever challenged, this is
 * the column that answers "what did the box next to the tick actually say on
 * the day they ticked it" — so a value that cannot distinguish two different
 * wordings is not doing its job.
 *
 * It was a bare `'2026-07'` for every submission. That was fine while one
 * form existed. The homepage capture band has different consent wording, and
 * a shared date string would have quietly recorded both as the same
 * agreement.
 *
 * ── Keyed by FORM, not by page ────────────────────────────────────────────
 * <ContactForm /> is rendered on many routes and passes a different `source`
 * on each ("about", "contact", "penalty-calculator", …). Every one of those
 * shows IDENTICAL consent wording, so they all share a version. The version
 * identifies the text, not the page it appeared on — `source` already records
 * the page.
 *
 * ── When to bump ──────────────────────────────────────────────────────────
 * Change a version string whenever the consent copy in that form changes, in
 * the same commit as the copy. Never re-point an old string at new wording:
 * rows already carry it, and rewriting what it means retroactively falsifies
 * every one of them. Add a new dated version instead.
 */
export const CONSENT_TEXT_VERSIONS = {
  /** components/forms/contact-form.tsx — separated reply/SMS/marketing boxes. */
  contactForm: 'contact-form-2026-07',
  /** components/forms/deadline-capture.tsx — single email-only consent box. */
  homepageCapture: 'homepage-capture-2026-08',
} as const;

/**
 * `source` value posted by the homepage lead-capture band.
 *
 * Exported so the form and this mapping cannot drift: if the form's source
 * string changed on its own, submissions would silently start recording the
 * ContactForm consent version against different wording.
 */
export const HOMEPAGE_CAPTURE_SOURCE = 'homepage-deadline-capture';

/**
 * The consent wording version for a submission's `source`.
 *
 * Defaults to the ContactForm version because every source other than the
 * homepage band is a ContactForm instance. If a third form is added, give it
 * its own source constant and an explicit branch here — do NOT let it fall
 * through to the default and inherit a version describing wording it never
 * showed anyone.
 */
export function consentTextVersionFor(source: string): string {
  return source === HOMEPAGE_CAPTURE_SOURCE
    ? CONSENT_TEXT_VERSIONS.homepageCapture
    : CONSENT_TEXT_VERSIONS.contactForm;
}
