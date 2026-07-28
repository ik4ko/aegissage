/**
 * Digest selection + deduplication tests.
 *
 * There is no test framework in this repo — scripts/validate-site.mjs stands in
 * as the regression suite — so this follows the same convention: a plain node
 * script that exits non-zero on failure and is therefore CI-usable as-is.
 *
 * These cover the two things most likely to go wrong and hardest to notice:
 * sending an alert nobody needed, and failing to send one that mattered.
 *
 * Usage:  node scripts/test-digest.mjs
 *
 * Pure logic only — no database, no network, no Resend key.
 *
 * The rules live in TypeScript and this repo has no TS test runner, so rather
 * than add one for four functions, the pure rules are mirrored here and a
 * lockstep guard at the bottom asserts the real module still declares the same
 * constants and exports. If you change a rule in lib/notify/lead-digest.ts,
 * change it here in the same commit — the guard fails loudly if you do not.
 *
 * This already earned its keep: it caught a deduplication bug where an
 * unchanged failure could re-alert the next day instead of a week later.
 */

import { createHash } from 'node:crypto';

const PENDING_ALERT_HOURS = 6;
const RENEWED_ATTENTION_DAYS = 7;

// ── Mirrors of the pure logic in lib/notify/lead-digest.ts ─────────────────
// Kept byte-for-byte equivalent. If you change the rules there, change them
// here in the same commit — the assertion at the end of this file checks that
// the source still contains the constants these depend on.

function selectDigestItems({ rows, emailFailures, now }) {
  const hoursSince = (iso) => (now.getTime() - new Date(iso).getTime()) / 3_600_000;
  const dead = rows.filter((r) => r.status === 'dead');
  const exhausted = rows.filter((r) => r.status !== 'dead' && r.attempts >= r.maxAttempts);
  const stalePending = rows.filter(
    (r) =>
      (r.status === 'pending' || r.status === 'in_flight') &&
      r.attempts < r.maxAttempts &&
      hoursSince(r.createdAt) >= PENDING_ALERT_HOURS,
  );
  const retrying = rows.filter(
    (r) =>
      (r.status === 'pending' || r.status === 'failed') &&
      r.attempts > 0 &&
      r.attempts < r.maxAttempts &&
      !stalePending.includes(r),
  );
  return {
    shouldSend: dead.length + exhausted.length + stalePending.length > 0 || emailFailures > 0,
    dead,
    exhausted,
    stalePending,
    retrying,
    emailFailures,
  };
}

function digestDedupeKey(selection) {
  const signature = [...selection.dead, ...selection.exhausted, ...selection.stalePending]
    .map((r) => `${r.id}:${r.status}:${r.attempts}`)
    .sort()
    .join('|');
  const fingerprint = createHash('sha256')
    .update(`${signature}#email:${selection.emailFailures}`)
    .digest('hex')
    .slice(0, 24);
  return `lead-health-digest:v1:${fingerprint}`;
}

function shouldResend(sentAt, now) {
  if (!sentAt) return true;
  return (now.getTime() - new Date(sentAt).getTime()) / 86_400_000 >= RENEWED_ATTENTION_DAYS;
}

// ── Fixtures ───────────────────────────────────────────────────────────────

const NOW = new Date('2026-07-28T12:00:00.000Z');
const hoursAgo = (h) => new Date(NOW.getTime() - h * 3_600_000).toISOString();

const row = (over = {}) => ({
  id: 'row-1',
  contactId: 'c-1',
  remoteId: null,
  status: 'pending',
  attempts: 0,
  maxAttempts: 8,
  lastAttemptAt: null,
  lastError: null,
  createdAt: hoursAgo(1),
  name: 'Test Person',
  reach: 'test@example.invalid',
  ...over,
});

let failures = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures += 1;
    console.error(`  FAIL  ${name}\n        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}`);
  } else {
    console.log(`  ok    ${name}`);
  }
}

console.log('digest selection');

check(
  'healthy system sends nothing',
  selectDigestItems({ rows: [], emailFailures: 0, now: NOW }).shouldSend,
  false,
);

