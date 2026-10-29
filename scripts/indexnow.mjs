/**
 * IndexNow submission — tells Bing (and through it ChatGPT search and
 * Copilot), Yandex, Seznam and Naver that every URL in the live sitemap
 * exists or changed.
 *
 * Manual, after a deploy:   npm run indexnow
 * Not hooked into the build on purpose: it should only run once the new
 * pages are actually live, and a build is not a deploy.
 *
 * The key is public by design. It is served at /<key>.txt from public/, and
 * IndexNow verifies ownership by fetching that file. Rotating it means
 * replacing that file and KEY below in the same commit.
 *
 * Env overrides: SITE (default https://www.aegissage.com), DRY_RUN=1.
 */
const KEY = '00f65e21fed9f14243f431c0b5ed2623';
const SITE = (process.env.SITE || 'https://www.aegissage.com').replace(/\/$/, '');
const HOST = new URL(SITE).host;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function main() {
  const sitemap = await fetch(`${SITE}/sitemap.xml`);
  if (!sitemap.ok) {
    console.error(`sitemap.xml returned HTTP ${sitemap.status}`);
    return 1;
  }

  const urls = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1].trim())
    // IndexNow rejects the whole batch if any URL is on another host.
    .filter((url) => new URL(url).host === HOST);

  if (urls.length === 0) {
    console.error('No URLs found in the sitemap for host ' + HOST);
    return 1;
  }

  const keyCheck = await fetch(`${SITE}/${KEY}.txt`);
  if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) {
    console.error(`Key file ${SITE}/${KEY}.txt is not live or does not match — deploy first.`);
    return 1;
  }

  const payload = { host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls };

  if (process.env.DRY_RUN) {
    console.log(`DRY_RUN: would submit ${urls.length} URLs for ${HOST}`);
    return 0;
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  // 200 = accepted, 202 = accepted, key validation pending.
  console.log(`IndexNow: HTTP ${res.status} for ${urls.length} URLs`);
  if (res.status !== 200 && res.status !== 202) {
    console.error(await res.text());
    return 1;
  }
  return 0;
}

// exitCode rather than process.exit(): exiting with fetch sockets still open
// trips a libuv assertion on Windows.
process.exitCode = await main();
