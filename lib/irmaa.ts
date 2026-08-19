/**
 * ══════════════════════════════════════════════════════════════════════════
 *  IRMAA — Income-Related Monthly Adjustment Amount
 * ══════════════════════════════════════════════════════════════════════════
 *
 * The surcharge Social Security adds to Part B and Part D premiums when
 * reported income is above a threshold. It is not a tax on this year's
 * income: the 2026 premium is set by the 2024 tax return, which is the fact
 * most people are surprised by and the one this tool exists to surface.
 *
 * ── UPDATE THIS FILE EVERY NOVEMBER ───────────────────────────────────────
 * CMS publishes the following year's thresholds and adjustment amounts in a
 * release each November, and SSA restates them in POMS HI 01101.020. When
 * that lands:
 *
 *   1. replace all three tier tables below,
 *   2. update IRMAA_YEAR, IRMAA_MAGI_YEAR and IRMAA_SOURCE_NOTE,
 *   3. re-read the boundary note below — the comparison operators are not
 *      uniform across rows and CMS has not always kept them consistent,
 *   4. re-check PART_B_STANDARD_PREMIUM in lib/medicare-costs.ts, which the
 *      Part B total is built from.
 *
 * Nothing else in the app hardcodes these numbers. The calculator, its copy
 * and its disclaimer all read from here, so a single edit moves the whole
 * tool to the new plan year.
 *
 * Leaving these stale is worse than showing nothing: someone deciding
 * whether a Roth conversion or a property sale pushes them over a threshold
 * is acting on a dollar figure, and last year's brackets produce a wrong
 * answer with no visible sign that it is wrong.
 *
 * ── Read the boundaries carefully; they are not uniform ───────────────────
 * SSA's published rows do not use the same comparison at every step. The
 * middle rows read "more than $X but less than or EQUAL TO $Y", while the
 * jump into the top bracket reads "GREATER THAN OR EQUAL TO $Z". So:
 *
 *   • a single filer at exactly $137,000 is in the SECOND tier, but
 *   • a single filer at exactly $500,000 is in the TOP tier, not the fourth.
 *
 * That asymmetry is easy to miss and lands on exactly the round numbers a
 * person is most likely to type into a calculator. It is encoded literally
 * below — note the 499,999 / 749,999 / 390,999 ceilings, which are not
 * typos and must not be "tidied" back to the round published figure.
 *
 * ── Married Filing Separately is not a scaled-down joint table ────────────
 * MFS collapses to three tiers and skips the intermediate steps entirely.
 * One dollar over $109,000 does not move an MFS filer into the first
 * surcharge tier — it moves them straight into the fourth, a jump of
 * $446.30 on Part B and $83.30 on Part D in a single step. That cliff is
 * the single harshest edge anywhere in the IRMAA rules.
 *
 * The second MFS threshold is $391,000. Secondary aggregators commonly
 * publish figures near but not equal to this; the value here was read
 * directly from SSA POMS HI 01101.020, which is the controlling source.
 *
 * ── What these numbers are NOT ────────────────────────────────────────────
 * The Part B figures below are SURCHARGES, not premiums. The premium a
 * person actually pays is the standard premium plus the surcharge, which is
 * what `estimateIrmaa` assembles. Storing surcharges rather than totals
 * keeps this file correct when only the standard premium moves.
 *
 * The Part D figure is also a surcharge only. It is paid on top of whatever
 * the chosen drug plan charges, and that plan premium is not knowable from
 * income — so this file never pretends to produce a total Part D cost.
 */

import { PART_B_STANDARD_PREMIUM } from '@/lib/medicare-costs';

/** Plan year these brackets apply to. Shown to the reader, never inferred. */
export const IRMAA_YEAR = 2026;

/**
 * The tax year whose return sets the premium above. Two years back, always.
 * Derived rather than written twice so the lookback cannot drift out of step
 * with IRMAA_YEAR during a November update.
 */
export const IRMAA_MAGI_YEAR = IRMAA_YEAR - 2;

/** Provenance, rendered under the result so the reader can check it. */
export const IRMAA_SOURCE_NOTE =
  'CMS, November 2025 release, effective 2026 (2024 MAGI)';

export type FilingStatus = 'single' | 'joint' | 'separate';

export type IrmaaTier = {
  /** Lowest whole-dollar MAGI in this tier. Inclusive. */
  minMagi: number;
  /** Highest whole-dollar MAGI in this tier, inclusive. null = top bracket. */
  maxMagi: number | null;
  /** Dollars added to the standard Part B premium each month. */
  partBSurcharge: number;
  /** Dollars added to the chosen drug plan's premium each month. */
  partDSurcharge: number;
};

