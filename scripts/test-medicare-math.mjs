/**
 * Money-math regression tests for lib/medicare-costs.ts and lib/irmaa.ts.
 *
 * There is no test framework in this repo — scripts/validate-site.mjs stands in
 * as the regression suite — so this follows that convention: a plain node
 * script that exits non-zero on failure and is therefore CI-usable as-is.
 *
 * Usage:  node scripts/test-medicare-math.mjs
 *
 * ── Why this one imports the real modules instead of mirroring them ───────
 * scripts/test-digest.mjs mirrors its rules in JS because there is no TS test
 * runner here. A mirror is the wrong trade for THIS file: these two modules
 * produce dollar figures a person may act on, and a mirror can drift from the
 * source silently — the exact failure mode the tests are meant to catch.
 *
 * Node strips TypeScript types natively (22.18+ / 24+), so the real modules
 * are imported directly and every assertion below runs against shipping code.
 * The `@/` path alias is the only thing Node cannot resolve on its own, so a
 * tiny loader hook is registered for it before the dynamic imports.
 *
 * ── What earned this file ────────────────────────────────────────────────
 * Four real bugs, all in code that looked right:
 *
 *   1. Part D expressed its 63-day statutory trigger as "three whole months",
 *      on the reasoning that a longer grace was the cautious direction. It
 *      was not cautious, it was wrong: anyone with a gap between 63 and about
 *      90 days was told they owed nothing. Fixed by measuring in days, which
 *      is why `PenaltyInput.coverageEnded` carries one.
 *   2. On the 'ended' path that approximation was applied TWICE — three
 *      months moving the clock start, then three more zeroing the result —
 *      for roughly six months of grace against a statutory 63 days.
 *   3. IRMAA's married-filing-separately table was missing its top bracket.
 *   4. IRMAA treated every bracket ceiling as inclusive, when SSA closes the
 *      top brackets with "greater than or equal to" — putting a MAGI of
 *      exactly $500,000 / $750,000 / $391,000 one bracket too low.
 *
 * A fifth was found here and is worth recording because it is the trap this
 * whole area sets: an intermediate "fix" for (2) removed the second
 * application but left the first, which made the 'never' path start charging
 * from day one and OVER-stated short gaps. Both directions of that error are
 * pinned below. Neither the month-shaped grace nor the month-shaped trigger
 * should come back.
 *
 * Each has a named test below. Do not delete them to make a change pass.
 */

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = pathToFileURL(resolvePath(dirname(fileURLToPath(import.meta.url)), '..') + '/').href;

// Teaches Node the `@/…` alias from tsconfig, and the extensionless imports
// TypeScript allows. Registered as a data: URL so this stays a single file.
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      const ROOT = ${JSON.stringify(ROOT)};
      export async function resolve(specifier, context, next) {
        if (specifier.startsWith('@/')) {
          const url = new URL(specifier.slice(2), ROOT).href;
          return next(/\\.[a-z]+$/.test(url) ? url : url + '.ts', context);
        }
        return next(specifier, context);
      }
    `),
  import.meta.url,
);

const {
  COSTS_YEAR,
  PART_B_STANDARD_PREMIUM,
  PART_B_PENALTY_RATE_PER_YEAR,
  PART_D_BASE_PREMIUM,
  PART_D_PENALTY_RATE_PER_MONTH,
  PART_D_TRIGGER_DAYS,
  addMonths,
  monthsBetween,
  daysBetween,
  daysInMonth,
  nextDay,
  fullMonthsBetween,
  estimatePartBPenalty,
  estimatePartDPenalty,
  partBMonthlyPremium,
  partDPenaltyForFullMonths,
} = await import('../lib/medicare-costs.ts');

const {
  IRMAA_YEAR,
  IRMAA_MAGI_YEAR,
  IRMAA_TIERS,
  IRMAA_TIERS_SEPARATE,
  estimateIrmaa,
  formatMagiRange,
} = await import('../lib/irmaa.ts');

let failures = 0;
let checks = 0;

function check(label, actual, expected) {
  checks++;
  const ok = Object.is(actual, expected);
  if (!ok) {
    failures++;
    console.error(`FAIL  ${label}\n        got=${actual}  want=${expected}`);
  }
}

function section(name) {
  console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 60 - name.length))}`);
}

