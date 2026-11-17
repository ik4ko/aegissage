/**
 * The reference hub: /medicare-glossary, /medicare-enrollment-calendar and
 * the glossary links inside answer pages.
 *
 * Checks the rules written at the top of lib/medicare-glossary.ts and
 * lib/enrollment-calendar.ts, so a later edit cannot quietly break them:
 * 40 sourced terms of 2 to 3 sentences, windows written as rules with no
 * year in them, official sources only, no carrier names, and auto-linking
 * that links each term once and never inside a heading or an existing link.
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

const { glossaryTerms, GLOSSARY_REVIEWED } = await import('../lib/medicare-glossary.ts');
const { glossary: popups } = await import('../lib/glossary.ts');
const { calendarSections, allWindows, fixedDates, CALENDAR_REVIEWED } = await import('../lib/enrollment-calendar.ts');
const { autolinkForTest } = await import('../lib/glossary-autolink.ts');

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

const sentences = (text) => text.split(/(?<=[.!?])\s+(?=[A-Z"“])/).filter(Boolean);
const FEDERAL = /^https:\/\/www\.(medicare|cms)\.gov\//;
const OFFICIAL = /^https:\/\/([a-z0-9-]+\.)*(medicare\.gov|cms\.gov|ssa\.gov|va\.gov|nj\.gov|ny\.gov|pa\.gov)\//;
// Same list the content guard uses, plus the two named in CLAUDE.md's exclusions.
const CARRIER = /\b(Humana|Aetna|UnitedHealthcare|United Healthcare|Cigna|Wellcare|Elevance|Anthem|Wellpoint|Kaiser|Devoted|Clover|Healthfirst|EmblemHealth|MetroPlus|Jefferson|Horizon|Braven)\b/i;
const BANNED = /\b(best|top-rated|#1|number one|you qualify|you are eligible|guaranteed approval|\$0)\b/i;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

console.log('\nGlossary');

ok('has exactly 40 terms with unique anchors', () => {
  assert.equal(glossaryTerms.length, 40);
  const slugs = glossaryTerms.map((entry) => entry.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.match(slug, /^[a-z][a-z0-9-]*$/, slug);
  assert.equal(new Set(glossaryTerms.map((entry) => entry.term.toLowerCase())).size, 40);
});

ok('every definition is 2 to 3 sentences', () => {
  for (const entry of glossaryTerms) {
    const count = sentences(entry.definition).length;
    assert.ok(count >= 2 && count <= 3, `${entry.slug} has ${count} sentence(s)`);
  }
});

ok('every term cites a medicare.gov or cms.gov page', () => {
  for (const entry of glossaryTerms) {
    assert.match(entry.source.url, FEDERAL, entry.slug);
    assert.ok(entry.source.title.trim().length > 3, entry.slug);
  }
});

ok('no dollar amounts, years, carrier names or promises in any definition', () => {
  for (const entry of glossaryTerms) {
    const text = `${entry.term} ${entry.definition} ${(entry.alsoCalled ?? []).join(' ')}`;
    assert.ok(!/\$\s?\d/.test(text), `${entry.slug} states a dollar amount`);
    assert.ok(!/\b20\d\d\b/.test(text), `${entry.slug} names a year`);
    assert.ok(!CARRIER.test(text), `${entry.slug} names a carrier`);
    assert.ok(!BANNED.test(text), `${entry.slug} uses restricted wording`);
  }
});

ok('every pop-up definition key has a full glossary entry to link to', () => {
  const slugs = new Set(glossaryTerms.map((entry) => entry.slug));
  for (const key of Object.keys(popups)) assert.ok(slugs.has(key), `no glossary entry for pop-up "${key}"`);
});

ok('review date is a real date that is not in the future', () => {
  for (const value of [GLOSSARY_REVIEWED, CALENDAR_REVIEWED]) {
    assert.match(value, ISO);
    assert.ok(new Date(`${value}T00:00:00Z`).getTime() <= Date.now());
  }
});

console.log('\nEnrollment calendar');

ok('every window has all its fields and a unique anchor', () => {
  const ids = [...calendarSections.map((section) => section.id), ...allWindows.map((window) => window.id)];
  assert.equal(new Set(ids).size, ids.length, 'duplicate anchor');
  assert.ok(allWindows.length >= 20, `only ${allWindows.length} windows`);
  for (const window of allWindows) {
    for (const field of ['name', 'who', 'when', 'can', 'starts']) {
      assert.ok(typeof window[field] === 'string' && window[field].trim().length > 5, `${window.id}.${field}`);
    }
  }
});

ok('every window cites an official federal or state page', () => {
  for (const window of allWindows) assert.match(window.source.url, OFFICIAL, window.id);
});

ok('windows are rules: no year appears, apart from one date fixed in New Jersey law', () => {
  /*
    New Jersey's statute applies to people who became eligible "on or after
    January 1, 2020". That date is part of the rule, not a calendar year the
    page will outlive, so it is the one allowed exception.
  */
  const allowed = new Map([['medigap-new-jersey-under-65', 'January 1, 2020']]);
  for (const window of allWindows) {
    for (const field of ['name', 'who', 'when', 'can', 'starts', 'note']) {
      let text = window[field] ?? '';
      const exception = allowed.get(window.id);
      if (exception) text = text.replaceAll(exception, '');
      assert.ok(!/\b(19|20)\d\d\b/.test(text), `${window.id}.${field} names a year`);
      assert.ok(!/\bthis year\b|\bnext year'?s\b/i.test(text), `${window.id}.${field} is tied to a year`);
    }
  }
  for (const item of fixedDates) assert.ok(!/\b20\d\d\b/.test(item.dates + item.name));
});

