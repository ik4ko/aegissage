import { Fragment } from 'react';
import { compliance, site } from '@/lib/site';
import type { ResolvedTpmoArea } from '@/lib/tpmo';

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
 *  ── Two variants (revised Nov 15 2026) ────────────────────────────────
 *
 *  counted  — THE DEFAULT, on every route. The standardized text for an
 *             agent who does not sell every plan in the area: "We do not
 *             offer every plan available in your area. Currently we
 *             represent N organizations which offer M products in your
 *             area. Please contact Medicare.gov, 1-800-MEDICARE, or your
 *             local State Health Insurance Program to get information on
 *             all of your options."
 *
 *  generic  — FALLBACK ONLY, when no verified count exists for the route's
 *             area or for the fallback area. It carries the pre-2024 scope
 *             sentence in place of the count. It exists so that a missing
 *             recount degrades to "asserts no number" rather than to a
 *             wrong number. It is not the target state.
 *
 *  An earlier version of this file rendered "counted" only on routes that
 *  collect a ZIP code. That split is gone: the counts are part of the
 *  standardized text, not an add-on for ZIP pages.
 *
 *  ── Where the numbers come from ───────────────────────────────────────
 *  `tpmoCountsByArea` in lib/site.ts, resolved per route by
 *  `tpmoAreasFor()` in lib/tpmo.ts. This component never sees a null or a
 *  placeholder: an area without a dated recount is filtered out before it
 *  gets here, so there is no code path that prints a blank, a zero or a
 *  guess.
 *
 *  ── Several areas on one page ─────────────────────────────────────────
 *  A page about New York City covers five counties whose counts can differ.
 *  When the resolved areas do not all share the same two numbers, each is
 *  stated on its own, prefixed with the county name. That prefix is the one
 *  place this file adds words to the standardized sentence, and it is
 *  pending confirmation from Pinnacle compliance (see lib/site.ts).
 * ══════════════════════════════════════════════════════════════════════════
 */

export type TpmoVariant = 'generic' | 'counted';

/** The variant a route renders: counted whenever a verified count exists. */
export function tpmoVariantFor(areas: ResolvedTpmoArea[]): TpmoVariant {
  return areas.length > 0 ? 'counted' : 'generic';
}

function sameCounts(areas: ResolvedTpmoArea[]): boolean {
  return areas.every(
    (area) =>
      area.organizationCount === areas[0].organizationCount &&
      area.productCount === areas[0].productCount,
  );
}

export function TpmoDisclaimer({ areas }: { areas: ResolvedTpmoArea[] }) {
  const variant = tpmoVariantFor(areas);
  const single = areas.length > 0 && sameCounts(areas) ? areas[0] : null;

  return (
    <p>
      {/*
        Non-government statement. CMS-standard wording — "not connected with
        or endorsed by the United States government or the federal Medicare
        program". Required on every marketing touchpoint.
      */}
      {site.name} is not connected with or endorsed by the United States government or the
      federal Medicare program. We do not offer every plan available in your area.{' '}
      {variant === 'generic' ? (
        <>Any information we provide is limited to those plans we do offer in your area.</>
      ) : single ? (
        <>
          Currently we represent {single.organizationCount} organizations which offer{' '}
          {single.productCount} products in your area.
        </>
      ) : (
        areas.map((area, index) => (
          <Fragment key={area.key}>
            {index > 0 ? ' ' : ''}
            {area.label}: Currently we represent {area.organizationCount} organizations
            which offer {area.productCount} products in your area.
          </Fragment>
        ))
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
