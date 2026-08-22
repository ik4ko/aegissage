-- ═══════════════════════════════════════════════════════════════════════════
--  Lead scoring + id-keyed quiz answers
--
--  APPLY AFTER 20260822000000_booking_status.sql. Both can go in one session.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── lead_score ─────────────────────────────────────────────────────────────
--  A real column rather than a key in `context` jsonb, for the same reason as
--  booking_status: this is something we will sort and filter by constantly,
--  and jsonb is awkward to aggregate and expensive to index.
--
--    A  urgent, or has explicitly asked to talk
--    B  a one-to-three month horizon
--    C  researching, or asked not to be followed up
--
--  Computed by scoreLead() in lib/lead-score.ts at submission time, against
--  the answers as given. It is deliberately NOT recomputed on read: a lead
--  scored A in October because their window was closing is a historical fact,
--  and silently re-grading it to C in January would erase why they were
--  contacted.
--
--  null means "written before scoring existed", not "unscored C".

alter table public.contacts
  add column if not exists lead_score text;

comment on column public.contacts.lead_score is
  'A/B/C urgency at submission time, from scoreLead() in lib/lead-score.ts. null = written before scoring existed. Never recomputed on read; the score records the situation as it was.';

alter table public.contacts
  drop constraint if exists contacts_lead_score_valid;

alter table public.contacts
  add constraint contacts_lead_score_valid check (
    lead_score is null or lead_score in ('A', 'B', 'C')
  );

-- Partial index over A leads only. The query that matters is "show me the
-- urgent ones I have not handled", and that is a tiny slice of the table.
create index if not exists contacts_lead_score_a_idx
  on public.contacts (created_at desc)
  where lead_score = 'A';

-- ── Existing rows are deliberately NOT migrated ────────────────────────────
--  Quiz answers used to be stored in `context` keyed by the full prompt TEXT
--  and valued by the human LABEL:
--
--    {"Where are you in the countdown to 65?": "Turning 65 within the next 12 months"}
--
--  and are now keyed by question id and valued by option value:
--
--    {"age": "turning-65"}
--
--  Backfilling would mean reverse-matching prompt and label strings against
--  the CURRENT wording of the quiz. Any question edited since a row was
--  written would fail to match, and the failure is silent — a row that does
--  not match simply gets no answers, which scores as C. That converts an
--  honest "we do not know" into a confident wrong answer, in a column meant
--  to decide who gets called first.
--
--  So old rows keep their prompt-keyed context and get lead_score = null.
--  They are readable by a human, which is what they were written for, and
--  `null` says truthfully that they were never scored. The volume at the time
--  of writing is small enough that this costs nothing.
--
--  If a backfill is ever genuinely needed, do it as a one-off script with the
--  quiz wording as it stood at each row's created_at, not as a migration.
