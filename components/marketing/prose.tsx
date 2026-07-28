import { AlertTriangle, Info, Lightbulb, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Article building blocks beyond plain paragraphs. These are what make the
 * long-form pages feel written rather than generated: pull quotes, boxed
 * callouts, numbered takeaway lists and embedded video.
 */

const CALLOUT_STYLES = {
  note: {
    icon: Info,
    wrap: 'border-navy/25 bg-navy-soft',
    accent: 'text-navy',
  },
  watch: {
    icon: AlertTriangle,
    wrap: 'border-ember/35 bg-ember-soft',
    accent: 'text-ember-deep',
  },
  tip: {
    icon: Lightbulb,
    wrap: 'border-sage/30 bg-sage-soft',
    accent: 'text-sage',
  },
} as const;

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof CALLOUT_STYLES;
  title?: string;
  children: React.ReactNode;
}) {
  const style = CALLOUT_STYLES[type] ?? CALLOUT_STYLES.note;
  const Icon = style.icon;

  return (
    <aside className={cn('my-8 rounded-2xl border-2 p-5 sm:p-6', style.wrap)}>
      <div className="flex gap-3.5">
        <Icon className={cn('mt-0.5 h-6 w-6 shrink-0', style.accent)} aria-hidden="true" />
        <div className="min-w-0">
          {title ? (
            <p className={cn('font-display text-lg font-semibold', style.accent)}>{title}</p>
          ) : null}
          <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:text-base [&>p]:leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function PullQuote({
  children,
  attribution,
}: {
  children: React.ReactNode;
  attribution?: string;
}) {
  return (
    <figure className="my-10 border-l-4 border-ember pl-6 sm:pl-8">
      <Quote className="h-7 w-7 text-ember/50" aria-hidden="true" />
      <blockquote className="mt-2 font-display text-2xl font-medium leading-snug tracking-[-0.015em] text-ink">
        {children}
      </blockquote>
      {attribution ? (
        <figcaption className="mt-3 text-sm font-semibold uppercase tracking-[0.1em] text-ink-faint">
          {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Video embed.
 *
 * The implementation moved to ./video-embed.tsx because it needs client-side
 * state to be genuinely click-to-load, and this module is otherwise made of
 * server components. Re-exported here so the MDX component map and every
 * existing `import { VideoEmbed } from './prose'` keep working unchanged.
 */
export { VideoEmbed } from './video-embed';

/**
 * Numbered takeaways rendered from a plain markdown list.
 *
 * next-mdx-remote v6 blocks JavaScript expressions in MDX by default. That
 * means expression-valued props such as `items={[...]}` arrive as undefined,
 * so this component intentionally accepts markdown children instead.
 * Numbering is provided by CSS counters in `.key-points`.
 */
export function KeyPoints({ children }: { children: React.ReactNode }) {
  return (
    <div className="key-points my-8 border-y border-line py-7">{children}</div>
  );
}
