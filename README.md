# AegisSage

Medicare educational content hub and personal-brand site for a licensed
independent Medicare broker. Public, no login, built so that every page ends
in a real phone number.

Next.js (App Router) · TypeScript · Tailwind · Framer Motion · Supabase ·
deployed on Vercel.

> **This is not the retention SaaS and not the agent dashboard.** It shares a
> name and a domain with a retired product; it shares no code, no database and
> no infrastructure with it. See [Isolation](#isolation).

---

## Before this goes live

One launch detail remains open. It does not require a code change.

**1. Review the broker details in `lib/site.ts`.** The public name is Erekle
Niniashvili, the phone is `(551) 202-9079`, the email is
`en@aegissage.com`, and the 25 licensed states are listed there.
Every configured value can be set by an environment variable; see `.env.example`.

**2. Have a human review `components/marketing/disclaimer-footer.tsx`.** It
holds the required CMS TPMO disclosure and is the only place that language
exists. Its header carries the reviewer checklist. **The plan and organization
counts in `compliance` (`lib/site.ts`) are pending verification** and must match the
advisor's actual contracts before launch.

**3. Wire the alert credentials.** `NOTIFY_EMAIL_TO` and `NOTIFY_SMS_TO` are
unset, so contact alerts currently log a warning instead of sending. The code
path is real — set the Resend and Twilio variables and it sends with no code
change. Until then, submissions are stored but nobody is notified.

Also: drop a real headshot at `public/advisor.jpg` and set
`NEXT_PUBLIC_ADVISOR_PHOTO=/advisor.jpg`. Without it the site renders initials
in a navy circle — deliberately, so it never ships a broken image or a stock
photo, but About is a primary landing target from social and it wants a face.

## Running it

```bash
npm install
npm run dev        # http://localhost:3100
npm run build
npm run typecheck
```

The site builds and runs with no environment variables at all. Contact
submissions log to the console instead of persisting, alerts are skipped with a
warning, and analytics no-op. Nothing crashes.

## Isolation

This project deliberately shares nothing with the retired retention SaaS or the
agent dashboard beyond a brand name.

| | This site |
| --- | --- |
| Repository | its own, this one |
| Supabase project | `aegissage-website` (`oofxhxsjfyuqegicczbu`) |
| Data it holds | public contact-form submissions, anonymous quiz analytics |
| Auth | none, by design |

**The Supabase project is separate on purpose.** Public contact-form data must
never share a database with client or book-of-business PII. If you are ever
about to point `NEXT_PUBLIC_SUPABASE_URL` at another project, stop.

## Deploying

Hostinger keeps the domain and DNS, pointed at Vercel. The app is a plain
Vercel deploy from this repository's root — no subdirectory offset.

- Vercel project **root directory: repository root**.
- Set the environment variables from `.env.example` in the Vercel dashboard.
- Set `NEXT_PUBLIC_SITE_URL` per environment. It drives canonical URLs, the
  sitemap and every absolute OG image URL.
- `aegissage.com` is dedicated to this project. Point it at the Vercel project
  when ready; no DNS changes have been made from here.

## Database

```bash
supabase link --project-ref oofxhxsjfyuqegicczbu
supabase db push          # applies supabase/migrations
supabase db reset         # LOCAL ONLY; also runs supabase/seed.sql
```

The migration in `supabase/migrations/` has already been applied to the
`aegissage-website` project. Two tables, both write-only from the app. RLS is
enabled on both with **no policies**, so the anon key can do nothing at all;
only the service role (used exclusively in `/api/contact`) can write. Adding a
policy to either table is a security change and should be reviewed as one.

- `contacts` — every direct-contact submission. The durable record.
- `quiz_responses` — anonymous eligibility-check analytics. Must never contain
  contact information.

Supabase's linter reports `rls_enabled_no_policy` on both tables. That is the
intended design, not a finding.

## How the pieces fit

```
app/(marketing)/     content, news and state pages, statically generated
app/tools/           eligibility check, Medicare IQ game, coverage comparison
app/api/contact/     the only write path: validate → store → notify
app/api/og/          dynamic OG images, one per article and per shared score
components/motion/   the site-wide scroll-reveal pattern
components/marketing/disclaimer-footer.tsx   ← compliance lives here, only here
lib/site.ts          ← advisor identity lives here, only here
lib/medicare-iq.ts   ← the trivia question bank
lib/validations/     zod schemas + the eligibility rules engine
content/             MDX: medicare-basics, blog, news
proxy.ts             rate limiting on /api/contact
```

**The disclaimer renders once, in `app/layout.tsx`.** Every route inherits it,
including 404. No page imports it and no page restates the language inline.

### Contact flow

`ContactForm` → `POST /api/contact` → validate with zod → insert into Supabase
→ email the advisor via Resend and text them via Twilio.

Order matters. Storage happens before notification, so a Resend or Twilio
outage can never lose someone's request — the row is already durable and the
failure is logged. Notification failures never fail the request.

### Compliance boundaries in code

Four files carry rules that are easy to break with an innocent-looking edit.
Each states its rule at the top:

- `disclaimer-footer.tsx` — required disclosure text, single source of truth.
- `plan-comparison-table.tsx` — compares *structure* only. No plan names, no
  premiums, no rankings, no "best for" column.
- `lib/validations/quiz.ts` — the eligibility check explains *enrollment
  windows and deadlines*, which are federal. It never recommends coverage.
- `lib/medicare-iq.ts` — trivia answers must be federal facts. Never a
  question whose answer is a plan, premium, benefit or carrier.

Consent is required before submission, shown above the submit button, and
enforced twice: in the zod schema and again in the API route. Each stored row
records `consent_text_version`.

## Recurring engagement, without a login

Two mechanisms give someone a reason to come back. Neither needs an account,
and neither sends anything to a server.

### Medicare IQ (`/tools/medicare-iq`)

A trivia game, distinct from the eligibility check — that one is a funnel
tool, this one is a game. Four rotating rounds of six questions; the round
advances on each completed play, so a return visit is a different set. Every
answer reveals *why*, right or wrong.

Personal best, day streak and play count live in `localStorage` only
(`aegissage.medicare-iq.v1`) — no account, no cookie, nothing server-side tied
to a person. Clearing the browser clears the streak, which is the correct
trade for not asking anyone to sign up.

Sharing a result appends `?score=&of=&round=` and the OG image is built from
those params, so a posted link reads "I scored 5/6" rather than the generic
page title.

**Adding a round:** append to `IQ_ROUNDS` in `lib/medicare-iq.ts`. Rotation
picks it up automatically. Read the compliance rules at the top of that file
first.

### Medicare News (`/news`)

Short, frequently-postable items — deadline reminders, rule changes, myth of
the week. The three most recent appear on the homepage.

**Posting an item is one file.** Drop an `.mdx` into `content/news/`. No build
step, no config, no code change; the file name becomes the slug and the
homepage updates itself. `content/news/_TEMPLATE.md` has the frontmatter, the
field table and the one content rule. A stale news feed is worse than none, so
this was built for the lowest possible friction.

## Scroll-reveal motion

Sections and cards animate in as they enter the viewport and reverse once
well clear of it. `components/motion/reveal.tsx` exports `Reveal`,
`RevealGroup` and `RevealItem`; the pattern is applied on the homepage, About,
articles, news and the shared CTA band.

Restraint is the point, given the audience:

- 320ms, translate-only, 14px. No parallax, no scale, no rotation — the
  effects most associated with motion sensitivity.
- Reveals commit at 15% visibility, so content is never withheld from a fast
  scroller.
- The scroll-up reverse only fires once an element is well outside the
  viewport.

**Reduced motion is guaranteed twice.** `usePrefersReducedMotion`
(`lib/use-prefers-reduced-motion.ts`) makes `Reveal` render plain elements with
no motion component at all, and a CSS rule in `globals.css` independently
forces `[data-reveal]` visible under the same media query. The redundancy is
deliberate: an earlier revision relied on Framer's `useReducedMotion`, which
returned `null` and never re-rendered, leaving reduced-motion users looking at
invisible content. Do not remove either half.

There is also a `<noscript>` rule in the layout covering the no-JS case. The
text is in the DOM regardless — only opacity and transform are affected.

## Writing an article

Drop an `.mdx` file in `content/medicare-basics/`, `content/blog/` or
`content/news/`. Frontmatter needs `title`, `description`, `date` and
`category`; guides also take an `order`. The build fails loudly on a missing
field rather than rendering a half-formed page.

Components available inside MDX (registered in `components/marketing/mdx.tsx` —
MDX files cannot import):

| Component | What it is |
| --- | --- |
| `<G k="irmaa" />` | Inline glossary term. Keys in `lib/glossary.ts`. |
| `<Callout type="note\|watch\|tip" title="…">` | Boxed aside. |
| `<PullQuote attribution="…">` | Large pull quote. |
| `<KeyPoints items={[…]} />` | Numbered takeaways. |
| `<VideoEmbed youtubeId="…" title="…" />` | Click-to-load, never autoplays. |
| `<AskMe>` | In-article contact CTA. |

Every article and news item automatically gets a distinct OG image built from
its title, category and description.

## The UX rules this site is built to

Not preferences. The primary reader is 65+ on a phone; the secondary reader is
their adult child.

- Body text starts at **19px**. The Tailwind `base` size is overridden so the
  small end of the scale is unreachable by accident.
- Every tap target clears **48×48** (`h-touch`).
- Nothing depends on hover — the glossary uses a click popover, not a tooltip.
- One question per screen in both quizzes. Never a long form on one page.
- A trust signal — photo, advisor name, phone number — sits next to every CTA.
- No autoplaying media. Zoom is never disabled.

Verified with axe-core (WCAG 2.1 A/AA + best-practice) across every page and
interactive state, and with Lighthouse mobile.

## Not in this build

No authentication. No agent dashboard or CRM views. No broker-recruitment
pages or B2B copy — a later phase. No payments.

## One deviation from the build brief

The brief specifies `middleware.ts`. Next 16 deprecated that filename in
favour of `proxy.ts` — same request hook, same matcher config, new name. The
file is `proxy.ts` and behaves identically; keeping the old name emitted a
deprecation warning on every build and would break at the next major.
