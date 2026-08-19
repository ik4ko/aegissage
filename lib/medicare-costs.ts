/**
 * ══════════════════════════════════════════════════════════════════════════
 *  Medicare cost constants and late-enrollment penalty math
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── UPDATE THIS FILE EVERY NOVEMBER ───────────────────────────────────────
 * CMS publishes the following year's Part B premium each November, and the
 * Part D national base beneficiary premium the previous July. When that
 * lands:
 *
 *   1. update PART_B_STANDARD_PREMIUM and PART_D_BASE_PREMIUM below,
 *   2. update COSTS_YEAR and COSTS_SOURCE_NOTE,
 *   3. update the same year and figures in lib/irmaa.ts, which publishes on
 *      the SAME CMS release and is a SEPARATE edit — irmaa.ts imports the
 *      Part B premium from here, so leaving it behind produces IRMAA totals
 *      built from a new standard premium and old brackets,
 *   4. re-read the note on Part D rounding — CMS has restated it before,
 *   5. run `npm run test:math`. The published-figure assertions there are
 *      written to FAIL until they are updated to match, which is the point:
 *      they are the checklist, not an obstacle to route around.
 *
 * The two penalty RATES (10% per year, 1% per month) and the grace periods
 * are set by statute, not by the annual release. If a November edit seems to
 * require changing those, stop — something else is wrong.
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

/**
 * A specific day. Needed only by Part D, whose trigger is measured in days.
 *
 * Everything else in this file works in whole months, because that is the
 * unit Medicare enrollment actually moves in — coverage starts on the first
 * of a month and the Part B penalty charges by the 12-month period. Part D is
 * the exception: 42 CFR 423.46(a) sets its trigger at "a continuous period of
 * 63 days or longer", and 63 days cannot be expressed in months without
 * getting somebody's answer wrong.
 */
export type CalendarDate = YearMonth & { day: number };

/** Days in a month, leap years included. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Whole days from `from` to `to`. Negative when `to` precedes `from`.
 *
 * Built on Date.UTC rather than local time on purpose: a local-time date
 * subtraction spanning a daylight-saving boundary is off by an hour, and an
 * hour is enough to turn 63 days into 62.96 and flip a penalty off. UTC has
 * no such boundaries. This reads no clock, so it stays deterministic and
 * cannot produce a hydration mismatch.
 */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  const a = Date.UTC(from.year, from.month - 1, from.day);
  const b = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((b - a) / 86_400_000);
}

/** The day after a given date, rolling the month and year over as needed. */
export function nextDay({ year, month, day }: CalendarDate): CalendarDate {
  if (day < daysInMonth(year, month)) return { year, month, day: day + 1 };
  const rolled = addMonths({ year, month }, 1);
  return { ...rolled, day: 1 };
}

/**
 * Complete calendar months between two dates.
 *
 * "Complete" is what Part D charges on: a month in which the person held
 * creditable coverage for even one day is not an uncovered month. Counting
 * the raw month difference would bill them for it.
 */
