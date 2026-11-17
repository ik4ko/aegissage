/**
 * Where a visitor says they found the site, and which AI assistant (if any)
 * sent them.
 *
 * Two independent signals, on purpose:
 *
 *   foundVia  — what the PERSON says, from the optional "How did you find us?"
 *               question on the lead form. Self-reported, so it also captures
 *               "I asked ChatGPT and then typed your name into Google".
 *   aiSource  — what the BROWSER says: the referring host or utm_source of
 *               the first page view, matched against known assistant domains.
 *               Present only when the assistant passes a referrer or tags the
 *               link, which not every assistant does on every click.
 *
 * Neither is personal data: both are one value from a short fixed list.
 * Keep it that way. Do not add a free-text "other, please specify" field —
 * free text is where names, conditions and phone numbers end up.
 */

export const FOUND_VIA = [
  'chatgpt',
  'claude',
  'perplexity',
  'gemini',
  'google',
  'referral',
  'other',
] as const;

export type FoundVia = (typeof FOUND_VIA)[number];

/**
 * Whether the person already has Medicare Part A and Part B.
 *
 * Enrollment status, not health information: it is the first thing needed to
 * know which plan types a person can join at all (a Medicare Advantage plan
 * requires both). It is asked on every lead form and must be answered:
 * Yes, No or Not sure (Erekle's rule, Nov 16 2026). "Not sure" is a real
 * answer, so nobody is stopped by not knowing.
 */
export const PARTS_AB = ['yes', 'no', 'not-sure'] as const;

/** The message every form shows when the question is left unanswered. */
export const PARTS_AB_REQUIRED = 'Please choose Yes, No or Not sure.';

/**
 * Answers from before Nov 16 2026, when the question was optional and had
 * four choices. A page left open across the deploy can still post one, and a
 * lead must not be lost over it, so the server maps them: having both parts
 * is "yes", having one or neither is "no". Rows already stored keep the old
 * words; see docs/sheet-writer.md.
 */
export const PARTS_AB_LEGACY: Readonly<Record<string, (typeof PARTS_AB)[number]>> = {
  both: 'yes',
  one: 'no',
  'not-yet': 'no',
};

export type PartsAB = (typeof PARTS_AB)[number];

export type AiSource = 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'copilot';

const AI_HOSTS: ReadonlyArray<readonly [RegExp, AiSource]> = [
  [/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$|(^|\.)openai\.com$/, 'chatgpt'],
  [/(^|\.)claude\.ai$|(^|\.)anthropic\.com$/, 'claude'],
  [/(^|\.)perplexity\.ai$/, 'perplexity'],
  [/(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/, 'gemini'],
  [/(^|\.)copilot\.microsoft\.com$/, 'copilot'],
];

/**
 * Classify a referring host or a utm_source value. Returns null for anything
 * that is not a known assistant, including ordinary Google search.
 *
 * `utm_source` matters as much as the referrer: some assistants strip the
 * referrer but append `utm_source=<their domain>` to outbound links.
 */
export function classifyAiSource(...candidates: Array<string | null | undefined>): AiSource | null {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const host = candidate.trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0];
    if (!host) continue;
    for (const [pattern, source] of AI_HOSTS) {
      if (pattern.test(host)) return source;
    }
    // utm_source is sometimes a bare product name rather than a domain.
    if (/^(chatgpt|openai)$/.test(host)) return 'chatgpt';
    if (/^(claude|anthropic)$/.test(host)) return 'claude';
    if (/^perplexity$/.test(host)) return 'perplexity';
    if (/^gemini$/.test(host)) return 'gemini';
    if (/^copilot$/.test(host)) return 'copilot';
  }
  return null;
}
