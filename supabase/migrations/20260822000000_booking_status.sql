-- ═══════════════════════════════════════════════════════════════════════════
--  Booking capture
--
--  Booking through the Google Calendar link produced no row, no alert and no
--  attribution. It is the highest-intent action on the site and it was
--  invisible to everything.
--
--  Google Calendar is off-domain with no return callback, and there is no
--  documented way to pass UTM parameters through an Appointment Schedule link
--  and read them back. So attribution has to be captured BEFORE the redirect,
--  on our own domain, by an interstitial at /book.
--
--  That also settles a consent problem. Reading a booking back out of Google
--  would mean inserting a row asserting `consent = true` — which the
--  contacts_consent_required constraint demands — with a consent_text_version
--  naming wording the person never saw. That is a fabricated consent artifact
--  in the one table whose purpose is proving consent. The interstitial shows a
--  real checkbox, so the consent recorded is the consent given.
--
--  `booking_status` is a real column rather than a key in `context` jsonb
--  because this is the conversion event most worth reporting on, and a jsonb
--  key is awkward to aggregate and impossible to index cheaply.
--
--  Values:
--    null       not a booking — every form submission, past and future
--    'intent'   completed the interstitial and was redirected to Calendar
--
--  Deliberately NOT 'confirmed'. Nothing currently reads Google Calendar back,
--  so we know someone was sent to the booking page and not whether they
--  finished. Recording 'confirmed' would be asserting something unverified.
--  A future Apps Script webhook can add that value; until one exists, the
--  absence is the honest state.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.contacts
  add column if not exists booking_status text;

comment on column public.contacts.booking_status is
  'null = not a booking. ''intent'' = completed the /book interstitial and was redirected to Google Calendar. Never set ''confirmed'' without a source that actually verifies the booking happened.';

alter table public.contacts
  drop constraint if exists contacts_booking_status_valid;

alter table public.contacts
  add constraint contacts_booking_status_valid check (
    booking_status is null or booking_status in ('intent', 'confirmed')
  );

-- Partial: only booking rows are indexed, so the ~all-null column costs
-- almost nothing while "show me bookings, newest first" stays a single scan.
create index if not exists contacts_booking_status_idx
  on public.contacts (created_at desc)
  where booking_status is not null;
