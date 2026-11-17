/**
 * External link check for the built site.
 *
 * validate-site.mjs covers internal links and runs in CI. This one follows
 * every link that leaves the site, which needs the open internet and can
 * fail for reasons that are not ours, so it is run by hand:
 *
 *   npm run build && npx next start -p 3200      # one terminal
 *   BASE=http://localhost:3200 npm run check:links
 *
 * A 404, 410 or 5xx is a failure: the page is gone and the link or source
 * must be replaced. A 401, 403 or 429 is reported as "blocked": several
 * government sites (ssa.gov, dfs.ny.gov, Medicare's plan finder) refuse
 * automated requests while loading normally in a browser, so those are
 * listed for a person to open, not counted as broken.
 */
const BASE = (process.env.BASE || 'http://localhost:3200').replace(/\/$/, '');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);

const found = new Map(); // url -> first page it was seen on
for (const path of new Set(paths)) {
  const html = await (await fetch(BASE + path)).text();
  for (const [, href] of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const url = href.replaceAll('&amp;', '&');
    if (/aegissage\.com|localhost/.test(new URL(url).hostname)) continue;
    if (!found.has(url)) found.set(url, path);
  }
}
console.log(`pages: ${new Set(paths).size}, external links: ${found.size}`);

async function status(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html,application/pdf,*/*' },
      signal: AbortSignal.timeout(30000),
    });
    return res.status;
  } catch (error) {
    return `error: ${error.cause?.code ?? error.name}`;
  }
}

const broken = [];
const blocked = [];
const queue = [...found.keys()];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let url = queue.pop(); url; url = queue.pop()) {
      const code = await status(url);
      if (code === 200) continue;
      (code === 401 || code === 403 || code === 429 ? blocked : broken).push([code, url, found.get(url)]);
    }
  }),
);

if (blocked.length) {
  console.log(`\nBLOCKED automated requests, open by hand (${blocked.length}):`);
  for (const [code, url, page] of blocked.sort()) console.log(`  ! ${code} ${url}  (on ${page})`);
}
if (broken.length) {
  console.log(`\nBROKEN (${broken.length}):`);
  for (const [code, url, page] of broken.sort()) console.log(`  x ${code} ${url}  (on ${page})`);
  process.exit(1);
}
console.log('\nNo broken external links.');
