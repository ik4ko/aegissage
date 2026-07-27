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
 * Privacy-friendly, click-to-load video. Nothing autoplays and no third-party
 * frame is mounted until the reader asks for it, which also keeps it off the
 * critical path for Lighthouse.
 */
export function VideoEmbed({
  youtubeId,
  title,
  caption,
}: {
  youtubeId: string;
  title: string;
  caption?: string;
}) {
  return (
    <figure className="my-10">
      <div className="overflow-hidden rounded-2xl border border-line bg-navy-deep shadow-card">
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
            title={title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm text-ink-faint">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/** Numbered takeaways — the format that actually gets screenshotted and shared. */
export function KeyPoints({ items }: { items: string[] }) {
  return (
    <ol className="my-8 space-y-4 border-y border-line py-7">
      {items.map((item, i) => (
        <li key={item} className="flex gap-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy font-display text-lg font-bold text-white">
            {i + 1}
          </span>
          <span className="pt-1 text-base leading-relaxed text-ink">{item}</span>
        </li>
      ))}
    </ol>
  );
}
