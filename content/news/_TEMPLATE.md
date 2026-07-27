# How to post a news item

Copy this pattern into a new `.mdx` file in this folder. That is the entire
process — no build step, no config, no code change. The file name becomes the
URL slug, and the newest three items appear on the homepage automatically.

```mdx
---
title: "Short and specific — this is the headline"
description: "One sentence. Shows on the homepage strip, the index and the OG image."
date: "2026-03-14"
category: "Deadline"
---

Two or three short paragraphs. Keep it to something you could say out loud in
thirty seconds.

You can use every component the articles use — <G k="part-b" /> for a glossary
term, <Callout type="watch"> for a warning box, and so on.
```

## Fields

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | The headline. |
| `description` | yes | One sentence. Used on cards and the OG image. |
| `date` | yes | `YYYY-MM-DD`. Sorting is newest-first, strictly by this. |
| `category` | yes | The chip on the card. See suggested set below. |
| `updated` | no | `YYYY-MM-DD`, if you revise an item after posting. |

## Suggested categories

Keep this list short so the chips stay meaningful: **Deadline**, **Plan year**,
**Myth of the week**, **Rule change**, **Reminder**.

## The one rule

Nothing in here may name a plan or a carrier, quote a premium, or describe a
benefit. News items are subject to the same marketing rules as every other
page — announce deadlines, explain rule changes, bust myths. A stale news feed
is worse than none, so short and frequent beats long and rare.
