'use client';

import { track } from '@vercel/analytics';

/**
 * Engagement + funnel tracking.
 *
 * Deliberately narrow: we record *that* a step happened and where it happened,
 * never what the visitor typed. No names, emails, phone numbers, ZIPs or quiz
 * answer values are ever passed to the analytics layer — only question ids and
 * step numbers. Keep it that way.
 *
 * ── The rule, stated once so it is not re-litigated per event ─────────────
 * These properties must NEVER be sent, by any event, ever:
 *
 *   Medicare Beneficiary Identifier, date of birth or age in years,
 *   health conditions, diagnoses, prescriptions or drug names,
 *   doctor / provider / facility names, free-text form contents,
 *   email addresses, phone numbers, full names, street addresses,
 *   ZIP codes, IP addresses.
 *
 * Several of those are protected health information the moment they are tied
 * to an individual, and a Medicare audience makes that a live risk rather
 * than a theoretical one. The events below carry ids, counts, enum values and
 * page paths — categories, never people.
 *
 * `assertNoPii` enforces the shape at runtime in development so a future
 * change that starts passing a raw form value fails loudly the first time it
 * runs, rather than quietly shipping.
 */

type Primitive = string | number | boolean | null;

/** Property keys that must never appear. Checked in development only. */
const FORBIDDEN_KEYS =
  /(^|_)(email|phone|tel|name|zip|postal|dob|birth|age|address|mbi|medicare_?number|ssn|condition|diagnosis|drug|prescription|rx|doctor|provider|physician|message|note|ip)($|_)/i;

/** Values that look like direct identifiers regardless of the key they sit on. */
const VALUE_LOOKS_PERSONAL = [
  /[\w.+-]+@[\w-]+\.[\w.]+/, // email address
  /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/, // US phone number
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b[0-9A-Za-z]{11}\b(?=.*\d)(?=.*[A-Za-z])/, // MBI-shaped token
];

/**
 * Returns a description of the first PII violation found, or null if clean.
 *
 * Pure detection — it neither throws nor logs, so the caller decides what to
 * do about a violation in each environment.
 */
function findPiiViolation(props?: Record<string, Primitive>): string | null {
  if (!props) return null;

  for (const [key, value] of Object.entries(props)) {
    if (FORBIDDEN_KEYS.test(key)) {
      return `forbidden property "${key}"`;
    }
    if (typeof value === 'string' && VALUE_LOOKS_PERSONAL.some((re) => re.test(value))) {
      return `property "${key}" contains a value that looks like a direct identifier`;
    }
  }
  return null;
}

/**
 * The page path, with query string and hash deliberately discarded.
 *
 * `?email=...` and `#name=...` are exactly the kind of thing that ends up in
 * a URL, and a page_path property is not worth turning into a PII carrier.
 */
function pagePath(): string {
  if (typeof window === 'undefined') return 'unknown';
  return window.location.pathname;
}

/**
 * ── Why this drops rather than skips in production ────────────────────────
 *
 * This check used to begin with:
 *
 *     if (process.env.NODE_ENV === 'production' || !props) return;
 *
 * so it ran ONLY in development and every production event went out
 * unchecked. The guard was disabled precisely where a leak has consequences,
 * which is the same defect shape as the lead pipeline gating its own audit
 * behind the failure it was meant to record.
 *
 * The dev behaviour is unchanged: throw loudly, because a developer must find
 * out on the first run. Production now DROPS the offending event instead of
 * transmitting it. Losing one analytics event is free; sending a Medicare
 * visitor's ZIP, phone number or MBI to a vendor is not, and this audience
 * makes that PHI rather than a theoretical worry.
 */
function emit(event: string, props?: Record<string, Primitive>) {
  const violation = findPiiViolation(props);

  if (violation) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `[analytics] event "${event}" carries ${violation}. Analytics must ` +
          'never receive personal or health data. Send an id, an enum or a ' +
          'count instead.',
      );
    }
    // Production: drop it. Never send, never break the page.
    console.error(`[analytics] DROPPED event "${event}" — ${violation}.`);
    return;
  }

  try {
    track(event, props);
  } catch {
    // Network, blocked script, quota — never worth breaking a page over.
  }
}

/**
 * A visitor tapped a call, text, email or booking link.
 *
 * Emits one channel-specific event rather than a single `contact_intent` with
 * a channel property. Renamed from `contact_intent` deliberately: these are
 * the three conversion actions worth reporting on individually, and a funnel
 * report should not have to filter one event by a property to see them.
 *
 * NOTE FOR DASHBOARDS: historical data before this change lives under
 * `contact_intent`. Nothing was migrated — Vercel Analytics keeps the old
 * event name for the old rows.
 *
 * `where` becomes `cta_position`: which surface the tap came from (hero,
 * header, header-mobile, sticky, cta-band, 404, location-*). That is the
 * question these events exist to answer.
 */
