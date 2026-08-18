/**
 * ══════════════════════════════════════════════════════════════════════════
 *  Medicare cost constants and late-enrollment penalty math
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── UPDATE THIS FILE EVERY NOVEMBER ───────────────────────────────────────
 * CMS publishes the following year's Part B premium and the Part D national
 * base beneficiary premium in a release each November. When that lands:
 *
 *   1. update the three constants below,
 *   2. update COSTS_YEAR and COSTS_SOURCE_NOTE,
 *   3. re-read the note on Part D rounding — CMS has restated it before.
 *
 * Nothing else in the app hardcodes these numbers. The calculator, its copy
 * and its disclaimer all read from here, so a single edit moves the whole
 * tool to the new plan year.
 *
 * Leaving these stale is worse than showing nothing: a penalty estimate is a
 * dollar figure an anxious person may act on, and last year's premium
 * produces a wrong figure with no visible sign that it is wrong.
 *
 * ── What these numbers are NOT ────────────────────────────────────────────
 * The Part B figure is the STANDARD premium. Higher earners pay an
 * income-related adjustment (IRMAA) on top, but the late-enrollment penalty
 * is calculated against the standard premium regardless of IRMAA, which is
 * why only the standard figure belongs here.
 */

/** Plan year these figures apply to. Shown to the reader, never inferred. */
export const COSTS_YEAR = 2026;

/** Provenance, rendered under the result so the reader can check it. */
export const COSTS_SOURCE_NOTE =
  'CMS, November 2025 release, effective 2026';

/** Standard monthly Part B premium. */
export const PART_B_STANDARD_PREMIUM = 202.9;

/** Part B penalty: 10% of the standard premium per full 12-month period. */
export const PART_B_PENALTY_RATE_PER_YEAR = 0.1;

/** National base beneficiary premium — the basis for the Part D penalty. */
export const PART_D_BASE_PREMIUM = 38.99;

/** Part D penalty: 1% of the base premium per full uncovered month. */
export const PART_D_PENALTY_RATE_PER_MONTH = 0.01;

// ── Calendar helpers ───────────────────────────────────────────────────────

/** A month in a year. `month` is 1-12, matching how a person reads a date. */
export type YearMonth = { year: number; month: number };

/** Whole months from `from` to `to`. Negative when `to` precedes `from`. */
export function monthsBetween(from: YearMonth, to: YearMonth): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

export function addMonths({ year, month }: YearMonth, count: number): YearMonth {
  const zeroBased = month - 1 + count;
  return {
    year: year + Math.floor(zeroBased / 12),
    month: ((zeroBased % 12) + 12) % 12 + 1,
  };
}

// ── Inputs ─────────────────────────────────────────────────────────────────

/**
 * Whether the person held coverage that protects against the penalty.
 *
 * For Part B that means an active employer group health plan through current
 * employment (their own or a spouse's). For Part D it means creditable
 * prescription drug coverage. Retiree coverage and COBRA are neither, which
 * is the single most common and most expensive misunderstanding here.
 */
export type CoverageAnswer =
  /** Held it continuously, right up to enrolling. No penalty. */
  | 'throughout'
  /** Held it, but it ended before enrolling. The gap runs from that end. */
  | 'ended'
  /** Never held it. The gap runs from the end of the initial window. */
  | 'never'
  /** Does not know. Treated as `never`, and the result says so. */
  | 'unsure';

export type PenaltyInput = {
  /** Month Medicare eligibility began — usually the 65th birthday month. */
  eligible: YearMonth;
  coverage: CoverageAnswer;
  /** When protective coverage ended. Required when `coverage` is 'ended'. */
  coverageEnded?: YearMonth;
  /** When they enrolled. `null` means not yet — the gap runs to `today`. */
  enrolled: YearMonth | null;
};

export type PenaltyEstimate = {
  /** Full months counted as uncovered after every grace period is applied. */
  uncoveredMonths: number;
  /** Part B only: complete 12-month periods, which is what it charges on. */
  fullYears: number;
  /** Estimated dollars added to the monthly premium. */
  monthlyPenalty: number;
  /** Same figure over twelve months, because that is how people feel it. */
  yearlyPenalty: number;
  /** True when the answers were 'unsure' and this is a worst case. */
  uncertain: boolean;
  /** True when the gap is still running because they have not enrolled. */
  stillAccruing: boolean;
};

