import { glossaryHref, glossaryTerms } from './medicare-glossary';

/**
 * Remark plugin: links the FIRST mention of each glossary term in an answer
 * page to its entry at /medicare-glossary#<slug>.
 *
 * Rules, so the result reads like a page a person linked by hand:
 *   - one link per term per page, on its first mention in the body
 *   - never inside a heading, an existing link, code, or an MDX component
 *   - the longest phrase wins, so "Medigap Open Enrollment Period" becomes
 *     one link to that entry, not a link on "Medigap" alone
 *   - whole words only; "Part A" does not match inside "Part AB"
 *
 * It runs at build time on the server, so the links are in the HTML a
 * crawler receives. No dependency: the tree is plain mdast and is walked by
 * hand.
 */

type Node = {
  type: string;
  value?: string;
  url?: string;
  children?: Node[];
  data?: Record<string, unknown>;
};

/** Node types whose text is left alone. */
const SKIP = new Set([
  'heading',
  'link',
  'linkReference',
  'code',
  'inlineCode',
  'html',
  'definition',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxFlowExpression',
  'mdxTextExpression',
  'mdxjsEsm',
  'yaml',
]);

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** All phrases, longest first, each remembering which term it belongs to. */
const PHRASES = glossaryTerms
  .flatMap((entry) => entry.match.map((phrase) => ({ phrase, slug: entry.slug })))
  .sort((a, b) => b.phrase.length - a.phrase.length);

/**
 * Short all-capital terms (HMO, PPO, SHIP, COBRA, IRMAA) match case-exactly,
 * so the verb "ship" is never linked. Everything else ignores case.
 */
function patternFor(phrase: string): RegExp {
  const caseExact = /^[A-Z]{3,6}$/.test(phrase);
  return new RegExp(`(?<![\\p{L}\\p{N}-])${escapeRegExp(phrase)}(?![\\p{L}\\p{N}-])`, caseExact ? 'u' : 'iu');
}

const PATTERNS = PHRASES.map((item) => ({ ...item, pattern: patternFor(item.phrase) }));

function linkText(value: string, linked: Set<string>): Node[] | null {
  let best: { index: number; length: number; slug: string } | null = null;

  for (const { pattern, slug } of PATTERNS) {
    if (linked.has(slug)) continue;
    const hit = pattern.exec(value);
    if (!hit) continue;
    // Earliest wins; PATTERNS is longest-first, so a tie goes to the longer phrase.
    if (!best || hit.index < best.index) {
      best = { index: hit.index, length: hit[0].length, slug };
    }
  }

  if (!best) return null;
  linked.add(best.slug);

  const before = value.slice(0, best.index);
  const matched = value.slice(best.index, best.index + best.length);
  const after = value.slice(best.index + best.length);

  const out: Node[] = [];
  if (before) out.push({ type: 'text', value: before });
  out.push({
    type: 'link',
    url: glossaryHref(best.slug),
    data: { hProperties: { 'data-glossary': best.slug } },
    children: [{ type: 'text', value: matched }],
  });
  if (after) {
    // The rest of the sentence may hold the first mention of another term.
    const rest = linkText(after, linked);
    if (rest) out.push(...rest);
    else out.push({ type: 'text', value: after });
  }
  return out;
}

function walk(node: Node, linked: Set<string>): void {
  if (!node.children) return;
  const next: Node[] = [];
  for (const child of node.children) {
    if (child.type === 'text' && typeof child.value === 'string') {
      const replaced = linkText(child.value, linked);
      if (replaced) next.push(...replaced);
      else next.push(child);
      continue;
    }
    if (!SKIP.has(child.type)) walk(child, linked);
    next.push(child);
  }
  node.children = next;
}

export function remarkGlossaryLinks() {
  return (tree: Node) => {
    walk(tree, new Set<string>());
  };
}

/** Exposed for scripts/test-glossary.mjs. */
export function autolinkForTest(tree: Node): Node {
  walk(tree, new Set<string>());
  return tree;
}
