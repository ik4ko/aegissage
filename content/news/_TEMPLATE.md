# How to post a news item

Copy this pattern into a new `.mdx` file in this folder. The file name becomes
the URL slug, and the newest three items appear on the homepage automatically.

Note that this file is `.md`, not `.mdx` — that is what keeps it out of the
site and out of the frontmatter guard. Do not rename it.

```mdx
---
title: "Short and specific — this is the headline"
description: "One sentence. Shows on the homepage strip, the index and the OG image."
author: "Erekle Niniashvili"
published: "2026-03-14"
updated: "2026-03-14"
reviewed_by: "Erekle Niniashvili"
status: "approved"
expires_on: "2027-03-14"
category: "Deadline"
---

Two or three short paragraphs. Keep it to something you could say out loud in
thirty seconds.

You can use every component the articles use — <G k="part-b" /> for a glossary
term, <Callout type="watch"> for a warning box, and so on.
```

## Fields

Every field marked required is enforced at build time by `lib/content-guard.ts`.
A missing or empty one **fails `next build`** — it is not a warning, and the
site will not deploy until it is fixed. The build reports every problem across
every file at once, so you fix them in one pass rather than one per rebuild.

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | The headline. |
| `description` | yes | One sentence. Used on cards and the OG image. |
| `author` | yes | Who wrote it. |
| `published` | yes | `YYYY-MM-DD`. Sorting is newest-first, strictly by this. Was called `date`. |
| `updated` | yes | `YYYY-MM-DD`. Set equal to `published` on a new item. Must never be earlier than `published`. |
| `reviewed_by` | yes | Who checked it for compliance before it went live. |
| `status` | yes | Must be exactly `approved`. Anything else fails the build. |
| `expires_on` | yes | `YYYY-MM-DD`. Once this date passes, **the build starts failing** — see below. |
| `category` | yes | The chip on the card. See suggested set below. |
| `makes_plan_claim` | no | `true` if the piece makes a plan-specific claim. Then `source_url` **and** `review_date` are both required. |
| `source_url` | conditional | One `https://` URL backing the claim. Required when `makes_plan_claim: true`. |
| `review_date` | conditional | `YYYY-MM-DD`. When a human last checked the claim. Cannot be a future date. Required when `makes_plan_claim: true`. |

### `updated` and the "Updated" byline

`updated` is required, so its presence no longer signals a revision — every
item has one. The article header prints "Updated <date>" only when `updated` is
**strictly after** `published`. Leave the two equal on a new item and the page
shows a plain publication date, which is the truth.

### `expires_on` is a deliberate time bomb

A build that passes today will fail once `expires_on` goes by, with no code
change. That is the point: it forces a human to re-read the piece rather than
letting stale Medicare guidance sit on the site indefinitely. When it fires,
re-review the item and push the date out, or delete the file.

Because this fails on a date rather than on a commit, **a redeploy of an
untouched commit can fail.** If a deploy suddenly breaks and nothing changed,
check this field first.

### `makes_plan_claim`, `source_url` and `review_date`

This is a compliance invariant, not a style preference. From CLAUDE.md:

> Plan-specific claims (premium, benefit, star rating, carrier) require
> `source_url` + `review_date` in frontmatter or they do not render.

Set `makes_plan_claim: true` when the piece states a premium, a benefit, a star
rating, a named carrier, or an enrollment figure — anything a reader could act
on that is specific to a plan rather than to Medicare generally. Then give both
the citation and the date someone checked it.

The guard fails the build rather than quietly not rendering the claim. That is
stricter on purpose: a page that renders without its claim still ships, whereas
a failed build ships nothing at all.

The guard also scans the body for high-confidence patterns (a dollar figure
next to premium/benefit wording, an N-star rating, a named carrier, a specific
enrollment count). If it finds one while `makes_plan_claim` is unset, the build
fails and tells you which sentence tripped it. Explaining that Medigap usually
costs more per month is not a plan claim; saying a plan has a $0 premium is.

## Suggested categories

Keep this list short so the chips stay meaningful: **Deadline**, **Plan year**,
**Myth of the week**, **Rule change**, **Reminder**.

## The one rule

Nothing in here may name a plan or a carrier, quote a premium, or describe a
benefit. News items are subject to the same marketing rules as every other
page — announce deadlines, explain rule changes, bust myths. A stale news feed
is worse than none, so short and frequent beats long and rare.
