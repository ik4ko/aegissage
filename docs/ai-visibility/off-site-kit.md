# Off-site kit: profiles, claims, the weekly AI panel, reviews and press

Everything here is work you do outside the website. Nothing in it needs code.

Order to do it in: section 1 (copy) → section 2 (claims, one sitting) → section 3 (first panel run, to set the baseline) → sections 4 and 5 as ongoing work.

---

## 1. Profile copy

Paste these exactly. The point is that every profile says the same thing in the same words.

**Name field (Google, Bing, Apple, Yelp, BBB):**

```
Aegis Sage
```

Use the two words only. Google's guidelines do not allow descriptors, a person's name or a service in the business-name field, and a newly verified profile is the easiest kind to get suspended. Your name and title go in the description.

**Long description (Google, Bing, Yelp, LinkedIn, Facebook, BBB, directories):**

```
Aegis Sage is the independent Medicare practice of Erekle Niniashvili, a licensed insurance broker based in Edgewater, New Jersey (NPN 21599052). I help people who are turning 65, leaving employer coverage, moving, or reviewing their current coverage understand Medicare Advantage, Part D, and Medicare Supplement (Medigap) options. Serving Bergen and Hudson counties, New York City, and the Philadelphia area by phone, video, or in person in North Jersey. Help in English, Georgian, and Russian. (551) 202-9079 · aegissage.com. Calling this number will direct you to a licensed insurance agent. Not connected with or endorsed by the U.S. government or the federal Medicare program.
```

**Short description (X, Instagram, Nextdoor):**

```
Aegis Sage · Erekle Niniashvili, independent Medicare broker, Edgewater NJ. English, Georgian, Russian. (551) 202-9079
```

**TPMO sentence: PENDING YOUR SUNFIRE RECOUNT.** Once the counts are in, append this to the long description, with the two numbers from `tpmoCountsByArea` for Bergen County:

```
We do not offer every plan available in your area. Currently we represent [N] organizations which offer [M] products in your area. Please contact Medicare.gov, 1-800-MEDICARE, or your local State Health Insurance Program to get information on all of your options.
```

Do not paste the bracketed version anywhere. Google's description limit is 750 characters; with the TPMO sentence the long description is over that, so on Google use the long description up to "aegissage.com." and then the TPMO sentence. Ask Pinnacle whether a profile description counts as marketing material that needs the disclaimer at all; if it does not, the long description above stands as written.

**Same on every profile:**

| Field | Value |
|---|---|
| Phone | (551) 202-9079 |
| Website | https://www.aegissage.com |
| Email | contact@aegissage.com |
| Location | Edgewater, NJ. Service-area business. No street address shown. |
| Service areas | Edgewater, Fort Lee, Cliffside Park, Bergen County, Hudson County, Brooklyn, Queens, Philadelphia |
| Category | Insurance agency (or the closest: Insurance broker, Health insurance agency) |
| Languages | English, Georgian, Russian |

Never enter the recorded-line number on any profile.

---

## 2. Claim checklist

I have not been inside these dashboards during this session. The steps follow each service's standard flow; if a label has moved, the goal of each step is what matters. Tick each one and send me the final profile URL so it goes into `sameAs`.

### Bing Places

Why it matters: Bing's index feeds ChatGPT search and Copilot.

1. Go to bingplaces.com and sign in with the business Google or Microsoft account.
2. Choose **Import from Google Business Profile**. This copies name, phone, category and service area in one step and keeps them matched.
3. Confirm the name is "Aegis Sage" and that the address is hidden (service-area business).
4. Paste the long description. Add the website and the three languages.
5. Verify (usually by phone or email) and wait for the listing to publish.
6. In Bing Webmaster Tools, submit `https://www.aegissage.com/sitemap.xml` if it is not already there.

### Apple Business Connect

Why it matters: Apple Maps, Siri and Spotlight.

1. Go to businessconnect.apple.com and sign in with an Apple Account you will keep.
2. Add a location for "Aegis Sage". If it asks for an address, enter your Edgewater address for verification and choose the option that hides it from customers, if offered. If Apple will not hide it, stop and skip this profile; a public home address is not worth it.
3. Category: Insurance agency. Add phone, website, description.
4. Complete verification (phone call or document upload).

### Yelp

1. Go to biz.yelp.com and search for "Aegis Sage" in Edgewater, NJ. Claim it if it exists; otherwise choose **Add your business**.
2. Choose the service-area option so no street address is shown.
3. Categories: Insurance; Health Insurance Offices (pick what Yelp offers closest to these).
4. Paste the long description under "From the business". Add the website, phone and languages.
5. Decline the ads offer. Yelp will call; you do not need to buy anything for the profile to exist.
6. Do not ask clients for Yelp reviews. Yelp's own rules discourage soliciting them, and solicited reviews tend to be filtered.

