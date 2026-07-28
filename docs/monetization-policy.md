# Monetization policy

This is a binding constraint on what may ship, not a statement of intent.
Anything in the "prohibited" list requires written legal review before it is
built, regardless of how much revenue it would produce.

## How this site currently earns

One way, and only one way: **Eric is paid a commission by the insurance
company when someone enrolls in a plan through him.** That is disclosed on the
About page and in the TPMO disclosure block on every page.

The site takes no advertising, no sponsorship, no affiliate revenue, and no
referral fees. Nothing linked from this site pays it anything.

## Prohibited

Do not use this site to:

- **Sell or resell Medicare leads.** The consumer contact form states *"I do
  not sell or share your information with anyone."* That promise binds every
  record already collected under it.
- **Pay or accept referral fees for Medicare-related business** without legal
  review. Payments tied to Medicare business are treated very differently from
  ordinary affiliate marketing under federal anti-kickback and
  beneficiary-inducement rules. "It is just an affiliate link" is not a
  defence.
- **Cross-sell unrelated products inside Medicare sales content.** No final
  expense, annuities, dental discount plans, supplements, or devices presented
  alongside Medicare guidance.
- **Imply Medicare approval or endorsement.** The site is not connected with
  or endorsed by the federal government or the Medicare program, and says so.
- **Recommend products with unsupported health claims.** Includes supplements,
  OTC products, and medical devices.
- **Hide an affiliate relationship.** See enforcement below.
- **Collect** Medicare Beneficiary Identifiers, dates of birth, prescription
  details, provider names, or health history — through any form, tool,
  analytics event, or third-party script.

## Specifically excluded product categories

Not permitted in the resource registry or anywhere else without legal review:

- OTC stores and "Medicare OTC benefit" storefronts
- supplements and nutraceuticals
- medical devices
- provider-referral offers and paid provider directories
- insurer-paid placements
- paid product recommendations
- automatically generated affiliate links

## Enforcement — how the code makes this hard to get wrong

Disclosure is structurally enforced, not left to reviewer diligence:

1. **`lib/resources.ts`** runs `assertResourceIntegrity()` at module load,
   which happens during `next build`. Any entry with `affiliate: true` and no
   non-empty `disclosure` **fails the build**.
2. **`components/marketing/resource-card.tsx`** independently refuses to
   render an affiliate resource without its disclosure, and renders the
   disclosure inside the same card as the link — never as a page footnote,
   never behind a toggle, never below the fold.
3. **`approved: false`** keeps an entry out of every rendering path.

Two independent guards, because a build-time check does not protect a code
path the build never evaluated, and the failure mode is a regulatory problem
rather than a rendering bug.

## Analytics constraint

`lib/analytics.ts` refuses, in development, to emit any event carrying a
property whose key or value looks like personal or health data. See the
`FORBIDDEN_KEYS` and `VALUE_LOOKS_PERSONAL` checks. Attribution
(`lib/attribution.ts`) stores UTM tokens, a pathname, and a referring host —
nothing else, by construction.

## If any of this changes

Update this file, the TPMO disclosure, the contact-form consent language, and
the privacy notice **before** the change ships — not after. A consent promise
cannot be revised retroactively for records already collected under it.
