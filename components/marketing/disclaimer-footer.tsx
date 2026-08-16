import Link from 'next/link';
import { compliance, site } from '@/lib/site';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  TPMO COMPLIANCE COMPONENT — SINGLE SOURCE OF TRUTH
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  This is the only place on the site where the required CMS Medicare
 *  Communications and Marketing Guidelines (MCMG) disclaimer text lives.
 *  It is rendered once in the root layout, so it appears on every public
 *  page automatically — no page should ever import it directly, and no page
 *  should ever restate this language inline.
 *
 *  WHEN CMS UPDATES THE REQUIRED LANGUAGE, EDIT ONLY THIS FILE.
 *  `compliance.currentAsOf` in lib/site.ts must be re-verified at the start
 *  of every contract year.
 *
 *  Reviewer checklist for this file:
 *   1. "We do not offer every plan available in your area..." sentence is
 *      present, verbatim, and visible without interaction.
 *   2. No plan or organization COUNT is asserted unless it has been verified
 *      against the advisor's actual contracts. See the note in lib/site.ts —
 *      placeholder counts previously shipped here and were removed.
 *   3. The 1-800-MEDICARE + medicare.gov referral is present.
 *   4. The non-government-entity statement is present.
 *   5. Nothing here promises, guarantees or ranks benefits.
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
  return (
    <section
      aria-label="Medicare marketing disclaimer"
      data-compliance="tpmo-disclaimer"
      className="border-t border-line bg-navy-deep text-navy-soft"
    >
      <div className="container max-w-3xl py-10 sm:py-12">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-white/85">
          Important disclosures
        </h2>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/85">
          {/*
            (1) Required TPMO disclaimer + non-government statement, merged
            into one short paragraph. Simplified Aug 14 2026 to match the
            length/structure of comparable FMO disclosures (Pinnacle
            Financial, IFG) at Erekle's direction — both real examples fold
            the non-government statement into the same sentence as the
            "we don't offer every plan" language rather than giving it a
            separate paragraph, and neither includes a name-specific
            "[name] will confirm" sentence. Do not re-add the advisor's name
            here without asking first.

            Aug 16 2026: the CMS standardized TPMO disclaimer wording is
            restored verbatim — "those plans" (not "the plans"), and all
            THREE referral routes CMS names: medicare.gov, 1-800-MEDICARE
            (with TTY), and the caller's local State Health Insurance
            Program (SHIP). An earlier pass shortened this to two routes and
            dropped TTY while matching the FMO examples' brevity. The FMO
            examples are not the compliance source; 42 CFR 422.2267(e)(41)
            is. Do not trim this sentence for length again.
          */}
          <p>
            {site.name} is not affiliated with or endorsed by the U.S. government or the
            federal Medicare program. We do not offer every plan available in your area. Any
            information we provide is limited to those plans we do offer in your area. Please
            contact{' '}
            <a
              href={compliance.medicareGovUrl}
              rel="noopener noreferrer"
              target="_blank"
              className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              medicare.gov
            </a>
            ,{' '}
            <a
              href="tel:+18006334227"
              className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              {compliance.medicarePhone}
            </a>{' '}
            (TTY {compliance.medicareTty}), or your local State Health Insurance Program
            (SHIP), to get information on all of your options.
          </p>

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