const CONTACT_EVENTS = {
  call: 'call_click',
  text: 'text_click',
  book: 'booking_click',
  email: 'email_click',
} as const;

export function trackContactIntent(
  channel: 'call' | 'text' | 'email' | 'book',
  where: string,
) {
  emit(CONTACT_EVENTS[channel], { page_path: pagePath(), cta_position: where });
}

/**
 * First field focus on a form, fired once per mount.
 *
 * The pair (form_start, form_submit) is the abandonment rate. Submissions
 * alone cannot distinguish "nobody started" from "everybody gave up".
 */
export function trackFormStart(formId: string) {
  emit('form_start', { form_id: formId });
}

/**
 * A form submitted successfully.
 *
 * ── ZIP is deliberately absent ────────────────────────────────────────────
 * The original spec listed `zip` as a parameter. It is not sent, and cannot
 * be: FORBIDDEN_KEYS matches /zip/ and emit() drops any event carrying it.
 * A 5-digit ZIP alongside a birth month is a meaningful re-identification
 * pair for a Medicare-age visitor, and ZIP is already in Supabase where it is
 * actually needed. Do not add it here.
 */
export function trackFormSubmit(
  formId: string,
  detail?: { intent?: string; contactPref?: string },
) {
  emit('form_submit', {
    form_id: formId,
    intent: detail?.intent ?? 'unspecified',
    contact_pref: detail?.contactPref ?? 'unspecified',
  });
}

/**
 * One of the public tools was opened. `toolName` is a slug, never a result.
 *
 * The property is `tool`, NOT `tool_name` as the spec named it: FORBIDDEN_KEYS
 * matches any key ending in `_name`, so `tool_name` would be dropped in
 * production and throw in development. The guard is right and the parameter
 * name is what changes — never loosen a PII pattern to fit a label.
 */
export function trackToolStart(toolName: string) {
  emit('tool_start', { tool: toolName });
}

/** A tool reached its result screen. */
export function trackToolComplete(toolName: string) {
  emit('tool_complete', { tool: toolName });
}

/**
 * The homepage two-question router resolved to a branch.
 *
 * `branch` is the chosen route id (learn / compare / talk) — an enum from the
 * component, never anything the visitor typed.
 */
export function trackRouterSelect(branch: string) {
  emit('router_select', { branch });
}

/** Quiz funnel. `questionId` is the question key, never the answer. */
export function trackQuizStep(step: number, questionId: string) {
  emit('quiz_step', { step, question: questionId });
}

export function trackQuizStarted() {
  emit('quiz_started');
  trackToolStart('eligibility-check');
}

export function trackQuizCompleted(answered: number) {
  emit('quiz_completed', { answered });
  trackToolComplete('eligibility-check');
}

// ── Late enrollment penalty calculator ─────────────────────────────────────
// This tool collects Medicare eligibility and enrollment MONTHS, which are a
// date of birth in all but name — `assertNoPii` would rightly throw on them.
// Nothing here carries a date, and nothing carries the dollar figure that was
// shown to the visitor. Only the step reached, and coarse booleans about the
// shape of the outcome, which is all that is needed to know whether the tool
// works.

export function trackPenaltyStarted() {
  emit('penalty_started');
  trackToolStart('penalty-calculator');
}

/** `field` is which screen was reached ('eligible', 'coverage'), never a value. */
export function trackPenaltyStep(step: number, field: string) {
  emit('penalty_step', { step, field });
}

export function trackPenaltyCalculated(outcome: {
  /** Whether any penalty came out above zero. Not the amount. */
  owes: boolean;
  /** Whether the visitor answered "not sure" and got a worst case. */
  uncertain: boolean;
  /** Whether they have still not enrolled, so the gap is open. */
  stillAccruing: boolean;
}) {
  trackToolComplete('penalty-calculator');
  emit('penalty_calculated', outcome);
}

// ── IRMAA calculator ───────────────────────────────────────────────────────
// This tool takes an income figure, which is the most sensitive input any
// tool on the site collects. It never leaves the browser and it never reaches
// analytics — not the amount, and not the bracket it landed in, because a
// bracket IS an income band and naming one is naming a person's income to
// within a few thousand dollars.
//
// What is sent is whether any surcharge applied at all, plus the filing
// status, which is the pair that answers "is this tool working and who is
// using it" without describing anyone's finances. Same posture as the penalty
// calculator, which sends `owes` rather than the dollar figure.

