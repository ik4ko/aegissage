/**
 * /for-organizations pages (lib/organizations.ts). Checks the rules at the
 * top of that file: six audiences, a 40-50 word direct answer, spoken FAQs
 * answered in at most 50 words, the no-lists and no-payments promises and the
 * Scope of Appointment rule on every page, no banned wording, and internal
 * links that resolve.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

const { orgAudiences } = await import('../lib/organizations.ts');
const { ORGANIZATION_TYPES } = await import('../lib/validations/partner-request.ts');

const words = (t) => t.split(/\s+/).filter(Boolean).length;
const BANNED = /\b(best|top|#1|you qualify|\$0|guarantee[sd]?)\b/i;
const exists = (href) => {
  const path = href.split('#')[0];
  if (path.startsWith('/answers/')) return fs.existsSync(`content/answers/${path.slice(9)}.mdx`);
  return fs.existsSync(`app/(marketing)${path}/page.tsx`);
};

let failures = 0;
const ok = (label, fn) => {
  try { fn(); console.log(`  ok    ${label}`); } catch (e) { failures += 1; console.error(`  FAIL  ${label}\n        ${e.message}`); }
};

ok('six audiences with unique slugs', () => {
  assert.equal(orgAudiences.length, 6);
  assert.equal(new Set(orgAudiences.map((a) => a.slug)).size, 6);
});

for (const a of orgAudiences) {
  ok(`${a.slug}: direct answer is 40-50 words; FAQs are questions answered in 50 words or fewer`, () => {
    const w = words(a.answer);
    assert.ok(w >= 40 && w <= 50, `answer ${w} words`);
    assert.ok(a.faq.length >= 3);
    for (const f of a.faq) {
      assert.ok(f.question.endsWith('?'), f.question);
      assert.ok(words(f.answer) <= 50, `${f.question}: ${words(f.answer)} words`);
    }
  });
  ok(`${a.slug}: says no lists or records, and no payments, gifts or meals`, () => {
    const dont = a.whatIDont.join(' ').toLowerCase();
    assert.match(dont, /list|record/);
    assert.match(dont, /pay|gift|meal|anything of value/);
  });
  ok(`${a.slug}: states the Scope of Appointment rule`, () => {
    assert.match(a.steps.join(' ') + a.faq.map((f) => f.answer).join(' '), /Scope of Appointment/);
  });
  ok(`${a.slug}: no banned wording; title fits search results`, () => {
    const all = [a.h1, a.answer, a.description, ...a.whatIDo, ...a.whatIDont, ...a.steps, ...a.sheet, ...a.faq.flatMap((f) => [f.question, f.answer])].join(' ');
    assert.doesNotMatch(all, BANNED);
    assert.ok(a.metaTitle.length + ' · Aegis Sage'.length <= 60, `${a.metaTitle.length} chars`);
    assert.ok(a.description.length <= 160, `description ${a.description.length} chars`);
  });
  ok(`${a.slug}: four sheet lines, a valid form type and links that exist`, () => {
    assert.equal(a.sheet.length, 4);
    assert.ok(ORGANIZATION_TYPES.some((t) => t.value === a.formType), a.formType);
    for (const r of a.related) assert.ok(exists(r.href), r.href);
  });
}

if (failures) { console.error(`${failures} check(s) failed`); process.exit(1); }
console.log('organization page checks passed');
