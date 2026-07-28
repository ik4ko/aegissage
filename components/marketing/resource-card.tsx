import { ExternalLink, Info } from 'lucide-react';
import { OutboundLink } from './outbound-link';
import type { Resource } from '@/lib/resources';

/**
 * Renders one external resource.
 *
 * ── The disclosure invariant ──────────────────────────────────────────────
 * This component is the second of two independent guards. lib/resources.ts
 * fails the build if an `affiliate: true` entry has no disclosure; this
 * refuses to render one even if that check were somehow bypassed (a resource
 * constructed at runtime, a future dynamic source, a bad merge).
 *
 * The disclosure renders directly beneath the link inside the same card —
 * never as a page footnote, never behind a "more info" toggle, never below
 * the fold. If a reader can see the link they can see the disclosure.
 *
 * Two guards rather than one because the failure mode here is a regulatory
 * problem, not a rendering bug, and a build check does not protect a code
 * path the build never evaluated.
 */
export function ResourceCard({ resource, where }: { resource: Resource; where: string }) {
  if (resource.affiliate && !resource.disclosure?.trim()) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `ResourceCard: "${resource.title}" is affiliate but has no disclosure. ` +
          'Refusing to render.',
      );
    }
    return null;
  }

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
          {resource.title}
        </h3>
        {resource.affiliate ? (
          <span className="shrink-0 rounded-lg bg-ember-soft px-2.5 py-1 text-sm font-semibold text-ember-deep">
            Paid link
          </span>
        ) : null}
      </div>

      <p className="mt-3 flex-1 text-base leading-relaxed text-ink-soft">
        {resource.description}
      </p>

      <OutboundLink
        href={resource.url}
        where={where}
        kind={resource.affiliate ? 'other' : 'official'}
        className="mt-5 inline-flex min-h-touch items-center gap-2 font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
      >
        Open {resource.title}
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </OutboundLink>

      {resource.affiliate && resource.disclosure ? (
        <p className="mt-4 flex gap-2.5 rounded-xl border-2 border-ember/30 bg-ember-soft p-3.5 text-sm leading-relaxed text-ink">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ember-deep" aria-hidden="true" />
          <span>{resource.disclosure}</span>
        </p>
      ) : null}
    </article>
  );
}
