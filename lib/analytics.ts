'use client';

import { track } from '@vercel/analytics';

/**
 * Engagement + funnel tracking.
 *
 * Deliberately narrow: we record *that* a step happened and where it happened,
 * never what the visitor typed. No names, emails, phone numbers, ZIPs or quiz
 * answer values are ever passed to the analytics layer — only question ids and
 * step numbers. Keep it that way.
 */

type Primitive = string | number | boolean | null;

function emit(event: string, props?: Record<string, Primitive>) {
  try {
    track(event, props);
  } catch {
    // Analytics must never break a page.
  }
}

/** A visitor tapped a call, text or email link. `where` is the component id. */
export function trackContactIntent(
  channel: 'call' | 'text' | 'email',
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