// ═════════════════════════════════════════════════════════════════════════
//  PART 1 — Published figures
// ═════════════════════════════════════════════════════════════════════════
// Cross-checked against the CMS November 2025 release, SSA POMS HI 01101.020
// and the RRB 2026 premium notice. If CMS publishes new figures, these are
// the lines to update — and updating them is the signal to re-read both
// files' November banners.

section('Published constants');
check('Part B standard premium', PART_B_STANDARD_PREMIUM, 202.9);
check('Part D base beneficiary premium', PART_D_BASE_PREMIUM, 38.99);
check('Part B penalty rate per full year', PART_B_PENALTY_RATE_PER_YEAR, 0.1);
check('Part D penalty rate per month', PART_D_PENALTY_RATE_PER_MONTH, 0.01);
check('Part D trigger in days (42 CFR 423.46(a))', PART_D_TRIGGER_DAYS, 63);
check('IRMAA lookback is exactly two years', IRMAA_YEAR - IRMAA_MAGI_YEAR, 2);
check('Both modules describe the same plan year', COSTS_YEAR, IRMAA_YEAR);

section('Required 2026 Part D full-month outputs');
for (const [months, expected] of [[0, 0], [1, 0.4], [2, 0.8], [14, 5.5], [29, 11.3]]) {
  check(`${months} full uncovered months`, partDPenaltyForFullMonths(months), expected);
}
check('official 14-month example is $5.50', partDPenaltyForFullMonths(14), 5.5);

// ═════════════════════════════════════════════════════════════════════════
//  PART 2 — Calendar helpers
// ═════════════════════════════════════════════════════════════════════════

section('Calendar arithmetic');
check('addMonths rolls the year forward', addMonths({ year: 2020, month: 12 }, 1).year, 2021);
check('addMonths rolls the month forward', addMonths({ year: 2020, month: 12 }, 1).month, 1);
check('addMonths rolls the year back', addMonths({ year: 2020, month: 1 }, -1).year, 2019);
check('addMonths rolls the month back', addMonths({ year: 2020, month: 1 }, -1).month, 12);
check('addMonths spans multiple years', addMonths({ year: 2020, month: 6 }, 30).year, 2022);
check('addMonths keeps the month on a span', addMonths({ year: 2020, month: 6 }, 30).month, 12);
check('monthsBetween counts forward', monthsBetween({ year: 2020, month: 1 }, { year: 2021, month: 1 }), 12);
check('monthsBetween goes negative backwards', monthsBetween({ year: 2021, month: 1 }, { year: 2020, month: 1 }), -12);

section('Day arithmetic — the Part D trigger depends on it');
check('daysInMonth February, common year', daysInMonth(2023, 2), 28);
check('daysInMonth February, leap year', daysInMonth(2024, 2), 29);
check('daysInMonth February, 2000 (divisible by 400)', daysInMonth(2000, 2), 29);
check('daysInMonth February, 1900 (divisible by 100, not 400)', daysInMonth(1900, 2), 28);
check('daysInMonth April', daysInMonth(2024, 4), 30);
check('daysInMonth December', daysInMonth(2024, 12), 31);
check('daysBetween across a month', daysBetween({ year: 2024, month: 1, day: 1 }, { year: 2024, month: 2, day: 1 }), 31);
check('daysBetween across a leap day', daysBetween({ year: 2024, month: 2, day: 1 }, { year: 2024, month: 3, day: 1 }), 29);
check('daysBetween across a year', daysBetween({ year: 2023, month: 1, day: 1 }, { year: 2024, month: 1, day: 1 }), 365);
// A local-time subtraction across a US DST change returns 30.958…, which
// floors to 30 and can flip a 63-day gap to 62. UTC has no such boundary.
check('daysBetween is DST-proof (March)', daysBetween({ year: 2024, month: 3, day: 1 }, { year: 2024, month: 3, day: 31 }), 30);
check('daysBetween is DST-proof (November)', daysBetween({ year: 2024, month: 11, day: 1 }, { year: 2024, month: 12, day: 1 }), 30);
check('daysBetween goes negative backwards', daysBetween({ year: 2024, month: 2, day: 1 }, { year: 2024, month: 1, day: 1 }), -31);
check('nextDay rolls a month', nextDay({ year: 2024, month: 1, day: 31 }).month, 2);
check('nextDay rolls to day 1', nextDay({ year: 2024, month: 1, day: 31 }).day, 1);
check('nextDay handles Feb 29', nextDay({ year: 2024, month: 2, day: 29 }).month, 3);
check('nextDay rolls the year', nextDay({ year: 2024, month: 12, day: 31 }).year, 2025);
check('fullMonthsBetween whole months', fullMonthsBetween({ year: 2024, month: 1, day: 1 }, { year: 2024, month: 4, day: 1 }), 3);
// A month the person held coverage part-way through is not an uncovered month.
check('fullMonthsBetween drops a partial month', fullMonthsBetween({ year: 2024, month: 1, day: 16 }, { year: 2024, month: 4, day: 1 }), 2);
check('fullMonthsBetween never goes negative', fullMonthsBetween({ year: 2024, month: 4, day: 1 }, { year: 2024, month: 1, day: 1 }), 0);