/**
 * ── Why the gap is not simply (enrolled − eligible) ───────────────────────
 * Subtracting those two dates overstates the penalty for almost everyone,
 * because two federal grace periods sit in between:
 *
 *   • the Initial Enrollment Period runs seven months — the three months
 *     before the birthday month, that month, and the three after — so the
 *     penalty clock cannot start until three months AFTER the eligibility
 *     month, and
 *   • losing employer coverage opens a Special Enrollment Period: eight
 *     months for Part B, roughly two months (the 63-day rule) for Part D.
 *
 * Ignoring these tells someone who enrolled thirteen months after turning 65
 * that they owe $243 a year when they in fact owe nothing. Overstating a
 * penalty to a worried person is the worst failure this tool could have, so
 * the grace periods are applied before anything is counted.
 */
const IEP_MONTHS_AFTER_ELIGIBILITY = 3;
const PART_B_SEP_MONTHS = 8;

/**
 * Part D allows 63 continuous days without creditable coverage before any
 * penalty attaches. Months are the only unit the rest of the math speaks, so
 * that threshold is applied as three whole months — 63 days is just over two.
 * Erring toward the longer grace keeps the estimate conservative.
 */
const PART_D_GRACE_MONTHS = 3;

function uncoveredMonths(input: PenaltyInput, today: YearMonth, sepMonths: number): number {
  if (input.coverage === 'throughout') return 0;

  const clockStarts =
    input.coverage === 'ended' && input.coverageEnded
      ? addMonths(input.coverageEnded, sepMonths)
      : addMonths(input.eligible, IEP_MONTHS_AFTER_ELIGIBILITY);

  const clockStops = input.enrolled ?? today;

  return Math.max(0, monthsBetween(clockStarts, clockStops));
}

/** CMS rounds penalty amounts to the nearest ten cents. */
function roundToDime(amount: number): number {
  return Math.round(amount * 10) / 10;
}

/**
 * Part B late enrollment penalty.
 *
 * 10% of the standard premium for each FULL 12-month period without Part B.
 * Eleven months late costs nothing; thirteen months costs a full 10%. That
 * cliff is why the tool reports whole years rather than a smooth curve.
 *
 * The surcharge lasts for as long as the person keeps Part B, which for
 * nearly everyone means the rest of their life.
 */
export function estimatePartBPenalty(input: PenaltyInput, today: YearMonth): PenaltyEstimate {
  const months = uncoveredMonths(input, today, PART_B_SEP_MONTHS);
  const fullYears = Math.floor(months / 12);
  const monthlyPenalty = roundToDime(
    fullYears * PART_B_PENALTY_RATE_PER_YEAR * PART_B_STANDARD_PREMIUM,
  );

  return {
    uncoveredMonths: months,
    fullYears,
    monthlyPenalty,
    yearlyPenalty: monthlyPenalty * 12,
    uncertain: input.coverage === 'unsure',
    stillAccruing: input.enrolled === null && months > 0,
  };
}

/**
 * Part D late enrollment penalty.
 *
 * 1% of the national base beneficiary premium per full uncovered month, with
 * no 12-month cliff — every month counts. Because it is a percentage of a
 * base premium that CMS resets annually, the amount someone pays moves each
 * year rather than being frozen at the figure shown here.
 */
export function estimatePartDPenalty(input: PenaltyInput, today: YearMonth): PenaltyEstimate {
  const raw = uncoveredMonths(input, today, PART_D_GRACE_MONTHS);
  const months = raw < PART_D_GRACE_MONTHS ? 0 : raw;
  const monthlyPenalty = roundToDime(
    months * PART_D_PENALTY_RATE_PER_MONTH * PART_D_BASE_PREMIUM,
  );

  return {
    uncoveredMonths: months,
    fullYears: Math.floor(months / 12),
    monthlyPenalty,
    yearlyPenalty: monthlyPenalty * 12,
    uncertain: input.coverage === 'unsure',
    stillAccruing: input.enrolled === null && months > 0,
  };
}

/** Currency for on-screen figures. Always two decimals, never a bare number. */
export function formatUsd(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