// Single / Head of Household / Qualifying Surviving Spouse
export const IRMAA_TIERS_SINGLE: IrmaaTier[] = [
  { minMagi: 0,       maxMagi: 109000,  partBSurcharge: 0,      partDSurcharge: 0 },
  { minMagi: 109001,  maxMagi: 137000,  partBSurcharge: 81.20,  partDSurcharge: 14.50 },
  { minMagi: 137001,  maxMagi: 171000,  partBSurcharge: 202.90, partDSurcharge: 37.50 },
  { minMagi: 171001,  maxMagi: 205000,  partBSurcharge: 324.60, partDSurcharge: 60.40 },
  // Published as "more than $205,000 but LESS THAN $500,000" — so $500,000
  // itself belongs to the top bracket, not here. See the boundary note above.
  { minMagi: 205001,  maxMagi: 499999,  partBSurcharge: 446.30, partDSurcharge: 83.30 },
  { minMagi: 500000,  maxMagi: null,    partBSurcharge: 487.00, partDSurcharge: 91.00 },
];

// Married Filing Jointly — thresholds double the single figures for tiers 1-4;
// the top bracket is fixed by statute at $750,000, not doubled from $500,000.
export const IRMAA_TIERS_JOINT: IrmaaTier[] = [
  { minMagi: 0,       maxMagi: 218000,  partBSurcharge: 0,      partDSurcharge: 0 },
  { minMagi: 218001,  maxMagi: 274000,  partBSurcharge: 81.20,  partDSurcharge: 14.50 },
  { minMagi: 274001,  maxMagi: 342000,  partBSurcharge: 202.90, partDSurcharge: 37.50 },
  { minMagi: 342001,  maxMagi: 410000,  partBSurcharge: 324.60, partDSurcharge: 60.40 },
  // Same asymmetry as the single table: $750,000 exactly is the top bracket.
  { minMagi: 410001,  maxMagi: 749999,  partBSurcharge: 446.30, partDSurcharge: 83.30 },
  { minMagi: 750000,  maxMagi: null,    partBSurcharge: 487.00, partDSurcharge: 91.00 },
];

/**
 * Married Filing Separately — three tiers, verified against SSA POMS
 * HI 01101.020 rather than a secondary source.
 *
 * Two things here were wrong in an earlier draft and are worth stating so
 * they are not reintroduced: the table does NOT stop at two tiers, and the
 * second threshold is $391,000 — not the ~$394,000 that circulates widely.
 *
 * POMS phrasing, verbatim:
 *   "More than $109,000 but less than $391,000"   → $649.20 Part B total
 *   "Greater than or equal to $391,000"           → $689.90 Part B total
 *
 * Those totals less the $202.90 standard premium give the surcharges below.
 *
 * This table applies to a couple who lived together at any point in the tax
 * year. A married-filing-separately couple who lived apart for the ENTIRE
 * year is treated under the single table instead (POMS HI 01120.060). The
 * calculator surfaces that as a note rather than asking a fourth question,
 * because it is a narrow case and a wrong guess at it changes the answer.
 */
export const IRMAA_TIERS_SEPARATE: IrmaaTier[] = [
  { minMagi: 0,      maxMagi: 109000, partBSurcharge: 0,      partDSurcharge: 0 },
  { minMagi: 109001, maxMagi: 390999, partBSurcharge: 446.30, partDSurcharge: 83.30 },
  { minMagi: 391000, maxMagi: null,   partBSurcharge: 487.00, partDSurcharge: 91.00 },
];

export const IRMAA_TIERS: Record<FilingStatus, IrmaaTier[]> = {
  single: IRMAA_TIERS_SINGLE,
  joint: IRMAA_TIERS_JOINT,
  separate: IRMAA_TIERS_SEPARATE,
};

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single, head of household, or qualifying surviving spouse',
  joint: 'Married, filing jointly',
  separate: 'Married, filing separately',
};

export type IrmaaEstimate = {
  /** The bracket the MAGI landed in. */
  tier: IrmaaTier;
  /** Position in the table, 0 for the standard-premium tier. */
  tierIndex: number;
  /** How many tiers this filing status has, for "tier 2 of 6" style copy. */
  tierCount: number;
  /** True when no surcharge applies — the standard-premium tier. */
  isStandard: boolean;
  /** True when there is no higher bracket to move into. */
  isTopTier: boolean;

  /** Standard premium plus the Part B surcharge. What Part B actually costs. */
  partBPremium: number;
  /** Part B surcharge alone. */
  partBSurcharge: number;
  /** Part D surcharge alone — added to whatever the drug plan itself charges. */
  partDSurcharge: number;

  /** The two surcharges together, per month. The "extra" figure. */
  monthlySurcharge: number;
  /** The same over twelve months, because that is how people feel it. */
  yearlySurcharge: number;
  /** Part B premium plus the Part D surcharge, per month. */
  monthlyTotal: number;
  /** The same over twelve months. */
  yearlyTotal: number;

  /**
   * The lowest MAGI that would land in the next bracket up, or null at the
   * top. Not advice about what to do with that — just the distance.
   */
  nextTierAt: number | null;
  /** How much more MAGI it would take to get there, or null at the top. */
  amountUnderNextTier: number | null;
  /** What the monthly surcharge would become there, or null at the top. */
  nextTierMonthlySurcharge: number | null;
};

