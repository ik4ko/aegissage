# Handoff: AI-visibility work, Nov 15–16 2026

Last updated Monday Nov 16, late evening. Section 8 lists what is done and not done.

Nothing is merged. Every change is in an open pull request for you to review
on its Vercel preview.

## 1. Pull requests and merge order

Merge in this order. #6 to #9 and #11 to #17 are stacked: each one's base is the
branch before it, so after you merge one, GitHub retargets the next to `main`.
#10 is independent.

| Order | PR | Branch | What it does |
|---|---|---|---|
| 1 | #6 | `fable/ai-visibility` | "Aegis Sage" sitewide, contact@ email, NPN published, schema (Person, InsuranceAgency, languages, sameAs), per-area TPMO counts with the Bergen recount, build warning for stale counts, CLAUDE.md rules |
| 2 | #7 | `fable/ai-visibility-languages` | `/ka` and `/ru` pages, translated form and disclaimer with English beneath, hreflang |
| 3 | #8 | `fable/ai-visibility-answers` | 10 answer pages under `/answers`, with sources, review dates and FAQ schema |
| 4 | #9 | `fable/ai-visibility-attribution` | "How did you find us?", Part A/B question on the contact form, AI referrer capture, GA4 setup notes |
| 5 | #11 | `fable/ai-visibility-forms-medigap` | Part A/B on homepage capture and booking step, Medigap line (NJ only), Sheet writer notes |
| 6 | #12 | `fable/ai-visibility-discoverability` | robots.txt crawler allow-list, "Aegis Sage Medicare" + "Erekle Niniashvili" in titles, H1s, descriptions and schema, IndexNow |
| 7 | #13 (draft) | `fable/partners` | `/partners` page, four partner one-pagers, compliance guardrails. Hold for Pinnacle. |
| 8 | #14 | `fable/trust-credentials` | Bylines, `/about#credentials`, `/how-we-are-paid`, `/editorial-policy`, `/accessibility`, privacy additions, credential schema |
| 9 | #15 | `fable/nextjs-security-upgrade` | Next.js 16.4.2 to 16.4.6, the security patch. Dependency files only. |
| 10 | #16 | `fable/zod4-upgrade` | zod 3 to 4 (security advisory), form resolver upgrade, 29 lead form validation tests, CLAUDE.md stack line |
| 11 | #17 | `fable/partsab-reference-hub-polish` | Part A/B required (Yes / No / Not sure) on all three forms; `/medicare-glossary`, `/medicare-enrollment-calendar`, 10 more answer pages, glossary links and related answers; share cards on every page, dead source links fixed |
| any | #10 | `fable/ai-visibility-offsite-kit` | Docs only: off-site kit, AI panel, referral list, this file |

### What to check on each preview

**#6**
- Footer on `/`: "Currently we represent 5 organizations which offer 31 products in your area." and "counts verified November 16, 2026".
- Footer on `/medicare-new-york-city`, `/medicare-philadelphia`, `/plans/florida`: same numbers, ending "in Bergen County, NJ."
- `/about`: NPN 21599052, three languages, "licensed insurance broker".
- View source on `/about`, search `sameAs`: the agency list has Google, X, Nextdoor, MyMedicareBroker, YouTube, Instagram; the Person list has LinkedIn, Facebook, MyMedicareBroker.

**#7**
- `/ka`: read every line. It is yours to approve. `/ru` needs a fluent reader.
- Both show a draft banner and are noindex until you set `reviewed: true` in `TRANSLATION_REVIEW` in `lib/language-pages.ts`.

**#8**
- Open three or four `/answers/...` pages. The first paragraph answers the question; sources link to medicare.gov, cms.gov, ssa.gov or a state site.
- Every page has `reviewed_by: "Erekle Niniashvili"`. That is a statement that you reviewed it. Read each one, or change the field.

**#9**
- `/contact`: Part A/B buttons and the "How did you find us?" list are optional and unselected. Submit a test and confirm the alert email shows both.

