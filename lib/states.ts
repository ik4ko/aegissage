import { advisor } from './site';

export type StateInfo = {
  slug: string;
  code: string;
  name: string;
  /** Short, factual note about the Medicare landscape in that state. */
  note: string;
};

/**
 * Louisiana removed Aug 13 2026 — appointment lost, confirmed by Erekle.
 * Do not re-add without confirming the appointment is active again.
 */
const LICENSED_STATES: Array<[string, string]> = [
  ['AL', 'Alabama'], ['AR', 'Arkansas'], ['AZ', 'Arizona'], ['FL', 'Florida'],
  ['GA', 'Georgia'], ['IA', 'Iowa'], ['IL', 'Illinois'], ['IN', 'Indiana'],
  ['KY', 'Kentucky'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['NC', 'North Carolina'],
  ['ND', 'North Dakota'], ['NJ', 'New Jersey'], ['NY', 'New York'], ['OH', 'Ohio'],
  ['OK', 'Oklahoma'], ['PA', 'Pennsylvania'], ['SC', 'South Carolina'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['VA', 'Virginia'], ['WV', 'West Virginia'],
];

/**
 * State-specific notes. Only states with something genuinely state-specific
 * to say get an entry; the rest fall back to a neutral line. Keep these
 * factual — no plan comparisons, no benefit claims.
 */
const NOTES: Record<string, string> = {
  NJ: 'New Jersey has no state-specific Medigap enrollment rules beyond the federal ones, so your six-month Medigap open enrollment window is the one that matters most here.',
  NY: 'New York requires Medigap policies to be sold on a continuous open enrollment, guaranteed issue basis, which is unusual — you cannot be turned down for a Medigap policy based on health history.',
  MN: 'Minnesota uses its own standardized Medigap plan set rather than the federal letter plans used in most states.',
  FL: 'Florida has a large and dense Medicare population, which means an unusually high number of plans available in most counties. Narrowing by your doctors and prescriptions matters more here than almost anywhere.',
  TX: 'Texas plan availability varies sharply between metro counties and rural ones, so the right question is always county-level, not statewide.',
  AZ: 'Arizona has significant seasonal-resident population, so network and travel coverage rules deserve close attention here.',
};

const FALLBACK_NOTE =
  'Medicare rules are federal, but which plans are actually available to you is decided county by county. That is the first thing worth checking.';

/**
 * ── Licensing guard ───────────────────────────────────────────────────────
 * Every public surface that lists states — /plans, /plans/[state], the footer,
 * the About page, the sitemap and schema `areaServed` — reads from this
 * module. A state added here appears in all of them at once, including in
 * JSON-LD, where claiming an unheld license is a real problem.
 *
 * EXCEPTION — public/llms.txt is hand-maintained and does NOT read from here.
 * This comment used to claim it did, which is how the Louisiana removal on
 * Aug 13 2026 shipped everywhere except the one file AI assistants read as
 * ground truth. Any change to this list must be mirrored by hand in
 * public/llms.txt (the state list and the state count in the Service area
 * section). The unlicensed-state guard in scripts/validate-site.mjs is the
 * backstop; add any dropped state to that regex too.
 *
 * These checks run at module load, which on this app means at build time
 * (every consumer is server-rendered or statically generated). A mismatch
 * fails `next build` loudly instead of shipping.
 */
const EXPECTED_LICENSED_COUNT = 25;

function assertLicensing() {
  const codes = LICENSED_STATES.map(([code]) => code);
  const declared = advisor.licensedStates as readonly string[];

  const duplicates = codes.filter((code, i) => codes.indexOf(code) !== i);
  if (duplicates.length > 0) {
    throw new Error(`lib/states.ts: duplicate state codes: ${duplicates.join(', ')}`);
  }

  const extra = codes.filter((code) => !declared.includes(code));
  if (extra.length > 0) {
    throw new Error(
      `lib/states.ts lists states the advisor is not licensed in: ${extra.join(', ')}. ` +
        'Remove them, or add them to advisor.licensedStates in lib/site.ts only if a ' +
        'real license exists.',
    );
  }

  const missing = declared.filter((code) => !codes.includes(code));
  if (missing.length > 0) {
    throw new Error(
      `lib/states.ts is missing licensed states declared in lib/site.ts: ${missing.join(', ')}.`,
    );
  }

  if (codes.length !== EXPECTED_LICENSED_COUNT) {
    throw new Error(
      `Expected exactly ${EXPECTED_LICENSED_COUNT} licensed states, found ${codes.length}. ` +
        'If the advisor genuinely gained or lost a license, update ' +
        'EXPECTED_LICENSED_COUNT deliberately — do not let this drift silently.',
    );
  }
}

assertLicensing();

/**
 * The licensed states (count enforced by EXPECTED_LICENSED_COUNT above,
 * currently 25 — do not let this comment's number drift from that one).
 *
 * `licensedStates` and `planStates` are the same list and are kept as two
 * names only because both are imported across the app. They were previously
 * built by two separate pipelines where one filtered against the other — a
 * no-op that read as though the two could legitimately differ. They cannot:
 * a plan page for a state the advisor is not licensed in has no reason to
 * exist, and `assertLicensing()` above now enforces that.
 */
export const licensedStates: StateInfo[] = LICENSED_STATES.map(([code, name]) => ({
  code,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  note: NOTES[code] ?? FALLBACK_NOTE,
}));

export const planStates: StateInfo[] = licensedStates;

export function getStateBySlug(slug: string): StateInfo | undefined {
  return planStates.find((s) => s.slug === slug);
}
