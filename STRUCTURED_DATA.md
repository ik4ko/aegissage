# Structured data and technical SEO

## Where it lives

- `lib/seo.ts` owns the sitewide JSON-LD graph: `WebSite`, `Organization`, the named `Person`, the service-area `ProfessionalService`, and the visible `Service` entities.
- `app/layout.tsx` renders that graph on every public route.
- `lib/seo.ts` also provides `breadcrumbJsonLd` and `faqJsonLd` helpers.
- Breadcrumbs are rendered by the applicable route or shared layout. FAQ schema is rendered only where the exact questions and answers are visible in the page content: the homepage (`HOME_FAQS` in `app/page.tsx`), `/medicare-basics`, `/medicare-checklist`, and every service page built on `components/marketing/service-page.tsx` (`/medicare-advantage-plans-nj`, `/medicare-supplement-medigap-nj`, `/medicare-part-d-drug-plans-nj`, `/medicare-plan-ending-letter`, `/dual-eligible-medicare-medicaid`, `/medicare-help-georgian-russian`). Each of those renders the visible Q&A and the schema from the same array, so they cannot drift.
- Article schema: `articleJsonLd()` in `components/marketing/article-layout.tsx` emits `Article` on `/medicare-basics/*`, `BlogPosting` on `/blog/*` and `NewsArticle` on `/news/*`, with dates taken from frontmatter `published` / `updated`, `author` → `#advisor` and `publisher` → `#organization`.
- `app/sitemap.ts` and `app/robots.ts` generate `sitemap.xml` and `robots.txt`.
- `next.config.js` redirects the apex `aegissage.com` host to the preferred `www.aegissage.com` host.

## Safe updates

Keep schema synchronized with visible, approved content. Safe maintenance includes updating the site description, social profiles, licensed-state source, service-area entries, and article/page metadata when those facts change in the corresponding source files. Keep all `@id` values stable and rooted at `site.url`.

Do not add ratings, reviews, prices, offers, carrier or plan claims, or medical-condition claims without visible, verifiable supporting content and compliance approval.

## Facts still required

The site currently publishes Erekle Niniashvili's name, role (`Independent Medicare Broker`), phone, email, licensed-state list, and legitimate service areas including Edgewater and Bergen County. It does **not** publish a verified public street address, geo coordinates, office hours, walk-in location, National Producer Number, carrier list, or plan/product counts. Those facts are required before adding address-based local-business fields, `geo`, `openingHours`, `hasMap`, NPN, carrier, or plan-specific schema.

The licensed-state source is `advisor.licensedStates` in `lib/site.ts`, checked against `lib/states.ts`. If the business later supplies an approved service-area source beyond those files, update the source and schema together; otherwise leave the service-area TODO out of the public HTML.

## Validation

Run the project checks:

```text
npm run lint
npm run typecheck
npm run build
npm run validate
```

For external validation, inspect a deployed URL with [Google's Rich Results Test](https://search.google.com/test/rich-results) and the [Schema.org Validator](https://validator.schema.org/). Validate each page type that emits additional breadcrumbs or FAQ schema, not only the homepage.

Medicare marketing and carrier/CMS compliance review is required before publishing new plan-specific or enrollment-focused copy. Structured data must not be used to introduce claims that are absent from approved visible content.