// ═════════════════════════════════════════════════════════════════════════
//  PART 3 — Part B late enrollment penalty
// ═════════════════════════════════════════════════════════════════════════

const TODAY = { year: 2026, month: 6, day: 15 };
const ELIGIBLE = { year: 2020, month: 1 }; // IEP therefore ends April 2020.

const partB = (over) =>
  estimatePartBPenalty({ eligible: ELIGIBLE, coverage: 'never', enrolled: null, ...over }, TODAY);

section('Part B — the 12-month cliff');
// The penalty charges only COMPLETE 12-month periods. Eleven months costs
// nothing; thirteen costs a full 10%. Both edges are asserted because a
// `<` where a `<=` belongs moves the whole curve by a month.
check('enrolled on the last IEP month → 0 months', partB({ enrolled: { year: 2020, month: 4 } }).uncoveredMonths, 0);
check('enrolled on the last IEP month → no penalty', partB({ enrolled: { year: 2020, month: 4 } }).monthlyPenalty, 0);
check('11 months late → 0 full years', partB({ enrolled: { year: 2021, month: 3 } }).fullYears, 0);
check('11 months late → still no penalty', partB({ enrolled: { year: 2021, month: 3 } }).monthlyPenalty, 0);
check('exactly 12 months late → 1 full year', partB({ enrolled: { year: 2021, month: 4 } }).fullYears, 1);
check('exactly 12 months late → 10% of the premium', partB({ enrolled: { year: 2021, month: 4 } }).monthlyPenalty, 20.3);
check('13 months late → still 1 full year', partB({ enrolled: { year: 2021, month: 5 } }).fullYears, 1);
check('23 months late → still 1 full year', partB({ enrolled: { year: 2022, month: 3 } }).fullYears, 1);
check('24 months late → 2 full years', partB({ enrolled: { year: 2022, month: 4 } }).fullYears, 2);
check('24 months late → 20% of the premium', partB({ enrolled: { year: 2022, month: 4 } }).monthlyPenalty, 40.6);
check('24 months late → $243.50 total Part B premium', partBMonthlyPremium(partB({ enrolled: { year: 2022, month: 4 } }).monthlyPenalty), 243.5);
check('36 months late → 30% penalty', partB({ enrolled: { year: 2023, month: 4 } }).monthlyPenalty, 60.9);
check('yearly is twelve times monthly', partB({ enrolled: { year: 2022, month: 4 } }).yearlyPenalty, 487.2);

section('Part B — protective coverage');
check('coverage throughout → no penalty', partB({ coverage: 'throughout' }).monthlyPenalty, 0);
check('coverage throughout → zero months even if never enrolled', partB({ coverage: 'throughout' }).uncoveredMonths, 0);
// An 8-month SEP follows the end of employer coverage.
const endedB = { coverage: 'ended', coverageEnded: { year: 2023, month: 1 } };
check('inside the 8-month SEP → no penalty', partB({ ...endedB, enrolled: { year: 2023, month: 9 } }).uncoveredMonths, 0);
check('one month past the SEP → 1 month', partB({ ...endedB, enrolled: { year: 2023, month: 10 } }).uncoveredMonths, 1);
check('one month past the SEP → still under the cliff', partB({ ...endedB, enrolled: { year: 2023, month: 10 } }).monthlyPenalty, 0);
check('unsure is flagged as a worst case', partB({ coverage: 'unsure' }).uncertain, true);
check('not yet enrolled is flagged as still accruing', partB({ enrolled: null }).stillAccruing, true);
check('enrolled is not still accruing', partB({ enrolled: { year: 2021, month: 4 } }).stillAccruing, false);

