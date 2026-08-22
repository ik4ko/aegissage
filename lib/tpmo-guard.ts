import 'server-only';

import { locationLandings } from './locations';
import { planStates } from './states';
import { GENERATED_ZIP_ROUTE_SET } from './tpmo';

/**
 * Build-time guard: keeps lib/tpmo.ts honest.
 *
 * ZIP_ROUTES is a literal list because <DisclaimerFooter /> is a client
 * component and deriving it would drag 33KB of location copy into the client
 * bundle (see the note in lib/tpmo.ts). The trade is that the list can drift
 * from the routes that actually exist.
 *
 * This module closes that gap. It imports the real data server-side and
 * throws if the two disagree, which fails `next build` loudly rather than
 * shipping a ZIP-collecting page that quietly renders the wrong TPMO
 * disclaimer. Same posture as `assertLicensing()` in lib/states.ts.
 *
 * It runs at module load, and app/sitemap.ts imports it for that side effect
 * — sitemap is built on every build and already exists to enumerate routes,
 * so it is the natural place to hang a route-coverage check.
 *
 * Only the two GENERATED route families are checked. The fixed routes
 * (/about, /contact, the three tools) are hand-listed in both places and a
 * check would just compare a literal to itself.
 */
function assertZipRoutesMatchGeneratedPages(): void {
  const expected = [
    ...locationLandings.map((location) => `/medicare-${location.slug}`),
    ...planStates.map((state) => `/plans/${state.slug}`),
  ];

  const missing = expected.filter((route) => !GENERATED_ZIP_ROUTE_SET.has(route));

  /*
    The reverse direction matters just as much. A route left behind here
    after its page was deleted is not a compliance problem, but it is a lie
    about what the site does, and it is how the list rots.
  */
  const stale = [...GENERATED_ZIP_ROUTE_SET].filter((route) => !expected.includes(route));

  if (missing.length === 0 && stale.length === 0) return;

  const lines = ['lib/tpmo.ts ZIP_ROUTES is out of sync with the pages that exist.\n'];

  if (missing.length > 0) {
    lines.push(
      'MISSING — these pages render <ContactForm />, so they collect a ZIP and',
      'require the counted TPMO disclaimer, but are not in ZIP_ROUTES:',
      ...missing.map((route) => `  + ${route}`),
      '',
    );
  }

  if (stale.length > 0) {
    lines.push(
      'STALE — these are in ZIP_ROUTES but no longer correspond to a page:',
      ...stale.map((route) => `  - ${route}`),
      '',
    );
  }

  lines.push('Add or remove them in lib/tpmo.ts so the list matches.');

  throw new Error(lines.join('\n'));
}

assertZipRoutesMatchGeneratedPages();
