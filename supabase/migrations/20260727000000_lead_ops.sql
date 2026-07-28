-- ═══════════════════════════════════════════════════════════════════════════
--  AegisSage — lead operations
--
--  Adds granular consent, an outbound sync outbox, notification delivery
--  tracking, and SMS opt-out persistence.
--
--  SECURITY MODEL (unchanged from the initial migration, and deliberately so):
--  every table here has RLS ENABLED WITH NO POLICIES. With RLS on and no
--  policy, `anon` and `authenticated` can do nothing at all; only the service
--  role — which bypasses RLS and never leaves the server — can read or write.
--  Do not add a policy to any of these tables without treating it as a
--  security change. None of this data should ever be readable by a browser.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Granular consent on contacts ───────────────────────────────────────────
--
-- The original form captured ONE consent boolean covering "may contact me
-- about Medicare options, including by text". That is not sufficient to
-- lawfully send automated SMS, and it is not sufficient to send marketing
-- email. Those are now three separate, independently recorded permissions.
--
-- CRITICAL: existing rows get `false` for the two new consents. They are NOT
-- backfilled from the old combined consent, because the old wording did not
-- disclose automated messaging, message frequency, or STOP/HELP handling.
-- Inferring SMS consent from a historical checkbox is exactly the failure
-- mode TCPA enforcement targets. Those people can still be called and
-- emailed a reply under the terms they agreed to — nothing more.
alter table public.contacts
  add column if not exists consent_sms boolean not null default false,
  add column if not exists consent_sms_at timestamptz,
  add column if not exists consent_sms_text_version text,
  add column if not exists consent_marketing boolean not null default false,
  add column if not exists consent_marketing_at timestamptz,
  add column if not exists consent_marketing_text_version text,
  add column if not exists consent_at timestamptz;

comment on column public.contacts.consent_sms is
  'Explicit, standalone permission to receive SMS. Never inferred from a phone number, from preferred_contact = text, or from the general contact consent.';
comment on column public.contacts.consent_marketing is
  'Explicit, standalone permission to receive future marketing/educational email. Separate from consent to receive a reply to this request.';

-- Notification state for the advisor alert, so a silent Resend failure is
-- visible rather than buried in a log line.
alter table public.contacts
  add column if not exists notified_at timestamptz,
  add column if not exists notify_status text not null default 'pending';

alter table public.contacts
  drop constraint if exists contacts_notify_status_valid;
alter table public.contacts
  add constraint contacts_notify_status_valid check (
    notify_status in ('pending', 'sent', 'failed', 'skipped')
  );

create index if not exists contacts_notify_failed_idx on public.contacts (created_at desc)
  where notify_status = 'failed';

-- ── lead_sync_outbox ───────────────────────────────────────────────────────
--
-- Transactional-outbox pattern. The website never calls the CRM inline: it
-- writes a row here, and a separate worker drains it. That keeps the
-- visitor's request fast, survives a CRM outage without losing a lead, and
-- makes every delivery attempt auditable after the fact.
--
-- `idempotency_key` is what makes the whole thing safe to retry. It is
-- derived from the contact id, so a replayed or duplicated attempt resolves
-- to the same key and the receiving system can reject the duplicate.
create table if not exists public.lead_sync_outbox (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  contact_id        uuid not null references public.contacts(id) on delete cascade,

  -- Stable across every retry of this lead. Unique, so a double-enqueue is a
  -- no-op at the database level rather than a duplicate CRM record.
  idempotency_key   text not null unique,

  -- The exact JSON body that will be delivered. Snapshotted at enqueue time
  -- so a later edit to the contact row cannot silently change what was sent,
  -- and so a retry re-sends byte-identical content.
  payload           jsonb not null,

  status            text not null default 'pending',
  attempts          integer not null default 0,
  max_attempts      integer not null default 8,

  -- Exponential backoff target. The worker only claims rows due now.
  next_attempt_at   timestamptz not null default now(),

  last_error        text,
  last_attempt_at   timestamptz,
  delivered_at      timestamptz,

  -- Identifier returned by the receiving system, for reconciliation.
  remote_id         text,

  constraint lead_sync_outbox_status_valid check (
    status in ('pending', 'in_flight', 'delivered', 'failed', 'dead')
  ),
  constraint lead_sync_outbox_attempts_sane check (attempts >= 0 and max_attempts > 0)
);

comment on table public.lead_sync_outbox is
  'Outbound lead deliveries to the Agent Factory CRM. Drained by /api/internal/sync-leads. Never readable from a browser.';
comment on column public.lead_sync_outbox.idempotency_key is
  'Stable per contact. The receiving system must treat a repeat of this key as a duplicate and not create a second lead.';
comment on column public.lead_sync_outbox.payload is
  'Snapshot of the delivered body. Immutable after enqueue so retries are byte-identical and auditable.';

