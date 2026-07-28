'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Click-to-load YouTube embed.
 *
 * ── Why a facade instead of a lazy iframe ─────────────────────────────────
 * The previous implementation mounted the iframe on first render with
 * `loading="lazy"`. That defers the *fetch* until the frame nears the
 * viewport, but the frame still exists, and once it is in view YouTube is
 * contacted whether or not the reader ever intended to watch. Its docstring
 * claimed nothing was mounted until the reader asked, which was never true.
 *
 * This is the honest version: until the button is pressed there is no
 * iframe, no request to any Google host, and no third-party JavaScript. On
 * a page of embeds that is the difference between one document request and
 * a dozen third-party connections nobody asked for.
 *
 * ── Why no thumbnail image ────────────────────────────────────────────────
 * The usual facade shows YouTube's poster frame from i.ytimg.com. That
 * reintroduces exactly the third-party request this component exists to
 * avoid, and would need a `remotePatterns` entry in next.config.js. The
 * brand-coloured card costs nothing, ships no external bytes, and cannot
 * break when a thumbnail 404s.
 *
 * ── Accessibility ─────────────────────────────────────────────────────────
 * The trigger is a real <button>, so it is keyboard-reachable, Enter/Space
 * activated, and announced as a button. Its accessible name includes the
 * video title rather than a bare "Play". The loaded iframe keeps its
 * `title`. The 16:9 wrapper is identical in both states, so activating it
 * shifts nothing — CLS stays 0.
 *
 * `autoplay=1` is set only on the post-click src. It is not autoplay in the
 * accessibility sense: playback is the direct result of a user action, so
 * WCAG 2.2 pause/stop/hide does not apply, and nothing moves before then.
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
  const [active, setActive] = useState(false);

  return (
    <figure className="my-10">
      <div className="overflow-hidden rounded-2xl border border-line bg-navy-deep shadow-card">
        <div className="relative aspect-video">
          {active ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setActive(true)}
              className="group absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-4 bg-navy-deep p-6 text-center transition-colors hover:bg-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-ember shadow-lift transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <Play className="ml-1 h-8 w-8 text-white" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-semibold text-white sm:text-xl">
                {title}
              </span>
              <span className="text-sm text-white/75">
                Press to play. YouTube is not contacted until you do.
              </span>
            </button>
          )}
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm text-ink-faint">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
