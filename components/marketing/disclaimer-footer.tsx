import Link from 'next/link';
import { advisor, compliance, site } from '@/lib/site';

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
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/85">
          Important disclosures
        </h2>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/85">
          {/* (1) Required TPMO scope-of-appointment style disclosure. */}
          <p>
            We do not offer every plan available in your area. Which Medicare plans and
            organizations are available to you depends on your county, the contract year,
            and your own eligibility, and that set changes annually. {advisor.firstName}{' '}
            will confirm what is actually available to you during a conversation. Please
            contact{' '}
            <a
              href="tel:+18006334227"
              className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              {compliance.medicarePhone}
            </a>{' '}
            (TTY {compliance.medicareTty}), 24 hours a day, 7 days a week, or consult{' '}
            <a
              href={compliance.medicareGovUrl}
              rel="noopener noreferrer"
              target="_blank"
              className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              medicare.gov
            </a>{' '}
            to get information on all of your options.
          </p>

          {/* (2) Non-government entity statement. */}
          <p>
            {site.name} is not connected with or endorsed by the United States government or the
            federal Medicare program. {advisor.name} is an independent Medicare advisor and may
            receive compensation from the plans he represents.
            Enrollment in a plan is never a condition of receiving information or guidance.
          </p>

          {/* (3) Educational-purpose framing. */}
          <p>
            The material on this site is for general educational purposes and is not medical,
            legal or tax advice, nor a complete description of benefits. Plan availability,
            costs, provider networks and covered drug lists vary by county and change every
            contract year. Confirm the details that apply to you before making a decision.
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
