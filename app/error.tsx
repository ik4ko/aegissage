'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ContactActions } from '@/components/marketing/contact-actions';
import { Button } from '@/components/ui/button';

/**
 * Production error boundary.
 *
 * Without this file, an unhandled render error shows Next's default page:
 * unstyled, unbranded, and with no way to reach anyone. For an audience that
 * is largely 65+ and often already anxious about a Medicare deadline, a blank
 * error screen is the moment they give up and close the tab.
 *
 * Three rules for what this page says:
 *   1. No stack trace, no digest, no error message from the exception. The
 *      `error` object can carry internal detail, and it is never rendered.
 *      It is logged to the console for the browser's own reporting and
 *      nothing more.
 *   2. No blame and no jargon. "Something on my end broke" — not
 *      "an unexpected error occurred in the application".
 *   3. A way out that does not depend on the site working: the phone number
 *      is a tel: link, so it works even if the rest of the app is broken.
 *
 * `reset()` re-renders the segment. It is offered first because a transient
 * failure genuinely does clear on retry.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Console only. Never rendered — see rule 1 above.
    console.error('[aegissage] unhandled error:', error);
  }, [error]);

  return (
    <div className="container py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
          Something went wrong
        </p>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
          This page did not load properly.
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          That is a problem on my end, not anything you did. Trying again usually fixes it.
          If it keeps happening, please just call or text me — you should not have to fight
          a website to get a Medicare question answered.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button type="button" size="lg" onClick={reset}>
            Try this page again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back to the homepage</Link>
          </Button>
        </div>

        <div className="mt-10 flex justify-center">
          <ContactActions where="error-boundary" size="md" />
        </div>

        <p className="mt-8 text-base text-ink-faint">
          Or go straight to the{' '}
          <Link
            href="/contact"
            className="font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
          >
            contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
