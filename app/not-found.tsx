import Link from 'next/link';
import { ContactActions } from '@/components/marketing/contact-actions';
import { Button } from '@/components/ui/button';
import { headerNav } from '@/lib/site';
import { NotFoundBeacon } from '@/components/seo/not-found-beacon';

/**
 * ── How 404s get recorded, and why not from here ──────────────────────────
 *
 * An earlier version of this file exported `dynamic = 'force-dynamic'` and
 * read `headers()` to log the referer server-side. It worked, and it also
 * took the entire site off static rendering: the root not-found is part of
 * every route's tree, so forcing it dynamic turned all 64 prerendered pages
 * into per-request serverless invocations. That reached production before the
 * build output was read carefully enough to catch it.
 *
 * <NotFoundBeacon /> replaces it. It reports the path and the referring HOST
 * from the client through lib/analytics.ts, so the event lands in Vercel
 * Analytics beside every other funnel event and inherits the PII guard. This
 * page stays static.
 *
 * Do not add `dynamic`, `headers()`, `cookies()` or any other dynamic API to
 * this file. The cost is not local to this page.
 */
export default function NotFound() {
  return (
    <div className="container py-20 sm:py-28">
      <NotFoundBeacon />
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
