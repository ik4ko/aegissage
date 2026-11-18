/**
 * Plan-ending pages (lib/plan-endings.ts). Checks the campaign rules from
 * Nov 18 2026 so a later edit cannot quietly break them:
 *
 *  - a 40 to 50 word direct answer, and spoken answers of 25 to 60 words
 *  - the key dates are stated: December 31, February 28, 2027, Original
 *    Medicare without drug coverage
 *  - every source is https, and each page cites medicare.gov
 *  - no member counts, superlatives, promises or urgency words
 *  - each page names only its own company
 *  - each route is a ZIP route and states the Bergen figures "in Bergen County, NJ"
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
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

const { planEndingPages, PLAN_ENDING_PATHS } = await import('../lib/plan-endings.ts');
const { collectsZip, usesFallbackScope } = await import('../lib/tpmo.ts');

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

const words = (text) => text.trim().split(/\s+/).length;
const CARRIERS = ['Humana', 'Aetna', 'UnitedHealthcare', 'United Healthcare', 'Cigna', 'Wellcare', 'Elevance', 'Anthem', 'Wellpoint', 'Kaiser', 'Devoted', 'Clover', 'Healthfirst', 'EmblemHealth', 'MetroPlus', 'Jefferson', 'Braven'];
const BANNED = /\b(best|top-rated|#1|number one|you qualify|you are eligible|guaranteed approval|\$0|act now|hurry|don'?t wait|last chance|urgent|deadline is approaching|stranded|scramble)\b/i;
const COUNTS = /\b\d[\d,]{2,}\+?\s+(?:people|members|enrollees|beneficiaries|seniors)\b/i;
const allText = (page) =>
  [page.title, page.metaTitle, page.metaDescription, page.h1, page.directAnswer,
    ...page.sections.flatMap((s) => [s.question, s.answer, ...(s.points ?? [])])].join('\n');

ok('two pages, one per company', () => {
  assert.deepEqual(PLAN_ENDING_PATHS.sort(), ['/aetna-medicare-plan-ending-2027', '/braven-health-plan-ending-2027']);
});

for (const page of planEndingPages) {
  ok(`${page.slug}: direct answer is 40 to 50 words`, () => {
    const n = words(page.directAnswer);
    assert.ok(n >= 40 && n <= 50, `${n} words`);
  });
  ok(`${page.slug}: spoken answers are 25 to 60 words`, () => {
    for (const s of page.sections) {
      const n = words(s.answer);
      assert.ok(n >= 25 && n <= 60, `"${s.question}" is ${n} words`);
    }
  });
  ok(`${page.slug}: states the key dates`, () => {
    const text = allText(page);
    for (const needle of ['December 31', 'February 28, 2027', 'Original Medicare', 'no drug coverage', '63 days', 'Medigap']) {
      assert.ok(text.includes(needle) || text.includes(needle.replace('no drug', 'without drug')), `missing "${needle}"`);
    }
  });
  ok(`${page.slug}: sources are https and include medicare.gov`, () => {
    assert.ok(page.sources.length >= 4);
    for (const s of page.sources) assert.match(s.url, /^https:\/\//);
    assert.ok(page.sources.some((s) => s.url.startsWith('https://www.medicare.gov/')));
  });
  ok(`${page.slug}: no counts, superlatives, promises or urgency words`, () => {
    const text = allText(page);
    assert.ok(!BANNED.test(text), `banned wording: ${text.match(BANNED)?.[0]}`);
    assert.ok(!COUNTS.test(text), `member count: ${text.match(COUNTS)?.[0]}`);
  });
  ok(`${page.slug}: names only its own company`, () => {
    const text = allText(page);
    const own = page.company.split(' ')[0];
    for (const c of CARRIERS) {
      if (c === own) continue;
      assert.ok(!new RegExp(`\\b${c}\\b`).test(text), `names ${c}`);
    }
  });
  ok(`${page.slug}: says it does not recommend a plan and keeps Original Medicare as a choice`, () => {
    const text = allText(page);
    assert.match(text, /Original Medicare/);
    const tpl = fs.readFileSync(new URL('../components/marketing/plan-ending-page.tsx', import.meta.url), 'utf8');
    assert.match(tpl, /does not recommend a plan/);
  });
  ok(`${page.slug}: counted TPMO, scoped to Bergen County`, () => {
    assert.ok(collectsZip(`/${page.slug}`), 'not in ZIP_ROUTES');
    assert.ok(usesFallbackScope(`/${page.slug}`), 'not in FALLBACK_SCOPE_ROUTES');
  });
}

console.log(`\n${passed} plan-ending checks passed.`);
