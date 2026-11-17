/**
 * Lead form validation, asserted against the real schemas.
 *
 * Covers the three forms that post to /api/contact:
 *   lib/validations/contact.ts   contact form, and the server's own check
 *   lib/validations/booking.ts   /book interstitial
 *   lib/validations/capture.ts   homepage capture band
 * and the outbound CRM contract in lib/crm/contract.ts.
 *
 * What it pins down:
 *   - a valid submission parses to exactly the expected fields
 *   - the Part A/B question is required: Yes, No or Not sure, nothing else
 *   - consent must be an explicit `true`; SMS and marketing consent are
 *     separate, default to false, and are never inferred from anything else
 *   - no schema accepts a Medicare number, SSN, date of birth or health field
 *   - every message a visitor can see is worded exactly as written here
 *   - the values handed to scoreLead() are the ones the route reads
 *
 * Written when zod moved from 3 to 4, so a later validation-library change
 * cannot quietly alter any of the above. Plain .mjs run with `node`, like the
 * other scripts here, so it cannot rot behind a test-framework upgrade.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';

/*
  The schema files use extensionless relative imports ('../ai-sources') and
  the CRM contract imports 'server-only', which throws outside a React server
  build. Both are resolved here so the real modules load unmodified.
*/
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') {
      return { url: 'data:text/javascript,', shortCircuit: true };
    }
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw error;
    }
  },
});

const { contactSchema } = await import('../lib/validations/contact.ts');
const { bookingSchema } = await import('../lib/validations/booking.ts');
const { captureSchema } = await import('../lib/validations/capture.ts');
const { leadPayloadSchema, assertNoProhibitedFields } = await import('../lib/crm/contract.ts');
const { PARTS_AB, PARTS_AB_REQUIRED } = await import('../lib/ai-sources.ts');
const { scoreLead } = await import('../lib/lead-score.ts');
const { zodResolver } = await import('@hookform/resolvers/zod');

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

