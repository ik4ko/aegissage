/**
 * IndexNow: tells Bing (which ChatGPT search draws on), Yandex and other
 * participating engines that pages changed, so they recrawl in minutes
 * instead of days. Google does not use IndexNow; Google is the sitemap and
 * Search Console.
 *
 * The key is not a secret. It proves ownership because the same value is
 * served at /{key}.txt (public/f78fb83788781742c4860a149c55d414.txt). If you rotate it, rename that
 * file, put the new value inside it, and change it here.
 *
 * The ping runs after each production deploy: .github/workflows/indexnow.yml
 * calls scripts/indexnow.mjs, which reads the live sitemap and submits it.
 */
export const INDEXNOW_KEY = 'f78fb83788781742c4860a149c55d414';
