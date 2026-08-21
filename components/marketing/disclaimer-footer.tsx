'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { compliance } from '@/lib/site';
import { collectsZip } from '@/lib/tpmo';
import { TpmoDisclaimer, tpmoVariantFor } from './tpmo-disclaimer';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  TPMO COMPLIANCE COMPONENT — SINGLE SOURCE OF TRUTH
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  This is the mount point. It is rendered once in the root layout, so the
 *  disclosure appears on every public page automatically — no page should
 *  ever import it directly, and no page should ever restate this language
 *  inline.
 *
 *  THE REQUIRED WORDING ITSELF NOW LIVES IN ./tpmo-disclaimer.tsx, which
 *  holds both CMS variants (generic and counted) and is the only place
 *  either one exists. WHEN CMS UPDATES THE REQUIRED LANGUAGE, EDIT THAT
 *  FILE, not this one. This file owns chrome only: the heading, the
 *  "current as of" line, the privacy link, and picking a variant.
 *
 *  `compliance.currentAsOf` in lib/site.ts must be re-verified at the start
 *  of every contract year, alongside `tpmoCounts`.
 *
 *  Reviewer checklist:
 *   1. "We do not offer every plan available in your area..." sentence is
 *      present, verbatim, and visible without interaction.
 *   2. No plan or organization COUNT is asserted unless it has been verified
 *      against the advisor's actual contracts. Placeholder counts previously
 *      shipped here and were removed; <TpmoDisclaimer /> now throws rather
 *      than render an unverified one.
 *   3. The 1-800-MEDICARE + medicare.gov + SHIP referrals are present.
 *   4. The non-government-entity statement is present.
 *   5. Nothing here promises, guarantees or ranks benefits.
 *   6. Every ZIP-collecting route is listed in `ZIP_ROUTES` in
 *      lib/tpmo.ts, which lib/tpmo-guard.ts checks at build time. A ZIP
 *      field without the counted variant is a defect.
 *
 *  Contrast, measured as composited values over navy-deep (#0B2942):
 *    white/85 → 11.10:1 (AAA)   body text and the section heading
 *    white/75 →  7.98:1 (AAA)   the muted "current as of" line
 *    white/60 →  6.21:1 (AA only)  — previously used for both of the above
 *
 *  white/60 was passing AA, so this was an AAA upgrade rather than a defect
 *  fix. It still matters here: this is legally required disclosure text, read
 *  by an audience that skews 65+, set at 16px on a dark field. It should not
 *  be the lowest-contrast text on the page.
 *
 *  ── Aug 13 2026: collapsed <details>/<summary> removed ────────────────────
 *  This previously rendered the required text inside a collapsed <details>,
 *  with the reasoning that the full text stayed in the DOM for crawlers and
 *  screen readers even while visually collapsed. Erekle overrode that
 *  judgment call directly: the disclosure must be visible on page load, not
 *  gated behind a click, full stop. That is now the standing rule for this
 *  component — do not reintroduce a collapse here without his sign-off.
 * ══════════════════════════════════════════════════════════════════════════
 */

export function DisclaimerFooter() {
  const pathname = usePathname();

  /*
    Which variant this route needs.

    `collectsZip()` in lib/tpmo.ts owns the route list; `tpmoVariantFor()`
    downgrades to "generic" while the counts are still null, so a
    ZIP-collecting page renders a compliant disclosure today rather than
    failing the build before Erekle has supplied the numbers.

    usePathname() resolves during static prerender — verified against the
    header's aria-current, which is baked correctly into every static page —
    so the disclosure text ships in the served HTML, not after hydration.
    That matters: it is legally required text and a crawler or a
    JS-disabled reader must see it.
  */
  const variant = tpmoVariantFor(pathname, collectsZip(pathname));

  return (
    <section
      aria-label="Medicare marketing disclaimer"
      data-compliance="tpmo-disclaimer"
      data-tpmo-variant={variant}
      className="border-t border-line bg-navy-deep text-navy-soft"
    >
      <div className="container max-w-3xl py-10 sm:py-12">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-white/85">
          Important disclosures
        </h2>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/85">
          {/*
            The required text itself lives in <TpmoDisclaimer />, which is the
            only place either variant's wording exists. Everything in this
            file is chrome around it: the heading, the "current as of" line
            and the privacy link.

            Aug 16 2026 note, still binding: all THREE referral routes CMS
            names must be present — medicare.gov, 1-800-MEDICARE (with TTY),
            and the caller's local State Health Insurance Program (SHIP). An
            earlier pass shortened this to two routes and dropped TTY to match
            comparable FMO disclosures. The FMO examples are not the
            compliance source; 42 CFR 422.2267(e)(41) is. Do not trim it.
          */}
          <TpmoDisclaimer variant={variant} />

          <p className="text-white/75">
            Information current as of {compliance.currentAsOf}.{' '}
            <Link
              href="/privacy"
              className="underline decoration-white/50 underline-offset-4 hover:text-white"
            >
              Privacy notice
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
