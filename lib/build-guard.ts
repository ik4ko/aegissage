import 'server-only';

import { collectContentFailures } from './content-guard';
import { collectTpmoFailures } from './tpmo-guard';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  BUILD GUARD — the single mount point for every build-time assertion
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  app/sitemap.ts imports this module for its side effect. It is the only
 *  import either guard needs, and sitemap is the natural host because it is
 *  built on every build and already exists to enumerate every route.
 *
 *  ── Why the checks collect instead of throwing ───────────────────────────
 *  Each guard used to throw at module load. Because the content guard was
 *  imported first, a content problem short-circuited the whole file and the
 *  TPMO route check never ran — you fixed the frontmatter, rebuilt, and only
 *  then discovered a route was missing from ZIP_ROUTES. Two build cycles to
 *  learn two things.
 *
 *  So every check now RETURNS its findings and this module throws once, with
 *  everything. One build tells you every problem, across every check. The
 *  same rule applies inside each guard: they accumulate across all files and
 *  routes rather than stopping at the first offender.
 *
 *  ADDING A CHECK: export a `collect*` that returns a GuardSection or null,
 *  add it to CHECKS below, and it joins the combined report automatically.
 *  Do not throw from a guard module at import time — that reintroduces
 *  exactly the masking this exists to prevent.
 * ══════════════════════════════════════════════════════════════════════════
 */

/**
 * One check's findings.
 *
 * `count` is the number of distinct problems, tracked separately because
 * `lines` is presentation — it carries blank lines, per-file headings and
 * indentation that would make a line count meaningless.
 */
export type GuardSection = {
  /** Short name of the check, used as the section heading. */
  title: string;
  /** How many distinct problems this check found. */
  count: number;
  /** Pre-formatted report body. */
  lines: string[];
};

const CHECKS: ReadonlyArray<() => GuardSection | null> = [
  collectContentFailures,
  collectTpmoFailures,
];

function runBuildGuards(): void {
  /*
    Every check runs, unconditionally, before anything is thrown. A check that
    itself blows up is reported as a failed check rather than being allowed to
    take down the guards that would have passed — otherwise a bug in one
    validator hides the findings of all the others, which is the same masking
    problem in a different costume.
  */
  const sections: GuardSection[] = [];

  for (const check of CHECKS) {
    try {
      const section = check();
      if (section) sections.push(section);
    } catch (error) {
      sections.push({
        title: `${check.name} (check itself failed)`,
        count: 1,
        lines: [`  ✗ ${(error as Error).message}`],
      });
    }
  }

  if (sections.length === 0) return;

  const total = sections.reduce((sum, section) => sum + section.count, 0);

  const lines = [
    `Build guard failed: ${total} problem(s) across ${sections.length} of ` +
      `${CHECKS.length} check(s).`,
    '',
  ];

  for (const section of sections) {
    lines.push(
      `── ${section.title} ${'─'.repeat(Math.max(0, 68 - section.title.length))}`,
      '',
      ...section.lines,
      '',
    );
  }

  throw new Error(lines.join('\n'));
}

runBuildGuards();
