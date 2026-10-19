/**
 * Regression tests for lib/frontmatter.ts, the gray-matter replacement.
 *
 * Expected values were captured from gray-matter 4.0.3 before it was removed
 * (a differential run over every file in content/ plus the cases below was
 * identical). These pin that behaviour so a future parser change cannot
 * silently alter how frontmatter, dates or article bodies come through.
 *
 *   node --experimental-strip-types scripts/test-frontmatter.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from '../lib/frontmatter.ts';

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok    ${name}`);
}

check('unquoted expires_on arrives as a Date (UTC midnight)', () => {
  const { data } = parseFrontmatter('---\nexpires_on: 2027-01-01\n---\nBody');
  assert.ok(data.expires_on instanceof Date);
  assert.equal(data.expires_on.toISOString(), '2027-01-01T00:00:00.000Z');
});

check('quoted expires_on arrives as a string', () => {
  const { data } = parseFrontmatter('---\nexpires_on: "2027-01-01"\n---\nBody');
  assert.equal(data.expires_on, '2027-01-01');
});

check('no frontmatter: empty data, content untouched', () => {
  const raw = '# Heading\n\nJust text.\n';
  assert.deepEqual(parseFrontmatter(raw), { data: {}, content: raw });
});

check('empty string', () => {
  assert.deepEqual(parseFrontmatter(''), { data: {}, content: '' });
});

check('empty and comment-only blocks give empty data', () => {
  assert.deepEqual(parseFrontmatter('---\n---\nBody'), { data: {}, content: 'Body' });
  assert.deepEqual(parseFrontmatter('---\n# note\n---\nBody'), { data: {}, content: 'Body' });
});

check('unclosed frontmatter: whole remainder is frontmatter, content empty', () => {
  assert.throws(() => parseFrontmatter('---\ntitle: A\nno close here\n'));
  const { data, content } = parseFrontmatter('---\ntitle: A\n');
  assert.deepEqual(data, { title: 'A' });
  assert.equal(content, '');
});

check('malformed YAML throws (content-guard reports it per file)', () => {
  assert.throws(() => parseFrontmatter('---\ntitle: [unclosed\n---\nBody'));
  assert.throws(() => parseFrontmatter('---\na: 1\n  b: 2\n---\nx'));
});

check('multiline values and body horizontal rules are preserved', () => {
  const { data, content } = parseFrontmatter(
    '---\ndescription: |\n  Line one\n  Line two\nfolded: >\n  a\n  b\n---\n\nPara 1\n\n---\n\nAfter rule\n',
  );
  assert.equal(data.description, 'Line one\nLine two\n');
  assert.equal(data.folded, 'a b\n');
  assert.equal(content, '\nPara 1\n\n---\n\nAfter rule\n');
});

check('CRLF line endings and a BOM are handled', () => {
  const crlf = parseFrontmatter('---\r\ntitle: A\r\n---\r\nBody\r\n');
  assert.equal(crlf.data.title, 'A');
  assert.equal(crlf.content, 'Body\r\n');
  assert.deepEqual(parseFrontmatter('﻿---\ntitle: A\n---\nBody'), {
    data: { title: 'A' },
    content: 'Body',
  });
});

check('"----" is a horizontal rule, not an opener', () => {
  const raw = '----\ntitle: A\n----\nBody';
  assert.deepEqual(parseFrontmatter(raw), { data: {}, content: raw });
});

check('non-YAML language tags are rejected', () => {
  assert.throws(() => parseFrontmatter('---js\nmodule.exports = {}\n---\nx'));
});

check('every rendered (.mdx) content file parses with required fields and a body', () => {
  const root = path.join(process.cwd(), 'content');
  let count = 0;
  for (const dir of fs.readdirSync(root)) {
    const full = path.join(root, dir);
    if (!fs.statSync(full).isDirectory()) continue;
    for (const file of fs.readdirSync(full).filter((f) => f.endsWith('.mdx'))) {
      const { data, content } = parseFrontmatter(fs.readFileSync(path.join(full, file), 'utf8'));
      for (const field of ['title', 'description', 'published', 'category']) {
        assert.ok(data[field], `${dir}/${file} missing ${field}`);
      }
      assert.ok(content.trim().length > 0, `${dir}/${file} has an empty body`);
      count += 1;
    }
  }
  assert.ok(count > 0, 'no content files found');
});

console.log(`\nAll ${passed} frontmatter checks passed.`);