export function trackIrmaaStarted() {
  emit('irmaa_started');
  trackToolStart('irmaa-calculator');
}

export function trackIrmaaCalculated(outcome: {
  /** Whether a surcharge applied. Never the tier, never the amount. */
  surcharge: boolean;
  /** Filing status enum — 'single' | 'joint' | 'separate'. */
  filing: string;
}) {
  trackToolComplete('irmaa-calculator');
  emit('irmaa_calculated', outcome);
}

export function trackTriageStarted() {
  emit('triage_started');
  trackToolStart('triage-router');
}

export function trackTriageStep(step: number, question: 'stage' | 'intent') {
  emit('triage_step', { step, question });
}

export function trackTriageCompleted(intent: string) {
  emit('triage_completed', { intent });
  trackToolComplete('triage-router');
  trackRouterSelect(intent);
}

/** Contact form outcomes. `source` matches the payload's source field. */
export function trackContactSubmit(source: string, status: 'success' | 'error') {
  emit('contact_submit', { source, status });
}

/** Someone used the native share sheet or copied an article link. */
export function trackShare(method: 'native' | 'copy', path: string) {
  emit('article_share', { method, path });
}

/** Reader reached the end of an article body. */
export function trackArticleRead(slug: string) {
  emit('article_read_complete', { slug });
}

/** A glossary tooltip was opened — tells us which jargon actually confuses people. */
export function trackGlossaryOpen(term: string) {
  emit('glossary_open', { term });
}

// ── Medicare IQ ────────────────────────────────────────────────────────────
// Round and question ids only. Scores are aggregate counts, never tied to a
// visitor — the game's own progress lives in localStorage and never leaves
// the browser.

export function trackIqStart(roundId: string) {
  emit('iq_start', { round: roundId });
  trackToolStart('medicare-iq');
}

/** Which questions people get wrong tells us what to write about next. */
export function trackIqAnswer(roundId: string, questionId: string, correct: boolean) {
  emit('iq_answer', { round: roundId, question: questionId, correct });
}

export function trackIqComplete(roundId: string, score: number, total: number) {
  trackToolComplete('medicare-iq');
  emit('iq_complete', { round: roundId, score, total });
}

/** Someone opened a news item from the homepage strip or the index. */
export function trackNewsOpen(slug: string, from: 'home' | 'index') {
  emit('news_open', { slug, from });
}

// ── Conversion funnel ──────────────────────────────────────────────────────

/**
 * A reader reached the end of the Original-vs-Advantage comparison.
 *
 * "Completion" for a comparison table is reading it, so this fires when the
 * final row enters the viewport — not on page load, which would make the
 * metric meaningless.
 */
export function trackPlanComparisonCompleted() {
  emit('plan_comparison_completed');
  trackToolComplete('plan-comparison');
}

/** Mobile route toggle on the comparison table. Enum value, not free text. */
export function trackPlanComparisonRouteView(route: 'original' | 'advantage') {
  emit('plan_comparison_route_view', { route });
}

/**
 * A visitor pressed play on an embedded video.
 *
 * Because the embed is click-to-load, this is the moment YouTube is first
 * contacted — so the event doubles as an honest record of when a third party
 * entered the page. `where` is the page surface, `video` is the YouTube id,
 * which identifies a public video and not a person.
 */
export function trackVideoLoad(video: string, where: string) {
  emit('video_load', { video, where });
}

/**
 * An outbound link was followed. `host` only — never the full destination
 * URL, which can carry query parameters we have no reason to record.
 */
export function trackOutboundClick(host: string, where: string, kind: 'official' | 'social' | 'other' = 'other') {
  emit('outbound_click', { host, where, kind });
}

/** A visitor opened or printed the free Medicare preparation checklist. */
export function trackResourceUse(resource: string, action: 'view' | 'print') {
  emit('resource_use', { resource, action });
}

/**
 * First-touch campaign attribution for this session.
 *
 * Sent once per session from the layout. Values are UTM tokens, a pathname
 * and a referring host — all sanitized in lib/attribution.ts and none of them
 * personal. This is what lets a contact submission be traced back to the
 * landing page without attaching anything to a human being.
 */
export function trackSessionStart(attribution: Record<string, string>) {
  emit('session_start', {
    source: attribution.utm_source ?? attribution.referrer ?? 'direct',
    medium: attribution.utm_medium ?? 'none',
    campaign: attribution.utm_campaign ?? 'none',
    landing: attribution.landing ?? '/',
  });
}
