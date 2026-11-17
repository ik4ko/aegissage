/**
 * Organization request form (lib/validations/partner-request.ts).
 * A valid request passes; anything that looks like a senior's SSN, Medicare
 * number or date of birth is refused; required fields are enforced; the
 * schema has no field for a patient, resident or employee.
 */
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) return nextResolve(`${specifier}.ts`, context);
      throw error;
    }
  },
});

const { partnerRequestSchema, looksLikePersonalInfo } = await import('../lib/validations/partner-request.ts');

const valid = {
  organization: 'Riverside Senior Living',
  organizationType: 'senior-living',
  contactName: 'Pat Lee',
  role: 'Community relations director',
  email: 'pat@example.org',
  phone: '201-555-0100',
  town: 'Edgewater',
  requests: ['education-talk', 'help-day'],
  timing: 'A Tuesday afternoon in January',
  message: 'We have about 40 residents who come to monthly talks.',
  sourcePage: '/for-organizations/senior-living',
};

let failures = 0;
const ok = (label, fn) => {
  try { fn(); console.log(`  ok    ${label}`); } catch (e) { failures += 1; console.error(`  FAIL  ${label}\n        ${e.message}`); }
};

ok('a valid organization request passes', () => assert.ok(partnerRequestSchema.safeParse(valid).success));
ok('a Social Security number in the message is refused', () =>
  assert.equal(partnerRequestSchema.safeParse({ ...valid, message: 'Resident SSN 123-45-6789' }).success, false));
ok('a Medicare number (MBI) is refused', () =>
  assert.equal(partnerRequestSchema.safeParse({ ...valid, message: 'Her number is 1EG4-TE5-MK73'.replace(/-/g, '') }).success, false));
ok('a date of birth is refused', () => {
  assert.equal(partnerRequestSchema.safeParse({ ...valid, message: 'Mr. Smith, born 03/14/1958' }).success, false);
  assert.equal(partnerRequestSchema.safeParse({ ...valid, timing: 'DOB 3/4/1950' }).success, false);
});
ok('ordinary dates and phone numbers are not mistaken for personal info', () => {
  assert.equal(looksLikePersonalInfo('Any Tuesday in January, call 201-555-0100'), false);
  assert.equal(looksLikePersonalInfo('Our office is in ZIP 07020-1234'), false);
});
ok('organization, type, name, email, town and at least one request are required', () => {
  for (const key of ['organization', 'organizationType', 'contactName', 'email', 'town']) {
    assert.equal(partnerRequestSchema.safeParse({ ...valid, [key]: '' }).success, false, key);
  }
  assert.equal(partnerRequestSchema.safeParse({ ...valid, requests: [] }).success, false, 'requests');
});
ok('the schema has no field about a patient, resident, member or employee', () => {
  const keys = Object.keys(partnerRequestSchema._def.schema?.shape ?? partnerRequestSchema.shape ?? {});
  assert.ok(keys.length > 0, 'could not read schema keys');
  for (const k of keys) assert.doesNotMatch(k, /patient|resident|member|employee|senior|dob|birth|medicare|ssn/i, k);
});

if (failures) { console.error(`${failures} check(s) failed`); process.exit(1); }
console.log('partner request checks passed');