// ═════════════════════════════════════════════════════════════════════════
//  PART 4 — Part D late enrollment penalty
// ═════════════════════════════════════════════════════════════════════════

const partD = (over) =>
  estimatePartDPenalty({ eligible: ELIGIBLE, coverage: 'never', enrolled: null, ...over }, TODAY);

// ── The 63-day trigger, to the day ───────────────────────────────────────
// 42 CFR 423.46(a): "a continuous period of 63 days or longer". This is a
// trigger, not a deductible — under it nothing is owed, at or over it every
// FULL month in the gap is charged, including months inside the first 63
// days. The step at the boundary is in the regulation.
//
// Coverage ends 31 Jan 2023, so the first uncovered day is 1 Feb 2023.
section('Part D — the 63-day trigger (42 CFR 423.46(a))');
const endedJan = { coverage: 'ended', coverageEnded: { year: 2023, month: 1, day: 31 } };
// Feb 1 → Apr 1 is 59 days. Under the trigger.
check('59-day gap → no penalty', partD({ ...endedJan, enrolled: { year: 2023, month: 4 } }).monthlyPenalty, 0);
check('59-day gap → no months counted', partD({ ...endedJan, enrolled: { year: 2023, month: 4 } }).uncoveredMonths, 0);
// Feb 1 → May 1 is 89 days. Over the trigger; Feb, Mar and Apr are full.
check('89-day gap → penalty applies', partD({ ...endedJan, enrolled: { year: 2023, month: 5 } }).uncoveredMonths, 3);
check('89-day gap → 3% of the base premium', partD({ ...endedJan, enrolled: { year: 2023, month: 5 } }).monthlyPenalty, 1.2);

// Exact-boundary pair. Coverage ends 30 Jun 2023 → first uncovered day is
// 1 Jul. 1 Jul → 1 Sep is 62 days; 1 Jul → 2 Sep is 63.
section('Part D — the boundary is "63 or longer", not "more than 63"');
const endedJun = { coverage: 'ended', coverageEnded: { year: 2023, month: 6, day: 30 } };
check(
  'REGRESSION 62-day gap is under the trigger',
  estimatePartDPenalty({ eligible: ELIGIBLE, ...endedJun, enrolled: null }, { year: 2023, month: 9, day: 1 }).uncoveredMonths,
  0,
);
check(
  'REGRESSION 63-day gap TRIGGERS — the exact statutory edge',
  estimatePartDPenalty({ eligible: ELIGIBLE, ...endedJun, enrolled: null }, { year: 2023, month: 9, day: 2 }).uncoveredMonths,
  2,
);

// ── REGRESSION: the 70-day gap that used to report zero ──────────────────
// The three-month approximation this replaced told anyone with a gap between
// 63 and ~90 days that they owed nothing. Coverage ends 31 Mar 2023 → first
// uncovered day 1 Apr; measured at 10 Jun 2023 that is 70 days.
section('Part D — REGRESSION: the 70-day gap');
const ended70 = { eligible: ELIGIBLE, coverage: 'ended', coverageEnded: { year: 2023, month: 3, day: 31 }, enrolled: null };
check('70-day gap is over the trigger', daysBetween({ year: 2023, month: 4, day: 1 }, { year: 2023, month: 6, day: 10 }), 70);
check('REGRESSION 70-day gap is NOT zero', estimatePartDPenalty(ended70, { year: 2023, month: 6, day: 10 }).uncoveredMonths, 2);
check('REGRESSION 70-day gap is charged', estimatePartDPenalty(ended70, { year: 2023, month: 6, day: 10 }).monthlyPenalty, 0.8);

