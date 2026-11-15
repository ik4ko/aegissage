# Knowing which leads came from an AI assistant

Three signals, from most to least reliable. None of them stores personal data.

| Signal | Where it comes from | Where you see it |
|---|---|---|
| `foundVia` | The optional "How did you find us?" question on the lead form | The lead alert email ("Found via"), the `context` column of the contact row, the `attribution` map sent to the CRM, GA4 event `form_submit` parameter `found_via` |
| `aiSource` | The browser: the referring site or `utm_source` of the visitor's first page view, matched against known assistant domains (`lib/ai-sources.ts`) | Same places as above, plus GA4 event `session_start` parameter `ai_source` |
| GA4 channel | GA4's own source data | Acquisition reports, once you add the channel group below |

`foundVia` is the one to trust. Assistants do not always pass a referrer, and a person who asks an assistant and then types your name into Google shows up as Google everywhere except in their own answer.

## What still needs you

1. **The Sheet.** The new values travel in the `attribution` map of the lead payload (`foundVia`, `aiSource`, `partsAB`, `locale`). The code that writes the Book of Business sheet is not in this repository, so it needs a column for each value you want to see there. Tell me where that writer lives and I will add them.
2. **GA4 setup below.** About ten minutes of clicking, done once.

## GA4: add an "AI assistants" channel

Google moves these menus from time to time. If a label below is not where I say, search Admin for the words in bold.

1. Open GA4 and click **Admin** (gear, bottom left).
2. Under *Data display*, open **Channel groups**.
3. Click **Create new channel group**. Name it `Default + AI assistants`. It starts as a copy of the default group.
4. Click **Add new channel**. Name it `AI assistants`.
5. Add one condition: **Source** → **matches regex** →

   ```
   chatgpt\.com|chat\.openai\.com|openai\.com|claude\.ai|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com
   ```

6. Save the channel, then use **Reorder** to drag `AI assistants` above `Referral`. Order matters: GA4 assigns the first channel that matches.
7. Save the group.

To use it: in **Reports → Acquisition → Traffic acquisition**, open the primary dimension dropdown and choose *Session Default + AI assistants*.

A custom channel group applies to past data as well, so you will see earlier AI visits immediately.

## GA4: make the two parameters reportable

1. **Admin → Data display → Custom definitions → Create custom dimension.**
2. Dimension name `Found via`, scope **Event**, event parameter `found_via`. Save.
3. Repeat: name `AI source`, scope **Event**, event parameter `ai_source`. Save.

Custom dimensions only collect from the day you create them, so do this before the form change goes live.

## Search Console and Bing

- **Google Search Console → Performance → Search results.** As far as I know, AI Overviews and AI Mode clicks are counted here together with ordinary search and are not broken out; check the Performance report's search-type filter in case Google has since added one. Filter *Queries* by your town names and by "medicare agent" to watch the agent-intent terms.
- **Bing Webmaster Tools.** The site is already verified (`public/BingSiteAuth.xml`). Bing's index feeds ChatGPT search and Copilot, so submit the sitemap there and check for an AI or Copilot performance report in the left menu; it shows which pages get cited.

## What counts as working

One number: leads per month where `foundVia` is ChatGPT, Claude, Perplexity or Gemini. Everything else here exists to explain that number.