/** Messages for a rejected input, as { 'field.path': first message }. */
function errorsOf(schema, input) {
  const result = schema.safeParse(input);
  assert.equal(result.success, false, 'expected the input to be rejected');
  const out = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/** The first message, which is what /api/contact returns to the browser. */
function firstError(schema, input) {
  const result = schema.safeParse(input);
  assert.equal(result.success, false, 'expected the input to be rejected');
  return result.error.issues[0].message;
}

function parse(schema, input) {
  const result = schema.safeParse(input);
  assert.equal(result.success, true, result.success ? '' : JSON.stringify(result.error.issues));
  return result.data;
}

const CONSENT_CONTACT = 'Please check the box so I know it is okay to contact you.';
const CONSENT_EMAIL = 'Please check the box so I know it is okay to email you.';
const PARTS_AB_MESSAGE = 'Please choose Yes, No or Not sure.';

/** What an unanswered radio group can arrive as. */
const UNANSWERED = [undefined, '', null];

/** Fields no lead form may ever accept. */
const PROHIBITED = {
  ssn: '123-45-6789',
  socialSecurityNumber: '123-45-6789',
  mbi: '1EG4-TE5-MK73',
  medicareNumber: '1EG4TE5MK73',
  medicare_beneficiary_identifier: '1EG4TE5MK73',
  dob: '1961-01-01',
  dateOfBirth: '1961-01-01',
  date_of_birth: '1961-01-01',
  birthday: '1961-01-01',
  diagnosis: 'x',
  conditions: 'x',
  medications: 'x',
  bankAccount: '000111222',
};

// ── Contact form and server validation ─────────────────────────────────────
console.log('\ncontactSchema (contact form and /api/contact)');

const validContact = {
  name: '  Jane Doe ',
  email: ' jane@example.com ',
  phone: '(551) 555-0100',
  zip: '07020',
  topic: 'I am turning 65 soon',
  preferredContact: 'phone',
  message: ' Call after 3. ',
  partsAB: 'yes',
  foundVia: 'google',
  consent: true,
};

ok('valid submission parses to exactly the expected fields', () => {
  assert.deepEqual(parse(contactSchema, validContact), {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '(551) 555-0100',
    zip: '07020',
    topic: 'I am turning 65 soon',
    preferredContact: 'phone',
    message: 'Call after 3.',
    source: 'contact-form',
    partsAB: 'yes',
    foundVia: 'google',
    consent: true,
    consentSms: false,
    consentMarketing: false,
  });
});

ok('smallest valid submission: name, one way to reach them, Part A/B, consent', () => {
  assert.deepEqual(parse(contactSchema, { name: 'Jo', phone: '5515550100', partsAB: 'not-sure', consent: true }), {
    name: 'Jo',
    phone: '5515550100',
    preferredContact: 'phone',
    source: 'contact-form',
    partsAB: 'not-sure',
    consent: true,
    consentSms: false,
    consentMarketing: false,
  });
  parse(contactSchema, { name: 'Jo', email: 'jo@example.com', preferredContact: 'email', partsAB: 'no', consent: true });
});

ok('Part A/B is required: a missing answer is rejected, with the visitor-facing message', () => {
  assert.equal(PARTS_AB_REQUIRED, PARTS_AB_MESSAGE);
  for (const partsAB of UNANSWERED) {
    const input = { ...validContact, partsAB };
    if (partsAB === undefined) delete input.partsAB;
    assert.deepEqual(errorsOf(contactSchema, input), { partsAB: PARTS_AB_MESSAGE }, `partsAB=${JSON.stringify(partsAB)}`);
  }
});

ok('Part A/B accepts Yes, No and Not sure, and nothing else', () => {
  assert.deepEqual([...PARTS_AB], ['yes', 'no', 'not-sure']);
  for (const answer of PARTS_AB) {
    assert.equal(parse(contactSchema, { ...validContact, partsAB: answer }).partsAB, answer);
  }
  assert.equal(parse(contactSchema, { ...validContact, partsAB: 'not-sure' }).partsAB, 'not-sure');
  for (const bad of ['Yes', 'YES', 'maybe', 'none', '1EG4-TE5-MK73', 5, true, {}]) {
    assert.deepEqual(
      errorsOf(contactSchema, { ...validContact, partsAB: bad }),
      { partsAB: PARTS_AB_MESSAGE },
      `partsAB=${JSON.stringify(bad)} must be rejected`,
    );
  }
});

ok('a page left open from before the change still submits: old answers are mapped', () => {
  // Server only. Having both parts is "yes"; having one or neither is "no".
  assert.equal(parse(contactSchema, { ...validContact, partsAB: 'both' }).partsAB, 'yes');
  assert.equal(parse(contactSchema, { ...validContact, partsAB: 'one' }).partsAB, 'no');
  assert.equal(parse(contactSchema, { ...validContact, partsAB: 'not-yet' }).partsAB, 'no');
  // The two short forms never showed the old answers to a current page.
  for (const schema of [bookingSchema, captureSchema]) {
    assert.equal(schema.safeParse({ partsAB: 'both' }).error.issues.some((issue) => issue.path[0] === 'partsAB'), true);
  }
});

ok('unchecked consent is rejected, with the visitor-facing message', () => {
  for (const consent of [false, undefined, null, 'true', 'on', 1, 0, '']) {
    const input = { ...validContact, consent };
    if (consent === undefined) delete input.consent;
    assert.deepEqual(
      errorsOf(contactSchema, input),
      { consent: CONSENT_CONTACT },
      `consent=${JSON.stringify(consent)}`,
    );
  }
});

ok('SMS and marketing consent are separate, default to false, and are never inferred', () => {
  // Choosing "text" and giving a phone number is not SMS consent.
  const texter = parse(contactSchema, { ...validContact, preferredContact: 'text' });
  assert.equal(texter.consentSms, false);
  assert.equal(texter.consentMarketing, false);

  // Each box is recorded on its own.
  const smsOnly = parse(contactSchema, { ...validContact, consentSms: true });
  assert.equal(smsOnly.consentSms, true);
  assert.equal(smsOnly.consentMarketing, false);
  const marketingOnly = parse(contactSchema, { ...validContact, consentMarketing: true });
  assert.equal(marketingOnly.consentSms, false);
  assert.equal(marketingOnly.consentMarketing, true);

  // Ticking the optional boxes does not stand in for the required one.
  assert.deepEqual(
    errorsOf(contactSchema, { ...validContact, consent: false, consentSms: true, consentMarketing: true }),
    { consent: CONSENT_CONTACT },
  );

  // Only a real boolean counts.
  for (const bad of ['true', 'on', 1]) {
    assert.deepEqual(Object.keys(errorsOf(contactSchema, { ...validContact, consentSms: bad })), ['consentSms']);
    assert.deepEqual(Object.keys(errorsOf(contactSchema, { ...validContact, consentMarketing: bad })), ['consentMarketing']);
  }
});

ok('never accepts a Medicare number, SSN, date of birth or health field', () => {
  const data = parse(contactSchema, { ...validContact, ...PROHIBITED });
  for (const key of Object.keys(PROHIBITED)) {
    assert.equal(key in data, false, `"${key}" must not survive validation`);
  }
  // The complete set of fields the schema can ever emit.
  const everything = parse(contactSchema, {
    ...validContact,
    ...PROHIBITED,
    source: 'about',
    context: { timing: 'now' },
    consentSms: true,
    consentMarketing: true,
    bookingStatus: 'intent',
    website: '',
  });
  assert.deepEqual(Object.keys(everything).sort(), [
    'bookingStatus',
    'consent',
    'consentMarketing',
    'consentSms',
    'context',
    'email',
    'foundVia',
    'message',
    'name',
    'partsAB',
    'phone',
    'preferredContact',
    'source',
    'topic',
    'website',
    'zip',
  ]);
});

ok('required fields and the exact messages a visitor sees', () => {
  const cases = [
    [{ name: '' }, { name: 'Please enter your name.' }],
    [{ name: 'J' }, { name: 'Please enter your name.' }],
    [{ name: 'x'.repeat(81) }, { name: 'That name is too long.' }],
    [{ email: 'not-an-email' }, { email: 'Please enter a valid email address.' }],
    [{ email: `${'x'.repeat(156)}@b.co` }, { email: 'That email address is too long.' }],
    [{ phone: '555-0100' }, { phone: 'Please enter a 10-digit phone number.' }],
    [{ zip: '0702' }, { zip: 'Please enter a 5-digit ZIP code.' }],
    [{ zip: '07020-1234' }, { zip: 'Please enter a 5-digit ZIP code.' }],
    [{ message: 'x'.repeat(2001) }, { message: 'Please keep this under 2000 characters.' }],
  ];
  for (const [override, expected] of cases) {
    assert.deepEqual(errorsOf(contactSchema, { ...validContact, ...override }), expected, JSON.stringify(override).slice(0, 60));
  }
  // Boundaries that must still pass.
  parse(contactSchema, { ...validContact, name: 'x'.repeat(80) });
  parse(contactSchema, { ...validContact, message: 'x'.repeat(2000) });
  parse(contactSchema, { ...validContact, zip: '' });
});

ok('needs an email or a phone, matching the chosen way to be reached', () => {
  const base = { name: 'Jane Doe', partsAB: 'yes', consent: true };
  assert.deepEqual(errorsOf(contactSchema, { ...base, email: '', phone: '' }), {
    email: 'Please give me either an email address or a phone number so I can reach you.',
    phone: 'You chose phone or text — please add your phone number.',
  });
  assert.equal(
    firstError(contactSchema, { ...base, email: '', phone: '' }),
    'Please give me either an email address or a phone number so I can reach you.',
  );
  assert.deepEqual(errorsOf(contactSchema, { ...base, phone: '5515550100', preferredContact: 'email' }), {
    email: 'You chose email — please add your email address.',
  });
  for (const preferredContact of ['phone', 'text']) {
    assert.deepEqual(errorsOf(contactSchema, { ...base, email: 'jane@example.com', preferredContact }), {
      phone: 'You chose phone or text — please add your phone number.',
    });
  }
});

ok('topic, contact preference and booking status are fixed lists', () => {
  for (const [field, bad] of [['topic', 'Sell me a plan'], ['preferredContact', 'sms'], ['bookingStatus', 'booked'], ['foundVia', 'bing']]) {
    assert.deepEqual(Object.keys(errorsOf(contactSchema, { ...validContact, [field]: bad })), [field]);
  }
});

ok('honeypot value is accepted so the route can answer a bot with a plain 200', () => {
  assert.equal(parse(contactSchema, { ...validContact, website: 'http://spam.example' }).website, 'http://spam.example');
});

ok('scoreLead() receives the same inputs the route reads from a parsed submission', () => {
  /*
    Mirrors the scoreLead({...}) call in app/api/contact/route.ts. The source
    check below fails if that call changes without this test changing too.
  */
  const route = fs.readFileSync(new URL('../app/api/contact/route.ts', import.meta.url), 'utf8');
  for (const line of [
    'bookingStatus: payload.bookingStatus,',
    'topic: payload.topic,',
    'preferredContact: payload.preferredContact,',
    'source: payload.source,',
    'answers: payload.context ?? null,',
    'turns65: payload.context?.turns65 ?? null,',
    'foundVia: payload.foundVia || null,',
    'partsAB: payload.partsAB || null,',
  ]) {
    assert.ok(route.includes(line), `route.ts no longer contains "${line}"`);
  }
  const NOW = new Date('2026-08-22T12:00:00Z');
  const inputsFor = (payload) => ({
    bookingStatus: payload.bookingStatus,
    topic: payload.topic,
    preferredContact: payload.preferredContact,
    source: payload.source,
    answers: payload.context ?? null,
    turns65: payload.context?.turns65 ?? null,
    foundVia: payload.foundVia || null,
    partsAB: payload.partsAB || null,
    now: NOW,
  });

  // Homepage capture band, as deadline-capture.tsx posts it.
  const capture = inputsFor(parse(contactSchema, {
    name: 'Jane',
    email: 'jane@example.com',
    zip: '07020',
    preferredContact: 'email',
    consent: true,
    consentMarketing: true,
    consentSms: false,
    partsAB: 'no',
    source: 'homepage-deadline-capture',
    website: '',
    context: { turns65: '2026-09', utm_source: 'newsletter' },
  }));
  assert.deepEqual(capture, {
    bookingStatus: undefined,
    topic: undefined,
    preferredContact: 'email',
    source: 'homepage-deadline-capture',
    answers: { turns65: '2026-09', utm_source: 'newsletter' },
    turns65: '2026-09',
    foundVia: null,
    partsAB: 'no',
    now: NOW,
  });
  assert.equal(scoreLead(capture), 'A');

  // Quiz answers arrive untouched, keyed by question id.
  const quiz = inputsFor(parse(contactSchema, {
    ...validContact,
    source: 'eligibility-quiz',
    context: { timing: '1-3-months', age: 'turning-65', enrolled: 'a-and-b' },
  }));
  assert.deepEqual(quiz.answers, { timing: '1-3-months', age: 'turning-65', enrolled: 'a-and-b' });
  assert.equal(quiz.partsAB, 'yes');
  assert.equal(quiz.foundVia, 'google');
  assert.equal(scoreLead(quiz), 'B');

  // Booking interstitial.
  const booking = inputsFor(parse(contactSchema, {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '',
    preferredContact: 'email',
    consent: true,
    consentSms: false,
    partsAB: 'not-sure',
    source: 'book-interstitial',
    bookingStatus: 'intent',
  }));
  assert.equal(booking.bookingStatus, 'intent');
  assert.equal(booking.partsAB, 'not-sure');
  assert.equal(scoreLead(booking), 'A');

  // Defaults: no source and no preference given.
  const bare = inputsFor(parse(contactSchema, { name: 'Jo', phone: '5515550100', partsAB: 'yes', consent: true }));
  assert.equal(bare.source, 'contact-form');
  assert.equal(bare.preferredContact, 'phone');
  assert.equal(bare.answers, null);
  assert.equal(scoreLead(bare), 'C');

  // Context values must be strings; nothing else reaches scoring.
  assert.deepEqual(Object.keys(errorsOf(contactSchema, { ...validContact, context: { timing: 1 } })), ['context.timing']);
});

// ── Booking interstitial ───────────────────────────────────────────────────
console.log('\nbookingSchema (/book)');

const validBooking = { name: 'Jane Doe', email: 'jane@example.com', phone: '', consent: true, partsAB: 'yes', website: '' };

ok('valid submission; phone is optional', () => {
  assert.deepEqual(parse(bookingSchema, validBooking), validBooking);
  assert.deepEqual(parse(bookingSchema, { name: 'Jane Doe', email: 'jane@example.com', partsAB: 'not-sure', consent: true }), {
    name: 'Jane Doe',
    email: 'jane@example.com',
    partsAB: 'not-sure',
    consent: true,
  });
});

ok('Part A/B is required: Yes, No and Not sure pass, a missing answer is rejected', () => {
  for (const answer of PARTS_AB) assert.equal(parse(bookingSchema, { ...validBooking, partsAB: answer }).partsAB, answer);
  for (const partsAB of [...UNANSWERED, 'none', 'both']) {
    const input = { ...validBooking, partsAB };
    if (partsAB === undefined) delete input.partsAB;
    assert.deepEqual(errorsOf(bookingSchema, input), { partsAB: PARTS_AB_MESSAGE }, `partsAB=${JSON.stringify(partsAB)}`);
  }
});

ok('unchecked consent is rejected, with the visitor-facing message', () => {
  for (const consent of [false, undefined, 'true']) {
    const input = { ...validBooking, consent };
    if (consent === undefined) delete input.consent;
    assert.deepEqual(errorsOf(bookingSchema, input), { consent: CONSENT_CONTACT });
  }
});

ok('required fields and exact messages', () => {
  assert.deepEqual(errorsOf(bookingSchema, { ...validBooking, name: '', email: '', phone: '123' }), {
    name: 'Please enter your name.',
    email: 'Please enter your email address.',
    phone: 'Please enter a 10-digit phone number.',
  });
  assert.deepEqual(errorsOf(bookingSchema, { ...validBooking, email: 'jane@' }), {
    email: 'Please enter a valid email address.',
  });
});

ok('never accepts a Medicare number, SSN, date of birth or health field', () => {
  const data = parse(bookingSchema, { ...validBooking, ...PROHIBITED });
  assert.deepEqual(Object.keys(data).sort(), ['consent', 'email', 'name', 'partsAB', 'phone', 'website']);
});

// ── Homepage capture band ──────────────────────────────────────────────────
console.log('\ncaptureSchema (homepage capture)');

const validCapture = { firstName: 'Jane', email: 'jane@example.com', zip: '07020', turns65: '', consent: true, partsAB: 'not-sure', website: '' };

ok('valid submission; birthday month is optional', () => {
  assert.deepEqual(parse(captureSchema, validCapture), validCapture);
  assert.equal(parse(captureSchema, { ...validCapture, turns65: '2027-03' }).turns65, '2027-03');
});

ok('Part A/B is required: Yes, No and Not sure pass, a missing answer is rejected', () => {
  for (const answer of PARTS_AB) assert.equal(parse(captureSchema, { ...validCapture, partsAB: answer }).partsAB, answer);
  for (const partsAB of [...UNANSWERED, 'none', 'both']) {
    const input = { ...validCapture, partsAB };
    if (partsAB === undefined) delete input.partsAB;
    assert.deepEqual(errorsOf(captureSchema, input), { partsAB: PARTS_AB_MESSAGE }, `partsAB=${JSON.stringify(partsAB)}`);
  }
});

ok('unchecked consent is rejected, with the visitor-facing message', () => {
  for (const consent of [false, undefined, 'true']) {
    const input = { ...validCapture, consent };
    if (consent === undefined) delete input.consent;
    assert.deepEqual(errorsOf(captureSchema, input), { consent: CONSENT_EMAIL });
  }
});

ok('required fields and exact messages', () => {
  assert.deepEqual(errorsOf(captureSchema, { ...validCapture, firstName: '', email: '', zip: '' }), {
    firstName: 'Please enter your first name.',
    email: 'Please enter your email address.',
    zip: 'Please enter a 5-digit ZIP code.',
  });
});

ok('asks for a month and year only, never a full date of birth', () => {
  for (const bad of ['1961-03-14', '03/14/1961', '1961']) {
    assert.deepEqual(errorsOf(captureSchema, { ...validCapture, turns65: bad }), {
      turns65: 'Please pick a month and year.',
    });
  }
  const data = parse(captureSchema, { ...validCapture, ...PROHIBITED });
  assert.deepEqual(Object.keys(data).sort(), ['consent', 'email', 'firstName', 'partsAB', 'turns65', 'website', 'zip']);
});

// ── What the browser form shows (react-hook-form resolver) ─────────────────
console.log('\nzodResolver (what the form shows before anything is sent)');

const resolve = (schema, values) =>
  zodResolver(schema)(values, undefined, { fields: {}, shouldUseNativeValidation: false });

const forms = [
  ['contact', contactSchema, { name: 'Jane Doe', email: 'jane@example.com', preferredContact: 'email', source: 'contact-form', website: '', foundVia: '', consentSms: false, consentMarketing: false }, CONSENT_CONTACT],
  ['booking', bookingSchema, { name: 'Jane Doe', email: 'jane@example.com', phone: '', website: '' }, CONSENT_CONTACT],
  ['capture', captureSchema, { firstName: 'Jane', email: 'jane@example.com', zip: '07020', turns65: '', website: '' }, CONSENT_EMAIL],
];
for (const [name, schema, values, consentMessage] of forms) {
  // As the form starts: no Part A/B answer (react-hook-form gives null for an
  // untouched radio group) and the consent box unticked.
  const fresh = await resolve(schema, { ...values, partsAB: null, consent: false });
  ok(`${name} form: untouched, it blocks the submit and asks for Part A/B and consent`, () => {
    assert.deepEqual(fresh.values, {});
    assert.deepEqual(Object.keys(fresh.errors).sort(), ['consent', 'partsAB']);
    assert.equal(fresh.errors.partsAB.message, PARTS_AB_MESSAGE);
    assert.equal(fresh.errors.consent.message, consentMessage);
  });
  const noAnswer = await resolve(schema, { ...values, partsAB: null, consent: true });
  ok(`${name} form: consent ticked but Part A/B unanswered still blocks`, () => {
    assert.deepEqual(Object.keys(noAnswer.errors), ['partsAB']);
    assert.equal(noAnswer.errors.partsAB.message, PARTS_AB_MESSAGE);
  });
  const allowed = await resolve(schema, { ...values, partsAB: 'not-sure', consent: true });
  ok(`${name} form: "Not sure" with consent ticked lets the submit through`, () => {
    assert.deepEqual(allowed.errors, {});
    assert.equal(allowed.values.consent, true);
    assert.equal(allowed.values.partsAB, 'not-sure');
  });
}

// ── Outbound CRM contract ──────────────────────────────────────────────────
console.log('\nleadPayloadSchema (website to CRM)');

const consentSnapshot = {
  reply: true,
  replyAt: '2026-11-16T22:00:00.000Z',
  replyTextVersion: 'v1',
  sms: false,
  smsAt: null,
  smsTextVersion: null,
  marketing: false,
  marketingAt: null,
  marketingTextVersion: null,
};
const validLead = {
  contractVersion: '1.0.0',
  websiteSubmissionId: '3f2b6c1e-8a4d-4c2b-9f1a-0b1c2d3e4f50',
  sourceLeadId: 'web:3f2b6c1e',
  submittedAt: new Date('2026-11-16T22:00:00Z').toISOString(),
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: null,
  zip: '07020',
  preferredContact: 'email',
  topic: null,
  message: null,
  sourcePage: 'contact-form',
  attribution: { utm_source: 'newsletter' },
  consent: consentSnapshot,
};

ok('a valid lead passes unchanged, and attribution defaults to empty', () => {
  assert.deepEqual(parse(leadPayloadSchema, validLead), validLead);
  const { attribution: _omit, ...noAttribution } = validLead;
  assert.deepEqual(parse(leadPayloadSchema, noAttribution).attribution, {});
});

ok('reply consent must be true; timestamps and the submission id are checked', () => {
  assert.deepEqual(Object.keys(errorsOf(leadPayloadSchema, { ...validLead, consent: { ...consentSnapshot, reply: false } })), ['consent.reply']);
  assert.deepEqual(Object.keys(errorsOf(leadPayloadSchema, { ...validLead, submittedAt: '2026-11-16' })), ['submittedAt']);
  assert.deepEqual(Object.keys(errorsOf(leadPayloadSchema, { ...validLead, websiteSubmissionId: 'not-an-id' })), ['websiteSubmissionId']);
  // Any 8-4-4-4-12 hex id passes, as it always has.
  parse(leadPayloadSchema, { ...validLead, websiteSubmissionId: '00000000-0000-0000-0000-000000000000' });
});

ok('prohibited fields are dropped by the schema and refused in attribution', () => {
  const data = parse(leadPayloadSchema, { ...validLead, ...PROHIBITED });
  for (const key of Object.keys(PROHIBITED)) assert.equal(key in data, false, key);
  for (const key of ['ssn', 'mbi', 'dob', 'medicareNumber', 'dateOfBirth', 'diagnosis']) {
    assert.throws(
      () => assertNoProhibitedFields({ ...validLead, attribution: { [key]: 'x' } }),
      /refusing to transmit prohibited field/,
      key,
    );
  }
  assertNoProhibitedFields(validLead);
});

console.log(`\nAll ${passed} lead form checks passed.`);
