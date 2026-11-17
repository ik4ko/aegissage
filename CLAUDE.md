# aegissage.com — project invariants

Consumer Medicare brokerage site for one licensed independent agent.
NOT a SaaS product. Never use: dashboard, seats, pricing tiers, sign in,
book of business, upload your roster, plan-switch detection.

Stack: Next.js 15 App Router, TypeScript, Supabase, Vercel.
Audience: 65+ and their adult children. iPad/Safari, reading glasses.
18px+ body, 44px+ tap targets, high contrast, plain language, no urgency tactics.

## Compliance — never violate
- TPMO disclaimer renders always-visible in footer, exact CMS wording
  (42 CFR 422.2267(e)(41)). The counted version is the default on every route.
- TPMO counts: organization and product counts come ONLY from a dated Sunfire
  recount by Erekle with "Appointed Only" switched on, for the plan year
  being sold. Medicare Advantage and Part D products only (MA/MAPD, SNP,
  PDP); Medigap is never in this number. They live in one config value,
  `tpmoCountsByArea` in lib/site.ts, keyed by area, each with a `countDate`.
  Recheck every October 1 and on any contracting change. An area without a
  recount is `null`; it never gets a placeholder, an estimate, or last
  year's number. The build warns when a count is over 12 months old or
  predates the last October 1.
- Fallback rule: a page about a place with no count of its own (New York
  City, Philadelphia, other state pages) states the Bergen County figures
  and says "in Bergen County, NJ" in place of "in your area". Never let a
  page imply Bergen numbers apply somewhere else.
- Medigap is separate from the TPMO count and never included in it. Medigap
  carriers live in `medigapCarriersByState` in lib/medigap.ts, keyed by
  state, confirmed by Erekle with a date. A state that is `null` (NY and PA
  today) shows no Medigap line. Fixed wording: "Medicare Supplement (Medigap)
  plans offered through [carriers], where available." No prices, rankings
  or logos.
- Lead forms may ask whether the person has Medicare Part A and Part B
  (four fixed choices, optional). Never a Medicare number, SSN or date of
  birth.
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
- NPN is published (About page, schema, llms.txt) as of Nov 15 2026. The only
  valid value is the one in `advisor.npn`. Never retype it from memory.
- Never publish the Sunfire recorded-line number. The only public phone is
  `advisor.phone`. Plan discussion and enrollment happen after a Scope of
  Appointment, on the recorded line.
- No superlatives about the broker or any plan ("best", "top", "#1"), no
  carrier steering, no "free" used in a way that implies a plan benefit, no
  Medicare or government logos, no counts of affected or displaced members.

## Canonical identity — must match every public profile exactly
- Business name: Aegis Sage (two words). Domain: aegissage.com.
  "AegisSage" appears only as schema `alternateName`.
- Person: Erekle Niniashvili, licensed independent insurance broker.
  Say "licensed insurance broker", never "licensed Medicare broker".
- Based in: Edgewater, New Jersey (Bergen County). Town only: no street
  address, postal code, geo coordinates or office hours, anywhere.
- Phone: (551) 202-9079. Email: contact@aegissage.com. NPN: 21599052.
- Languages: English, Georgian, Russian.
- Focus areas: Edgewater, Fort Lee, Cliffside Park, Bergen County, Hudson
  County, Brooklyn, Queens, Philadelphia.
- All of the above live in lib/site.ts. Agency profile URLs for schema
  `sameAs` live in `profiles`; Erekle's personal LinkedIn and Facebook live in
  `personProfiles` and go on the Person node only. A blank entry means "URL
  not supplied", never guess one.

## Ready-to-sell carriers, plan year 2027 (MA/PD) — reference, as told by Erekle Nov 16 2026
Do not publish this list or derive a count from it; counts come from the recount.
- NJ: Aetna, Anthem/Wellpoint, Clover, Humana, UnitedHealthcare, Devoted
  (no Bergen plans). Jefferson: TBD.
- NY: Aetna, Humana, UnitedHealthcare, Devoted, plus Healthfirst,
  EmblemHealth, MetroPlus (off-Sunfire, via Applied General).
- PA: Aetna, Clover, Humana, UnitedHealthcare, Devoted, plus Jefferson
  (off-Sunfire).
- Horizon/Braven: not in his Sunfire MA/PD list. Exclude.

## AI-visibility and answer pages
- Educational first: answer the question in the opening paragraph, in plain
  language, before any call to action.
- Every factual claim about Medicare rules cites medicare.gov, cms.gov,
  ssa.gov or a state agency, with `source_url` and `review_date` frontmatter.
- No carrier or plan names, premiums, benefits or star ratings of a named
  plan. Enrollment periods (including the 5-star SEP) are explained
  generically.
- Local detail must be real civil geography or a cited state rule. No
  invented statistics.
- Each page: FAQ schema matching the visible questions, internal links, the
  compliant lead form and tap-to-call.
- Georgian and Russian pages carry the TPMO disclaimer in that language AND
  in English, and stay marked for native review until Erekle (Georgian) or a
  fluent reviewer (Russian) signs off in the frontmatter.
- No fake reviews, no review incentives, no undisclosed forum posting.

## Crawler and search policy
- robots.txt (app/robots.ts) allows every public page to search engines, AI
  search crawlers and model-training crawlers alike: Googlebot, Bingbot,
  Claude-SearchBot, Claude-User, ClaudeBot, OAI-SearchBot, ChatGPT-User,
  GPTBot, PerplexityBot, Perplexity-User. Erekle wants future models to know
  him. Never block a crawler, add `noai` tags or a training opt-out without
  asking. Only /api/ (except /api/og) is closed.
- Search name: "Aegis Sage" alone collides with an unrelated company. Titles,
  the homepage and About H1, meta descriptions and schema `alternateName`
  use "Aegis Sage Medicare" with "Erekle Niniashvili" (`site.searchName`).
  The legal brand name stays "Aegis Sage".
- Every key page must render its full content in the server HTML, with no
  JavaScript. Nothing a crawler needs may load client-side only.
- IndexNow: key in lib/indexnow.ts and public/<key>.txt;
  .github/workflows/indexnow.yml pings after each production deploy.

## Do not modify without being asked
TPMO disclosure component, dynamic state count, Book-a-Time CTA wiring,
header nav (4 items), LocalBusiness areaServed town list, UTM sessionStorage
handling, server-side lead scoring, Phase 2 booking pipeline.

## Facts you must not invent
Carrier names, plan details, org/product counts, license states, NPN,
profile URLs.
If unverified, stop and ask.

## Before finishing any task
Run typecheck, lint, and build. Report failures rather than working around them.