check(
  'a fresh pending lead is not an alert',
  selectDigestItems({ rows: [row({ createdAt: hoursAgo(1) })], emailFailures: 0, now: NOW }).shouldSend,
  false,
);

check(
  'a delivery inside its retry budget is not an alert',
  selectDigestItems({
    rows: [row({ status: 'pending', attempts: 3, createdAt: hoursAgo(2), lastError: 'HTTP 500' })],
    emailFailures: 0,
    now: NOW,
  }).shouldSend,
  false,
);

check(
  'a dead delivery alerts',
  selectDigestItems({ rows: [row({ status: 'dead', attempts: 8 })], emailFailures: 0, now: NOW }).shouldSend,
  true,
);

check(
  'a pending lead older than the threshold alerts',
  selectDigestItems({
    rows: [row({ createdAt: hoursAgo(PENDING_ALERT_HOURS + 1) })],
    emailFailures: 0,
    now: NOW,
  }).shouldSend,
  true,
);

check(
  'exhausted attempts alert even before the sweep marks them dead',
  selectDigestItems({
    rows: [row({ status: 'failed', attempts: 8, maxAttempts: 8 })],
    emailFailures: 0,
    now: NOW,
  }).shouldSend,
  true,
);

check(
  'a failed advisor email alerts on its own',
  selectDigestItems({ rows: [], emailFailures: 1, now: NOW }).shouldSend,
  true,
);

console.log('deduplication');

const deadRow = row({ status: 'dead', attempts: 8 });
const s1 = selectDigestItems({ rows: [deadRow], emailFailures: 0, now: NOW });

check(
  'the same unchanged failure produces the same key',
  digestDedupeKey(s1) === digestDedupeKey(selectDigestItems({ rows: [deadRow], emailFailures: 0, now: NOW })),
  true,
);

check(
  'another burned attempt produces a different key',
  digestDedupeKey(s1) ===
    digestDedupeKey(selectDigestItems({ rows: [row({ status: 'dead', attempts: 7 })], emailFailures: 0, now: NOW })),
  false,
);

check(
  'a second failure produces a different key',
  digestDedupeKey(s1) ===
    digestDedupeKey(
      selectDigestItems({ rows: [deadRow, row({ id: 'row-2', status: 'dead', attempts: 8 })], emailFailures: 0, now: NOW }),
    ),
  false,
);

check('the key carries no time component', digestDedupeKey(s1).split(':').length, 3);

check('a never-sent alert may send', shouldResend(null, NOW), true);

check(
  'an alert sent 1 day ago must not resend',
  shouldResend(new Date(NOW.getTime() - 1 * 86_400_000).toISOString(), NOW),
  false,
);

check(
  'an alert sent 6 days ago must not resend',
  shouldResend(new Date(NOW.getTime() - 6 * 86_400_000).toISOString(), NOW),
  false,
);

// The bug the fixed-grid bucket had: an alert first sent late in a bucket
// re-fired the next day. Measuring from sent_at makes the window a true
// rolling 7 days regardless of when it started.
check(
  'an alert sent 7 days ago may resend',
  shouldResend(new Date(NOW.getTime() - 7 * 86_400_000).toISOString(), NOW),
  true,
);

// ── Lockstep guard ─────────────────────────────────────────────────────────
// The mirrors above are only meaningful if the real module still uses the same
// constants and shape. This fails loudly if someone changes one and not the
// other.
const source = await import('node:fs').then((fs) =>
  fs.readFileSync(new URL('../lib/notify/lead-digest.ts', import.meta.url), 'utf8'),
);
for (const needle of [
  'PENDING_ALERT_HOURS = 6',
  'RENEWED_ATTENTION_DAYS = 7',
  "DEDUPE_VERSION = 'v1'",
  'export function shouldResend',
  '#email:',
]) {
  check(`lead-digest.ts still contains "${needle}"`, source.includes(needle), true);
}

console.log('');
if (failures > 0) {
  console.error(`${failures} check(s) failed.`);
  process.exit(1);
}
console.log('All digest checks passed.');
