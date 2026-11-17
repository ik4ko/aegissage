/**
 * Medicare Supplement (Medigap) carriers, by state.
 *
 * ── Separate from the TPMO count, always ──────────────────────────────────
 * The TPMO disclaimer counts Medicare Advantage and Part D organizations and
 * products only (`tpmoCountsByArea` in lib/site.ts). Nothing in this file is
 * ever added to that number, and that number is never derived from this.
 *
 * ── Rules ─────────────────────────────────────────────────────────────────
 *  - A state appears here only after Erekle confirms its carriers himself.
 *    `null` means "not confirmed": the line does not render on that state's
 *    pages. Never fill a state in from another state, a carrier's website or
 *    memory.
 *  - Carrier names only, in alphabetical order. No prices, no rankings, no
 *    plan letters, no logos, no "best" or "top".
 *  - The sentence is fixed: "Medicare Supplement (Medigap) plans offered
 *    through {carriers}, where available." Do not reword it per page.
 *  - Update `confirmedOn` whenever the list changes.
 */
export type MedigapCarriers = {
  carriers: readonly string[];
  /** ISO date Erekle confirmed the list. */
  confirmedOn: string;
  source: string;
};

export const medigapCarriersByState: Record<string, MedigapCarriers | null> = {
  NJ: {
    carriers: ['Aetna', 'Humana', 'UnitedHealthcare'],
    confirmedOn: '2026-11-16',
    source: 'Confirmed by Erekle in Sunfire, Nov 16 2026',
  },
  // Unknown until Erekle confirms. Keep null so the line stays hidden.
  NY: null,
  PA: null,
};

const STATE_CODES: Record<string, string> = {
  'New Jersey': 'NJ',
  'New York': 'NY',
  Pennsylvania: 'PA',
};

function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join('');
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * The Medigap sentence for a state, or null when that state is unconfirmed.
 * Accepts a postal code ('NJ') or a full name ('New Jersey').
 */
export function medigapLineFor(state: string): string | null {
  const code = STATE_CODES[state] ?? state.toUpperCase();
  const entry = medigapCarriersByState[code];
  if (!entry || entry.carriers.length === 0) return null;
  const sorted = [...entry.carriers].sort((a, b) => a.localeCompare(b));
  return `Medicare Supplement (Medigap) plans offered through ${joinNames(sorted)}, where available.`;
}
