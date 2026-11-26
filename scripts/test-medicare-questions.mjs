/**
 * /medicare-questions (lib/medicare-questions.ts). Checks the rules at the top
 * of that file so a later edit cannot quietly break them:
 * exactly 28 questions, unique anchors, answers of at most 50 words that end
 * in a full stop, an official source for each, and a deep link that exists.
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

const { allQuestions, QUESTIONS_REVIEWED } = await import('../lib/medicare-questions.ts');
const { glossaryTerms } = await import('../lib/medicare-glossary.ts');

const OFFICIAL = /^https:\/\/(www\.)?(medicare\.gov|cms\.gov|ssa\.gov|va\.gov|nj\.gov|nyc\.gov|aging\.ny\.gov|dfs\.ny\.gov|pa\.gov)\//;
const BANNED = /\b(best|top|#1|you qualify|\$0|free plan)\b/i;
const glossarySlugs = new Set(glossaryTerms.map((t) => t.slug));

function routeExists(href) {
  const [path, anchor] = href.split('#');
  if (path.startsWith('/answers/')) return fs.existsSync(`content/answers/${path.slice(9)}.mdx`);
  if (path === '/medicare-glossary' && anchor) return glossarySlugs.has(anchor);
  if (path.startsWith('/tools/')) return fs.existsSync(`app${path}/page.tsx`);
  return fs.existsSync(`app/(marketing)${path}/page.tsx`);
}

let failures = 0;
const ok = (label, fn) => {
  try {
    fn();
    console.log(`  ok    ${label}`);
  } catch (error) {
    failures += 1;
    console.error(`  FAIL  ${label}\n        ${error.message}`);
  }
};

ok('exactly 28 questions with unique anchors', () => {
  assert.equal(allQuestions.length, 28);
  assert.equal(new Set(allQuestions.map((q) => q.id)).size, 28);
  for (const q of allQuestions) assert.match(q.id, /^[a-z0-9-]+$/, q.id);
});

ok('every question is a question; every answer is 50 words or fewer', () => {
  for (const q of allQuestions) {
    assert.ok(q.question.endsWith('?'), q.id);
    const words = q.answer.split(/\s+/).filter(Boolean).length;
    assert.ok(words <= 50, `${q.id}: ${words} words`);
    assert.ok(/[.]$/.test(q.answer), `${q.id}: answer should end with a full stop`);
  }
});

ok('every source is an official page', () => {
  for (const q of allQuestions) assert.match(q.source.url, OFFICIAL, `${q.id}: ${q.source.url}`);
});

ok('every deep link points to a page that exists', () => {
  for (const q of allQuestions) assert.ok(routeExists(q.href), `${q.id}: ${q.href}`);
});

ok('no superlatives, eligibility promises or $0 claims', () => {
  for (const q of allQuestions) assert.doesNotMatch(`${q.question} ${q.answer}`, BANNED, q.id);
});

ok('review date is set', () => assert.match(QUESTIONS_REVIEWED, /^\d{4}-\d{2}-\d{2}$/));

if (failures > 0) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.log('medicare questions checks passed');
