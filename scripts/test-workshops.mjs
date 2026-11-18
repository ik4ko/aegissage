/**
 * Workshops (lib/workshops.ts, /api/workshop-rsvp). Checks:
 *  - every configured session is inside Dec 8, 2026 to Feb 28, 2027, has a
 *    unique id, a known language and state, and a host confirmation date
 *  - Eastern offsets around the DST changes
 *  - the RSVP form rules: Part A/B required with three answers, consent
 *    required and unchecked by default, phone or email, 1 to 6 attending,
 *    no Medicare number / SSN / date of birth field, and identifiers refused
 *    in the one free-text field
 *  - the Event schema carries no street address or postal code
 *  - /workshops and the flyers state the Bergen figures "in Bergen County, NJ"
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      specifier = new URL(`../${specifier.slice(2)}`, import.meta.url).href;
    }
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (!/\.[a-z]+$/.test(specifier)) return nextResolve(`${specifier}.ts`, context);
      throw error;
    }
  },
});

const W = await import('../lib/workshops.ts');
const { workshopRsvpSchema, RSVP_CONSENT_TEXT } = await import('../lib/validations/workshop-rsvp.ts');
const { usesFallbackScope, collectsZip } = await import('../lib/tpmo.ts');

let passed = 0;
function ok(label, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`  FAIL  ${label}`);
    throw error;
  }
  console.log(`  ok    ${label}`);
  passed += 1;
}

ok('configured sessions follow the rules', () => {
  const ids = new Set();
  for (const w of W.workshops) {
    assert.match(w.id, /^[a-z0-9-]+$/, `${w.id}: id`);
    assert.ok(!ids.has(w.id), `${w.id}: duplicate id`);
    ids.add(w.id);
    assert.ok(w.date >= W.WORKSHOP_WINDOW.from && w.date <= W.WORKSHOP_WINDOW.to, `${w.id}: date outside the window`);
    assert.match(w.start, /^\d{2}:\d{2}$/);
    assert.match(w.end, /^\d{2}:\d{2}$/);
    assert.ok(w.end > w.start, `${w.id}: ends before it starts`);
    assert.ok(['en', 'ka', 'ru'].includes(w.language));
    assert.ok(['NJ', 'NY', 'PA'].includes(w.state));
    assert.match(w.hostConfirmed, /^\d{4}-\d{2}-\d{2}$/, `${w.id}: host confirmation date`);
    assert.ok(w.venue.trim().length > 2 && w.town.trim().length > 1);
  }
});

ok('Eastern offsets across daylight saving changes', () => {
  assert.equal(W.easternOffset('2026-12-10'), '-05:00');
  assert.equal(W.easternOffset('2027-02-28'), '-05:00');
  assert.equal(W.easternOffset('2027-03-13'), '-05:00');
  assert.equal(W.easternOffset('2027-03-14'), '-04:00');
  assert.equal(W.easternOffset('2026-11-01'), '-05:00');
  assert.equal(W.easternOffset('2026-10-31'), '-04:00');
});

ok('date and time formatting', () => {
  assert.equal(W.formatWorkshopDate('2026-12-10'), 'Thursday, December 10, 2026');
  assert.equal(W.formatTime('10:30'), '10:30 a.m.');
  assert.equal(W.formatTime('13:00'), '1 p.m.');
  assert.equal(W.formatTime('12:00'), '12 p.m.');
});

const valid = {
  name: 'Ana Test',
  phone: '201-555-0143',
  email: '',
  workshopId: 'any',
  town: 'Fort Lee',
  attendees: '2',
  language: 'ru',
  partsAB: 'not-sure',
  consent: true,
  consentSms: false,
};

ok('a complete RSVP passes', () => {
  const r = workshopRsvpSchema.safeParse(valid);
  assert.ok(r.success, JSON.stringify(r.error?.issues));
  assert.equal(r.data.attendees, 2);
});

ok('Part A/B is required, with Yes / No / Not sure only', () => {
  assert.ok(!workshopRsvpSchema.safeParse({ ...valid, partsAB: undefined }).success);
  assert.ok(!workshopRsvpSchema.safeParse({ ...valid, partsAB: 'maybe' }).success);
  for (const v of ['yes', 'no', 'not-sure']) assert.ok(workshopRsvpSchema.safeParse({ ...valid, partsAB: v }).success);
});

ok('consent is required and names Erekle Niniashvili / Aegis Sage', () => {
  assert.ok(!workshopRsvpSchema.safeParse({ ...valid, consent: false }).success);
  assert.match(RSVP_CONSENT_TEXT, /Erekle Niniashvili/);
  assert.match(RSVP_CONSENT_TEXT, /Aegis Sage/);
  const form = fs.readFileSync(new URL('../components/forms/workshop-rsvp-form.tsx', import.meta.url), 'utf8');
  assert.match(form, /consent: false/, 'consent must start unchecked');
  assert.match(form, /consentSms: false/, 'SMS consent must start unchecked');
});

ok('needs a phone or an email', () => {
  assert.ok(!workshopRsvpSchema.safeParse({ ...valid, phone: '', email: '' }).success);
  assert.ok(workshopRsvpSchema.safeParse({ ...valid, phone: '', email: 'a@b.co' }).success);
});

ok('1 to 6 attending', () => {
  assert.ok(!workshopRsvpSchema.safeParse({ ...valid, attendees: 0 }).success);
  assert.ok(!workshopRsvpSchema.safeParse({ ...valid, attendees: 7 }).success);
});

ok('no Medicare number, SSN or date of birth anywhere in the form', () => {
  const keys = Object.keys(workshopRsvpSchema.shape ?? workshopRsvpSchema._def?.schema?.shape ?? {});
  for (const k of keys) assert.ok(!/ssn|mbi|medicare.?(number|id)|dob|birth/i.test(k), `field ${k}`);
  const form = fs.readFileSync(new URL('../components/forms/workshop-rsvp-form.tsx', import.meta.url), 'utf8');
  assert.ok(!/register\('(ssn|mbi|dob|birth)/i.test(form));
  assert.ok(!workshopRsvpSchema.safeParse({ ...valid, town: 'Fort Lee 1EG4TE5MK73' }).success);
  assert.ok(!workshopRsvpSchema.safeParse({ ...valid, town: 'DOB 01/02/1958' }).success);
  assert.ok(!workshopRsvpSchema.safeParse({ ...valid, town: '123-45-6789' }).success);
});

ok('Event schema has no street address or postal code', () => {
  const seo = fs.readFileSync(new URL('../lib/seo.ts', import.meta.url), 'utf8');
  const fn = seo.slice(seo.indexOf('export function workshopEventJsonLd'));
  assert.ok(!/streetAddress|postalCode|latitude|longitude/.test(fn));
});

ok('/workshops and flyers: Bergen figures "in Bergen County, NJ"; no ZIP field', () => {
  assert.ok(usesFallbackScope('/workshops'));
  assert.ok(usesFallbackScope('/workshops/flyer'));
  assert.ok(usesFallbackScope('/workshops/flyer/some-session'));
  assert.ok(!collectsZip('/workshops'));
});

console.log(`\n${passed} workshop checks passed.`);
