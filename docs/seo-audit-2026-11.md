# SEO, AI and voice search audit, November 17, 2026

Run against production (https://www.aegissage.com) after the town pages (#20) went live. No code was changed for this report.

## Summary

| Area | Result |
|---|---|
| Crawlability | All 101 sitemap URLs return 200, with no redirect chains inside the site and no broken internal links. robots.txt allows every listed crawler, and the homepage is `index, follow`. |
| Titles, descriptions, canonicals | Every page has a title, description and self-canonical, and exactly one H1. 1 duplicate title, 29 titles that Google will cut off, 18 descriptions over 160 characters. |
| Structured data | 15 types in use, no JSON parse errors. One real error: the FAQ schema on `/medicare-checklist` describes 4 questions that are not on the page. |
| Name, phone, URL | Consistent everywhere: "Aegis Sage", `+15512029079` / (551) 202-9079, `https://www.aegissage.com`, Edgewater NJ. No stray or old phone number found. |
| Speed and accessibility | Lighthouse: accessibility, best practices and SEO 100 on every page tested. Performance 100 on desktop, 94 to 99 on mobile. CLS 0 everywhere. |
| **AI and search visibility** | **aegissage.com and Erekle's name appeared in none of the 20 test questions, including a search for the brand name itself.** This is the biggest problem, and it is not a technical block. It is a new domain with almost no other sites linking to it. |

## 1. Speed, accessibility and Core Web Vitals

The PageSpeed Insights API refused requests without a key (HTTP 429: the shared daily quota was used up). These are the same Lighthouse 12.8 tests PageSpeed runs, run from this PC against production, one page at a time. They are **lab** numbers. **Field** Core Web Vitals (real Chrome users) need a free API key for PageSpeed or CrUX: see L3.

Mobile is a mid-range phone on a slowed 4G connection. TBT (total blocking time) is the lab stand-in for INP.

| Page | Mobile perf | Mobile LCP | Mobile CLS | Mobile TBT | Desktop perf | Desktop LCP | Accessibility | Best practices | SEO |
|---|---|---|---|---|---|---|---|---|---|
| / | 98 | 2.0 s | 0 | 120 ms | 100 | 0.6 s | 100 | 100 | 100 |
| /about | 95 (runs: 81, 96, 95) | 4.7 s | 0 | 130 ms | 100 | 0.6 s | 100 | 100 | 100 |
| /contact | 83 (runs: 83, 96, 83) | 4.4 s | 0 | 120 ms | 100 | 0.5 s | 100 | 100 | 100 |
| /book | 95 | 2.9 s | 0 | 110 ms | 100 | 0.6 s | 100 | 100 | 66 (noindex on purpose) |
| /medicare-glossary | 97 | 2.4 s | 0 | 110 ms | 100 | 0.5 s | 100 | 100 | 100 |
| /medicare-enrollment-calendar | 97 | 2.3 s | 0 | 130 ms | 100 | 0.5 s | 100 | 100 | 100 |
| /answers/turning-65-new-jersey | 94 | 2.9 s | 0 | 130 ms | 100 | 0.6 s | 100 | 100 | 100 |
| /answers/medigap-new-jersey | 94 | 2.9 s | 0 | 120 ms | 100 | 0.6 s | 100 | 100 | 100 |
| /answers/medicare-help-new-york-city | 95 | 2.6 s | 0 | 170 ms | 100 | 0.6 s | 100 | 100 | 100 |
| /answers/how-to-check-if-a-doctor-is-in-a-medicare-plan | 96 | 2.6 s | 0 | 140 ms | 100 | 0.6 s | 100 | 100 | 100 |
| /answers/medicare-enrollment-periods-explained | 94 | 2.8 s | 0 | 170 ms | 100 | 0.5 s | 100 | 100 | 100 |
| /medicare-jersey-city | 94 | 2.9 s | 0 | 130 ms | 100 | 0.6 s | 100 | 100 | 100 |
| /medicare-hackensack | 95 | 2.7 s | 0 | 150 ms | 100 | 0.6 s | 100 | 100 | 100 |
| /medicare-brooklyn | 99 | 1.4 s | 0 | 120 ms | 100 | 0.6 s | 100 | 100 | 100 |

What this says:
- **Accessibility, best practices and SEO are 100 on every page tested.** `/book` scores 66 on SEO only because it is `noindex`, which is deliberate.
- **Desktop performance is 100 everywhere.** Mobile is 94 to 99. The first runs of `/about` (81) and `/contact` (83) were noise from a busy PC. On re-runs both scored 95 to 96, and the slow element (the intro paragraph) is not animated or late-loading.
- **Core Web Vitals in the lab:** LCP 1.4 to 2.9 s on mobile (good is under 2.5 s; a few answer pages sit just over), CLS 0 everywhere, TBT 110 to 170 ms.
- **Largest remaining cost:** about 120 to 160 KB of JavaScript that isn't used on first load, and the Google Analytics tag (one ~95 ms task about 3.5 s in). Both are small. Not worth changing alone.


## 2. Structured data

Checked every JSON-LD block on all 101 pages against Google's required properties for each type.

| Type | Pages | Result |
|---|---|---|
| Organization, InsuranceAgency, ProfessionalService, Person, WebSite, Service | 101 | Valid. Same name, phone and URL on every page. |
| BreadcrumbList | 100 | Valid: positions in order, every item named, URLs present. |
| Article / NewsArticle | 33 | Valid: headline, author, datePublished and image present. |
| FAQPage | 23 | 22 valid. **`/medicare-checklist` fails**: its 4 FAQ questions are only in the schema, not on the page. Google treats that as a guideline violation, and CLAUDE.md requires the schema to match visible questions. |
| DefinedTermSet / DefinedTerm | 1 page (glossary) | Valid: 40 terms with names and descriptions. |
| ProfilePage, CollectionPage, ItemList, WebPage | 6 | Valid. |
| LocalBusiness-type nodes on the 21 location pages | 21 | No `address`, by policy (town only, no street address). Google's local business rich result needs an address, so these pages will not get one. The schema is still valid and still useful to AI systems. **No change recommended.** The policy is a deliberate privacy choice. |

Note: Google stopped showing FAQ rich results for most sites in 2023. The FAQ schema still helps AI answer engines read the questions, but don't expect FAQ dropdowns in Google.

## 3. Crawl

- **Broken links:** none. **Orphan pages:** none. Every sitemap page has at least one internal link.
- **Pages with only 1 internal link:** `/tools/irmaa-calculator`, `/answers/medicare-help-philadelphia`, `/answers/va-health-care-and-medicare`.
- **Redirects:** `https://aegissage.com` → `www` is 1 hop (308). `http://aegissage.com` takes **2 hops** (http → https apex → https www). It's harmless, but it can be one hop in Vercel's domain settings.
- **Duplicate title:** "Medicare in New Jersey · Aegis Sage" is used by both `/medicare-new-jersey` and `/plans/new-jersey`.
- **Titles over about 65 characters (cut off in Google):** 29. Mostly answer pages, whose long question-style titles get " · Aegis Sage" added, for example `/answers/extra-help-medicare-savings-programs-new-jersey` (103 characters).
- **Descriptions over 160 characters:** 18, for example `/about` (214), `/answers/how-to-check-if-a-doctor-is-in-a-medicare-plan` (198). One is short: `/privacy` (66).
- **Thin pages (under 300 words in the main content):**
  - `/contact` (96)
  - `/tools/eligibility-check` (137), `/videos` (154), `/tools/medicare-iq` (159)
  - `/accessibility` (202), `/blog` (208), `/news` (252)
  - `/how-we-are-paid` (279), `/editorial-policy` (286)

  The tools, listings and policy pages are thin by nature and fine. `/contact` is worth a few plain paragraphs.
- **Town page duplicate content:** each town's own text (headline, intro, sections, questions, local help) shares at most 21.2% of its 6-word phrases with any other location page. The test in `npm test` enforces 30%. Measured on the whole rendered page, including the shared form, call-to-action and footer, the most similar pair is 44% (Jersey City / Union City). That shared part is page layout, which search engines expect. All town pages have 545 to 738 words of main content.
- **Sitemap `lastmod`:** 66 URLs show the deploy time instead of the date the content changed. Search engines learn to ignore a `lastmod` that changes on every deploy.
- **Language pages:** `/ka` and `/ru` are `noindex` and left out of the sitemap and hreflang. This is deliberate until native review, and it is working as designed. It also means no search engine can show a Georgian-language page for "Georgian speaking Medicare agent", a search where nobody currently ranks.
- `/book` is `noindex` and not in the sitemap. This is deliberate and correct.

## 4. Name, address, phone

| Check | Result |
|---|---|
| Business name in schema | "Aegis Sage" only (101 pages) |
| Phone in schema | `+15512029079` only |
| Phone links | `tel:+15512029079` and `sms:+15512029079` on every page. Every other number on the site is a public agency (SHIP, county offices, libraries, Medicare, NJSave) and is labelled as such. |
| URL | `https://www.aegissage.com` (the 21 location pages add their own path as the page URL, which is correct) |
| Service area | Edgewater NJ appears on every page. Site-wide `areaServed` names Bergen and Hudson counties, the town pages, NYC (Brooklyn, Queens) and Philadelphia. |
| Off-site | No off-site listing could be checked, because none came up in search. See section 5 and the off-site kit. |

## 5. AI and search visibility baseline

Twenty questions were run through the web search tool Claude Code uses, on November 17, 2026. This is not Google. It is one independent index, close to what AI assistants that browse the web see.

| # | Question | aegissage.com or Erekle? | What appeared instead |
|---|---|---|---|
| 1 | Medicare agent Bergen County NJ | No | medicareagentshub.com town pages (about 20 Bergen towns) |
| 2 | Medicare help Jersey City | No | fiercehealthcare, paulbinsurance.com, lawinfo, nj.gov SHIP, medicareagentshub |
| 3 | Georgian speaking Medicare agent | No | Results only about the US state of Georgia. **No Georgian-language agent appears at all.** |
| 4 | Russian speaking Medicare agent Brooklyn | No | Liberty Medicare (Gregory Lazarev, via medicareagentshub), JCCGCI counseling center, job ads |
| 5 | Who can help me with Medicare near Fort Lee NJ | No | lawinfo, avvo, Bergen County SHIP, BBB |
| 6 | Turning 65 New Jersey Medicare help | No | AARP, nj.db101.org, NJ State Library, NJ Hospital Association |
| 7 | Medicare broker Edgewater NJ | No | medicareagentshub Edgewater page, Humana agent finder, lawinfo |
| 8 | Erekle Niniashvili Medicare | No | Georgian news about Georgia's health system |
| 9 | Aegis Sage Medicare | No | Aegis Ventures, Sage Health, HealthEdge "Sage" |
| 10 | Russian speaking Medicare broker New Jersey | No | Gregory Lazarev (medicareagentshub), birdeye, nj.gov language pages |
| 11 | site:aegissage.com | No | Look-alike domains on scam-checker sites. The index does not seem to hold the site. |
| 12 | aegissage.com Medicare Edgewater | No | Aegis Living, Edgewater MD and FL pages |
| 13 | Medicare help Hoboken NJ | No | lawinfo, medicareagentshub, nj.gov SHIP, Humana agent finder |
| 14 | Medicare agent Queens Rego Park Russian speaking | No | Gregory Lazarev, JCCGCI, medicareagentshub Rego Park |
| 15 | Free Medicare counseling Bergen County | No | bergencountynj.gov SHIP, Valley Health events, NJ 211 |
| 16 | Medicare insurance agent Hackensack NJ | No | cosmoins.com, medicareagentshub, BBB, county SHIP |
| 17 | Medicare broker Teaneck NJ independent | No | medicareagentshub, Jewish Link profile (Levi Goldberg), thebig65.com |
| 18 | Medicare Advantage help Cliffside Park NJ | No | Templated "Compare Medicare Plans" pages, medicareagentshub, GoHealth, Optum |
| 19 | How do I sign up for Medicare in New Jersey | No | GoHealth, HelpAdvisor, medigap.com, healthinsurance.org |
| 20 | Medigap help New Jersey independent broker Bergen | No | medicareagentshub (Joe Pearson), county SHIP, nj.gov Medigap list |

What this says:
1. **The site isn't being found yet**, even by its own name. A new domain needs other sites to link to it and needs submitting to the search engines. That work is off the site: Search Console and Bing Webmaster (HANDOFF section 7), the listings in the off-site kit, and local press.
2. **medicareagentshub.com came up in 14 of the 20 searches.** A claimed profile there is the fastest way into those results.
3. **Nobody owns "Georgian speaking Medicare agent".** Once Erekle signs off the Georgian page (`/ka`), the site would have the only page on the web made for that search.
4. **For Russian-language searches the competitor is one agency** (Liberty Medicare). The Russian page needs a fluent reviewer before it can compete.
5. For general how-to questions (signing up, turning 65), government and large publishers win. Answer pages can be cited there, but only once the site is indexed and trusted.

## 6. Prioritized fix list

**High**
| # | Fix | Where | Expected impact |
|---|---|---|---|
| H1 | Show the 4 checklist FAQ questions on the page, or remove them from the schema | Code (fix PR) | Removes the only structured-data violation. Avoids a manual-action risk. |
| H2 | Get indexed: verify Search Console and Bing Webmaster, submit the sitemap, request indexing for key pages | By hand (HANDOFF section 7) | Prerequisite for every other gain. Bing also feeds ChatGPT search and Copilot. |
| H3 | Claim the medicareagentshub.com profile and the listings in the off-site kit | By hand (Block 4 docs) | It appears in 14 of 20 local searches. Directory profiles are what AI assistants cite for "agent near me". |
| H4 | Native review of `/ka` (Erekle) and `/ru` (fluent reviewer), then set `reviewed: true` | By hand, then a one-line code change | Opens a search nobody currently answers (Georgian), and lets the Russian page compete. |

**Medium**
| # | Fix | Where | Expected impact |
|---|---|---|---|
| M1 | Shorter search titles for the 29 long titles (a separate SEO title field; the on-page H1 stays) | Code | Full titles in Google results, so the question the page answers stays readable |
| M2 | Give `/plans/new-jersey` its own title | Code | Removes the duplicate title, so the two pages stop competing |
| M3 | Trim the 18 long descriptions to 160 characters | Code | Descriptions shown in full instead of cut mid-sentence |
| M4 | Add plain-language content to `/contact` (what happens when you call, languages, how a meeting works) | Code | Thin page becomes useful, and answers "how do I reach a Medicare broker" |
| M5 | Link the 3 pages that have only one internal link | Code | Helps crawlers and readers find them |
| M6 | Sitemap `lastmod` from real content dates, not the deploy time | Code | Search engines trust the dates and recrawl what actually changed |
| M7 | Fix any Lighthouse item under 90 (see section 1) | Code | Speed and accessibility for older readers on iPads |

**Low**
| # | Fix | Where | Expected impact |
|---|---|---|---|
| L1 | One-hop redirect from `http://aegissage.com` | Vercel domain settings, by hand | Slightly faster first visit from old links |
| L2 | LocalBusiness `address` | No change (privacy policy) | None: rich results are given up on purpose |
| L3 | Real-user Core Web Vitals | Add a free PageSpeed/CrUX API key, then rerun | Field data instead of lab data |

Items in section 6 marked "Code" go into the fix PR. The rest are on the by-hand checklist.
