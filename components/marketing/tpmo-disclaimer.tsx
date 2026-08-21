import { compliance, site, tpmoCounts } from '@/lib/site';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  TPMO DISCLAIMER — REQUIRED TEXT, SINGLE SOURCE
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  Federally required under 42 CFR §§ 422.2267(e)(41) and 423.2267(e)(41)
 *  for Third Party Marketing Organizations. The wording is standardized.
 *
 *  DO NOT paraphrase, reword, shorten, restyle, abbreviate, or "tighten"
 *  anything in this file. Do not move it behind a <details>, a modal, a
 *  tab, an accordion, or a "read more". Do not reduce its contrast or type
 *  size. It must be legible and present on page load.
 *
 *  ── Two variants, and which one a page needs ──────────────────────────
 *
 *  generic  — pages that do NOT collect a ZIP code. Carries the scope
 *             limitation sentence: "Any information we provide is limited
 *             to those plans we do offer in your area."
 *
 *  counted  — pages that DO collect a ZIP code. CMS substitutes the
 *             organization/product count for that scope sentence.
 *
 *  Route selection is NOT decided here. `collectsZip()` in lib/site.ts owns
 *  it, derived from which routes render <ContactForm />, which is the only
 *  ZIP input on the site.
 *
 *  ── Why "counted" throws instead of degrading ─────────────────────────
 *
 *  The counts are contract facts from Erekle's quoting platform and are
 *  null until he supplies them. A missing count could be papered over with
 *  a zero, an em-dash or "several" — every one of those would publish a
 *  false statement on a federally mandated notice, which is strictly worse
 *  than the generic variant, and the generic variant is itself fully
 *  compliant on a page that does not collect a ZIP.
 *
 *  So this fails loudly and at build time. See `tpmoVariantFor()` below for
 *  the safe path that live pages actually take.
 * ══════════════════════════════════════════════════════════════════════════
 */

export type TpmoVariant = 'generic' | 'counted';

/**
 * The variant a route should actually render.
 *
 * A ZIP-collecting route wants "counted", but can only have it once real
 * counts exist. Until then it falls back to "generic" — which is compliant,
 * carries the same scope limitation and the same referral routes, and simply
 * declines to assert a number nobody has verified.
 *
 * This is the ONLY thing that should choose a variant for a live page.
 * Passing variant="counted" by hand while the counts are null is a build
 * error, by design.
 */
export function tpmoVariantFor(pathname: string | null, zipRoute: boolean): TpmoVariant {
  void pathname;
  const haveCounts =
    typeof tpmoCounts.organizationCount === 'number' &&
    typeof tpmoCounts.productCount === 'number';
  return zipRoute && haveCounts ? 'counted' : 'generic';
}

export function TpmoDisclaimer({ variant }: { variant: TpmoVariant }) {
  const { organizationCount, productCount } = tpmoCounts;

  if (variant === 'counted') {
    const missing = [
      organizationCount === null ? 'organizationCount' : null,
      productCount === null ? 'productCount' : null,
    ].filter(Boolean);

    if (missing.length > 0) {
      throw new Error(
        '[TPMO] <TpmoDisclaimer variant="counted" /> was rendered while ' +
          `${missing.join(' and ')} ${missing.length > 1 ? 'are' : 'is'} null in ` +
          'lib/site.ts (tpmoCounts).\n\n' +
          'The counted disclaimer states "Currently we represent N organizations ' +
          'which offer M products in your area." That is a factual regulatory ' +
          'disclosure under 42 CFR 422.2267(e)(41). It cannot be rendered with a ' +
          'blank, a zero, or a guess.\n\n' +
          'Fix by ONE of:\n' +
          '  1. Set both counts in lib/site.ts from the quoting platform, or\n' +
          '  2. Render variant="generic", which is compliant and asserts no count.\n\n' +
          'Do not invent the numbers.',
      );
    }
  }

  return (
    <p>
      {/*
        Non-government statement. CMS-standard wording — "not connected with
        or endorsed by the United States government or the federal Medicare
        program". Required on every marketing touchpoint.
      */}
      {site.name} is not connected with or endorsed by the United States government or the
      federal Medicare program. We do not offer every plan available in your area.{' '}
      {variant === 'counted' ? (
        <>
          Currently we represent {organizationCount} organizations which offer{' '}
          {productCount} products in your area.
        </>
      ) : (
        <>Any information we provide is limited to those plans we do offer in your area.</>
      )}{' '}
      {/*
        All THREE referral routes named by the regulation: medicare.gov,
        1-800-MEDICARE with its TTY line, and the caller's local State Health
        Insurance Program. See the note in disclaimer-footer.tsx — an earlier
        pass dropped SHIP and TTY to match a shorter FMO example, and the FMO
        examples are not the compliance source.
      */}
      Please contact{' '}
      <a
        href={compliance.medicareGovUrl}
        rel="noopener noreferrer"
        target="_blank"
        className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
      >
        medicare.gov
      </a>
      ,{' '}
      <a
        href="tel:+18006334227"
        className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
      >
        {compliance.medicarePhone}
      </a>{' '}
      (TTY {compliance.medicareTty}), or your local State Health Insurance Program (SHIP),
      to get information on all of your options.
    </p>
  );
}
