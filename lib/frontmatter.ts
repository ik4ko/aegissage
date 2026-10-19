import { load } from 'js-yaml';

/**
 * Minimal YAML frontmatter parser — a drop-in for the subset of `gray-matter`
 * this site used: `matter(raw)` → `{ data, content }`, default `---`
 * delimiters, YAML only, no excerpts, no sections.
 *
 * Why it exists: gray-matter 4 pins js-yaml 3, whose argparse → sprintf-js
 * chain carries GHSA-hp3w-g68c-fv3c with no patched release. Parsing here
 * uses js-yaml 4, whose `load()` DEFAULT_SCHEMA is the same schema gray-matter
 * used via js-yaml 3 `safeLoad()` (core types + timestamp + merge + binary/
 * omap/pairs/set, no JS functions). That matters for `expires_on` and
 * `review_date`: unquoted `2027-01-01` still arrives as a JS Date and quoted
 * `"2027-01-01"` as a string, exactly as before (see lib/content-guard.ts).
 *
 * The splitting rules mirror gray-matter 4.0.3 line for line so every content
 * file parses identically; scripts/test-frontmatter.mjs checks that.
 */
export type ParsedFrontmatter = {
  data: Record<string, unknown>;
  content: string;
};

const OPEN = '---';
const CLOSE = '\n---';

export function parseFrontmatter(input: string): ParsedFrontmatter {
  // gray-matter strips a leading byte-order mark before anything else.
  let str = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;

  if (str === '' || !str.startsWith(OPEN)) {
    return { data: {}, content: str };
  }
  // `----` (or longer) is a horizontal rule, not a frontmatter opener.
  if (str.charAt(OPEN.length) === OPEN.charAt(OPEN.length - 1)) {
    return { data: {}, content: str };
  }

  str = str.slice(OPEN.length);
  const len = str.length;

  // Optional language tag after the opener, e.g. `---yaml`. Only YAML is
  // supported; gray-matter's other engines (json, js) are deliberately not.
  const newline = str.search(/\r?\n/);
  const languageRaw = str.slice(0, newline);
  const language = languageRaw.trim();
  if (language) {
    if (language !== 'yaml' && language !== 'yml') {
      throw new Error(`unsupported frontmatter language "${language}"`);
    }
    str = str.slice(languageRaw.length);
  }

  let closeIndex = str.indexOf(CLOSE);
  if (closeIndex === -1) closeIndex = len;

  const matter = str.slice(0, closeIndex);
  const block = matter.replace(/^\s*#[^\n]+/gm, '').trim();
  const data =
    block === '' ? {} : (load(matter) as Record<string, unknown>);

  let content = '';
  if (closeIndex !== len) {
    content = str.slice(closeIndex + CLOSE.length);
    if (content[0] === '\r') content = content.slice(1);
    if (content[0] === '\n') content = content.slice(1);
  }

  return { data, content };
}
