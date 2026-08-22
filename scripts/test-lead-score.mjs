/**
 * scoreLead() rules, asserted against real field values.
 *
 * Mirrors lib/lead-score.ts. Kept as a plain .mjs script for the same reason
 * as test-medicare-math.mjs: it runs with `node` and no test runner, so it
 * cannot rot behind a framework upgrade.
 */
import assert from 'node:assert/strict';

const NOW = new Date('2026-08-22T12:00:00Z');
const AEP = new Date('2026-11-01T12:00:00Z');

let passed = 0;
function check(label, actual, expected) {
  assert.equal(actual, expected, `${label}: expected ${expected}, got ${actual}`);
  passed += 1;
}

const { scoreLead } = await import('../lib/lead-score.ts');

// ── A ──────────────────────────────────────────────────────────────────────
check('booked a call', scoreLead({ bookingStatus: 'intent', now: NOW }), 'A');
check('timing=now', scoreLead({ answers: { timing: 'now' }, now: NOW }), 'A');
check('losing employer coverage', scoreLead({ topic: 'I am losing employer coverage', now: NOW }), 'A');
check('retiree/COBRA', scoreLead({ answers: { employer: 'retiree-cobra' }, now: NOW }), 'A');
check('turning 65, nothing enrolled', scoreLead({ answers: { age: 'turning-65', enrolled: 'none' }, now: NOW }), 'A');
check('turns65 this month', scoreLead({ turns65: '2026-08', now: NOW }), 'A');
check('turns65 next month', scoreLead({ turns65: '2026-09', now: NOW }), 'A');

// ── B ──────────────────────────────────────────────────────────────────────
check('timing=1-3-months', scoreLead({ answers: { timing: '1-3-months' }, now: NOW }), 'B');
check('turns65 in 3 months', scoreLead({ turns65: '2026-11', now: NOW }), 'B');
check('turning 65, already has A+B', scoreLead({ answers: { age: 'turning-65', enrolled: 'a-and-b' }, now: NOW }), 'B');
check('helping a parent', scoreLead({ topic: 'I am helping a parent or relative', now: NOW }), 'B');
check('coverage review during AEP', scoreLead({ topic: 'I want to review my current coverage', now: AEP }), 'B');

// ── C ──────────────────────────────────────────────────────────────────────
check('coverage review outside AEP', scoreLead({ topic: 'I want to review my current coverage', now: NOW }), 'C');
check('planning ahead', scoreLead({ answers: { age: 'under-64' }, now: NOW }), 'C');
check('turns65 far out', scoreLead({ turns65: '2027-06', now: NOW }), 'C');
check('nothing at all', scoreLead({ now: NOW }), 'C');
check('newsletter signup', scoreLead({ source: 'homepage-deadline-capture', preferredContact: 'email', now: NOW }), 'C');

// ── "just researching" outranks inference ──────────────────────────────────
check('just-researching beats turning-65+none',
  scoreLead({ answers: { timing: 'just-researching', age: 'turning-65', enrolled: 'none' }, now: NOW }), 'C');
check('just-researching beats losing-coverage topic',
  scoreLead({ answers: { timing: 'just-researching' }, topic: 'I am losing employer coverage', now: NOW }), 'C');
check('...but a booking overrides it',
  scoreLead({ answers: { timing: 'just-researching' }, bookingStatus: 'intent', now: NOW }), 'A');

// ── edge cases ─────────────────────────────────────────────────────────────
check('malformed turns65 ignored', scoreLead({ turns65: 'not-a-date', now: NOW }), 'C');
check('impossible month ignored', scoreLead({ turns65: '2026-13', now: NOW }), 'C');
check('past turns65 still urgent', scoreLead({ turns65: '2026-05', now: NOW }), 'A');
check('AEP boundary Oct 15 inclusive',
  scoreLead({ topic: 'I want to review my current coverage', now: new Date('2026-10-15T00:00:00Z') }), 'B');
check('AEP boundary Oct 14 excluded',
  scoreLead({ topic: 'I want to review my current coverage', now: new Date('2026-10-14T00:00:00Z') }), 'C');
check('AEP boundary Dec 7 inclusive',
  scoreLead({ topic: 'I want to review my current coverage', now: new Date('2026-12-07T00:00:00Z') }), 'B');
check('AEP boundary Dec 8 excluded',
  scoreLead({ topic: 'I want to review my current coverage', now: new Date('2026-12-08T00:00:00Z') }), 'C');

console.log(`\n✓ ${passed} lead-scoring checks passed.`);