ok('no dollar amounts, carrier names or promises in any window', () => {
  for (const window of allWindows) {
    const text = ['name', 'who', 'when', 'can', 'starts', 'note'].map((field) => window[field] ?? '').join(' ');
    assert.ok(!/\$\s?\d/.test(text), `${window.id} states a dollar amount`);
    assert.ok(!CARRIER.test(text), `${window.id} names a carrier`);
    assert.ok(!BANNED.test(text), `${window.id} uses restricted wording`);
  }
});

ok('glossary and fixed-date links point at anchors that exist', () => {
  const slugs = new Set(glossaryTerms.map((entry) => entry.slug));
  const ids = new Set(allWindows.map((window) => window.id));
  for (const window of allWindows) if (window.glossary) assert.ok(slugs.has(window.glossary), `${window.id} -> ${window.glossary}`);
  for (const item of fixedDates) assert.ok(ids.has(item.anchor), item.anchor);
});

console.log('\nGlossary links in answer pages');

const text = (value) => ({ type: 'text', value });
const paragraph = (...children) => ({ type: 'paragraph', children });
const links = (node, out = []) => {
  if (node.type === 'link') out.push([node.url, node.children.map((child) => child.value).join('')]);
  for (const child of node.children ?? []) links(child, out);
  return out;
};

ok('links the first mention of a term, once, and the longest phrase wins', () => {
  const tree = autolinkForTest({
    type: 'root',
    children: [
      paragraph(text('Your Medigap Open Enrollment Period starts with Part B. Medigap works with Original Medicare.')),
      paragraph(text('Part B has a premium. A Medigap policy is separate.')),
    ],
  });
  assert.deepEqual(links(tree), [
    ['/medicare-glossary#medigap-oep', 'Medigap Open Enrollment Period'],
    ['/medicare-glossary#part-b', 'Part B'],
    ['/medicare-glossary#medigap', 'Medigap'],
    ['/medicare-glossary#original-medicare', 'Original Medicare'],
  ]);
});

ok('leaves headings, existing links, code and components alone', () => {
  const tree = autolinkForTest({
    type: 'root',
    children: [
      { type: 'heading', depth: 2, children: [text('COBRA and Part B')] },
      paragraph({ type: 'link', url: '/answers/x', children: [text('Medicaid rules')] }, { type: 'inlineCode', value: 'Part D' }),
      { type: 'mdxJsxFlowElement', name: 'AskMe', children: [paragraph(text('Extra Help'))] },
    ],
  });
  assert.deepEqual(links(tree), [['/answers/x', 'Medicaid rules']]);
});

ok('matches whole words, and capital-letter terms only in capitals', () => {
  const tree = autolinkForTest({
    type: 'root',
    children: [paragraph(text('They ship the card. Part Bs are not a thing. Call your SHIP about an HMO.'))],
  });
  assert.deepEqual(links(tree), [
    ['/medicare-glossary#ship', 'SHIP'],
    ['/medicare-glossary#hmo', 'HMO'],
  ]);
});

ok('all 20 answer pages name three related answers that exist', () => {
  const dir = new URL('../content/answers/', import.meta.url);
  const files = fs.readdirSync(dir).filter((name) => name.endsWith('.mdx'));
  assert.equal(files.length, 20);
  const slugs = new Set(files.map((name) => name.replace(/\.mdx$/, '')));
  for (const file of files) {
    // Normalise CRLF: Git for Windows (core.autocrlf) checks the LF files out with CRLF.
    const frontmatter = fs
      .readFileSync(new URL(file, dir), 'utf8')
      .replace(/\r\n/g, '\n')
      .split('\n---\n')[0];
    const block = frontmatter.split('\nrelated:\n')[1] ?? '';
    const related = [...block.matchAll(/^\s+-\s+"([^"]+)"\s*$/gm)].map((match) => match[1]);
    assert.equal(related.length, 3, `${file} lists ${related.length}`);
    assert.equal(new Set(related).size, 3, `${file} repeats a page`);
    for (const slug of related) {
      assert.ok(slugs.has(slug), `${file} -> ${slug}`);
      assert.notEqual(`${slug}.mdx`, file);
    }
  }
});

console.log(`\nAll ${passed} reference hub checks passed.`);
