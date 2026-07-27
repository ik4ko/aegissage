import { advisor } from './site';

export type StateInfo = {
  slug: string;
  code: string;
  name: string;
  /** Short, factual note about the Medicare landscape in that state. */
  note: string;
};

const LICENSED_STATES: Array<[string, string]> = [
  ['AL', 'Alabama'], ['AR', 'Arkansas'], ['AZ', 'Arizona'], ['FL', 'Florida'],
  ['GA', 'Georgia'], ['IA', 'Iowa'], ['IL', 'Illinois'], ['IN', 'Indiana'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
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

export const planStates: StateInfo[] = LICENSED_STATES
  .map(([code, name]) => ({
    code,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    note: NOTES[code] ?? FALLBACK_NOTE,
  }));

export const licensedStates: StateInfo[] = LICENSED_STATES
  .filter(([code]) => (advisor.licensedStates as readonly string[]).includes(code))
  .map(([code, name]) => ({
    code,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    note: NOTES[code] ?? FALLBACK_NOTE,
  }));

export function getStateBySlug(slug: string): StateInfo | undefined {
  return planStates.find((s) => s.slug === slug);
}
