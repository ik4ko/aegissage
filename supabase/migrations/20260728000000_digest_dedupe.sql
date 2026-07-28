-- ═══════════════════════════════════════════════════════════════════════════
--  Durable deduplication for the daily lead-health digest
--
--  The digest reuses public.notification_deliveries rather than introducing a
--  new table: it IS a notification delivery (channel=email, audience=internal,
--  purpose='lead-health-digest'), and the existing row already carries status,
--  attempts, provider, provider_message_id, last_error, sent_at and failed_at
--  — everything needed to record and retry one.
--
--  What was missing is a stable identity for "this exact alert", so a second
--  cron run in the same window cannot send it twice.
--
--  `dedupe_key` is that identity, with a UNIQUE index doing the enforcing.
--  Deduplication has to survive a process restart, a double cron fire, and a
--  Resend timeout that gets retried, so it lives in the database rather than
--  in memory. A unique index is the only version of this that cannot race:
--  two concurrent runs both insert, exactly one wins, the loser gets 23505 and
--  stands down.
--
--  The index is PARTIAL (`where dedupe_key is not null`) so that every
--  existing and future contact-alert row — none of which carry a key — is
--  unaffected and can still be inserted freely.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.notification_deliveries
  add column if not exists dedupe_key text;

comment on column public.notification_deliveries.dedupe_key is
  'Stable identity for an alert that must not be sent twice. NULL for ordinary per-contact notifications. The digest sets it to lead-health-digest:v1:<failure fingerprint>:<week bucket>, so an unchanged set of failures cannot re-alert until it changes or the bucket rolls over.';

create unique index if not exists notification_deliveries_dedupe_key_uniq
  on public.notification_deliveries (dedupe_key)
  where dedupe_key is not null;
