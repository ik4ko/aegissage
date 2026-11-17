#!/usr/bin/env node
/**
 * Submits every URL in the live sitemap to IndexNow.
 *
 *   node scripts/indexnow.mjs            # production site
 *   SITE=https://www.aegissage.com node scripts/indexnow.mjs
 *   DRY_RUN=1 node scripts/indexnow.mjs  # print, send nothing
 *
 * Run after a production deploy, never against a preview URL: IndexNow only
 * accepts URLs on the host that serves the key file.
 */
const SITE = (process.env.SITE || 'https://www.aegissage.com').replace(/\/$/, '');
const KEY = 'f78fb83788781742c4860a149c55d414';
const host = new URL(SITE).host;

const sitemap = await fetch(`${SITE}/sitemap.xml`);
if (!sitemap.ok) {
  console.error(`sitemap fetch failed: ${sitemap.status}`);
  process.exit(1);
}
const urlList = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].trim())
  .filter((u) => new URL(u).host === host);

if (urlList.length === 0) {
  console.error('no URLs found in sitemap');
  process.exit(1);
}

const keyFile = await fetch(`${SITE}/${KEY}.txt`);
if (!keyFile.ok || (await keyFile.text()).trim() !== KEY) {
  console.error('key file is not live yet; nothing submitted');
  process.exit(1);
}

if (process.env.DRY_RUN) {
  console.log(`dry run: would submit ${urlList.length} URLs for ${host}`);
  process.exit(0);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} for ${urlList.length} URLs`);
// 200 and 202 both mean accepted.
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
