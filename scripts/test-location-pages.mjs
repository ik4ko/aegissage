/**
 * Location and town pages (lib/locations.ts).
 *
 *  1. No two location pages share more than 30% of their body text. Body
 *     text is everything the page's own entry supplies: headline, intro,
 *     section headings and paragraphs, questions and the local-help list.
 *     The shared shell (form, call-to-action, footer) is not counted. The
 *     measure: of the shorter page's 6-word runs, the share that also appear
 *     in the other page. Swapping a town name into a copied body scores
 *     near 100%; two pages that only share the county SHIP line score low.
 *  2. Every local-help item has an official https/http URL, a check date
 *     in YYYY-MM-DD form, and no directory-site source.
 *  3. Every town page names exactly three answer pages that exist.
 *  4. Town pages outside Bergen County are mapped in ROUTE_TPMO_AREAS, so
 *     their disclaimer says "in Bergen County, NJ".
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

const { locationLandings } = await import('../lib/locations.ts');
const { ROUTE_TPMO_AREAS, usesFallbackScope } = await import('../lib/tpmo.ts');

const MAX_OVERLAP = 0.3;
const N = 6;

function bodyText(location) {
  return [
    location.headline,
    location.intro,
    ...location.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
    ...location.questions,
    ...(location.localHelp ?? []).flatMap((item) => [item.name, item.what]),
  ].join(' ');
}

function shingles(text) {
  const words = text
    .toLowerCase()
    .replace(/[’']/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const set = new Set();
  for (let i = 0; i + N <= words.length; i += 1) set.add(words.slice(i, i + N).join(' '));
  return set;
}

let failures = 0;
const check = (label, fn) => {
  try {
    fn();
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${label}\n  ${error.message}`);
  }
};

// 1. Overlap
const pages = locationLandings.map((location) => ({
  slug: location.slug,
  set: shingles(bodyText(location)),
}));
let worst = { score: 0, pair: '' };
for (let i = 0; i < pages.length; i += 1) {
  for (let j = i + 1; j < pages.length; j += 1) {
    const [a, b] = [pages[i], pages[j]];
    let shared = 0;
    for (const s of a.set) if (b.set.has(s)) shared += 1;
    const score = shared / Math.min(a.set.size, b.set.size);
    if (score > worst.score) worst = { score, pair: `${a.slug} / ${b.slug}` };
    check(`overlap ${a.slug} / ${b.slug}`, () =>
      assert.ok(score <= MAX_OVERLAP, `${(score * 100).toFixed(1)}% shared, limit ${MAX_OVERLAP * 100}%`),
    );
  }
}

const towns = locationLandings.filter((location) => location.localHelp);
const answerSlugs = new Set(
  fs.readdirSync('content/answers').filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, '')),
);
const DIRECTORY_SITES = /claimyr|egovrush|mapquest|yelp|wikipedia|regionaldirectory|librarytechnology|atticus/i;

for (const town of towns) {
  // 2. Local help sources
  for (const item of town.localHelp) {
    check(`${town.slug}: "${item.name}" source`, () => {
      assert.match(item.url, /^https?:\/\//);
      assert.doesNotMatch(item.url, DIRECTORY_SITES, 'directory sites are not a source');
      assert.match(item.checked, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(item.what.trim().length > 0);
    });
  }

  // 3. Related answers
  check(`${town.slug}: three related answers`, () => {
    assert.equal(town.relatedAnswers?.length, 3);
    assert.equal(new Set(town.relatedAnswers).size, 3, 'no duplicates');
    for (const slug of town.relatedAnswers) assert.ok(answerSlugs.has(slug), `missing answer ${slug}`);
  });

  // 4. TPMO scope outside Bergen County
  const path = `/medicare-${town.slug}`;
  const inBergen = town.parentSlug === 'bergen-county';
  check(`${town.slug}: TPMO scope`, () => {
    if (inBergen) {
      assert.ok(!(path in ROUTE_TPMO_AREAS), 'a Bergen town uses the Bergen count as its own');
    } else {
      assert.ok(path in ROUTE_TPMO_AREAS, 'outside Bergen County: add to ROUTE_TPMO_AREAS');
      assert.ok(usesFallbackScope(path), 'must state the Bergen counts "in Bergen County, NJ"');
    }
  });
}

console.log(
  `location pages: ${pages.length}, towns: ${towns.length}, highest overlap ${(worst.score * 100).toFixed(1)}% (${worst.pair})`,
);
if (failures > 0) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.log('location page checks passed');
