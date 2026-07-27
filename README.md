# AegisSage

Medicare educational content hub and personal-brand site for a licensed
independent Medicare advisor. Public, no login, built so that every page ends
in a real phone number.

Next.js (App Router) · TypeScript · Tailwind · Supabase · deployed on Vercel.

---

## Before this goes live

Three things must happen, in this order. None of them are code changes.

**1. Replace every PLACEHOLDER in `lib/site.ts`.** That file is the single
source of truth for the advisor's name, NPN, phone, email and licensed states.
The defaults are fictional. Every one can be overridden by an environment
variable instead of editing the file — see `.env.example`.

**2. Have a human review `components/marketing/disclaimer-footer.tsx`.** It
contains the required CMS TPMO disclosure and is the only place that language
exists. Its header comment carries the reviewer checklist. The plan and
organization counts come from `compliance` in `lib/site.ts` and must match the
advisor's actual contracts.

**3. Drop a real headshot at `public/advisor.jpg`** and set
`NEXT_PUBLIC_ADVISOR_PHOTO=/advisor.jpg`. Without it the site renders initials
in a navy circle — deliberately, so it never ships a broken image or a stock
photo, but the About page is a primary landing target from social and it wants
a face.

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

## Deploying

Hostinger keeps the domain and DNS, pointed at Vercel. The app itself is a
plain Vercel deploy.

- **Vercel project root directory: `aegissage`** — this app is a subdirectory
  of the repo, and it has its own `package.json` and lockfile.
- Set the environment variables from `.env.example` in the Vercel dashboard.
  `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never gain a
  `NEXT_PUBLIC_` prefix.
- Set `NEXT_PUBLIC_SITE_URL` per environment. It drives canonical URLs, the
  sitemap and every absolute OG image URL.

## Database

```bash
supabase db push          # applies supabase/migrations
supabase db reset         # local only; also runs supabase/seed.sql
```

Two tables, both write-only from the app. RLS is enabled on both with **no
policies**, which means the anon key can do nothing at all; only the service
role (used exclusively in `/api/contact`) can write. Adding a policy to either
table is a security change and should be reviewed as one.

- `contacts` — every direct-contact submission. The durable record.
- `quiz_responses` — anonymous eligibility-check analytics. Must never contain
  contact information.

## How the pieces fit

```
app/(marketing)/     content + state pages, all statically generated
app/tools/           eligibility check, coverage comparison
app/api/contact/     the only write path: validate → store → notify
app/api/og/          dynamic OG images, one per article
components/marketing/disclaimer-footer.tsx   ← compliance lives here, only here
lib/site.ts          ← advisor identity lives here, only here
lib/validations/     zod schemas + the quiz's rules engine
content/             MDX articles (medicare-basics, blog)
proxy.ts             rate limiting on /api/contact
```

**The disclaimer renders once, in `app/layout.tsx`.** Every route inherits it,
including 404. No page should import it and no page should restate the
language inline.

### Contact flow

`ContactForm` → `POST /api/contact` → validate with zod → insert into Supabase
→ email the advisor via Resend and text them via Twilio.

Order matters. Storage happens before notification, so a Resend or Twilio
outage can never lose someone's request — the row is already durable and the
failure is logged. Notification failures never fail the request.

Both notification channels degrade to a logged warning when their credentials
are unset. The code path is real either way: set the env vars and it sends,
with no code change.

### Compliance boundaries in code

Three components carry rules that are easy to break with an innocent-looking
edit. Each has the rule written at the top of the file:

- `disclaimer-footer.tsx` — required disclosure text, single source of truth.
- `plan-comparison-table.tsx` — compares *structure* only. No plan names, no
  premiums, no rankings, no "best for" column.
- `lib/validations/quiz.ts` — the quiz explains *enrollment windows and
  deadlines*, which are federal and identical for every carrier. It never
  recommends coverage and never states an eligibility determination.

Consent is required before submission, shown above the submit button, and
enforced twice: in the zod schema and again in the API route. Each stored row
records `consent_text_version` so a later wording change does not rewrite what
someone actually agreed to.

## Writing an article

Drop an `.mdx` file in `content/medicare-basics/` or `content/blog/`.
Frontmatter needs `title`, `description`, `date` and `category`; guides also
take an `order`. The build fails loudly on a missing field rather than
rendering a half-formed page.

Components available inside MDX (registered in
`components/marketing/mdx.tsx` — MDX files cannot import):

| Component | What it is |
| --- | --- |
| `<G k="irmaa" />` | Inline glossary term. Keys live in `lib/glossary.ts`. |
| `<Callout type="note\|watch\|tip" title="…">` | Boxed aside. |
| `<PullQuote attribution="…">` | Large pull quote. |
| `<KeyPoints items={[…]} />` | Numbered takeaways. |
| `<VideoEmbed youtubeId="…" title="…" />` | Click-to-load, never autoplays. |
| `<AskMe>` | In-article contact CTA. |

Each article automatically gets a distinct OG image built from its title,
category and description — no per-article image work.

## The UX rules this site is built to

These are not preferences. The primary reader is 65+ on a phone, and the
secondary reader is their adult child.

- Body text starts at **19px**. The Tailwind `base` size is overridden to make
  the small end of the scale unreachable by accident.
- Every tap target clears **48×48** (`h-touch`).
- Nothing depends on hover. The glossary uses a click-driven popover, not a
  tooltip, for exactly this reason.
- One question per screen in the quiz. Never a long form on one page.
- A trust signal — photo, NPN, phone number — sits next to every CTA.
- No autoplaying media. Zoom is never disabled.
- `prefers-reduced-motion` is respected globally in `globals.css`.

Verified with axe-core (WCAG 2.1 A/AA + best-practice) across all pages and
interactive states, and with Lighthouse mobile.

## Not in this build

No authentication. No agent dashboard or CRM views. No broker-recruitment
pages or B2B copy — that is a later phase. No payments.

## One deviation from the build brief

The brief specifies `middleware.ts`. Next 16 deprecated that filename in
favour of `proxy.ts` — same request hook, same matcher config, new name. The
file is `proxy.ts` and behaves identically; keeping the old name emitted a
deprecation warning on every build and would break on the next major.