// ── REGRESSION: the day field actually changes the answer ────────────────
// Same month, different day. Ending on the 1st opens a 91-day gap; ending on
// the 30th opens a 62-day one. If these two agree, the day is being ignored.
section('Part D — REGRESSION: day precision is real');
const asOf = { year: 2023, month: 9, day: 1 };
const endedEarly = { eligible: ELIGIBLE, coverage: 'ended', coverageEnded: { year: 2023, month: 6, day: 1 }, enrolled: null };
const endedLate = { eligible: ELIGIBLE, coverage: 'ended', coverageEnded: { year: 2023, month: 6, day: 30 }, enrolled: null };
check('ended on the 1st → triggered', estimatePartDPenalty(endedEarly, asOf).uncoveredMonths, 2);
check('ended on the 30th → not triggered', estimatePartDPenalty(endedLate, asOf).uncoveredMonths, 0);
check(
  'REGRESSION the two differ, so the day is not being dropped',
  estimatePartDPenalty(endedEarly, asOf).monthlyPenalty === estimatePartDPenalty(endedLate, asOf).monthlyPenalty,
  false,
);

section('Part D — never held creditable coverage');
// IEP ends 30 Apr 2020, so the first uncovered day is 1 May 2020.
check('enrolled the month IEP ends → no gap', partD({ enrolled: { year: 2020, month: 5 } }).uncoveredMonths, 0);
// May 1 → Jul 1 is 61 days: under the trigger.
check('61-day gap → no penalty', partD({ enrolled: { year: 2020, month: 7 } }).monthlyPenalty, 0);
// May 1 → Aug 1 is 92 days: over it, and May, Jun, Jul are full months.
check('92-day gap → 3 months', partD({ enrolled: { year: 2020, month: 8 } }).uncoveredMonths, 3);
check('12 months late', partD({ enrolled: { year: 2021, month: 5 } }).uncoveredMonths, 12);
check('12 months late → 12% of the base premium', partD({ enrolled: { year: 2021, month: 5 } }).monthlyPenalty, 4.7);
check('yearly is twelve times monthly', partD({ enrolled: { year: 2021, month: 5 } }).yearlyPenalty, 56.4);
check('coverage throughout → no penalty', partD({ coverage: 'throughout' }).monthlyPenalty, 0);
check('Extra Help → no Part D penalty', partD({ extraHelp: true }).monthlyPenalty, 0);
check('coverage throughout → not still accruing', partD({ coverage: 'throughout' }).stillAccruing, false);

// ═════════════════════════════════════════════════════════════════════════
//  PART 5 — Penalty input edge cases
// ═════════════════════════════════════════════════════════════════════════
// Every one of these must resolve to zero rather than a negative penalty, a
// NaN, or a number rendered as "$NaN" to somebody already anxious.

section('Penalty edge cases');
check('enrolled before eligible → 0 months', partB({ enrolled: { year: 2019, month: 1 } }).uncoveredMonths, 0);
check('enrolled before eligible → no negative penalty', partB({ enrolled: { year: 2019, month: 1 } }).monthlyPenalty, 0);
check('eligibility in the future → 0 months', partB({ eligible: { year: 2050, month: 1 }, enrolled: null }).uncoveredMonths, 0);
check('coverage ended after enrolling → 0 months', partB({ coverage: 'ended', coverageEnded: { year: 2025, month: 1, day: 31 }, enrolled: { year: 2021, month: 1 } }).uncoveredMonths, 0);
check('Part D: coverage ended after enrolling → 0 months', partD({ coverage: 'ended', coverageEnded: { year: 2025, month: 1, day: 31 }, enrolled: { year: 2021, month: 1 } }).uncoveredMonths, 0);
check('Part D: eligibility in the future → 0 months', partD({ eligible: { year: 2050, month: 1 }, enrolled: null }).uncoveredMonths, 0);
check("Part D: 'ended' with no date falls back to the IEP clock", partD({ coverage: 'ended', enrolled: { year: 2021, month: 5 } }).uncoveredMonths, 12);
check('ended without a date falls back to the IEP clock', partB({ coverage: 'ended', enrolled: { year: 2021, month: 4 } }).uncoveredMonths, 12);
check('Part B penalty is never NaN', Number.isNaN(partB({ enrolled: null }).monthlyPenalty), false);
check('Part D penalty is never NaN', Number.isNaN(partD({ enrolled: null }).monthlyPenalty), false);
check('Part B penalty is never negative', partB({ enrolled: { year: 2019, month: 1 } }).monthlyPenalty >= 0, true);
check('Part D penalty is never negative', partD({ enrolled: { year: 2019, month: 1 } }).monthlyPenalty >= 0, true);

