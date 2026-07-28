import 'server-only';
import { getServerSupabase } from '@/lib/supabase/server';
import {
  LEAD_CONTRACT_VERSION,
  assertNoProhibitedFields,
  leadPayloadSchema,
  type LeadPayload,
} from './contract';

/**
 * Transactional outbox for lead delivery.
 *
 * The contact route never calls the CRM inline. It writes a row here and
 * returns; a worker drains the queue. Three reasons, in order of importance:
 *
 *  1. A CRM outage cannot lose a lead. The durable record is already in
 *     `contacts`, and the delivery intent is already in the outbox.
 *  2. The visitor's request does not wait on a third-party round trip.
 *  3. Every attempt is auditable after the fact, which an inline fire-and-
 *     forget call is not.
 */

/** Backoff schedule in minutes, indexed by attempt number. */
const BACKOFF_MINUTES = [1, 5, 15, 60, 180, 360, 720, 1440];

function backoffFor(attempts: number): Date {
  const minutes = BACKOFF_MINUTES[Math.min(attempts, BACKOFF_MINUTES.length - 1)];
  return new Date(Date.now() + minutes * 60_000);
}

/**
 * The dedupe key. Derived only from the contact id, so every retry — and any
 * accidental double-enqueue — resolves to the same key and the receiver
 * rejects the duplicate.
 */
export function idempotencyKeyFor(contactId: string): string {
  return `aegissage-web-lead:${contactId}`;
}

type EnqueueInput = {
  contactId: string;
  submittedAt: string;
  name: string;
  email: string | null;
  phone: string | null;
  zip: string | null;
  preferredContact: 'phone' | 'text' | 'email';
  topic: string | null;
  message: string | null;
  sourcePage: string;
  attribution: Record<string, string>;
  consent: LeadPayload['consent'];
};

/**
 * Queues a lead for delivery. Never throws into the request path — a failed
 * enqueue is logged and swallowed, because the contact row is already stored
 * and the advisor is already being emailed. Losing the CRM copy is
 * recoverable; failing the visitor's submission is not.
 */
export async function enqueueLeadSync(input: EnqueueInput): Promise<boolean> {
  const supabase = getServerSupabase();
  if (!supabase) {
    console.warn('[outbox] Supabase not configured — lead sync not queued.');
    return false;
  }

  const idempotencyKey = idempotencyKeyFor(input.contactId);

  const payload: LeadPayload = {
    contractVersion: LEAD_CONTRACT_VERSION,
    websiteSubmissionId: input.contactId,
    sourceLeadId: idempotencyKey,
    submittedAt: input.submittedAt,
    name: input.name,
    email: input.email,
    phone: input.phone,
    zip: input.zip,
    preferredContact: input.preferredContact,
    topic: input.topic,
    message: input.message,
    sourcePage: input.sourcePage,
    attribution: input.attribution,
    consent: input.consent,
  };

  try {
    // Validate and screen before anything is persisted. A payload that would
    // be rejected by the receiver should never sit in the queue retrying.
    const validated = leadPayloadSchema.parse(payload);
    assertNoProhibitedFields(validated);

    const { error } = await supabase.from('lead_sync_outbox').insert({
      contact_id: input.contactId,
      idempotency_key: idempotencyKey,
      payload: validated,
      status: 'pending',
      next_attempt_at: new Date().toISOString(),
    });

    if (error) {
      // 23505 = unique violation on idempotency_key. That means this lead is
      // already queued, which is exactly what the constraint is for. Not an
      // error condition.
      if (error.code === '23505') return true;
      console.error('[outbox] enqueue failed:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[outbox] enqueue rejected:', err instanceof Error ? err.message : err);
    return false;
  }
}

export type OutboxRow = {
  id: string;
  contact_id: string;
  idempotency_key: string;
  payload: LeadPayload;
  attempts: number;
  max_attempts: number;
};

/**
 * Claims due rows for delivery.
 *
 * Marks them `in_flight` and pushes `next_attempt_at` forward before any
 * network call, so a second worker running concurrently cannot pick up the
 * same row. This is optimistic rather than a true lock — acceptable here
 * because the receiver is idempotent, so the worst case of a double-claim is
 * a duplicate request the CRM rejects, not a duplicate lead.
 */
export async function claimDueLeads(limit = 10): Promise<OutboxRow[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('lead_sync_outbox')
    .select('id, contact_id, idempotency_key, payload, attempts, max_attempts')
    .in('status', ['pending', 'in_flight'])
    .lte('next_attempt_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('[outbox] claim failed:', error.message);
    return [];
  }

  const rows = (data ?? []) as OutboxRow[];
  if (rows.length === 0) return [];

  await supabase
    .from('lead_sync_outbox')
    .update({
      status: 'in_flight',
      last_attempt_at: new Date().toISOString(),
      // Hold off a re-claim while this attempt is in flight.
      next_attempt_at: new Date(Date.now() + 2 * 60_000).toISOString(),
    })
    .in(
      'id',
      rows.map((row) => row.id),
    );

  return rows;
}

export async function markDelivered(id: string, remoteId: string | null): Promise<void> {
  const supabase = getServerSupabase();
  if (!supabase) return;

  await supabase
    .from('lead_sync_outbox')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      remote_id: remoteId,
      last_error: null,
    })
    .eq('id', id);
}

/**
 * Records a failed attempt and schedules the next one.
 *
 * Once `max_attempts` is exhausted the row becomes `dead` rather than being
 * deleted or retried forever. A dead row is a human's problem — it stays
 * visible with its last error so someone can see what happened and re-drive
 * it deliberately.
 */
export async function markFailed(row: OutboxRow, error: string): Promise<void> {
  const supabase = getServerSupabase();
  if (!supabase) return;

  const attempts = row.attempts + 1;
  const exhausted = attempts >= row.max_attempts;

  await supabase
    .from('lead_sync_outbox')
    .update({
      status: exhausted ? 'dead' : 'pending',
      attempts,
      last_error: error.slice(0, 500),
      last_attempt_at: new Date().toISOString(),
      next_attempt_at: exhausted
        ? new Date().toISOString()
        : backoffFor(attempts).toISOString(),
    })
    .eq('id', row.id);
}
