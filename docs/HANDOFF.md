# Handoff: AI-visibility work, Nov 15–16 2026

Last updated Monday Nov 16, late evening. Section 8 lists what is done and not done.

Nothing is merged. Every change is in an open pull request for you to review
on its Vercel preview.

## 1. Pull requests and merge order

Merge in this order. #6 to #9 and #11 to #15 are stacked: each one's base is the
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
- `/` and `/book`: Part A/B buttons above the consent box; the form submits with none chosen; the calendar still opens after the booking step.
- `/plans/new-jersey`, `/medicare-edgewater`: Medigap sentence present. `/plans/new-york`, `/medicare-philadelphia`: absent.

**#12**
- `/` and `/about`: the small line above the main heading reads "Aegis Sage Medicare · Erekle Niniashvili". The browser tab title on `/` starts "Aegis Sage Medicare | Erekle Niniashvili".
- `/robots.txt` lists Googlebot, Bingbot, Claude-SearchBot, Claude-User, ClaudeBot, OAI-SearchBot, ChatGPT-User, GPTBot, PerplexityBot, Perplexity-User.
- After it is merged and deployed: GitHub → Actions → "IndexNow ping" shows a green run.

**#13**
- `/partners`: read it as a practice manager would. No carrier names, no fees, no lists.
- `docs/partners/compliance-guardrails.md`: send the questions at the bottom to Pinnacle before using any one-pager.

**#10**
- `docs/ai-visibility/off-site-kit.md`: profile copy now carries the TPMO sentence with 5 and 31.
- `docs/ai-visibility/referral-targets.csv`: see section 6.

## 2. Open items and owners

| Item | Owner | Detail |
|---|---|---|
| Product count | Closed | 31, confirmed by you Nov 16. The "confirm" note at the top of PR #6 is out of date. |
| "in Bergen County, NJ" fallback | Pinnacle | Approved by you pending their answer (question 2 in section 4). |
| Next.js security notice | Done, PR #15 | Upgraded to 16.4.6. Three clean builds in a row, no notice. |
| zod security advisory | You decide, then Claude Code | `npm audit --omit=dev` reports one high-severity advisory in zod (GHSA-mrhx-c7xc-m3w5). The only fix is the zod 4 major version, which touches lead form validation. CI runs that audit as a blocking step, so CI fails there on any PR against `main` until it is handled. Prompt in section 9. |
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

**Not done**
- Partner research CSV (Priority 2d)
- Gemini runner scaffold
- zod 4 upgrade (new, see section 2)
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

Blocks 1 and 6 are built. Blocks 2 to 5 are not started.

**Block 1, done (PR #14).** Read the "statements made in your name" list at the top of that PR before merging: the byline, the AI-drafting disclosure, the compensation sentences, the Tag Manager check.

**Not started. One prompt per block for Claude Code, each its own PR stacked on the last:**

- **Block 2, design and accessibility.** "Read CLAUDE.md. Audit every page template against WCAG 2.1 AA: contrast, 18px+ body text, 48px tap targets, focus states, form labels and errors, no small gray text. Check each template at 375px wide and fix layout breaks. Run Lighthouse mobile on /, /about, /contact, /answers, /answers/turning-65-new-jersey, /medicare-edgewater, /medicare-bergen-county, /medicare-new-jersey, /medicare-basics and /book; record before and after scores in the PR; fix what keeps any category under 90. Then do a plain-language pass on content/answers/*.mdx for a 6th to 8th grade reading level without changing any fact, source or date."
- **Block 3, reference hub.** "Read CLAUDE.md. Build /medicare-glossary with 40 core terms, each with an anchor, a 2 to 3 sentence definition, a medicare.gov or cms.gov source and DefinedTerm schema. Build /medicare-enrollment-calendar with every enrollment window as a rule, not a year-specific date, all sourced. Add 10 answer pages under content/answers on: Medicare while still working; COBRA and Medicare; retiree coverage; VA and Medicare; moving between NJ, NY and PA; Medigap underwriting basics in NJ and NY; what to bring to a Medicare appointment; how to check whether a doctor is in a plan; Medicare with Medicaid; how to switch plans. Follow the build rules the content guard enforces. Link glossary terms to their anchors and give every answer page 3 related answers. Verify every source URL loads. Stop and ask about any state rule you cannot source."
- **Block 4, technical polish.** "Add a custom 404 with links to the main sections and tap-to-call. Confirm every page type has a canonical tag and Open Graph and Twitter cards with a share image. Crawl the built site for broken internal and external links and fix them. Check alt text and image compression."
- **Block 5, partner research CSV.** Prompt is in section 8.
- **Block 6, Next.js security upgrade. Done Nov 16 (PR #15, stacked on #14).** `next` and `eslint-config-next` 16.4.2 to 16.4.6; nothing else changed. Advisory GHSA-mfr8-8qww-v76h covers 16.3.0 to 16.4.4. Typecheck, lint, tests, build (three clean runs) and the site crawl (76 URLs, 81 internal links) pass. Stack the next block on `fable/nextjs-security-upgrade`.
- **Follow-up found during Block 6, not started: zod.** "Read CLAUDE.md. `npm audit --omit=dev` reports GHSA-mrhx-c7xc-m3w5 in zod 3. Upgrade zod to the patched 4.x release and `@hookform/resolvers` to a version that supports it. Change no validation rule, consent wording or form field. Submit each lead form in a local build and confirm the consent boxes still start unchecked and are stored separately. Run typecheck, lint, test, build and validate, and open a PR." 
