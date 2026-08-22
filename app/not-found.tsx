import Link from 'next/link';
import { headers } from 'next/headers';
import { ContactActions } from '@/components/marketing/contact-actions';
import { Button } from '@/components/ui/button';
import { headerNav } from '@/lib/site';

/*
  Rendered per request rather than prerendered once.

  Without this, Next builds _not-found.html at build time and the logging
  below would run exactly once — during the build — instead of on each 404.
  The cost is a server render on a page almost nobody should reach; the
  benefit is that a broken link stops being invisible.
*/
export const dynamic = 'force-dynamic';

/**
 * ── Why this page logs ────────────────────────────────────────────────────
 *
 * The Task 10 audit found legacy URLs only because Search Console happened to
 * surface them weeks later. Every 404 in between was silent — the same shape
 * as the lead-pipeline defect: a failure with no record of itself.
 *
 * `[404]` is the marker to grep or alert on in Vercel's runtime logs.
 *
 * What this captures and what it does not:
 *   - The REFERER is logged, which is the useful half: it names the page
 *     carrying the broken link, which is what you actually need to fix it.
 *     An empty referer means the URL was typed, bookmarked, or crawled.
 *   - The requested PATH is NOT logged here. Next's global not-found does not
 *     receive it, and the only ways to get it are a sitewide proxy matcher
 *     (latency on every request) or non-public Vercel headers. It is
 *     unnecessary anyway: Vercel's log line for this invocation already
 *     records the path, so the marker and the path sit on the same entry.
 *
 * No IP, no user agent, no query string — a 404 is not a reason to start
 * collecting more about a visitor than the request already required.
 */
export default async function NotFound() {
  const referer = (await headers()).get('referer');
  console.warn(`[404] referer=${referer ?? 'none'}`);

  return (
    <div className="container py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
          404
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
          That page is not here.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Either I moved it or the link was wrong. Either way, do not let it stop you — the
          guides are one tap away, and so am I.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/medicare-basics">Read the guides</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back to the homepage</Link>
          </Button>
        </div>

        {/*
          A dead end that only says "not here" wastes the one moment someone
          is still willing to look. These are the same destinations as the
          header, derived from `headerNav` so a nav change cannot leave this
          list pointing at something that has itself moved.
        */}
        <div className="mt-12 border-t border-line pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Looking for one of these?
          </h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {headerNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-touch items-center text-base text-navy underline decoration-line underline-offset-4 hover:decoration-navy"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/plans"
                className="inline-flex min-h-touch items-center text-base text-navy underline decoration-line underline-offset-4 hover:decoration-navy"
              >
                Plans by state
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="inline-flex min-h-touch items-center text-base text-navy underline decoration-line underline-offset-4 hover:decoration-navy"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-10 flex justify-center">
          <ContactActions where="404" size="md" />
        </div>
      </div>
    </div>
  );
}
