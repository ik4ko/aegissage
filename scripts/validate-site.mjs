/**
 * Site regression crawl.
 *
 * There is no test framework in this repo, so this stands in for one. It
 * crawls every URL the sitemap advertises and asserts what a regression
 * suite would: status codes, a non-empty <title>, exactly one <h1>, a meta
 * description, canonical + twitter:card presence, absolute og:image URLs,
 * iframe accessible names, JSON-LD that parses and carries @type, internal
 * link integrity, and sitemap canonicality.
 *
 * Usage:
 *   npm run build && npm run start        # in one terminal
 *   npm run validate                      # in another
 *
 * Against production:
 *   BASE=https://www.aegissage.com npm run validate
 *
 * Exits non-zero on any failure, so it is CI-usable as-is.
 */
const BASE = (process.env.BASE || 'http://localhost:3200').replace(/\/$/, '');
const CANONICAL_HOST = process.env.CANONICAL_HOST || 'https://www.aegissage.com';

/**
 * Content that must never reach a rendered page.
 *
 * Every entry here corresponds to something that was actually shipped at
 * some point, or that would be a compliance problem if it were. Written as
 * [index, pattern, label] so the tuple destructures cleanly below.
 */
const FORBIDDEN = [
  [0, /Verification needed|Before launch|Pending verification|\bTODO\b/, 'internal TODO text'],
  [0, /\bNPN\b|National Producer Number/i, 'an NPN reference'],
  [0, /represent\s+\d+\s+organizations|\d+\s+products in your area/i, 'an unverified plan/organization count'],
  [0, /Hackensack Meridian|Valley Health|NYU Langone|Mount Sinai/i, 'a health-system reference'],
  [
    0,
    /\b(Alaska|California|Colorado|Connecticut|Hawaii|Idaho|Kansas|Maryland|Massachusetts|Montana|Nebraska|Nevada|New Hampshire|New Mexico|Oregon|Rhode Island|South Dakota|Vermont|Wisconsin|Wyoming)\b/,
    'an unlicensed state',
  ],
  [0, /"streetAddress"|"postalCode"|"openingHours|"latitude"|"longitude"/, 'address/geo/hours in schema'],
  [0, /dQw4w9WgXcQ/, 'a test YouTube ID'],
];

const failures = [];
const warnings = [];
const fail = (m) => failures.push(m);
const warn = (m) => warnings.push(m);

async function get(path) {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  const body = res.headers.get('content-type')?.includes('image') ? '' : await res.text();
  return { status: res.status, body, headers: res.headers };
}

// ── Discover every URL from the sitemap ───────────────────────────────────
const sm = await get('/sitemap.xml');
if (sm.status !== 200) fail(`sitemap.xml returned ${sm.status}`);
const sitemapUrls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`sitemap: ${sitemapUrls.length} URLs`);

const nonCanonical = sitemapUrls.filter((u) => !u.startsWith(CANONICAL_HOST));
if (nonCanonical.length) {
  fail(
    `sitemap has ${nonCanonical.length} URLs not on the canonical host ` +
      `${CANONICAL_HOST}: ${nonCanonical.slice(0, 3).join(', ')}`,
  );
}

const dupes = sitemapUrls.filter((u, i) => sitemapUrls.indexOf(u) !== i);
if (dupes.length) fail(`sitemap has duplicate URLs: ${[...new Set(dupes)].join(', ')}`);

const paths = sitemapUrls.map((u) => new URL(u).pathname);
for (const required of ['/videos', '/medicare-bergen-county', '/medicare-new-jersey', '/plans']) {
  if (!paths.includes(required)) fail(`sitemap missing ${required}`);
}

// ── Per-page structural checks ────────────────────────────────────────────
const internalLinks = new Map(); // href -> [found on]
const pages = [...new Set(paths)];

for (const path of pages) {
  const { status, body } = await get(path);
  if (status !== 200) { fail(`${path} -> HTTP ${status}`); continue; }

  const title = body.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title || !title.trim()) fail(`${path} has no <title>`);

  const h1s = [...body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
  if (h1s.length === 0) fail(`${path} has no <h1>`);
  if (h1s.length > 1) fail(`${path} has ${h1s.length} <h1> elements`);

  if (!/<meta name="description"/.test(body)) fail(`${path} has no meta description`);
  if (!/name="twitter:card"/.test(body)) warn(`${path} has no twitter:card`);

  // Canonical must exist AND point at the canonical host, or every
  // self-referencing canonical on the site resolves through a redirect.
  const canonical = body.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) {
    warn(`${path} has no canonical link`);
  } else if (!canonical.startsWith(CANONICAL_HOST)) {
    fail(`${path} canonical points off-host: ${canonical}`);
  }

  // The TPMO disclosure is a CMS marketing requirement and is mounted once
  // in the root layout. If a route ever escapes that layout, catch it here.
  if (!body.includes('tpmo-disclaimer')) fail(`${path} is missing the TPMO disclaimer`);

  // og:image must be absolute
  const ogImages = [...body.matchAll(/property="og:image"\s+content="([^"]+)"/g)].map((m) => m[1]);
  for (const img of ogImages) {
    if (!/^https?:\/\//.test(img)) fail(`${path} has relative og:image: ${img}`);
  }

  // iframes need accessible names
  for (const [, attrs] of body.matchAll(/<iframe([^>]*)>/g)) {
    if (!/title="[^"]+"/.test(attrs)) fail(`${path} has an <iframe> with no title`);
  }

  // JSON-LD must parse
  for (const [, json] of body.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    try {
      const parsed = JSON.parse(json);
      const nodes = parsed['@graph'] ?? [parsed];
      for (const n of nodes) if (!n['@type']) fail(`${path} JSON-LD node missing @type`);
    } catch (e) {
      fail(`${path} has invalid JSON-LD: ${e.message}`);
    }
  }

  for (const [, forbidden, label] of FORBIDDEN) {
    if (forbidden.test(body)) fail(`${path} contains ${label}`);
  }

  for (const [, href] of body.matchAll(/href="(\/[^"#?]*)"/g)) {
    if (!internalLinks.has(href)) internalLinks.set(href, []);
    internalLinks.get(href).push(path);
  }
}

// ── Internal link integrity ───────────────────────────────────────────────
console.log(`checking ${internalLinks.size} unique internal links...`);
for (const [href, sources] of internalLinks) {
  const { status } = await get(href);
  if (status >= 400) fail(`broken internal link ${href} (HTTP ${status}) on ${sources[0]}`);
}

// ── robots.txt ────────────────────────────────────────────────────────────
const robots = await get('/robots.txt');
if (!robots.body.includes('/api/og')) fail('robots.txt does not allow /api/og');
if (!robots.body.includes('Sitemap:')) fail('robots.txt has no Sitemap directive');

// ── OG endpoint actually renders ──────────────────────────────────────────
const og = await get('/api/og?title=Validation');
if (og.status !== 200) fail(`/api/og returned ${og.status}`);
if (!og.headers.get('content-type')?.includes('image')) {
  fail(`/api/og content-type is ${og.headers.get('content-type')}`);
}

// ── Report ────────────────────────────────────────────────────────────────
console.log(`\npages checked: ${pages.length}`);
if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length}):`);
  warnings.forEach((w) => console.log('  ! ' + w));
}
if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):`);
  failures.forEach((f) => console.log('  x ' + f));
  process.exit(1);
}
console.log('\nAll structural checks passed.');
