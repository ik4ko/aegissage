import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import type { GuardSection } from './build-guard';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  BUILD-TIME EDITORIAL GUARD — every content file, every rule, one pass
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  This FAILS THE BUILD. It does not warn. A warning in a build log is a
 *  warning nobody reads, and the things checked here — an unreviewed piece, a
 *  piece past its expiry, a plan-specific claim with no citation — are the
 *  kind of thing a CMS audit asks about. Fail closed.
 *
 *  It is one of the checks run by lib/build-guard.ts, which app/sitemap.ts
 *  imports for its side effect. There is deliberately no separate npm script:
 *  a check that has to be remembered is a check that gets skipped.
 *
 *  This module does NOT throw on import. It returns its findings so that
 *  build-guard can print them alongside every other check's — a guard that
 *  throws at import time masks the guards that come after it.
 *
 *  ── Why this re-reads the files instead of calling getAllArticles() ──────
 *  `parseFile()` in lib/content.ts THROWS on the first malformed file. That
 *  is right for the render path and useless for a report — you would fix one
 *  file, rebuild, and meet the next error. The requirement here is every
 *  failure with its path and reason, so this reads the frontmatter itself and
 *  accumulates.
 *
 *  It still derives WHICH files to check from the same rule the loader uses
 *  (content/<collection>/*.mdx, `.mdx` only), so the guard cannot drift from
 *  what actually renders. That filter is also what keeps _TEMPLATE.md out: it
 *  is `.md` documentation with no frontmatter, and validating it would be
 *  eight spurious failures. If the template is ever renamed to `.mdx` it
 *  becomes a real content file and will be held to these rules — which is the
 *  correct outcome, not a bug.
 * ══════════════════════════════════════════════════════════════════════════
 */

const CONTENT_ROOT = path.join(process.cwd(), 'content');
const COLLECTIONS = ['medicare-basics', 'blog', 'news'] as const;

/** Every field that must be present and non-empty on every content item. */
const REQUIRED_FIELDS = [
  'title',
  'description',
  'author',
  'published',
  'updated',
  'reviewed_by',
  'status',
  'expires_on',
] as const;

const APPROVED_STATUS = 'approved';

/**
 * Patterns that indicate a PLAN-SPECIFIC claim, not Medicare education.
 *
 * ── Why these are narrow, and why they are only a cross-check ─────────────
 * The obvious implementation — flag any file mentioning "premium", "benefit"
 * or "star rating" — matches 10 of the 13 files in this repo, almost all of
 * them for generic teaching copy like "Medigap generally means a higher
 * monthly premium". Demanding a citation for that sentence is noise, and a
 * guard that cries wolf is a guard people learn to route around.
 *
 * So the AUTHORITY is the `makes_plan_claim` flag in frontmatter: the writer
 * declares it, and the guard then requires `source_url` and `review_date`.
 * These patterns
 * exist to catch a MISSING declaration, and are therefore deliberately tuned
 * to things that cannot be generic:
 *
 *   - a dollar figure sitting next to premium/benefit/allowance wording
 *   - an explicit N-star rating
 *   - a named carrier
 *   - a specific enrollment headcount
 *
 * A bare "$" or a bare "premium" is NOT enough and must not be added here.
 * Every loosening of these patterns costs a false positive, and false
 * positives are what get a build guard disabled.
 */
const PLAN_CLAIM_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [
    /\$\s?[\d,]+(?:\.\d{2})?\s*(?:\/\s*(?:mo|month))?\s+(?:monthly\s+)?(?:premium|benefit|allowance|copay|deductible)/i,
    'a dollar figure attached to a premium, benefit, allowance, copay or deductible',
  ],
  [
    /(?:premium|benefit|allowance|copay|deductible)\s+of\s+\$\s?[\d,]+/i,
    'a premium, benefit, allowance, copay or deductible quoted as a dollar figure',
  ],
  [/\b[0-5](?:\.5)?[\s-]?stars?\b/i, 'a star rating'],
  [/\bstar rating of\b/i, 'a star rating'],
  [
    /\b(?:Humana|Aetna|UnitedHealthcare|United Healthcare|Cigna|Wellcare|Elevance|Anthem|Kaiser Permanente|Devoted Health|Clover Health)\b/i,
    'a named carrier',
  ],
  [
    /\b[\d,]{4,}\s+(?:people\s+)?(?:enrolled|enrollees|beneficiaries|members)\b/i,
    'a specific enrollment figure',
  ],
];