### BBB

1. Go to bbb.org and search "Aegis Sage" in Edgewater, NJ.
2. If no profile exists, use the option to add or list your business. A basic profile does not require accreditation.
3. Enter the same name, phone, website and description.
4. Accreditation is a paid membership. Skip it; it is outside your budget rule.

### Patch

1. Go to patch.com and open the Fort Lee or Edgewater-area Patch (whichever covers Edgewater).
2. Find **Add your business** or the local business directory link, usually in the menu or footer.
3. Create the listing with the same name, phone, website and long description.
4. Skip any "featured" or paid upgrade.
5. Patch also accepts community posts and local event notices. Your library session belongs there as an event, written as a public notice and not as an ad.

### Medicare Agents Hub (medicareagentshub.com)

This directory came up for nearly every town I searched, so it is the one most worth being in.

1. Go to medicareagentshub.com and look for the agent sign-up or "Are you an agent?" link.
2. Before creating anything, find out what a basic listing costs. The "Top Rated" positions at the top of each town page look like paid placements. Your rule is no paid placement, so take a listing only if a no-cost tier exists.
3. If it does: use your full name, NPN, "Aegis Sage", the long description, your three languages, and list Edgewater, Fort Lee and Cliffside Park as towns served.
4. Read their terms for how they handle people who contact you through the listing. If they sell or share those contacts with other agents, do not list.

### After all six

- Send me each live profile URL, plus Facebook, LinkedIn, X, Nextdoor and your Google share link. They go into `profiles` in `lib/site.ts`.
- Check that the phone number, website and spelling "Aegis Sage" are identical on every one.

---

## 3. The weekly AI panel

**What it is:** you ask real assistants the questions a prospect would ask and write down whether you appear.

**Files in this folder:**
- `ai-panel-questions.csv`: 20 questions in two sets of 10 (A and B), plus two rows for the exact wording your two AI leads used.
- `ai-panel-template.csv`: the log. Import it into Google Sheets (File → Import → Upload → "Insert new sheet").

**Columns**

| Column | What to write |
|---|---|
| `week_of` | Monday's date |
| `question_id` | Q01 to Q20, L01, L02 |
| `question` | The question, exactly as asked |
| `assistant` | ChatGPT, Claude or Perplexity |
| `mentioned_y_n` | Y if "Aegis Sage" or your name appears anywhere in the answer |
| `position` | 1 if you are the first agent named, 2 if second, and so on. Blank if not mentioned. |
| `how_described` | A few words: what it said about you. This is where wrong facts show up. |
| `competitors_named` | Other agents or agencies named, separated by semicolons |
| `urls_cited` | Every link or source shown, separated by semicolons |
| `notes` | Anything odd: wrong phone, wrong town, refused to recommend anyone |

**The 30-minute routine**

Twenty questions on three assistants is 60 checks, which does not fit in 30 minutes. So alternate: set A on odd weeks, set B on even weeks. Ten questions on three assistants is 30 checks, about a minute each. Every question gets asked every two weeks.

1. Same day and roughly the same time each week. Monday morning works.
2. Open a private or incognito window so nothing you did before affects the answers.
   - **ChatGPT:** logged out, at chatgpt.com.
   - **Perplexity:** logged out, at perplexity.ai.
   - **Claude:** it needs an account. Use a separate account kept only for this, with memory turned off, and start a new chat for every question.
3. Paste the question exactly as written. Do not add your town or your name unless the question has it.
4. One new chat per question. Do not ask follow-ups; the first answer is what a prospect sees.
5. Fill in the row. Copy the cited links.
6. When the ten are done, look at two things only:
   - How many of the 30 answers mentioned you. That is this week's number.
   - Which sites were cited most. That is next week's to-do.

**Reading the results honestly**

- Answers vary from one run to the next. One mention or one miss means little. Look at the count over four weeks.
- Many assistants decline to recommend a specific agent and list directories instead. When that happens, the directory they list is the thing to get into.
- If an assistant states something wrong about you (phone, town, license), note it. The fix is almost always a profile or page that says the right thing clearly.

**The scoreboard**

One row per week on a second sheet:

| week_of | set | ChatGPT mentions /10 | Claude mentions /10 | Perplexity mentions /10 | total /30 | AI-attributed leads this week |
|---|---|---|---|---|---|---|

The last column comes from the "How did you find us?" answers on the form. It is the number that matters.

---

## 4. Asking for reviews

Rules first, because each one is a way to get a profile penalized or to break a rule:

