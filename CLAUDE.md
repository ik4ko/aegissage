# AegisSage.com — project invariants

Consumer Medicare brokerage site for one licensed independent agent.
NOT a SaaS product. Never use: dashboard, seats, pricing tiers, sign in,
book of business, upload your roster, plan-switch detection.

Stack: Next.js 15 App Router, TypeScript, Supabase, Vercel.
Audience: 65+ and their adult children. iPad/Safari, reading glasses.
18px+ body, 44px+ tap targets, high contrast, plain language, no urgency tactics.

## Compliance — never violate
- TPMO disclaimer renders always-visible in footer, exact CMS wording.
  Org/product counts live in one config constant with a verified_on date.
- Never imply Medicare affiliation, endorsement, or being sent by Medicare.
- Never state or imply eligibility, approval, savings, $0 premium, or a
  specific benefit before a licensed review. No "you qualify" anywhere.
- No health-condition capture in any form. C-SNP/D-SNP pages are educational only.
- Never collect SSN, MBI, banking details, or medical records.
- Consent: three separate unchecked boxes (call / SMS / email). No pre-check,
  no bundling. Append-only Supabase table, RLS on. Revocation = new row, never delete.
  Persist consent_text_version, timestamp, source_url, utm, user_agent, ip.
- No health/condition data in analytics, pixels, URLs, or error logs.
- Plan-specific claims (premium, benefit, star rating, carrier) require
  source_url + review_date in frontmatter or they do not render.
- NPN stays blank site-wide. This is intentional — do not "fix" it.

## Do not modify without being asked
TPMO disclosure component, dynamic state count, Book-a-Time CTA wiring,
header nav (4 items), LocalBusiness areaServed town list, UTM sessionStorage
handling, server-side lead scoring, Phase 2 booking pipeline.

## Facts you must not invent
Carrier names, plan details, org/product counts, license states, NPN.
If unverified, stop and ask.

## Before finishing any task
Run typecheck, lint, and build. Report failures rather than working around them.