type Failure = { file: string; reason: string };

/**
 * gray-matter runs YAML, so `expires_on: 2027-01-01` unquoted arrives as a JS
 * Date while `expires_on: "2027-01-01"` arrives as a string. Both spellings
 * are legitimate YAML and a writer should not have to know the difference, so
 * normalise before validating rather than rejecting one of them.
 */
function asDateString(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value.trim();
  return null;
}

/** Strict YYYY-MM-DD, and a date that actually exists — Feb 30 is not one. */
function parseIsoDate(value: unknown): Date | null {
  const text = asDateString(value);
  if (!text || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;

  const parsed = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;

  // Round-trip catches values that are well-formed but not real dates:
  // `2026-02-30` silently parses to March 2 without this.
  if (parsed.toISOString().slice(0, 10) !== text) return null;
  return parsed;
}

/**
 * UTC midnight today.
 *
 * Both the expiry check and the review_date check compare against this, so a
 * build straddling midnight cannot judge one field against one day and the
 * next field against another.
 */
function todayUtcMs(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/** Files to check — the same set lib/content.ts renders from. */
function contentFiles(): string[] {
  const files: string[] = [];
  for (const collection of COLLECTIONS) {
    const dir = path.join(CONTENT_ROOT, collection);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).sort()) {
      if (name.endsWith('.mdx')) files.push(`content/${collection}/${name}`);
    }
  }
  return files;
}

