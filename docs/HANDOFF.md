# Handoff: AI-visibility work, Nov 15–16 2026

Nothing is merged. Every change is in an open pull request for you to review
on its Vercel preview.

## 1. Pull requests and merge order

Merge in this order. #6 to #9 and #11 are stacked: each one's base is the
branch before it, so after you merge one, GitHub retargets the next to `main`.
#10 is independent.

| Order | PR | Branch | What it does |
|---|---|---|---|
| 1 | #6 | `fable/ai-visibility` | "Aegis Sage" sitewide, contact@ email, NPN published, schema (Person, InsuranceAgency, languages, sameAs), per-area TPMO counts with the Bergen recount, build warning for stale counts, CLAUDE.md rules |
| 2 | #7 | `fable/ai-visibility-languages` | `/ka` and `/ru` pages, translated form and disclaimer with English beneath, hreflang |
| 3 | #8 | `fable/ai-visibility-answers` | 10 answer pages under `/answers`, with sources, review dates and FAQ schema |
| 4 | #9 | `fable/ai-visibility-attribution` | "How did you find us?", Part A/B question on the contact form, AI referrer capture, GA4 setup notes |
| 5 | #11 | `fable/ai-visibility-forms-medigap` | Part A/B on homepage capture and booking step, Medigap line (NJ only), Sheet writer notes |
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

**#10**
- `docs/ai-visibility/off-site-kit.md`: profile copy now carries the TPMO sentence with 5 and 31.
- `docs/ai-visibility/referral-targets.csv`: see section 6.

## 2. Open items and owners

| Item | Owner | Detail |
|---|---|---|
| Product count: 31 or 26 | You | `productCount` in `tpmoCountsByArea['bergen-nj']`, `lib/site.ts`. 31 assumes the 5 SNPs are separate from the 25. Also change the number in `docs/ai-visibility/off-site-kit.md` and any profile you pasted it into. |
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