- **No incentives.** No gift card, no raffle, no discount, nothing of value for a review.
- **Ask everyone the same way.** Do not ask only the people you expect to be happy. Asking selectively is called review gating and Google does not allow it.
- **Never write, edit or suggest the words.** Not even "you could mention that I speak Georgian".
- **Not during an appointment or an enrollment.** Ask afterward, once the help is finished.
- **Google only.** Do not solicit Yelp reviews.
- **When you reply to a review, do not confirm the person is a client** and do not mention their plan, their health or anything they told you. "Thank you for the kind words" is the whole reply.

**In person or on the phone, at the end:**

> "One thing, and there is no obligation at all. If you ever feel like leaving an honest review on Google, good or bad, it helps other people decide whether to call me. I can text you the link if you want it."

**Text, only if they said yes:**

> "Hi [first name], this is Erekle from Aegis Sage. Here is the link you asked for, if you would like to leave an honest review: [your Google review link]. No obligation, and thank you either way."

**Email, only if they said yes:**

> Subject: The review link you asked for
>
> Hi [first name],
>
> Here is the link, if you would like to leave an honest review of your experience: [your Google review link]
>
> There is no obligation, and I do not offer anything in return. Whatever you write is yours to write.
>
> Thank you,
> Erekle Niniashvili
> Aegis Sage · (551) 202-9079

Get your Google review link from the Business Profile dashboard under "Ask for reviews".

**Gray area to raise with Pinnacle:** some carriers restrict agents from soliciting testimonials from enrollees. A review of you as a broker is not a testimonial about a plan, but ask before you start.

---

## 5. Press pitches

Two pitches. Both lead with something useful to the outlet's readers and not with you. Do not pitch during the last week of Open Enrollment; editors are flooded then. The weeks after December 7 are better, because the two angles below are both about what happens next.

### Pitch A: a local outlet (Bergen County)

Candidates that came up in my searches: your local Patch (Fort Lee / Edgewater area), and The Jewish Link, which ran a profile of a Bergen County insurance agent this year. Pick one. Do not send the same pitch to several at once.

> Subject: For your readers on Medicare: the deadline most people do not know about
>
> Hi [editor's name],
>
> Most people think Medicare decisions end on December 7. For a lot of your readers they do not. People already in a Medicare Advantage plan can change it once between January 1 and March 31, and people whose plan is not being renewed have until the end of February to choose a new one. Those dates come straight from Medicare.gov, and very few people know them.
>
> I am a licensed insurance broker in Edgewater and I would be glad to write a short, plain-language piece for [outlet] on what residents can still change after December 7, with the official sources linked. No plan names, no sales pitch. I can also answer reader questions if that is more useful to you.
>
> I am also giving a free "AI and Medicare" session at the Edgewater library on [date], open to anyone, if that fits your community calendar.
>
> Thank you for considering it.
>
> Erekle Niniashvili
> Licensed insurance broker, Aegis Sage, Edgewater NJ
> (551) 202-9079 · contact@aegissage.com · aegissage.com

### Pitch B: a Georgian- or Russian-language community outlet

Candidates: see the rows marked `community` and `media` in `referral-targets.csv`. Send it in the outlet's language. The Georgian version you can write yourself; have a fluent reader check a Russian one.

> Subject: Medicare explained in [Georgian / Russian], for your readers
>
> Hello [name],
>
> Many people in our community reach 65 without anyone having explained Medicare to them in their own language. The letters are in English, the deadlines are strict, and the rules for people who have worked in the United States for less than ten years are different in ways that surprise families.
>
> I am a licensed insurance broker in Edgewater, New Jersey, and Georgian is my first language. I would like to offer [outlet] a short article, in [language], covering three things: when to sign up, what the rule is for people with a shorter work history here, and how to get an interpreter from Medicare itself at no cost. Everything in it comes from Medicare.gov and CMS, and it names no insurance company.
>
> I would also be glad to take questions from readers, or to speak at a community gathering, without charge.
>
> Thank you,
>
> Erekle Niniashvili
> Licensed insurance broker, Aegis Sage
> (551) 202-9079 · contact@aegissage.com
> aegissage.com/medicare-help-georgian-russian

**Rules for anything that gets published**

- An educational article names no carrier, no plan and no benefit. The moment it does, it is marketing material and needs carrier review.
- An educational event is not a sales event. You may not collect Scope of Appointment forms or enroll anyone at one. You may leave a card.
- If an outlet offers a paid "sponsored article", decline. It is an ad, and your rule is no paid placement.
- Your byline should say "licensed insurance broker", never "Medicare expert" or "Medicare specialist" with any suggestion of a government role.
