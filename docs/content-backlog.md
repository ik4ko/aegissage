# Content backlog: articles and short videos (draft, nothing here is published)

Started November 26, 2026. Owner: Erekle Niniashvili.

## How to use this list

- **Start from real questions.** The topics below are a starting list built from the questions
  already on the site (`lib/medicare-questions.ts`, the 20 answer pages) and the AI-panel question
  set (`docs/ai-visibility/ai-panel-questions.csv`). They are *likely* questions, not questions a
  specific person asked. Before writing one, tick the **Heard** column only when someone actually
  asked it on a call, by text, at a table or in a comment, and note the words they used. Their
  wording makes the best title.
- **Rules for every piece** (same as CLAUDE.md):
  - Author is Erekle. Every article has `published`, `updated`, `review_date` and `expires_on`.
  - Every Medicare fact cites medicare.gov, cms.gov, ssa.gov or a state agency.
  - No plan names, carrier names, premiums, benefits, star ratings or availability.
  - No client stories, outcomes or savings figures unless Erekle confirms them and compliance
    approves.
  - Georgian and Russian versions carry the TPMO disclaimer in that language and English, and stay
    marked for native review until signed off.
- **Videos:** 45 to 75 seconds, one question each. Say the answer in the first sentence. End with the
  page link, not "call now". Videos that mention plans or enrollment carry the TPMO sentence in the
  description (see `docs/ai-visibility/content-calendar-4-weeks.md`).
- **Check for overlap first.** "Existing page" means the site already answers it. A new article
  should then go deeper or be a video pointing to that page, not a second copy of it.

## Priority 1: turning 65 / new to Medicare

| # | Question (as a person would ask it) | Working title | Format | Existing page | Official sources | Heard? |
|---|---|---|---|---|---|---|
| 1 | "I turn 65 next year. What do I actually have to do, and when?" | Turning 65: the three dates that matter | Article + video | /answers/turning-65-new-jersey | medicare.gov sign-up pages; ssa.gov | |
| 2 | "Will Social Security sign me up automatically?" | Who gets signed up automatically, and who does not | Video | /medicare-questions | ssa.gov; medicare.gov | |
| 3 | "I'm still working at 65. Do I need Part B?" | Working past 65: when waiting on Part B is safe | Video | /answers/medicare-while-still-working | medicare.gov; ssa.gov (CMS-L564 form) | |
| 4 | "What's the difference between Original Medicare and Medicare Advantage, in plain words?" | Two ways to get Medicare, explained at the kitchen table | Video | /tools/plan-comparison | medicare.gov | |
| 5 | "My employer coverage ends soon. What's the order of steps?" | Leaving job coverage after 65: the order of steps | Article | /answers/leaving-employer-coverage-after-65 | medicare.gov; ssa.gov | |

## Priority 2: people comparing or reviewing current coverage

| # | Question | Working title | Format | Existing page | Official sources | Heard? |
|---|---|---|---|---|---|---|
| 6 | "My plan sent a letter that it's ending. What now?" | Your plan is ending: what happens and what to do | Video | /answers/medicare-advantage-plan-ending-non-renewal-letter | medicare.gov Special Enrollment Periods | |
| 7 | "How do I check if my doctor is in a plan before I switch?" | Checking a doctor before you switch, step by step | Video (screen share on Medicare.gov) | /answers/how-to-check-if-a-doctor-is-in-a-medicare-plan | medicare.gov plan finder | |
| 8 | "My drug got more expensive this year. Why, and what can I do?" | When a drug moves tiers: what it means | Article | none (new) | medicare.gov formulary/tier pages | |
| 9 | "I missed December 7. Am I stuck?" | Missed Open Enrollment? What is still possible | Video | /news/after-december-7-what-is-still-possible | medicare.gov joining a plan | |
| 10 | "Can I go back to a supplement after trying Medicare Advantage?" | Trying Medicare Advantage: the way back, by state | Article | /answers/medigap-underwriting-new-jersey-new-york | medicare.gov Medigap; NJ DOBI; NY DFS | |
| 11 | "My doctor is in Manhattan but I live in New Jersey. Does that matter?" | Living in NJ with doctors in NYC: what to check | Article | none (new) | medicare.gov network pages | |

## Priority 3: Georgian- and Russian-speaking audiences

Write in English first, then translate. Erekle reviews Georgian; Russian needs a fluent reviewer.

| # | Question | Working title | Format | Existing page | Official sources | Heard? |
|---|---|---|---|---|---|---|
| 12 | "Can I get Medicare help in Georgian / Russian?" | Medicare help in your language (Georgian and Russian versions) | Video in each language | /medicare-help-georgian-russian (noindex until reviewed) | medicare.gov language help; 1-800-MEDICARE | |
| 13 | "I came to the US later in life. Can I get Medicare without 40 work quarters?" | Medicare without 10 years of work: buying Part A | Article (EN, KA, RU) | partly on /medicare-help-georgian-russian | ssa.gov; medicare.gov | |
| 14 | "My parent has Medicare and Medicaid. What changes?" | Medicare and Medicaid together, explained for families | Video (RU) | /answers/medicare-and-medicaid-together | medicare.gov; NJ DHS; NY HRA | |
| 15 | "How do I help my mother with Medicare when she lives in Brooklyn and I'm in NJ?" | Helping a parent with Medicare from another state | Article | partly on /medicare-brooklyn | medicare.gov (authorization to share info) | |

## Not to make

- City or town pages that only swap the place name (thin copies).
- "Best plan in [town]" or "top Medicare agent" content.
- Anything built on a plan's premium, benefit or star rating.
- Testimonials or client stories without written consent and compliance approval.