create index if not exists lead_sync_outbox_due_idx
  on public.lead_sync_outbox (next_attempt_at)
  where status in ('pending', 'in_flight');
create index if not exists lead_sync_outbox_contact_idx on public.lead_sync_outbox (contact_id);
create index if not exists lead_sync_outbox_status_idx on public.lead_sync_outbox (status, created_at desc);

alter table public.lead_sync_outbox enable row level security;

-- ── notification_deliveries ────────────────────────────────────────────────
--
-- One row per attempted message, internal or client-facing. This is the audit
-- trail: what was sent, to which channel, on whose authority, and what the
-- provider said about it.
--
-- `audience` is the field that keeps internal advisor alerts and client-facing
-- messages apart. They have completely different consent rules — an internal
-- alert to Eric needs no consent from anyone, a client SMS needs explicit
-- attributable consent — and conflating them is how a system accidentally
-- texts a beneficiary who never opted in.
create table if not exists public.notification_deliveries (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  contact_id        uuid references public.contacts(id) on delete set null,

  channel           text not null,
  audience          text not null,

  -- 'contact-alert', 'lead-acknowledgement', 'overdue-nudge', ...
  purpose           text not null,

  status            text not null default 'queued',
  attempts          integer not null default 0,

  provider          text,
  provider_message_id text,
  -- Who the message was addressed to (normalised E.164, or an email). The
  -- per-destination SMS rate limiter counts on this. Do NOT overload
  -- provider_message_id for it — that holds the provider's own message id, so
  -- matching a phone number against it silently matches nothing and the limit
  -- fails open.
  destination       text,
  last_error        text,

  -- Which consent authorised this send. NULL for internal audience, since no
  -- consumer consent is involved in alerting the advisor.
  consent_basis     text,

  sent_at           timestamptz,
  failed_at         timestamptz,

  constraint notification_deliveries_channel_valid check (channel in ('email', 'sms')),
  constraint notification_deliveries_audience_valid check (audience in ('internal', 'client')),
  constraint notification_deliveries_status_valid check (
    status in ('queued', 'sent', 'failed', 'retrying', 'permanently_failed', 'skipped')
  ),
  -- A client-facing message must always name the consent that permitted it.
  constraint notification_deliveries_client_needs_basis check (
    audience <> 'client' or consent_basis is not null
  )
);

comment on table public.notification_deliveries is
  'Audit trail for every notification attempt. audience=internal are alerts to the advisor; audience=client require an explicit consent_basis.';

create index if not exists notification_deliveries_contact_idx
  on public.notification_deliveries (contact_id, created_at desc);
create index if not exists notification_deliveries_failed_idx
  on public.notification_deliveries (created_at desc)
  where status in ('failed', 'permanently_failed');
create index if not exists notification_deliveries_sms_rate_idx
  on public.notification_deliveries (destination, created_at desc)
  where channel = 'sms' and audience = 'client';

alter table public.notification_deliveries enable row level security;

-- ── sms_opt_outs ───────────────────────────────────────────────────────────
--
-- Persistent, permanent suppression list keyed by phone number.
--
-- This is checked before EVERY client-facing SMS, and it deliberately
-- outlives the contact row: if someone texts STOP and later submits the form
-- again, they stay suppressed until they explicitly START. An opt-out that
-- can be erased by re-submitting a form is not an opt-out.
create table if not exists public.sms_opt_outs (
  phone             text primary key,
  opted_out_at      timestamptz not null default now(),
  -- 'STOP' keyword, manual advisor action, or provider-reported unsubscribe.
  reason            text not null default 'stop_keyword',
  -- Set when a START/UNSTOP keyword re-subscribes them. Non-null means the
  -- suppression is lifted; the row is kept for the audit trail either way.
  opted_in_again_at timestamptz
);

comment on table public.sms_opt_outs is
  'Permanent SMS suppression. Checked before every client-facing SMS. Survives new form submissions by design.';

alter table public.sms_opt_outs enable row level security;

-- ── updated_at maintenance ─────────────────────────────────────────────────
-- INVOKER, not DEFINER: this only ever sets NEW.updated_at, so it needs no
-- elevated rights. As a SECURITY DEFINER function it was also reachable at
-- /rest/v1/rpc/touch_updated_at by anon and authenticated, which the Supabase
-- security advisor flags. EXECUTE is revoked below so it is a trigger only.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_updated_at() from public;
revoke all on function public.touch_updated_at() from anon;
revoke all on function public.touch_updated_at() from authenticated;

drop trigger if exists lead_sync_outbox_touch on public.lead_sync_outbox;
create trigger lead_sync_outbox_touch
  before update on public.lead_sync_outbox
  for each row execute function public.touch_updated_at();

drop trigger if exists notification_deliveries_touch on public.notification_deliveries;
create trigger notification_deliveries_touch
  before update on public.notification_deliveries
  for each row execute function public.touch_updated_at();