**#11**
- `/` and `/book`: Part A/B buttons above the consent box; the calendar still opens after the booking step. (From #17 the question is required and the answers are Yes / No / Not sure.)
- `/plans/new-jersey`, `/medicare-edgewater`: Medigap sentence present. `/plans/new-york`, `/medicare-philadelphia`: absent.

**#12**
- `/` and `/about`: the small line above the main heading reads "Aegis Sage Medicare · Erekle Niniashvili". The browser tab title on `/` starts "Aegis Sage Medicare | Erekle Niniashvili".
- `/robots.txt` lists Googlebot, Bingbot, Claude-SearchBot, Claude-User, ClaudeBot, OAI-SearchBot, ChatGPT-User, GPTBot, PerplexityBot, Perplexity-User.
- After it is merged and deployed: GitHub → Actions → "IndexNow ping" shows a green run.

**#13**
- `/partners`: read it as a practice manager would. No carrier names, no fees, no lists.
- `docs/partners/compliance-guardrails.md`: send the questions at the bottom to Pinnacle before using any one-pager.

**#17**
- `/contact`, `/` and `/book`: leave "Do you have Medicare Part A and Part B?" blank and submit. The message "Please choose Yes, No or Not sure." appears and nothing is sent. Choose "Not sure" and it goes through.
- `/medicare-glossary` and `/medicare-enrollment-calendar`: read every entry. They carry your name as reviewer.
- The 10 new pages under `/answers` (list in section 9): read each one, or change `reviewed_by`.
- Any answer page: the first mention of a term such as Part B is a link to the glossary, and "Related answers" at the bottom shows three cards.
- Share any page link into a text message or Slack: the preview shows that page's title and its own image.

**#10**
- `docs/ai-visibility/off-site-kit.md`: profile copy now carries the TPMO sentence with 5 and 31.
- `docs/ai-visibility/referral-targets.csv`: see section 6.

## 2. Open items and owners

| Item | Owner | Detail |
|---|---|---|
| Product count | Closed | 31, confirmed by you Nov 16. The "confirm" note at the top of PR #6 is out of date. |
| "in Bergen County, NJ" fallback | Pinnacle | Approved by you pending their answer (question 2 in section 4). |
| Next.js security notice | Done, PR #15 | Upgraded to 16.4.6. Three clean builds in a row, no notice. |
| zod security advisory | Done, PR #16 | zod 4.6.7. `npm audit --omit=dev` reports 0 vulnerabilities. Submit each of the three forms once on the #16 preview before merging. |
| Partner research CSV | Claude Code | Not built: senior-focused primary care centers (Bergen, Hudson, NYC), senior living communities (Bergen, Hudson), Bergen municipal senior programs, with a `verified` column. |
| Partner kit review | Pinnacle | Questions at the end of `docs/partners/compliance-guardrails.md` (PR #13). |
| Bing Webmaster Tools and Search Console | You | Section 7. |
| NYC and Philadelphia counts | You | Section 3. |
| Medigap carriers for NY and PA | You | Replace `null` in `lib/medigap.ts`. |
| Georgian review of `/ka` | You | Then set `reviewed: true`. |
| Russian review of `/ru` | You, with a fluent reader | Same switch. |
| Paste the Sheet snippet | You | `docs/sheet-writer.md`, on the #11 branch. |
| Google profile URL | You, optional | `sameAs` uses the Knowledge Graph URL the share link redirects to. If you want the `maps.google.com/?cid=` form, copy it from Share on the Maps listing into `profiles.googleBusinessProfile`. |
| Remaining profile claims | You | Bing Places, Apple Business Connect, Yelp, BBB, Patch, medicareagentshub. Paste each URL into `profiles` in `lib/site.ts`. |
| Wording of your two AI leads | You | For the panel questions file. |
| Compliance questions | Pinnacle | Section 4. |
| Read the pages in #17 | You | Glossary, enrollment calendar and 10 answer pages state things in your name. Also the Georgian and Russian words for Yes, No, Not sure and the new error message in `lib/form-strings.ts`. |
| NJ Medigap rule for people 65 and older | You | #17 says New Jersey uses the federal 6-month window for people 65 and older, as your existing Medigap page does. I found a state source only for the under-65 rules. Confirm, or point me to the DOBI page. |
| TPMO wording on multi-state answer pages | Pinnacle | The pages about moving between states and about NJ/NY Medigap state the Bergen counts with "in your area". Ask with question 2 in section 4. |
| Jefferson (NJ) ready-to-sell status | You / Applied General | Marked TBD in CLAUDE.md. |
| Gemini runner scaffold | Claude Code | Not built. Cut for time, as the order allowed. |
| Referral rows not re-verified | You | Section 6. |

## 3. Finishing the NYC and Philadelphia counts

Do this once per county. One ZIP stands for each county:

| Config key | County | ZIP |
|---|---|---|
| `kings-ny` | Kings (Brooklyn) | 11201 |
| `queens-ny` | Queens | 11375 |
| `new-york-ny` | New York (Manhattan) | 10001 |
| `bronx-ny` | Bronx | 10451 |
| `richmond-ny` | Richmond (Staten Island) | 10301 |
| `philadelphia-pa` | Philadelphia | 19103 |

1. Sunfire, plan year 2027, enter the ZIP, switch **Appointed Only** on.
2. Count products in three groups: MA/MAPD, SNP, PDP. Decide the SNP question once (inside the MA/MAPD number or separate) and count every county the same way as Bergen.
3. Count the distinct organizations behind those products.
4. Off-Sunfire carriers you are ready to sell there (Healthfirst, EmblemHealth, MetroPlus in New York; Jefferson in Pennsylvania): open Medicare.gov Plan Finder for the same ZIP, count that carrier's MA/MAPD, SNP and PDP products for 2027, and add them. Add one organization per carrier. Note in `source` that these came from Plan Finder.
5. In `lib/site.ts`, replace that county's `null` in `tpmoCountsByArea`:

   ```ts
   'kings-ny': {
     organizationCount: 0, // your number
     productCount: 0,      // your number
     countDate: '2026-11-20',
     source: 'Sunfire, Appointed Only, plan year 2027, ZIP 11201; plus Healthfirst, EmblemHealth, MetroPlus from Medicare.gov Plan Finder',
   },
   ```
6. Nothing else changes. Once a county has a count, its pages state that county's numbers with "in your area" and stop using the Bergen wording. The New York City pages list each counted county on its own line until all five match or Pinnacle says otherwise.
7. Run `npm run typecheck && npm run lint && npm test && npm run build`. The build prints a warning naming any area still falling back.

Never enter 0, a guess or last year's number. Leave `null` until the recount is done.

## 4. Questions for Pinnacle (paste into an email)

> Subject: TPMO disclaimer and website questions, aegissage.com
>
> Hi,
>
> I am updating aegissage.com and want to confirm six points before I publish.
>
> 1. TPMO disclaimer counts. I count organizations and products in Sunfire with Appointed Only on, MA/MAPD, SNP and PDP for the plan year, Medigap excluded. Is that the right basis? Should SNPs be counted as separate products?
> 2. Counts by area. My Bergen County count is done. For pages about New York City and Philadelphia, which I have not recounted yet, the footer states the Bergen figures and ends "in Bergen County, NJ" instead of "in your area". Is that acceptable as a temporary measure, or should those pages carry different wording until I have their counts?
> 3. Multi-county pages. A New York City page covers five counties whose counts may differ. May I state one sentence per county, each prefixed with the county name?
> 4. Off-Sunfire carriers. For carriers I am appointed with outside Sunfire, I plan to count their products from Medicare.gov Plan Finder and add them. Is that acceptable?
> 5. Translated pages. I have Georgian and Russian pages. The consent wording and the TPMO disclaimer appear in that language with the English text directly beneath. Is that acceptable, or must the English stand alone?
> 6. Other items: (a) Does a Google Business Profile or directory description count as marketing material that needs the TPMO disclaimer? (b) May a state page say "Medicare Supplement (Medigap) plans offered through Aetna, Humana and UnitedHealthcare, where available", with no prices or plan details? (c) For talks at libraries and senior centers with no plan names, no sign-up sheets and no enrollment, is anything further needed to keep them educational events under 42 CFR 422.2264(c)? (d) Is "licensed insurance broker" with my NPN the wording you prefer on the site?
>
> Thank you,
> Erekle Niniashvili, NPN 21599052

## 5. Continuing in Claude Code

1. `git clone https://github.com/ik4ko/aegissage && cd aegissage && npm install`
2. Start Claude Code in that folder. It reads `CLAUDE.md` on its own; that file holds the compliance rules, the canonical identity block, the recount and fallback rules, the Medigap rule and the 2027 ready-to-sell reference. Merge #6 first so `main` has the current version.
3. Give it one task at a time and name the file. Examples:
   - "Read docs/HANDOFF.md section 3. Kings County is 7 organizations and 40 products, counted 2026-11-20 in Sunfire with Appointed Only on. Update the config and open a PR."
   - "NY Medigap carriers are X and Y, confirmed today. Update lib/medigap.ts and open a PR."
   - "I reviewed /ka. Mark the Georgian translation reviewed and open a PR."
4. Standing instructions that worked here: work on a branch, open a PR, never merge to main; before finishing run `npm run typecheck`, `npm run lint`, `npm test`, `NEXT_PUBLIC_SITE_URL=https://www.aegissage.com npm run build`, then `npx next start -p 3200` and `BASE=http://localhost:3200 npm run validate`.
5. If it proposes a number, carrier or plan detail you did not give it, stop it. CLAUDE.md says the same.

## 6. Referral list status

`docs/ai-visibility/referral-targets.csv` has 97 rows. The `verified` column says what was checked:

- 18 rows: website loaded on Nov 16.
- 3 rows: website refused an automated check (not a 404). Open by hand.
- 3 county rows: the old co.bergen.nj.us address has an expired certificate; website changed to bergencountynj.gov.
- 1 row: Cliffside Park Senior Activity Center's recorded page returns 404; link removed, phone kept.
- 1 row dropped: Fairview Senior Center, a stale listing that could not be confirmed.
- 24 rows: new on Nov 16 (Brooklyn and Queens elder law, older adult centers, tax preparers), each seen in a public listing that day.
- **48 rows were not re-verified.** They have no website on record, only a directory listing. Confirm each on the organization's own site or by phone before writing.

Start with priority 5 and 4 rows that are verified. Drafts are education-first and state no referral fees.

## 7. Discoverability checklist

Claude searches with Brave, ChatGPT with Bing, Gemini with Google. Each has
to find and read the site on its own.

### One-time setup (after #12 is merged and deployed)

**Google Search Console**
1. Go to search.google.com/search-console, signed in as contact@aegissage.com.
2. Add property → Domain → `aegissage.com`. Add the TXT record it shows at your domain's DNS provider, then Verify. (If DNS is a problem, use URL prefix `https://www.aegissage.com` and the HTML tag method, and ask Claude Code to add the tag.)
3. Sitemaps → enter `sitemap.xml` → Submit.
4. URL inspection → paste the homepage, `/about` and two answer pages → Request indexing for each.

**Bing Webmaster Tools** (feeds ChatGPT search and Copilot)
1. Go to bing.com/webmasters, sign in.
2. Choose "Import from Google Search Console". It copies the verified site and sitemap in one step.
3. Sitemaps → confirm `https://www.aegissage.com/sitemap.xml` is listed.
4. IndexNow → the page should show submissions after the next deploy. If not, run the "IndexNow ping" workflow by hand from the GitHub Actions tab.

**Brave** has no webmaster console. It finds the site through links and its own crawl. What helps: the profiles in section 2, the medicareagentshub listing, and any local press link.

**medicareagentshub.com listing.** That directory came up in nearly every local agent search I ran on Nov 15. Open the site, find its add or claim listing page, and enter exactly: Aegis Sage, Erekle Niniashvili, licensed insurance broker, Edgewater NJ, (551) 202-9079, contact@aegissage.com, aegissage.com, NPN 21599052. Use the short profile description from `docs/ai-visibility/off-site-kit.md`. If it asks for payment, stop and decide whether it is worth it; I did not check its terms. Then paste the listing URL into `profiles.medicareAgentsHub` in `lib/site.ts`.

### Weekly, 15 minutes, same day each week

Use a private window, signed out. Record rank or "not found" in the panel sheet (`docs/ai-visibility/ai-panel-template.csv`).

| # | Query | Brave (search.brave.com) | Bing | Google |
|---|---|---|---|---|
| 1 | Aegis Sage Medicare | | | |
| 2 | Erekle Niniashvili | | | |
| 3 | Erekle Niniashvili Medicare broker | | | |
| 4 | Medicare broker Edgewater NJ | | | |
| 5 | Medicare agent Fort Lee NJ | | | |
| 6 | Medicare broker Bergen County NJ | | | |
| 7 | Georgian speaking Medicare agent New Jersey | | | |
| 8 | Russian speaking Medicare broker Bergen County | | | |
| 9 | turning 65 Medicare New Jersey what to do | | | |
| 10 | Medicare Advantage plan ending non-renewal letter what to do | | | |

Then the same three checks in the assistants, from the manual panel routine: ask Claude, ChatGPT and Gemini query 4 and query 7 and note whether Aegis Sage is named and what source is cited.

What to expect: queries 1 to 3 should show the site within one to three weeks of indexing. Queries 4 to 8 depend on profiles, reviews and links, and take longer. If query 1 still shows the unrelated company first after a month, the profiles are the lever, not the site.

### Google review request (no incentives)

Send only to people you have already helped, one at a time, never in bulk, and never with anything offered in return. Do not ask for a positive review, do not suggest wording, and do not ask anyone to mention a plan or company.

Text message:
> Hi [first name], this is Erekle from Aegis Sage. If you have a minute, an honest review on Google helps other people find me. Here is the link: [Google review link]. No obligation at all, and thank you either way.

Email:
> Subject: A small favor, if you have a minute
>
> Hi [first name],
>
> I am glad I could help with your Medicare questions. If you are willing, an honest review on Google helps other people in the area find me: [Google review link]
>
> Please write whatever you think, and leave out any personal health or plan details. There is no obligation, and nothing changes either way.
>
> Thank you,
> Erekle Niniashvili, Aegis Sage, (551) 202-9079

Get the link from your Google Business Profile: "Ask for reviews" → copy link. Ask Pinnacle whether they have any restriction on review requests to enrolled clients before you start.

## 8. Done and not done, as of Nov 16 night

**Done, in open PRs**
- TPMO: Bergen recount (5 organizations, 31 products), per-area slots, "in Bergen County, NJ" fallback, CLAUDE.md recount rule (#6)
- sameAs for agency and person (#6)
- Georgian and Russian pages, unreviewed and noindex (#7)
- 10 answer pages (#8)
- Attribution and Part A/B on all three forms (#9, #11)
- Medigap line, New Jersey only (#11)
- Sheet writer snippet, `docs/sheet-writer.md` (#11)
- robots.txt, search name, IndexNow, no-JavaScript and sitemap checks (#12)
- /partners page, one-pagers, guardrails (#13, draft)
- Off-site kit, AI panel, 97-row referral list, this handoff (#10)
- Next.js security upgrade to 16.4.6 (#15)
- zod 4 upgrade and lead form validation tests (#16)
- Part A/B required, reference hub, technical polish (#17)

**Not done**
- Partner research CSV (Priority 2d)
- Gemini runner scaffold
- Re-verifying the 48 referral rows that have no website on record
- NYC and Philadelphia counts, NY and PA Medigap carriers (waiting on you)
- Translation reviews (waiting on you)
- Pasting the Sheet snippet (you)
- Everything in section 7's one-time setup (you)

**Prompts to finish the rest in Claude Code**
- "Read docs/HANDOFF.md. Build the partner research CSV described in the open items: public information only, a `verified` column, no invented rows. Open a PR against main."
- "Upgrade Next.js to the patched release, run typecheck, lint, test, build and validate, and open a PR. Do not change anything else."
- "Read docs/HANDOFF.md section 2. Scaffold the Gemini runner, disabled by default, with a README on enabling it at no cost. Open a PR."

## 9. "Expert team" order of Nov 16, 10pm: status

Blocks 1, 3, 4 and 6 and the zod follow-up are built. Blocks 2 and 5 are not started.

**Block 1, done (PR #14).** Read the "statements made in your name" list at the top of that PR before merging: the byline, the AI-drafting disclosure, the compensation sentences, the Tag Manager check.

**Not started. One prompt per block for Claude Code, each its own PR stacked on the last:**

- **Block 2, design and accessibility.** "Read CLAUDE.md. Audit every page template against WCAG 2.1 AA: contrast, 18px+ body text, 48px tap targets, focus states, form labels and errors, no small gray text. Check each template at 375px wide and fix layout breaks. Run Lighthouse mobile on /, /about, /contact, /answers, /answers/turning-65-new-jersey, /medicare-edgewater, /medicare-bergen-county, /medicare-new-jersey, /medicare-basics and /book; record before and after scores in the PR; fix what keeps any category under 90. Then do a plain-language pass on content/answers/*.mdx for a 6th to 8th grade reading level without changing any fact, source or date."
- **Block 3, reference hub. Done Nov 16 (PR #17, stacked on #16).** `/medicare-glossary` (40 terms, anchors, DefinedTerm schema, a Medicare.gov source each), `/medicare-enrollment-calendar` (26 windows as rules, each sourced) and 10 more answer pages: `medicare-while-still-working`, `cobra-and-medicare`, `retiree-coverage-and-medicare`, `va-health-care-and-medicare`, `moving-between-new-jersey-new-york-pennsylvania`, `medigap-underwriting-new-jersey-new-york`, `what-to-bring-to-a-medicare-appointment`, `how-to-check-if-a-doctor-is-in-a-medicare-plan`, `medicare-and-medicaid-together`, `how-to-switch-medicare-plans`. Glossary terms link automatically in answer pages and every answer page names 3 related answers (the build enforces it). All 50 source URLs load. Three points I could not fully source are listed in the PR and in section 2.
- **Block 4, technical polish. Done Nov 16 (PR #17).** Every one of the 93 pages has a canonical tag and its own Open Graph and Twitter card with a share image. Five dead Medicare.gov source links replaced. The 404 page already existed with section links and tap-to-call; it gained three links. One image on the site: alt text present, served as AVIF, source recompressed with identical pixels. `npm run check:links` checks external links by hand. Not done in Block 4: Lighthouse and a by-eye check at phone width; those belong to Block 2.
- **Part A/B change. Done Nov 16 (PR #17).** Required on all three forms, answers Yes / No / Not sure. Old four-choice answers from a page left open are mapped on the server. Stored rows keep the old words.
- **Block 5, partner research CSV.** Prompt is in section 8.
- **Block 6, Next.js security upgrade. Done Nov 16 (PR #15, stacked on #14).** `next` and `eslint-config-next` 16.4.2 to 16.4.6; nothing else changed. Advisory GHSA-mfr8-8qww-v76h covers 16.3.0 to 16.4.4. Typecheck, lint, tests, build (three clean runs) and the site crawl (76 URLs, 81 internal links) pass.
- **Follow-up to Block 6, zod. Done Nov 16 (PR #16, stacked on #15).** zod 3.25 to 4.6.7 and `@hookform/resolvers` 3.10 to 5.9.2. Required fields, visitor-facing messages, the optional Part A/B question, consent rules and `scoreLead()` inputs are unchanged, checked against a 716-input baseline recorded under zod 3. `scripts/test-lead-forms.mjs` (29 checks) is in `npm test` and CI. Also fixed: the CRM prohibited-field guard never matched the camelCase keys `medicareNumber` and `dateOfBirth`. `npm audit --omit=dev` is at 0. The booking and capture schemas now live in `lib/validations/`. Not checked: the forms in a real browser against Supabase; submit each once on the preview.

**Left after #17:** Block 2 (design and accessibility audit, Lighthouse, plain-language pass) and Block 5 (partner research CSV), each as its own PR stacked on `fable/partsab-reference-hub-polish`. The Gemini runner scaffold from section 8 is also still not built.

### Session of Nov 17, 2026: status

The stack (#6 to #17) is merged and live. #13 (partners) is still a draft and was not merged.

**Done**
- **#18, merged.** The "Written and reviewed by" byline, schema `reviewedBy` and the credential after the reviewer's name show only when `reviewed_by` names Erekle. `docs/sheet-writer.md` test step now uses `chatgpt` / `not-sure`.
- **#19, open: Block 2, design and accessibility.** 18px text floor, no sideways scroll at 375px, solid focus rings, 48px tap targets, consent errors linked to their boxes, WCAG 2.5.3 fix on the sticky call button, keyboard-scrollable IRMAA table, plain-language pass (mean grade 7.8 to 7.4, no fact changed). Before/after Lighthouse and 375px numbers are in the PR.

**Not started, in this order. One PR each, off `main`:**

1. **Town pages.** Hackensack, Englewood, Teaneck, Paramus, Fair Lawn, Palisades Park, Jersey City, Hoboken, Union City, West New York, North Bergen, Weehawken, Brooklyn (Brighton Beach / Sheepshead Bay, Russian-language help) and Queens (Forest Hills / Rego Park). Each page needs real local substance, every item from a public source with a URL and the date checked: NJ SHIP or HIICAP contact, county office on aging, nearest Social Security office, the town's public library or senior center, how Erekle serves the town (phone, video, in person only where true; ask him), languages, the form and tap-to-call, LocalBusiness `areaServed`, and links to 3 answer pages. TPMO: Hudson County and NYC pages are outside Bergen, so they must state the Bergen counts "in Bergen County, NJ". Add each route to `ROUTE_TPMO_AREAS` (or make `usesFallbackScope` cover it) and to the ZIP route list the build guard checks. Add to the sitemap. No two pages may share more than about 30% identical body text; add a check for that to `npm test`. Do not invent an address, phone number or hours: if a source cannot be found, leave the item out and say so in the PR.
2. **Block 5, partner research (docs PR).** Re-verify the 48 unverified rows in `docs/ai-visibility/referral-targets.csv` (organization exists, website, contact page; drop dead ones). New CSV with 100+ rows: senior-focused primary care centers and medical groups in Bergen, Hudson and NYC (community or growth team contact pages), senior living communities in Bergen and Hudson, and every Bergen County municipal senior program. Columns: name, type, town, website, contact page, why they fit, first-message draft (education-first, no fees, no patient lists), priority 1 to 5, verified Y/N. Public information only.
3. **#13 (partners).** Merge `main` into `fable/partners` so it is merge-ready, and re-add the share card #17 gave every page (`pageMetadata()` / `withShareCard()`). Keep it a draft. Do not merge.
4. **Content calendar (docs PR, can share a PR with item 2).** 4 weeks of drafts: Google Business Profile, Nextdoor business page, LinkedIn and Facebook, 2 posts a week each. Each post links to one specific page (answer pages, glossary, calendar, town pages). Short, calm, for readers 64+, no hype, no plan or carrier names, no "best", and the TPMO sentence wherever CMS requires it (ask Pinnacle whether profile posts count; question 6a in section 4). Include 4 posts about Georgian and Russian help.

Tools that helped with Block 2: a 375px sweep with axe-core over every sitemap URL, and mobile Lighthouse, both run against `next build` + `next start` on port 3200. Rerun them after the town pages.

### Later on Nov 17 (after a computer crash): items 1 to 4 above are built

The PC crashed mid-session. Nothing was lost: the tree was clean and #18 and #19 were already pushed. Then:

- **Town pages:** branch `town-pages`, pushed, **PR not opened yet** (`gh` was logged out after the crash). Covers all 14 towns, each with its own copy, local help read on official pages (with the URL and date on the page), and 3 related answers.
  - **TPMO:** Hudson towns map to a new `hudson-nj` area with a `null` count. They, Brooklyn and Queens state the Bergen counts "in Bergen County, NJ".
  - **New test:** `npm run test:locations`. It caps overlap between any two location pages at 30%; the highest now is 22.1%.
  - **Not verified, so left out:** the Weehawken library, the Queens library branches, and Social Security office addresses (each page links ssa.gov/locator instead).
  - **Questions for Erekle are in the PR:** where he meets in person, the site-wide `areaServed` list, and a Hudson recount.
  - **`next build` could not run locally** (out of memory after the crash). Check CI on the PR.
- **Block 5:** branch `block5/partner-research`, pushed, PR not opened. `docs/ai-visibility/partner-research-2026-11.csv` has 111 rows, all from official lists: 61 Bergen senior programs and 29 Bergen assisted living homes (Bergen County Key Services Guide 2024), plus 21 NYC Aging centers in Brighton Beach, Sheepshead Bay, Rego Park and Forest Hills (NYC Open Data).
  - **The 48 rows:** 8 are now verified, with two phone numbers corrected. 40 still have only directory listings and say how to confirm them. None was dropped.
  - **Not done:** senior-focused primary care practices, and Hudson senior living and municipal programs (no official list found).
- **#13 partners:** main merged into `fable/partners` and `/partners` given a share card. Still a draft, not merged.
- **Content calendar:** branch `docs/content-calendar`, pushed, PR not opened. `docs/ai-visibility/content-calendar-4-weeks.md` has 32 posts, 4 of them about Georgian and Russian help. It includes the TPMO sentence pending Pinnacle question 6a.

**Windows note:** Git for Windows checks files out with CRLF. `scripts/test-glossary.mjs` failed on Windows only; the fix is in the town-pages branch.

### Nov 17 evening: SEO, AI and voice session (in progress)

- **Merged today:** #20 town pages. **Waiting for Erekle's "go":** #23 Hudson count (6 orgs / 39 products, CI green).
- **Open, CI green:** #24 audit (`docs/seo-audit-2026-11.md`), #25 SEO fixes (checklist FAQ visible, `seo_title`/`seo_description`, `/plans` title, `/contact` content, sitemap dates).
- **In progress on `seo/voice-search` (pushed, no PR yet):** done so far: the Text button behind `features.textButton` and Speakable schema. Still to do: rewrite the 52 town H2s and 94 answer H2s as spoken questions, each answered first in 40–50 words (measure with a script; keep facts, sources and dates), the `/medicare-questions` hub (30 Q&As, FAQPage schema, links to deep pages, including the IRMAA calculator and the Philadelphia and VA answers for audit M5), then open the PR.
- **Not started:** Block 4 off-site kit docs (Apple Business Connect, Yelp, Bing Places, BBB, Nextdoor, medicareagentshub). Hours: CLAUDE.md says no office hours anywhere, so listings say "by appointment". Ask before publishing hours. Then Block 5: refresh llms.txt and About.
- **Audit headline:** aegissage.com appeared in 0 of 20 test searches, including the brand name. Erekle's by-hand list: Search Console and Bing Webmaster (section 7), the medicareagentshub listing, native review of `/ka` and `/ru`, a PageSpeed/CrUX API key for field data.
