import Link from 'next/link';
import { PLAN_ENDING_ANSWER_HREF, planEndingPages } from '@/lib/plan-endings';
import { cn } from '@/lib/utils';

/**
 * "Got a letter saying your plan is ending?" — links to the plan-ending
 * pages (lib/plan-endings.ts). Used on the homepage, the town and county
 * pages, and the general non-renewal answer page.
 *
 * Braven Health sold plans only in New Jersey, so pages about New York or
 * Pennsylvania pass `newJersey={false}` and get the other links only.
 */
export function PlanEndingLinks({
  newJersey = true,
  showGeneral = true,
  className,
}: {
  newJersey?: boolean;
  /** Off on the general answer page itself. */
  showGeneral?: boolean;
  className?: string;
}) {
  const pages = planEndingPages.filter((page) => newJersey || page.company !== 'Braven Health');
  const linkClass =
    'inline-flex min-h-touch items-center text-lg font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep';

  return (
    <aside
      aria-labelledby="plan-ending-links"
      className={cn('not-prose rounded-2xl border-2 border-line bg-paper p-6', className)}
    >
      <h2 id="plan-ending-links" className="font-display text-2xl font-bold text-ink">
        Got a letter saying your plan ends in 2027?
      </h2>
      <p className="mt-2 text-lg text-ink-soft">
        You keep Medicare. These pages explain the dates and your choices for each letter.
      </p>
      <ul className="mt-3 space-y-1">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link href={`/${page.slug}`} className={linkClass}>
              {page.company} plan ending in 2027
            </Link>
          </li>
        ))}
        {showGeneral ? (
          <li>
            <Link href={PLAN_ENDING_ANSWER_HREF} className={linkClass}>
              Any plan-ending letter: what it means
            </Link>
          </li>
        ) : null}
      </ul>
    </aside>
  );
}
