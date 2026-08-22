/**
 * ══════════════════════════════════════════════════════════════════════════
 *  Lead scoring
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  A — urgent, or has explicitly asked to talk
 *  B — a one-to-three month horizon
 *  C — researching, or has said not to follow up
 *
 *  ── What this is not ─────────────────────────────────────────────────────
 *  Not a judgement about the person and not a measure of how valuable they
 *  are. It answers one question: how soon does ignoring this cost them
 *  something? Someone reading three months ahead of turning 65 is a better
 *  outcome for everyone than someone who found the site the week after their
 *  window closed; the score just says who has a clock running.
 *
 *  It must never gate what anyone is shown, what advice they get, or whether
 *  they can book. It exists so an urgent lead is not buried under three
 *  newsletter signups in the same inbox.
 *
 *  ── Pure ────────────────────────────────────────────────────────────────
 *  No I/O, no clock of its own. `now` is passed in so the AEP-window rule is
 *  testable and so a submission is scored against when it ARRIVED rather than
 *  whenever the row is next read.
 * ══════════════════════════════════════════════════════════════════════════
 */

export type LeadScore = 'A' | 'B' | 'C';

export type LeadScoreInput = {
  /** 'intent' when the visitor completed the /book interstitial. */
  bookingStatus?: string | null;
  /** One of CONTACT_TOPICS, when the form collected it. */
  topic?: string | null;
  /** phone | text | email. A channel, never an intent — see below. */
  preferredContact?: string | null;
  /** Which form produced this. */
  source?: string | null;
  /**
   * Quiz answers keyed by question id, valued by option value.
   * e.g. { timing: 'now', age: 'turning-65', enrolled: 'none' }
   */
  answers?: Record<string, string> | null;
  /** "YYYY-MM" from the homepage capture band's optional 65th-birthday field. */
  turns65?: string | null;
  /** When the submission arrived. Injected, never read from a global clock. */
  now: Date;
};

/** Whole months from `now` to a "YYYY-MM" month, or null if unparseable. */
function monthsUntil(yyyymm: string | null | undefined, now: Date): number | null {
  if (!yyyymm) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(yyyymm.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;

  return (year - now.getUTCFullYear()) * 12 + (month - 1 - now.getUTCMonth());
}

/**
 * True inside the Annual Enrollment Period, October 15 to December 7.
 *
 * Month is 0-indexed: 9 = October, 11 = December.
 */
function isAepWindow(now: Date): boolean {
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  if (month === 9) return day >= 15;
  if (month === 10) return true;
  if (month === 11) return day <= 7;
  return false;
}

export function scoreLead(input: LeadScoreInput): LeadScore {
  const answers = input.answers ?? {};
  const timing = answers.timing;
  const months = monthsUntil(input.turns65, input.now);

  /*
    ── C first, because an explicit "do not follow up" outranks everything ──

    Someone who ticked "just reading for now" has told us plainly. Letting an
    A-signal elsewhere override that would mean treating our inference as
    better evidence than their own statement, which is both wrong and the
    fastest way to make a helpful site feel like a funnel.

    The one exception is a booking: if they went on to book a call, they
    changed their mind, and the booking is the more recent statement.
  */
  if (timing === 'just-researching' && input.bookingStatus !== 'intent') {
    return 'C';
  }

  // ── A ──────────────────────────────────────────────────────────────────

  // Booked a call. The strongest signal the site can produce: they gave up a
  // slot in their own calendar.
  if (input.bookingStatus === 'intent') return 'A';

  if (timing === 'now') return 'A';

  // Losing employer coverage starts an eight-month Part B SEP. The clock is
  // already running whether or not they know it.
  if (input.topic === 'I am losing employer coverage') return 'A';

  /*
    Retiree coverage and COBRA are not active employment coverage, so they do
    not protect against the Part B late penalty and do not create a SEP. The
    quiz copy calls this "the single most expensive misunderstanding I see" —
    which makes it urgent regardless of what the person thinks their timing is.
  */
  if (answers.employer === 'retiree-cobra') return 'A';

  // Window open or opening, and nothing in place yet.
  if (answers.age === 'turning-65' && answers.enrolled === 'none') return 'A';

  // Turning 65 this month or next.
  if (months !== null && months <= 1) return 'A';

  // ── B ──────────────────────────────────────────────────────────────────

  if (timing === '1-3-months') return 'B';

  if (months !== null && months <= 3) return 'B';

  // Turning 65 inside the year, with something already in place — real, but
  // not the same emergency as having nothing.
  if (answers.age === 'turning-65') return 'B';

  if (input.topic === 'I am helping a parent or relative') return 'B';

  // A coverage review is routine most of the year and time-boxed during AEP.
  if (input.topic === 'I want to review my current coverage' && isAepWindow(input.now)) {
    return 'B';
  }

  // ── C ──────────────────────────────────────────────────────────────────

  return 'C';
}