// ═════════════════════════════════════════════════════════════════════════
//  PART 6 — IRMAA brackets
// ═════════════════════════════════════════════════════════════════════════

section('IRMAA — table integrity');
for (const [status, tiers] of Object.entries(IRMAA_TIERS)) {
  for (let i = 0; i < tiers.length - 1; i++) {
    check(`${status}: tier ${i} abuts tier ${i + 1} with no gap`, tiers[i].maxMagi + 1, tiers[i + 1].minMagi);
  }
  check(`${status}: top tier has no ceiling`, tiers.at(-1).maxMagi, null);
  check(`${status}: first tier starts at zero`, tiers[0].minMagi, 0);
  check(`${status}: first tier has no surcharge`, tiers[0].partBSurcharge, 0);
}

section('IRMAA — inclusive ceilings on the middle rows');
// SSA writes these rows as "more than $X but less than or equal to $Y", so
// the published figure belongs to the LOWER bracket.
check('single $109,000 is standard', estimateIrmaa(109000, 'single').tierIndex, 0);
check('single $109,001 is tier 1', estimateIrmaa(109001, 'single').tierIndex, 1);
check('single $137,000 is still tier 1', estimateIrmaa(137000, 'single').tierIndex, 1);
check('single $137,001 is tier 2', estimateIrmaa(137001, 'single').tierIndex, 2);
check('single $171,000 is still tier 2', estimateIrmaa(171000, 'single').tierIndex, 2);
check('single $205,000 is still tier 3', estimateIrmaa(205000, 'single').tierIndex, 3);
check('joint $218,000 is standard', estimateIrmaa(218000, 'joint').tierIndex, 0);
check('joint $274,000 is still tier 1', estimateIrmaa(274000, 'joint').tierIndex, 1);
check('joint $410,000 is still tier 3', estimateIrmaa(410000, 'joint').tierIndex, 3);

section('IRMAA — REGRESSION: exclusive ceilings on the top rows');
// SSA closes the top bracket with "greater than or equal to", so the round
// published figure belongs to the HIGHER bracket. Treating these like the
// rows above put someone at exactly $500,000 one bracket too low.
check('REGRESSION single $499,999 is tier 4', estimateIrmaa(499999, 'single').tierIndex, 4);
check('REGRESSION single $500,000 is the TOP tier', estimateIrmaa(500000, 'single').tierIndex, 5);
check('REGRESSION joint $749,999 is tier 4', estimateIrmaa(749999, 'joint').tierIndex, 4);
check('REGRESSION joint $750,000 is the TOP tier', estimateIrmaa(750000, 'joint').tierIndex, 5);
check('REGRESSION separate $390,999 is the cliff tier', estimateIrmaa(390999, 'separate').tierIndex, 1);
check('REGRESSION separate $391,000 is the TOP tier', estimateIrmaa(391000, 'separate').tierIndex, 2);

section('IRMAA — REGRESSION: married filing separately has three tiers');
// An earlier draft stopped at two and would have under-reported the top
// MFS bracket by $40.70/mo on Part B and $7.70/mo on Part D.
check('REGRESSION separate tier count', IRMAA_TIERS_SEPARATE.length, 3);
check('REGRESSION separate top bracket exists', IRMAA_TIERS_SEPARATE.at(-1).partBSurcharge, 487.0);
check('REGRESSION separate top Part D surcharge', IRMAA_TIERS_SEPARATE.at(-1).partDSurcharge, 91.0);
check('separate skips straight to the tier-4 surcharge', estimateIrmaa(110000, 'separate').partBSurcharge, 446.3);

