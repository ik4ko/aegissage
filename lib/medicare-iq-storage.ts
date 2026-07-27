'use client';

/**
 * Medicare IQ progress, stored in localStorage and nowhere else.
 *
 * The no-login decision stands, and this does not quietly work around it:
 * nothing here is sent to a server, nothing is tied to an identity, and there
 * is no cookie. If someone clears their browser the streak is gone, and that
 * is the correct trade for not asking anyone to make an account.
 *
 * Every read is defensive — localStorage throws in private mode on some
 * browsers, and the stored blob may predate a schema change.
 */

const KEY = 'aegissage.medicare-iq.v1';

export type IqProgress = {
  /** How many rounds have been completed. Drives round rotation. */
  plays: number;
  /** Best score as a percentage of the round, 0-100. */
  bestPct: number;
  /** Consecutive days played. */
  streak: number;
  /** ISO date (YYYY-MM-DD) of the last completed round. */
  lastPlayed: string | null;
  /** Round ids already completed, so rotation can prefer unseen sets. */
  seen: string[];
};

const EMPTY: IqProgress = {
  plays: 0,
  bestPct: 0,
  streak: 0,
  lastPlayed: null,
  seen: [],
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function readProgress(): IqProgress {
  if (typeof window === 'undefined') return EMPTY;

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;

    const parsed = JSON.parse(raw) as Partial<IqProgress>;
    return {
      plays: typeof parsed.plays === 'number' ? parsed.plays : 0,
      bestPct: typeof parsed.bestPct === 'number' ? parsed.bestPct : 0,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      lastPlayed: typeof parsed.lastPlayed === 'string' ? parsed.lastPlayed : null,
      seen: Array.isArray(parsed.seen) ? parsed.seen.filter((s) => typeof s === 'string') : [],
    };
  } catch {
    // Corrupt blob or storage disabled — behave like a first-time visitor.
    return EMPTY;
  }
}

/**
 * Record a finished round. Returns the updated progress so the UI can show
 * "new personal best" without a second read.
 */
export function recordRound(
  roundId: string,
  score: number,
  total: number,
): { progress: IqProgress; isBest: boolean } {
  const previous = readProgress();
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const day = today();

  let streak = previous.streak;
  if (previous.lastPlayed === null) {
    streak = 1;
  } else {
    const gap = daysBetween(previous.lastPlayed, day);
    if (gap === 0) streak = Math.max(1, previous.streak); // same day, unchanged
    else if (gap === 1) streak = previous.streak + 1;
    else streak = 1; // missed a day, start over
  }

  const isBest = pct > previous.bestPct;

  const next: IqProgress = {
    plays: previous.plays + 1,
    bestPct: Math.max(previous.bestPct, pct),
    streak,
    lastPlayed: day,
    seen: previous.seen.includes(roundId) ? previous.seen : [...previous.seen, roundId],
  };

  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked. The round still counts for this session.
  }

  return { progress: next, isBest };
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing useful to do.
  }
}
