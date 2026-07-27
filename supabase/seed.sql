-- Local development seed data.
--
-- Run against a LOCAL Supabase stack only (`supabase db reset`). Never run
-- this against the production project — these are fictional submissions used
-- to exercise the dashboard views and the funnel reporting.

insert into public.contacts
  (name, email, phone, zip, topic, preferred_contact, message, source, context, consent, consent_text_version)
values
  (
    'Sample Visitor',
    'sample.visitor@example.com',
    '(555) 010-0100',
    '07090',
    'I am turning 65 soon',
    'phone',
    'Turning 65 in April and I have no idea where to start.',
    'contact-form',
    null,
    true,
    '2026-01'
  ),
  (
    'Sample Adult Child',
    'sample.child@example.com',
    null,
    '10001',
    'I am helping a parent or relative',
    'email',
    'Helping my mother in New York. She has Part A only.',
    'about',
    null,
    true,
    '2026-01'
  ),
  (
    'Sample Quiz Finisher',
    null,
    '(555) 010-0102',
    '19103',
    'I am losing employer coverage',
    'text',
    null,
    'eligibility-quiz',
    '{"Where are you in the countdown to 65?":"Already 65 or older","Do you have health coverage through an employer right now?":"I have retiree coverage or COBRA"}'::jsonb,
    true,
    '2026-01'
  );

insert into public.quiz_responses (answers, completed, last_step, result_key)
values
  ('{"age":"turning-65","employer":"no","enrolled":"none","drugs":"few","priority":"doctors"}'::jsonb, true, 5, 'iep'),
  ('{"age":"over-65","employer":"yes-large"}'::jsonb, false, 2, null),
  ('{"age":"under-64","employer":"yes-small","enrolled":"none","drugs":"none","priority":"simple"}'::jsonb, true, 5, 'early');
