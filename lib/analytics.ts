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

function assertNoPii(event: string, props?: Record<string, Primitive>) {
  if (process.env.NODE_ENV === 'production' || !props) return;

  for (const [key, value] of Object.entries(props)) {
    if (FORBIDDEN_KEYS.test(key)) {
      throw new Error(
        `[analytics] event "${event}" carries a forbidden property "${key}". ` +
          'Analytics must never receive personal or health data. Send an id, ' +
          'an enum or a count instead.',
      );
    }
    if (typeof value === 'string' && VALUE_LOOKS_PERSONAL.some((re) => re.test(value))) {
      throw new Error(
        `[analytics] event "${event}" property "${key}" contains a value that ` +
          'looks like a direct identifier. Send a category, not the value.',
      );
    }
  }
}

function emit(event: string, props?: Record<string, Primitive>) {
  try {
    assertNoPii(event, props);
    track(event, props);
  } catch (err) {
    // A PII assertion is a developer error and must surface in development.
    if (process.env.NODE_ENV !== 'production' && err instanceof Error && err.message.startsWith('[analytics]')) {
      throw err;
    }
    // Anything else — network, blocked script, quota — is never worth
    // breaking a page over.
  }
}

/** A visitor tapped a call, text, email or booking link. `where` is the component id. */
export function trackContactIntent(
  channel: 'call' | 'text' | 'email' | 'book',
  where: string,
) {
  emit('contact_intent', { channel, where });
}

/** Quiz funnel. `questionId` is the question key, never the answer. */
export function trackQuizStep(step: number, questionId: string) {
  emit('quiz_step', { step, question: questionId });
}

export function trackQuizStarted() {
  emit('quiz_started');
}

export function trackQuizCompleted(answered: number) {
  emit('quiz_completed', { answered });
}

export function trackTriageStarted() {
  emit('triage_started');
}

export function trackTriageStep(step: number, question: 'stage' | 'intent') {
  emit('triage_step', { step, question });
}

export function trackTriageCompleted(intent: string) {
  emit('triage_completed', { intent });
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
}

/** Which questions people get wrong tells us what to write about next. */
export function trackIqAnswer(roundId: string, questionId: string, correct: boolean) {
  emit('iq_answer', { round: roundId, question: questionId, correct });
}

export function trackIqComplete(roundId: string, score: number, total: number) {
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