section('IRMAA — Part B totals reconcile to the published figures');
// SSA and RRB publish Part B TOTALS; this module stores surcharges. If these
// disagree, one of the two is wrong and the tool is quoting a bad premium.
check('single tier 1 total', estimateIrmaa(120000, 'single').partBPremium, 284.1);
check('single tier 2 total', estimateIrmaa(150000, 'single').partBPremium, 405.8);
check('single tier 3 total', estimateIrmaa(190000, 'single').partBPremium, 527.5);
check('single tier 4 total', estimateIrmaa(300000, 'single').partBPremium, 649.2);
check('single top total', estimateIrmaa(600000, 'single').partBPremium, 689.9);
check('joint tier 1 total', estimateIrmaa(250000, 'joint').partBPremium, 284.1);
check('joint top total', estimateIrmaa(800000, 'joint').partBPremium, 689.9);
check('separate cliff total', estimateIrmaa(200000, 'separate').partBPremium, 649.2);
check('separate top total', estimateIrmaa(400000, 'separate').partBPremium, 689.9);
check('standard tier pays exactly the standard premium', estimateIrmaa(50000, 'single').partBPremium, PART_B_STANDARD_PREMIUM);

section('IRMAA — combined figures and distance to the next bracket');
const t1 = estimateIrmaa(120000, 'single');
check('monthly surcharge', t1.monthlySurcharge, 95.7);
check('yearly surcharge', t1.yearlySurcharge, 1148.4);
check('monthly total', t1.monthlyTotal, 298.6);
check('yearly total', t1.yearlyTotal, 3583.2);

const near = estimateIrmaa(105800, 'single');
check('next bracket starts one dollar over the threshold', near.nextTierAt, 109001);
check('distance to the next bracket', near.amountUnderNextTier, 3201);
check('what the next bracket would cost', near.nextTierMonthlySurcharge, 95.7);
check('standard tier is flagged', near.isStandard, true);
check('standard tier is not the top', near.isTopTier, false);

const topJ = estimateIrmaa(900000, 'joint');
check('top bracket has no next threshold', topJ.nextTierAt, null);
check('top bracket has no distance', topJ.amountUnderNextTier, null);
check('top bracket has no next cost', topJ.nextTierMonthlySurcharge, null);
check('top bracket is flagged', topJ.isTopTier, true);

// ═════════════════════════════════════════════════════════════════════════
//  PART 7 — IRMAA input edge cases
// ═════════════════════════════════════════════════════════════════════════

section('IRMAA edge cases');
check('zero income is standard', estimateIrmaa(0, 'single').tierIndex, 0);
check('negative income is standard', estimateIrmaa(-5000, 'single').tierIndex, 0);
check('NaN means nothing typed → standard', estimateIrmaa(NaN, 'single').tierIndex, 0);
// Infinity must clamp UPWARD. Resolving it to zero would answer an absurdly
// high income with the cheapest bracket on the table.
check('REGRESSION Infinity clamps to the top tier', estimateIrmaa(Infinity, 'single').tierIndex, 5);
check('-Infinity is standard', estimateIrmaa(-Infinity, 'single').tierIndex, 0);
check('cents floor downward, never up a bracket', estimateIrmaa(109000.99, 'single').tierIndex, 0);
check('cents just over the line still count', estimateIrmaa(109001.01, 'single').tierIndex, 1);
check('MAX_SAFE_INTEGER lands in the top tier', estimateIrmaa(Number.MAX_SAFE_INTEGER, 'joint').tierIndex, 5);
for (const status of ['single', 'joint', 'separate']) {
  check(`${status}: no input yields NaN dollars`, Number.isNaN(estimateIrmaa(NaN, status).monthlyTotal), false);
  check(`${status}: surcharge is never negative`, estimateIrmaa(0, status).monthlySurcharge >= 0, true);
}

section('IRMAA — range labels stay literal');
// These must NOT be rounded to the published figure. A row reading
// "$205,001 – $499,999" is the point: $500,000 is not in it.
check('standard row', formatMagiRange(IRMAA_TIERS.single[0]), '$109,000 or less');
check('exclusive ceiling shown literally', formatMagiRange(IRMAA_TIERS.single[4]), '$205,001 – $499,999');
check('open-ended top row', formatMagiRange(IRMAA_TIERS.single[5]), '$500,000 and above');
check('separate cliff row', formatMagiRange(IRMAA_TIERS_SEPARATE[1]), '$109,001 – $390,999');

// ═════════════════════════════════════════════════════════════════════════

console.log(
  failures === 0
    ? `\n✓ ${checks} checks passed.`
    : `\n✗ ${failures} of ${checks} checks FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
