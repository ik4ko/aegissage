import 'server-only';

import type { GuardSection } from './build-guard';

import { locationLandings } from './locations';
import { planStates } from './states';
import {
  TPMO_AREAS,
  TPMO_FALLBACK_AREA,
  tpmoCountsByArea,
  type TpmoAreaKey,
} from './site';
import { GENERATED_ZIP_ROUTE_SET } from './tpmo';

/**
 * Build-time guard: keeps lib/tpmo.ts honest.
 *
 * NOTE: this module does NOT throw on import. It is one of the checks run
 * by lib/build-guard.ts, which collects from every guard and throws a
 * single combined report. Throwing here would mask whichever checks ran
 * after it — which is exactly what used to happen to this one.
 *
 * ZIP_ROUTES is a literal list because <DisclaimerFooter /> is a client
 * component and deriving it would drag 33KB of location copy into the client
 * bundle (see the note in lib/tpmo.ts). The trade is that the list can drift
 * from the routes that actually exist.
 *
 * This module closes that gap. It imports the real data server-side and
 * throws if the two disagree, which fails `next build` loudly rather than
 * shipping a ZIP-collecting page that quietly renders the wrong TPMO
 * disclaimer. Same posture as `assertLicensing()` in lib/states.ts.
 *
 * It runs at module load, and app/sitemap.ts imports it for that side effect
 * — sitemap is built on every build and already exists to enumerate routes,
 * so it is the natural place to hang a route-coverage check.
 *
 * Only the two GENERATED route families are checked. The fixed routes
 * (/about, /contact, the three tools) are hand-listed in both places and a
 * check would just compare a literal to itself.
 */
/** Returns this check's findings, or null when the lists agree. */
export function collectTpmoFailures(): GuardSection | null {
  const expected = [
    ...locationLandings.map((location) => `/medicare-${location.slug}`),
    ...planStates.map((state) => `/plans/${state.slug}`),
  ];

  const missing = expected.filter((route) => !GENERATED_ZIP_ROUTE_SET.has(route));

  /*
    The reverse direction matters just as much. A route left behind here
    after its page was deleted is not a compliance problem, but it is a lie
    about what the site does, and it is how the list rots.
  */
  const stale = [...GENERATED_ZIP_ROUTE_SET].filter((route) => !expected.includes(route));

  if (missing.length === 0 && stale.length === 0) return null;

  const lines = ['lib/tpmo.ts ZIP_ROUTES is out of sync with the pages that exist.', ''];

  if (missing.length > 0) {
    lines.push(
      'MISSING — these pages render <ContactForm />, so they collect a ZIP and',
      'require the counted TPMO disclaimer, but are not in ZIP_ROUTES:',
      ...missing.map((route) => `  + ${route}`),
      '',
    );
  }

  if (stale.length > 0) {
    lines.push(
      'STALE — these are in ZIP_ROUTES but no longer correspond to a page:',
      ...stale.map((route) => `  - ${route}`),
      '',
    );
  }

  lines.push('Add or remove them in lib/tpmo.ts so the list matches.');

  return {
    title: 'TPMO route coverage',
    count: missing.length + stale.length,
    lines,
  };
}


/* ══════════════════════════════════════════════════════════════════════════
 *  Count freshness — a WARNING, not a failure
 * ══════════════════════════════════════════════════════════════════════════
 *
 * The counts in `tpmoCountsByArea` are only as good as the day they were
 * pulled. This prints to the build log when a count:
 *
 *   - is more than 12 months old, or
 *   - predates the most recent October 1 (the standing recount date), or
 *   - has a `countDate` that does not parse.
 *
 * It also lists the areas still falling back to another area's numbers, so
 * the gap is visible on every build instead of living in a comment.
 *
 * Deliberately not a build failure: a stale count is fixed by Erekle doing a
 * Sunfire recount, and blocking every deploy until he does would also block
 * the unrelated fix that might be urgent. Erekle asked for a warning.
 */

function parseCountDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(iso);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3] ?? '1')));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function collectTpmoCountWarnings(now: Date = new Date()): string[] {
  const warnings: string[] = [];
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setUTCFullYear(now.getUTCFullYear() - 1);
  const octoberYear = now.getUTCMonth() >= 9 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  const lastOctoberFirst = new Date(Date.UTC(octoberYear, 9, 1));

  const missing: string[] = [];

  for (const key of Object.keys(tpmoCountsByArea) as TpmoAreaKey[]) {
    const count = tpmoCountsByArea[key];
    const label = TPMO_AREAS[key];
    if (!count) {
      if (key !== TPMO_FALLBACK_AREA) missing.push(label);
      else warnings.push(`${label}: no count at all. Every page renders the count-free wording.`);
      continue;
    }
    const counted = parseCountDate(count.countDate);
    if (!counted) {
      warnings.push(`${label}: countDate "${count.countDate}" is not YYYY-MM or YYYY-MM-DD.`);
      continue;
    }
    if (counted < twelveMonthsAgo) {
      warnings.push(`${label}: counted ${count.countDate}, more than 12 months ago. Recount in Sunfire.`);
    } else if (counted < lastOctoberFirst) {
      warnings.push(
        `${label}: counted ${count.countDate}, before the October 1 ${octoberYear} recount date. Recount in Sunfire.`,
      );
    }
  }

  if (missing.length > 0) {
    warnings.push(
      `No count for: ${missing.join('; ')}. Pages about these areas state the ${TPMO_AREAS[TPMO_FALLBACK_AREA]} counts.`,
    );
  }
  return warnings;
}
