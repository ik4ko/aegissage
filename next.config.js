/** @type {import('next').NextConfig} */
const path = require('node:path');

/**
 * This app lives in a subdirectory of a repo that has its own lockfile at the
 * root, so Turbopack's workspace inference picks the wrong root. Pin it here.
 */
const nextConfig = {
  turbopack: { root: __dirname },
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'aegissage.com' }],
        destination: 'https://www.aegissage.com/:path*',
        permanent: true,
      },
      /*
       * Louisiana — appointment lost Aug 13 2026.
       *
       * The page is gone from lib/states.ts, so /plans/[state] no longer
       * generates it and `dynamicParams = false` makes the route 404. A 404
       * is the wrong answer here: the URL was live, is indexed, and may be
       * linked from elsewhere. Sending it to /plans keeps whatever equity it
       * has and lands the visitor on the list of states actually covered,
       * rather than a dead end that says nothing.
       *
       * `permanent: true` (308) is deliberate — the page is not coming back
       * unless the appointment is reinstated, and a temporary redirect would
       * leave the old URL in the index indefinitely.
       *
       * If a state is ever dropped again, add its slug here at the same time
       * it leaves lib/states.ts. Removing the page without this leaves a
       * 404 behind.
       */
      {
        source: '/plans/louisiana',
        destination: '/plans',
        permanent: true,
      },
      /*
       * ── Legacy URLs from Search Console's 404 report ────────────────────
       *
       * Five paths were reported. Only these two get redirects:
       *
       *   /login                  stays 404. Nothing on a consumer Medicare
       *                           site is a login page, so there is no honest
       *                           target. Redirecting it to / or /contact
       *                           would tell a returning visitor their account
       *                           moved somewhere it did not. Note this repo
       *                           has never contained an auth route — no
       *                           login/signin file in any of its 61 commits,
       *                           no auth dependency ever in package.json.
       *   /wp-content/uploads/*   scanner noise, already 403 at the platform
       *                           layer. Nothing here was ever WordPress.
       *   /docs                   one crawl in May, never repeated. Not worth
       *                           a permanent rule.
       */
      {
        source: '/contact-medicare',
        /*
         * Target is /contact, NOT the /medicare-coverage-review named in the
         * brief — that page does not exist in this repo and returns 404 live,
         * so the redirect would have been a 404 -> 404 hop, which search
         * engines treat as a soft error and which is strictly worse than the
         * plain 404 it replaced. Repoint this the day that page ships.
         */
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/medicare-plans',
        destination: '/plans',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ];
  },
};

module.exports = nextConfig;
