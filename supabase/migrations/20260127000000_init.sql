-- ═══════════════════════════════════════════════════════════════════════════
--  AegisSage — initial schema
--
--  Two tables, both write-only from the application's perspective. There is no
--  auth in this app and no public read path: everything is inserted by the
--  /api/contact route using the service role key, and read by the advisor
--  through the Supabase dashboard.
--
--  RLS is enabled on both tables with NO policies. That is deliberate — with
--  RLS on and no policy, the anon and authenticated roles can do nothing at
--  all, while the service role bypasses RLS entirely. If a policy is ever
--  added here, it should be reviewed as a security change.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── contacts ───────────────────────────────────────────────────────────────
-- Every direct-contact submission from the site. This is the durable record;
-- the email/SMS alert to the advisor is best-effort on top of it.
create table if not exists public.contacts (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),

  name                  text not null,
  email                 text,
  phone                 text,
  zip                   text,

  topic                 text,
  preferred_contact     text not null default 'phone',
  message               text,

  -- Which surface produced the submission: 'contact-form', 'about',
  -- 'eligibility-quiz', 'state-nj', etc. Used for funnel reporting.
  source                text not null default 'contact-form',

  -- Free-form context attached by the submitting surface (quiz answers,
  -- the state page they were on). Never contains anything the visitor did
  -- not knowingly provide.
  context               jsonb,

  -- Consent is required before submission and is enforced in the API route.
  -- The version records WHICH wording the visitor agreed to, so a later
  -- change to the consent language does not rewrite history.
  consent               boolean not null,
  consent_text_version  text,

  -- Abuse controls only.
  user_agent            text,
  ip_address            text,

  -- Advisor's own workflow fields, managed from the Supabase dashboard.
  handled_at            timestamptz,
  notes                 text,

  constraint contacts_consent_required check (consent = true),
  constraint contacts_reachable check (
    (email is not null and email <> '') or (phone is not null and phone <> '')
  ),
  constraint contacts_preferred_contact_valid check (
    preferred_contact in ('phone', 'text', 'email')
  )
);

comment on table public.contacts is
  'Direct-contact submissions from aegissage.com. Written only by /api/contact via the service role.';
comment on column public.contacts.consent_text_version is
  'Version tag of the consent language shown at submission time. Bump in app/api/contact/route.ts when the wording changes.';

create index if not exists contacts_created_at_idx on public.contacts (created_at desc);
create index if not exists contacts_source_idx on public.contacts (source);
create index if not exists contacts_unhandled_idx on public.contacts (created_at desc)
  where handled_at is null;

alter table public.contacts enable row level security;

-- ── quiz_responses ─────────────────────────────────────────────────────────
-- Anonymous, aggregate-only record of eligibility-check completions, used to
-- see which questions people drop on and which situations are most common.
--
-- IMPORTANT: this table must never carry contact information. A visitor who
-- wants to be contacted fills in the contact form, and that lands in
-- `contacts` with the answers attached to it. Nothing here identifies anyone.
create table if not exists public.quiz_responses (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  -- Question id -> answer value, e.g. {"age":"turning-65","employer":"no"}.
  answers      jsonb not null,

  -- How far they got, so partial funnels are measurable.
  completed    boolean not null default false,
  last_step    smallint,

  -- The headline the tool showed, for QA on the rules in lib/validations/quiz.ts.
  result_key   text
);

comment on table public.quiz_responses is
  'Anonymous eligibility-check analytics. Must never contain names, emails, phone numbers or ZIPs.';

create index if not exists quiz_responses_created_at_idx on public.quiz_responses (created_at desc);

alter table public.quiz_responses enable row level security;