export function fullMonthsBetween(from: CalendarDate, to: CalendarDate): number {
  const months = (to.year - from.year) * 12 + (to.month - from.month);
  return Math.max(0, to.day < from.day ? months - 1 : months);
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
  /**
   * The last day protective coverage was active. Required when `coverage` is
   * 'ended'. Part B uses only the month; Part D needs the day, because its
   * trigger is a 63-day count rather than a number of months.
   */
  coverageEnded?: CalendarDate;
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
 *   • losing employer coverage opens a Special Enrollment Period of eight
 *     months for Part B.
 *
 * Ignoring these tells someone who enrolled thirteen months after turning 65
 * that they owe $243 a year when they in fact owe nothing. Overstating a
 * penalty to a worried person is the worst failure this tool could have, so
 * the grace periods are applied before anything is counted.
 *
 * Part D does NOT work this way and is calculated separately below. It has no
 * month-shaped grace period at all.
 */
const IEP_MONTHS_AFTER_ELIGIBILITY = 3;
const PART_B_SEP_MONTHS = 8;

/**
 * Part D's trigger, in days, exactly as 42 CFR 423.46(a) states it:
 * "a continuous period of 63 days or longer" without creditable coverage.
 *
 * ── Why this is days and not months ──────────────────────────────────────
 * This was previously approximated as three whole months, on the reasoning
 * that months were the only unit the rest of the file spoke and that a longer
 * grace kept the estimate conservative. That reasoning was wrong, and it
 * produced a wrong answer rather than a cautious one: somebody with a 70-day
 * gap was told they owed nothing, when the regulation starts their penalty at
 * day 63. Rounding a statutory threshold in the beneficiary's favour is still
 * telling them something untrue about their own position.
 *
 * The fix is not a better approximation. It is to stop approximating — hence
 * `CalendarDate` and the day field on the coverage-ended question.
 *
 * ── The threshold is a trigger, not a deductible ─────────────────────────
 * Passing 63 days does not mean the penalty starts counting from day 63. It
 * means a penalty applies, and the amount is then 1% of the base premium for
 * every FULL uncovered month in the gap — including the ones inside the first
 * 63 days. That is why the figure steps from $0.00 to two or three months'
 * worth at the trigger instead of easing in. The step is in the regulation,
 * not in this code.
 */
export const PART_D_TRIGGER_DAYS = 63;

/** Part B only. Whole months, which is the unit Part B actually charges in. */
function uncoveredMonths(input: PenaltyInput, today: YearMonth, sepMonths: number): number {
  if (input.coverage === 'throughout') return 0;

  const clockStarts =
    input.coverage === 'ended' && input.coverageEnded
      ? addMonths(input.coverageEnded, sepMonths)
      : addMonths(input.eligible, IEP_MONTHS_AFTER_ELIGIBILITY);

  const clockStops = input.enrolled ?? today;

  return Math.max(0, monthsBetween(clockStarts, clockStops));
}

/**
 * The first day the person had no creditable drug coverage.
 *
 * Two routes in. If coverage ended, it is the day after it ended — to the
 * day, which is the whole reason the question now asks for one. If they never
 * had it, it is the first day after the Initial Enrollment Period closes, and
 * an IEP always closes on the last day of a month, so no day input is needed
 * for that path.
 */
function partDGapStart(input: PenaltyInput): CalendarDate {
  if (input.coverage === 'ended' && input.coverageEnded) {
    return nextDay(input.coverageEnded);
  }
  const iepEnds = addMonths(input.eligible, IEP_MONTHS_AFTER_ELIGIBILITY);
  return { ...addMonths(iepEnds, 1), day: 1 };
}

/**
 * The day the gap closed: the date Part D coverage began.
 *
 * Medicare coverage always starts on the first of a month, so an enrollment
 * month converts to day 1 without losing anything. Someone who has not
 * enrolled has an open gap, measured to today.
 */
function partDGapEnd(input: PenaltyInput, today: CalendarDate): CalendarDate {
  return input.enrolled ? { ...input.enrolled, day: 1 } : today;
}

/** CMS rounds penalty amounts to the nearest ten cents. */
function roundToDime(amount: number): number {
  return Math.round(amount * 10) / 10;
}

/**
 * Twelve times a dime-rounded monthly figure, re-rounded.
 *
 * `20.3 * 12` is 243.60000000000002 in binary floating point, not 243.6. Every
 * caller today happens to pass the result through `formatUsd`, which rounds it
 * away — but `yearlyPenalty` is exported, and the first place that renders it
 * raw would print a premium with fourteen decimal places to somebody already
 * worried about the number. Rounding here rather than trusting every future
 * caller to remember.
 */
function annualize(monthly: number): number {
  return roundToDime(monthly * 12);
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
    yearlyPenalty: annualize(monthlyPenalty),
    uncertain: input.coverage === 'unsure',
    stillAccruing: input.enrolled === null && months > 0,
  };
}

/**
 * Part D late enrollment penalty.
 *
 * Two steps, in this order, because they are two different rules:
 *
 *   1. Does a penalty apply at all? Yes if the gap without creditable
 *      coverage reached 63 continuous days — 42 CFR 423.46(a).
 *   2. If so, how much? 1% of the national base beneficiary premium for each
 *      FULL uncovered month in that gap — 42 CFR 423.286(d)(3). No 12-month
 *      cliff the way Part B has; every complete month counts.
 *
 * Because it is a percentage of a base premium CMS resets annually, the
 * amount someone pays moves each year rather than being frozen at the figure
 * shown here.
 */
export function estimatePartDPenalty(input: PenaltyInput, today: CalendarDate): PenaltyEstimate {
  if (input.coverage === 'throughout') {
    return {
      uncoveredMonths: 0,
      fullYears: 0,
      monthlyPenalty: 0,
      yearlyPenalty: 0,
      uncertain: false,
      stillAccruing: false,
    };
  }

  const gapStart = partDGapStart(input);
  const gapEnd = partDGapEnd(input, today);
  const gapDays = daysBetween(gapStart, gapEnd);

  // Under the trigger there is no penalty, however many partial months the
  // gap happens to touch. At or over it, every full month in the gap counts.
  const months =
    gapDays >= PART_D_TRIGGER_DAYS ? fullMonthsBetween(gapStart, gapEnd) : 0;

  const monthlyPenalty = roundToDime(
    months * PART_D_PENALTY_RATE_PER_MONTH * PART_D_BASE_PREMIUM,
  );

  return {
    uncoveredMonths: months,
    fullYears: Math.floor(months / 12),
    monthlyPenalty,
    yearlyPenalty: annualize(monthlyPenalty),
    uncertain: input.coverage === 'unsure',
    stillAccruing: input.enrolled === null && gapDays > 0,
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
