export type StateInfo = {
  slug: string;
  code: string;
  name: string;
  /** Short, factual note about the Medicare landscape in that state. */
  note: string;
};

const ALL_STATES: Array<[string, string]> = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
  ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
];

/**
 * State-specific notes. Only states with something genuinely state-specific
 * to say get an entry; the rest fall back to a neutral line. Keep these
 * factual — no plan comparisons, no benefit claims.
 */
const NOTES: Record<string, string> = {
  NJ: 'New Jersey has no state-specific Medigap enrollment rules beyond the federal ones, so your six-month Medigap open enrollment window is the one that matters most here.',
  NY: 'New York requires Medigap policies to be sold on a continuous open enrollment, guaranteed issue basis, which is unusual — you cannot be turned down for a Medigap policy based on health history.',
  CT: 'Connecticut requires continuous open enrollment for Medigap policies, so medical underwriting does not apply to Medigap applications in this state.',
  MA: 'Massachusetts uses its own standardized Medigap plan set (Core, Supplement 1, Supplement 1A) rather than the federal letter plans used in most states.',
  MN: 'Minnesota uses its own standardized Medigap plan set rather than the federal letter plans used in most states.',
  WI: 'Wisconsin uses its own standardized Medigap plan set rather than the federal letter plans used in most states.',
  CA: 'California has a Medigap birthday rule: for 60 days following your birthday each year you may switch to a Medigap policy with equal or lesser benefits without medical underwriting.',
  FL: 'Florida has a large and dense Medicare population, which means an unusually high number of plans available in most counties. Narrowing by your doctors and prescriptions matters more here than almost anywhere.',
  TX: 'Texas plan availability varies sharply between metro counties and rural ones, so the right question is always county-level, not statewide.',
  AZ: 'Arizona has significant seasonal-resident population, so network and travel coverage rules deserve close attention here.',
};

const FALLBACK_NOTE =
  'Medicare rules are federal, but which plans are actually available to you is decided county by county. That is the first thing worth checking.';

export const planStates: StateInfo[] = ALL_STATES
  .map(([code, name]) => ({
    code,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    note: NOTES[code] ?? FALLBACK_NOTE,
  }));

/** Verified licensing data is intentionally empty until the advisor confirms it. */
export const licensedStates: StateInfo[] = [];

export function getStateBySlug(slug: string): StateInfo | undefined {
  return planStates.find((s) => s.slug === slug);
}