/**
 * Whole dollars, floored, never negative.
 *
 * SSA works from the whole-dollar MAGI on the return, and the tier tables
 * are integer boundaries, so a value carrying cents has to resolve one way
 * or the other. Flooring is the resolution that cannot push someone into a
 * higher bracket than their return would.
 *
 * The two non-finite cases are deliberately NOT treated alike. NaN means
 * nothing has been typed yet, so it resolves to zero and shows the standard
 * premium. Infinity means a number too large to represent, and resolving
 * that to zero would answer an absurdly high income with the cheapest
 * bracket on the table — so it clamps upward into the top one instead.
 */
function normalizeMagi(magi: number): number {
  if (Number.isNaN(magi) || magi <= 0) return 0;
  if (magi === Infinity) return Number.MAX_SAFE_INTEGER;
  return Math.floor(magi);
}

/** Currency rounding, applied after adding two published figures together. */
function round(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Which bracket a MAGI falls in, and how far the next one is.
 *
 * The distance to the next threshold is the genuinely useful output here.
 * Someone $3,200 below a cliff is in a different position from someone
 * $60,000 below it, and IRMAA is a cliff rather than a slope: one dollar
 * over the line applies the whole surcharge for the entire year. Reporting
 * the gap is a fact about the brackets. It is deliberately not paired with
 * any suggestion about what to do with income — that is a conversation with
 * a tax professional, not output from a web page.
 */
export function estimateIrmaa(magi: number, filingStatus: FilingStatus): IrmaaEstimate {
  const tiers = IRMAA_TIERS[filingStatus];
  const value = normalizeMagi(magi);

  // Falls through to the top bracket, which is the only one with no ceiling.
  const tierIndex = tiers.findIndex(
    (tier) => value >= tier.minMagi && (tier.maxMagi === null || value <= tier.maxMagi),
  );
  const index = tierIndex === -1 ? tiers.length - 1 : tierIndex;
  const tier = tiers[index];

  const next = tiers[index + 1] ?? null;
  const partBPremium = round(PART_B_STANDARD_PREMIUM + tier.partBSurcharge);
  const monthlySurcharge = round(tier.partBSurcharge + tier.partDSurcharge);
  const monthlyTotal = round(partBPremium + tier.partDSurcharge);

  return {
    tier,
    tierIndex: index,
    tierCount: tiers.length,
    isStandard: tier.partBSurcharge === 0 && tier.partDSurcharge === 0,
    isTopTier: next === null,

    partBPremium,
    partBSurcharge: tier.partBSurcharge,
    partDSurcharge: tier.partDSurcharge,

    monthlySurcharge,
    yearlySurcharge: round(monthlySurcharge * 12),
    monthlyTotal,
    yearlyTotal: round(monthlyTotal * 12),

    nextTierAt: next?.minMagi ?? null,
    amountUnderNextTier: next ? Math.max(0, next.minMagi - value) : null,
    nextTierMonthlySurcharge: next ? round(next.partBSurcharge + next.partDSurcharge) : null,
  };
}

/** Whole dollars, no cents — for thresholds, which are always round figures. */
export function formatMagiDollars(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

/**
 * A bracket's income range as a person would read it.
 *
 * Renders the stored integer bounds literally rather than rounding them back
 * to the figures SSA prints. A row that reads "$205,001 – $499,999" looks
 * less tidy than "$205,000 – $500,000", and it is the reason the table is
 * worth showing at all: it makes visible that one dollar decides the
 * bracket, and that $500,000 exactly is NOT in that row. Rounding for
 * appearance would erase the only thing the boundaries are trying to say.
 */
export function formatMagiRange(tier: IrmaaTier): string {
  if (tier.minMagi === 0) return `${formatMagiDollars(tier.maxMagi ?? 0)} or less`;
  if (tier.maxMagi === null) return `${formatMagiDollars(tier.minMagi)} and above`;
  return `${formatMagiDollars(tier.minMagi)} – ${formatMagiDollars(tier.maxMagi)}`;
}