function checkFile(relPath: string, failures: Failure[]): void {
  const add = (reason: string) => failures.push({ file: relPath, reason });

  let data: Record<string, unknown>;
  let body: string;
  try {
    const parsed = matter(fs.readFileSync(path.join(process.cwd(), relPath), 'utf8'));
    data = parsed.data as Record<string, unknown>;
    body = parsed.content;
  } catch (error) {
    add(`frontmatter could not be parsed — ${(error as Error).message}`);
    return;
  }

  // ── Presence ────────────────────────────────────────────────────────────
  for (const field of REQUIRED_FIELDS) {
    if (isBlank(data[field])) {
      add(`missing or empty required field \`${field}\``);
    }
  }

  // ── status ──────────────────────────────────────────────────────────────
  const status = typeof data.status === 'string' ? data.status.trim() : '';
  if (status !== '' && status !== APPROVED_STATUS) {
    add(`status is "${status}" — only "${APPROVED_STATUS}" may ship`);
  }

  /*
    Dates are validated independently of each other so one bad value does not
    mask the rest. `published` being unparseable is its own failure AND stops
    the ordering comparison below, but `expires_on` is still checked on the
    same pass — the writer sees every date problem in the file at once.
  */
  const published = parseIsoDate(data.published);
  const updated = parseIsoDate(data.updated);
  const expiresOn = parseIsoDate(data.expires_on);

  const shown = (v: unknown) => String(asDateString(v) ?? v);

  if (!isBlank(data.published) && !published) {
    add(`published "${shown(data.published)}" is not a valid ISO date (YYYY-MM-DD)`);
  }
  if (!isBlank(data.updated) && !updated) {
    add(`updated "${shown(data.updated)}" is not a valid ISO date (YYYY-MM-DD)`);
  }
  if (!isBlank(data.expires_on) && !expiresOn) {
    add(`expires_on "${shown(data.expires_on)}" is not a valid ISO date (YYYY-MM-DD)`);
  }

  if (published && updated && updated.getTime() < published.getTime()) {
    add(
      `updated (${shown(data.updated)}) is earlier than published (${shown(data.published)})`,
    );
  }

  /*
    Expiry is compared against UTC midnight today, so a piece expiring today
    is still valid for the whole of today rather than dying the moment the
    build machine crosses midnight in whatever zone it happens to run in.
  */
  const todayUtc = todayUtcMs();

  if (expiresOn) {
    if (expiresOn.getTime() < todayUtc) {
      add(
        `expires_on ${shown(data.expires_on)} is in the past — re-review the ` +
          'piece and extend it, or unpublish it',
      );
    }
  }

  /*
    ── Plan-specific claims: source_url + review_date ──────────────────────
    CLAUDE.md, under "Compliance — never violate":

      Plan-specific claims (premium, benefit, star rating, carrier) require
      source_url + review_date in frontmatter or they do not render.

    Both fields are therefore CONDITIONAL on the claim, not universally
    required — a piece that makes no plan claim has nothing to cite and no
    claim to have reviewed.

    This guard fails the BUILD rather than suppressing the render. That is
    deliberately stricter: a non-rendering claim still ships a page, whereas
    a failed build ships nothing, so an uncited claim cannot reach a reader
    by any path. Do not weaken this to render-time suppression.

    `source_url` is a single string, not a list — that is the name CLAUDE.md
    specifies, and it is the one that stays.
  */
  const declaresClaim = data.makes_plan_claim === true;
  const sourceUrl = data.source_url;
  const reviewDate = parseIsoDate(data.review_date);

  if (!isBlank(sourceUrl)) {
    if (typeof sourceUrl !== 'string') {
      add('source_url must be a single URL string');
    } else if (!/^https?:\/\//i.test(sourceUrl.trim())) {
      add(`source_url "${sourceUrl}" is not an http(s) URL`);
    }
  }

  if (!isBlank(data.review_date) && !reviewDate) {
    add(`review_date "${shown(data.review_date)}" is not a valid ISO date (YYYY-MM-DD)`);
  } else if (reviewDate && reviewDate.getTime() > todayUtc) {
    /*
      A review cannot have happened yet. This is the field asserting that a
      human checked the claim, so a future date is either a typo or a claim
      about work nobody has done.
    */
    add(`review_date ${shown(data.review_date)} is in the future`);
  }

  if (declaresClaim) {
    if (isBlank(sourceUrl)) {
      add('makes_plan_claim is true, so source_url is required');
    }
    if (isBlank(data.review_date)) {
      add('makes_plan_claim is true, so review_date is required');
    }
  }

  /*
    The cross-check. Only runs when the writer declared NO plan claim — if
    they declared one, `source_url` and `review_date` are already enforced
    above and re-scanning the prose would add nothing.
  */
  if (!declaresClaim) {
    for (const [pattern, label] of PLAN_CLAIM_PATTERNS) {
      const hit = body.match(pattern);
      if (!hit) continue;
      add(
        `body contains ${label} ("${hit[0].trim()}") but makes_plan_claim is not ` +
          'set. Set `makes_plan_claim: true` with `source_url` and ' +
          '`review_date`, or rewrite ' +
          'the sentence so it makes no plan-specific claim',
      );
      break; // One report per file is enough to send someone to the text.
    }
  }
}

/** Returns this check's findings, or null when every file is clean. */
export function collectContentFailures(): GuardSection | null {
  const failures: Failure[] = [];
  const files = contentFiles();

  for (const file of files) checkFile(file, failures);
  if (failures.length === 0) return null;

  /*
    Grouped by file, because the unit of work for whoever fixes this is a
    file, not a rule. Every failure is listed — never just the first — so one
    build tells you everything that needs editing.
  */
  const byFile = new Map<string, string[]>();
  for (const { file, reason } of failures) {
    const list = byFile.get(file);
    if (list) list.push(reason);
    else byFile.set(file, [reason]);
  }

  const lines = [
    `${failures.length} problem(s) in ${byFile.size} of ${files.length} content file(s).`,
    '',
  ];

  for (const [file, reasons] of byFile) {
    lines.push(file);
    for (const reason of reasons) lines.push(`  ✗ ${reason}`);
    lines.push('');
  }

  lines.push(
    `Every content item requires: ${REQUIRED_FIELDS.join(', ')}.`,
    `status must be "${APPROVED_STATUS}", expires_on must be in the future,`,
    'published and updated must be ISO dates (YYYY-MM-DD), and updated must',
    'not be earlier than published. A piece making a plan-specific claim must',
    'set `makes_plan_claim: true` with `source_url` and `review_date`.',
    '',
    'Rules live in lib/content-guard.ts.',
  );

  return {
    title: 'Content frontmatter',
    count: failures.length,
    lines,
  };
}
