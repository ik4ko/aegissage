'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { GlossaryTerm } from '@/components/marketing/glossary-term';
import {
  trackPlanComparisonCompleted,
  trackPlanComparisonRouteView,
} from '@/lib/analytics';
import { cn } from '@/lib/utils';

/**
 * Structural comparison of the two routes through Medicare.
 *
 * Compliance boundary: this compares *how the routes are structured under
 * federal rules* — it never compares named plans, never ranks them, never
 * implies one is better, and never states a benefit or a premium. Every row
 * is a factual structural difference that is true nationwide. Do not add a
 * "best for" column, a score, or any carrier name.
 */

type RouteKey = 'original' | 'advantage';

type Row = {
  label: string;
  /** Glossary key surfaced next to the row label, if any. */
  term?: string;
  original: string;
  advantage: string;
};

const ROWS: Row[] = [
  {
    label: 'Where the coverage comes from',
    original: 'The federal Medicare program directly, for Part A and Part B.',
    advantage: 'A private insurance company approved by Medicare, which administers your Part A and Part B coverage.',
    term: 'part-c',
  },
  {
    label: 'Choice of doctors and hospitals',
    original: 'Any provider in the country who accepts Medicare.',
    advantage: 'The plan network, which is defined by the plan and can change. Out-of-network rules vary by plan type.',
  },
  {
    label: 'Referrals to see a specialist',
    original: 'Not required.',
    advantage: 'Depends on the plan type. Some require them, some do not.',
  },
  {
    label: 'Prescription drug coverage',
    original: 'Added separately through a standalone Part D plan.',
    advantage: 'Usually built into the plan, though not always.',
    term: 'part-d',
  },
  {
    label: 'Annual limit on what you pay',
    original: 'None on its own. This is the gap a Medigap policy is designed to address.',
    advantage: 'Every plan has a maximum out-of-pocket for in-network covered services.',
    term: 'moop',
  },
  {
    label: 'Adding a supplement',
    original: 'A Medigap policy can be purchased alongside it.',
    advantage: 'Medigap cannot be used with a Medicare Advantage plan. It is one route or the other.',
    term: 'medigap',
  },
  {
    label: 'Health questions when you apply',
    original: 'None for Part A and Part B. Medigap usually requires medical underwriting outside your one-time open enrollment window.',
    advantage: 'None. Enrollment is not based on health history.',
    term: 'underwriting',
  },
  {
    label: 'How often it can change',
    original: 'Part A and Part B rules and amounts are set federally each year.',
    advantage: 'Networks, drug lists and cost-sharing are set by the plan and can change every contract year.',
  },
  {
    label: 'Coverage when you travel in the US',
    original: 'Works with any Medicare provider nationwide.',
    advantage: 'Depends on the plan network and its out-of-area rules.',
  },
];

const ROUTES: Record<RouteKey, { name: string; blurb: string }> = {
  original: {
    name: 'Original Medicare',
    blurb: 'Part A and Part B, from the federal program — often paired with a Medigap policy and a Part D plan.',
  },
  advantage: {
    name: 'Medicare Advantage',
    blurb: 'Part C — your Part A and Part B coverage delivered through a private plan approved by Medicare.',
  },
};

export function PlanComparisonTable() {
  // Mobile shows one column at a time; a two-column table at 375px is
  // unreadable for the people this site is built for.
  const [mobileRoute, setMobileRoute] = useState<RouteKey>('original');
  const endRef = useRef<HTMLDivElement>(null);
  const completed = useRef(false);

  /**
   * "Completed" for a comparison table means read, so this fires when the
   * final row reaches the viewport — never on mount, which would make the
   * metric indistinguishable from a page view.
   */
  useEffect(() => {
    const element = endRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || completed.current) return;
        completed.current = true;
        trackPlanComparisonCompleted();
        observer.disconnect();
      },
      { threshold: 0.6 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function chooseRoute(key: RouteKey) {
    setMobileRoute(key);
    trackPlanComparisonRouteView(key);
  }

  return (
    <div>
      {/* Mobile: route switcher + single column */}
      <div className="lg:hidden">
        <div
          role="tablist"
          aria-label="Choose a route to view"
          className="grid grid-cols-2 gap-2 rounded-2xl border-2 border-line bg-paper p-2"
        >
          {(Object.keys(ROUTES) as RouteKey[]).map((key) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={mobileRoute === key}
              onClick={() => chooseRoute(key)}
              className={cn(
                'min-h-touch rounded-xl px-3 text-base font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30',
                mobileRoute === key ? 'bg-navy text-white' : 'text-ink-soft',
              )}
            >
              {ROUTES[key].name}
            </button>
          ))}
        </div>

        <p className="mt-4 text-base text-ink-soft">{ROUTES[mobileRoute].blurb}</p>

        <dl className="mt-6 space-y-4">
          {ROWS.map((row) => (
            <div key={row.label} className="rounded-2xl border border-line bg-paper p-5">
              <dt className="font-display text-lg font-semibold text-ink">
                {row.label}
                {row.term ? (
                  <>
                    {' '}
                    <GlossaryTerm k={row.term} />
                  </>
                ) : null}
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-ink-soft">{row[mobileRoute]}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden lg:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Structural differences between Original Medicare and Medicare Advantage under
            federal rules.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[22%] pb-5 pr-6 align-bottom text-base font-semibold text-ink-faint">
                What people ask about
              </th>
              {(Object.keys(ROUTES) as RouteKey[]).map((key) => (
                <th key={key} scope="col" className="w-[39%] pb-5 pr-6 align-bottom">
                  <span className="block font-display text-2xl font-bold tracking-[-0.02em] text-ink">
                    {ROUTES[key].name}
                  </span>
                  <span className="mt-2 block text-base font-normal text-ink-soft">
                    {ROUTES[key].blurb}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-line align-top">
                <th scope="row" className="py-6 pr-6 text-base font-semibold text-ink">
                  {row.label}
                  {row.term ? (
                    <>
                      {' '}
                      <GlossaryTerm k={row.term} />
                    </>
                  ) : null}
                </th>
                <td className="py-6 pr-6 text-base leading-relaxed text-ink-soft">
                  {row.original}
                </td>
                <td className="py-6 pr-6 text-base leading-relaxed text-ink-soft">
                  {row.advantage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*
        Sentinel for the completion event. Sits after both the mobile list and
        the desktop table, so reaching it means the reader got through the
        whole comparison on either layout. Zero height, no visual effect.
      */}
      <div ref={endRef} aria-hidden="true" className="h-px w-full" />

      <div className="mt-10 rounded-2xl border-2 border-navy/20 bg-navy-soft p-6">
        <p className="flex items-start gap-3 text-base leading-relaxed text-navy-deep">
          <Check className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>
            Neither route is better than the other. Which one fits depends on your doctors,
            your prescriptions, how much you travel, and how you feel about trading a
            predictable monthly cost for a variable one.
          </span>
        </p>
        <p className="mt-4 flex items-start gap-3 text-base leading-relaxed text-navy-deep">
          <Minus className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>
            This table describes structure only. It does not show any specific plan,
            premium, benefit or network — those are county-level and change every year.
          </span>
        </p>
      </div>
    </div>
  );
}
