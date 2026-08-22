/**
 * Which routes require the COUNTED TPMO disclaimer.
 *
 * ── The rule ──────────────────────────────────────────────────────────────
 * CMS requires the counted variant ("Currently we represent N organizations
 * which offer M products in your area") on any marketing touchpoint that
 * collects a ZIP code. Everywhere else gets the generic variant.
 *
 * ── How this list is derived ──────────────────────────────────────────────
 * There is exactly ONE ZIP input on this site: the `zip` field in
 * <ContactForm />. So "collects a ZIP" means precisely "renders ContactForm",
 * directly or through a shared component:
 *
 *   /                             the homepage lead-capture band
 *   /about, /contact              render it directly
 *   /plans/{state}                renders it directly (25 state pages)
 *   /medicare-{place}             via <LocationLandingPage /> (7 pages)
 *   /tools/eligibility-check      via <EligibilityQuiz />
 *   /tools/penalty-calculator     via <PenaltyCalculator />
 *   /tools/irmaa-calculator       via <IrmaaCalculator />
 *
 * Deliberately NOT here, because they do not collect anything:
 *   /plans              the index — links to state pages, no form
 *   /medicare-basics    guide index. The `/medicare-` prefix is a trap:
 *   /medicare-checklist a printable worksheet that explicitly collects
 *                       nothing. Both start with "/medicare-" and neither
 *                       takes a ZIP, which is why this matches exact paths
 *                       rather than prefixes.
 *   /tools/plan-comparison, /tools/medicare-iq   no form
 *
 * The form's success state renders inline on the same route, so submission
 * confirmations are covered by the route they happen on. There are no
 * separate confirmation URLs.
 *
 * ── Why this is a literal list and not derived from lib/locations.ts ──────
 * <DisclaimerFooter /> is a client component (it needs usePathname), and
 * lib/locations.ts is 33KB of page copy. Importing it here to map over
 * `locationLandings` would pull every location page's prose into the client
 * bundle of every route on the site. The literal list stays a few hundred
 * bytes.
 *
 * The cost of a literal list is that it can drift from reality. That is what
 * lib/tpmo-guard.ts is for: it imports the real data server-side and fails
 * the build if this list and the actual routes disagree. Add a location or a
 * state and forget this file, and the build tells you.
 *
 * IF YOU ADD <ContactForm /> TO A PAGE, ADD ITS ROUTE HERE.
 */

/**
 * ZIP routes whose page is hand-authored.
 *
 * Kept apart from the generated ones so lib/tpmo-guard.ts can check the
 * generated families against real data without tripping over these. An earlier
 * version prefix-matched "/medicare-" to decide what was generated, which
 * flagged the hand-written /medicare-coverage-review as a stale location page
 * and failed the build. Same too-broad-prefix trap this file already warns
 * about; naming the two sets explicitly removes it for good.
 */
const HAND_AUTHORED_ZIP_ROUTES = [
  /*
    The homepage collects a ZIP as of the lead-capture band added in
    components/forms/deadline-capture.tsx. It is the highest-traffic page on
    the site, so if this entry is ever removed the disclosure silently
    downgrades on the page that needs it most.
  */
  '/',
  '/about',
  '/contact',
  '/tools/eligibility-check',
  '/tools/penalty-calculator',
  '/tools/irmaa-calculator',
  /*
    Both landing pages embed <EligibilityQuiz />, which renders <ContactForm />
    and therefore a ZIP field. Added with the pages in the same commit — a
    landing page carrying the generic disclaimer while collecting a ZIP is the
    exact defect this list exists to prevent.
  */
  '/turning-65-bergen-county',
  '/medicare-coverage-review',
] as const;

/**
 * ZIP routes generated from lib/locations.ts and lib/states.ts.
 *
 * lib/tpmo-guard.ts checks THIS list against the real data at build time, so
 * adding a location or a state without adding it here fails the build.
 */
const GENERATED_ZIP_ROUTES = [
  // Local landing pages — mirrors locationLandings in lib/locations.ts
  '/medicare-bergen-county',
  '/medicare-cliffside-park',
  '/medicare-edgewater',
  '/medicare-fort-lee',
  '/medicare-new-jersey',
  '/medicare-new-york-city',
  '/medicare-philadelphia',
  // State plan pages — mirrors planStates in lib/states.ts
  '/plans/alabama',
  '/plans/arkansas',
  '/plans/arizona',
  '/plans/florida',
  '/plans/georgia',
  '/plans/iowa',
  '/plans/illinois',
  '/plans/indiana',
  '/plans/kentucky',
  '/plans/michigan',
  '/plans/minnesota',
  '/plans/mississippi',
  '/plans/missouri',
  '/plans/north-carolina',
  '/plans/north-dakota',
  '/plans/new-jersey',
  '/plans/new-york',
  '/plans/ohio',
  '/plans/oklahoma',
  '/plans/pennsylvania',
  '/plans/south-carolina',
  '/plans/tennessee',
  '/plans/texas',
  '/plans/virginia',
  '/plans/west-virginia',
] as const;

export const ZIP_ROUTES: ReadonlySet<string> = new Set<string>([
  ...HAND_AUTHORED_ZIP_ROUTES,
  ...GENERATED_ZIP_ROUTES,
]);

/** Only the generated families, for the build-time drift guard. */
export const GENERATED_ZIP_ROUTE_SET: ReadonlySet<string> = new Set<string>(
  GENERATED_ZIP_ROUTES,
);

/** True when the route at `pathname` puts a ZIP field in front of a visitor. */
export function collectsZip(pathname: string | null): boolean {
  if (!pathname) return false;
  // Normalise a trailing slash, but never turn "/" into "".
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return ZIP_ROUTES.has(path);
}
