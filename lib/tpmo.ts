import {
  TPMO_AREAS,
  TPMO_FALLBACK_AREA,
  TPMO_FALLBACK_SCOPE,
  tpmoCountsByArea,
  type TpmoAreaCount,
  type TpmoAreaKey,
} from './site';

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
  // Language pages (lib/language-pages.ts) render <ContactForm />.
  '/medicare-help-georgian-russian',
  '/ka',
  '/ru',
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
  // Town pages (Nov 17 2026)
  '/medicare-brooklyn',
  '/medicare-englewood',
  '/medicare-fair-lawn',
  '/medicare-hackensack',
  '/medicare-hoboken',
  '/medicare-jersey-city',
  '/medicare-north-bergen',
  '/medicare-palisades-park',
  '/medicare-paramus',
  '/medicare-queens',
  '/medicare-teaneck',
  '/medicare-union-city',
  '/medicare-weehawken',
  '/medicare-west-new-york',
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
  // Answer pages — mirrors content/answers/*.mdx
  '/answers/cobra-and-medicare',
  '/answers/extra-help-medicare-savings-programs-new-jersey',
  '/answers/how-to-check-if-a-doctor-is-in-a-medicare-plan',
  '/answers/how-to-choose-medicare-agent-bergen-hudson-county',
  '/answers/how-to-switch-medicare-plans',
  '/answers/leaving-employer-coverage-after-65',
  '/answers/medicare-advantage-plan-ending-non-renewal-letter',
  '/answers/medicare-and-medicaid-together',
  '/answers/medicare-enrollment-periods-explained',
  '/answers/medicare-help-new-york-city',
  '/answers/medicare-help-philadelphia',
  '/answers/medicare-while-still-working',
  '/answers/medigap-new-jersey',
  '/answers/medigap-underwriting-new-jersey-new-york',
  '/answers/moved-medicare-new-jersey-new-york',
  '/answers/moving-between-new-jersey-new-york-pennsylvania',
  '/answers/retiree-coverage-and-medicare',
  '/answers/turning-65-new-jersey',
  '/answers/va-health-care-and-medicare',
  '/answers/what-to-bring-to-a-medicare-appointment',
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

/* ══════════════════════════════════════════════════════════════════════════
 *  Which area's counts a route states
 * ══════════════════════════════════════════════════════════════════════════
 *
 * As of Nov 15 2026 the counted disclaimer is the default on EVERY route, not
 * only the ZIP-collecting ones. 42 CFR 422.2267(e)(41) as amended for
 * contract year 2024 puts the organization and product counts in the
 * standardized text itself; the count-free wording is the pre-2024 version
 * and is now used only when no verified count exists at all.
 *
 * `ZIP_ROUTES` above is unchanged and still guarded at build time. It no
 * longer selects the variant; it remains the authoritative list of routes
 * that render <ContactForm />.
 *
 * ── Area mapping ──────────────────────────────────────────────────────────
 * A route listed here is ABOUT that place, so "in your area" should mean that
 * place. Everything not listed falls back to `TPMO_FALLBACK_AREA`.
 *
 * New York City is five counties. Until Pinnacle answers how a multi-county
 * page should state its counts, such a page lists each county that has a
 * verified count on its own line (see <TpmoDisclaimer />). That presentation
 * is a judgment call pending their answer, not established practice.
 *
 * IF YOU ADD A PAGE ABOUT A SPECIFIC PLACE OUTSIDE BERGEN COUNTY, ADD IT HERE.
 */
const NYC_AREAS: TpmoAreaKey[] = [
  'kings-ny',
  'queens-ny',
  'new-york-ny',
  'bronx-ny',
  'richmond-ny',
];

export const ROUTE_TPMO_AREAS: Readonly<Record<string, TpmoAreaKey[]>> = {
  '/medicare-new-york-city': NYC_AREAS,
  '/plans/new-york': NYC_AREAS,
  '/medicare-philadelphia': ['philadelphia-pa'],
  '/plans/pennsylvania': ['philadelphia-pa'],
  '/answers/medicare-help-new-york-city': NYC_AREAS,
  '/answers/medicare-help-philadelphia': ['philadelphia-pa'],
  /*
    Town pages outside Bergen County. Hudson County was recounted on
    2026-11-17, so its six town pages state the Hudson figures "in your
    area". Brooklyn and Queens have no recount yet and state the Bergen
    figures "in Bergen County, NJ".
    The Bergen towns (Hackensack, Englewood, Teaneck, Paramus, Fair Lawn,
    Palisades Park) are not listed: Bergen is their own county.
  */
  '/medicare-hoboken': ['hudson-nj'],
  '/medicare-jersey-city': ['hudson-nj'],
  '/medicare-north-bergen': ['hudson-nj'],
  '/medicare-union-city': ['hudson-nj'],
  '/medicare-weehawken': ['hudson-nj'],
  '/medicare-west-new-york': ['hudson-nj'],
  '/medicare-brooklyn': ['kings-ny'],
  '/medicare-queens': ['queens-ny'],
};

export type ResolvedTpmoArea = TpmoAreaCount & {
  key: TpmoAreaKey;
  label: string;
  /**
   * Set when these counts are the fallback area's and the page is about a
   * different place. The disclaimer then says "in {scope}" instead of "in
   * your area", so it never implies the numbers apply where the page is about.
   */
  scope?: string;
};

/**
 * True for a route about a place outside the fallback area: anything mapped
 * in ROUTE_TPMO_AREAS, and every state plan page except New Jersey's.
 */
export function isOutOfAreaRoute(path: string): boolean {
  if (path in ROUTE_TPMO_AREAS) return true;
  return path.startsWith('/plans/') && path !== '/plans/new-jersey';
}

/**
 * True when the fallback counts must name their area instead of saying "in
 * your area": every route about another place, and every answer page. Answer
 * pages are read by people anywhere (many arrive from AI search), so the
 * Bergen figures always say "in Bergen County, NJ" there (Erekle, Nov 16 2026).
 */
export function usesFallbackScope(path: string): boolean {
  return isOutOfAreaRoute(path) || path.startsWith('/answers/');
}

function resolve(key: TpmoAreaKey): ResolvedTpmoArea | null {
  const count = tpmoCountsByArea[key];
  return count ? { ...count, key, label: TPMO_AREAS[key] } : null;
}

/**
 * The verified counts a route should state, most specific first.
 *
 *  - areas mapped to the route that have a count → those
 *  - otherwise the fallback area, if it has a count; on a route about
 *    another place, or an answer page, it carries `scope`, so the sentence
 *    names Bergen County
 *  - otherwise [] → the caller renders the count-free wording
 */
export function tpmoAreasFor(pathname: string | null): ResolvedTpmoArea[] {
  const path =
    pathname && pathname.length > 1 ? pathname.replace(/\/$/, '') : (pathname ?? '/');
  const mapped = (ROUTE_TPMO_AREAS[path] ?? [])
    .map(resolve)
    .filter((area): area is ResolvedTpmoArea => area !== null);
  if (mapped.length > 0) return mapped;

  const fallback = resolve(TPMO_FALLBACK_AREA);
  if (!fallback) return [];
  return [usesFallbackScope(path) ? { ...fallback, scope: TPMO_FALLBACK_SCOPE } : fallback];
}

/** 'YYYY-MM' or 'YYYY-MM-DD' → "November 2026" / "November 15, 2026". */
export function formatCountDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December',
  ];
  const name = months[(month ?? 1) - 1] ?? '';
  return day ? `${name} ${day}, ${year}` : `${name} ${year}`;
}
