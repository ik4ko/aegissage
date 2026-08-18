import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, MapPin } from 'lucide-react';
import { advisor } from '@/lib/site';
import { licensedStates } from '@/lib/states';
import { cn } from '@/lib/utils';

/**
 * Licensing facts + a real face. Rendered adjacent to CTAs across the site,
 * not just on the About page — the senior-UX rule is that a trust signal
 * should always be within sight of the thing you are asking someone to tap.
 */
export function TrustBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-line bg-paper/80 p-4 sm:px-6',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <AdvisorAvatar size={52} />
        <div className="leading-tight">
          <p className="font-semibold text-ink">{advisor.name}</p>
          <p className="text-sm text-ink-faint">{advisor.credential}</p>
        </div>
      </div>

      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
        <li className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-sage" aria-hidden="true" />
          Licensed in {licensedStates.length} states
        </li>
        {/*
          The three local markets are named by state code, then the remaining
          licensed states are a link rather than a claim the reader has to
          take on trust. "+ N more" is derived from lib/states.ts, so it can
          never disagree with the directory it points at.
        */}
        <li className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-sage" aria-hidden="true" />
          <span>
            NJ · NY · PA{' '}
            <Link
              href="/plans"
              className="font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
            >
              + {licensedStates.length - 3} more states
            </Link>
          </span>
        </li>
      </ul>
    </div>
  );
}

/**
 * The advisor's photo, committed at public/images/advisor-headshot.png.
 *
 * ── Why this is one component and not an <img> in each place ──────────────
 * The same face appears in the hero card (72px), in every TrustBar (52px)
 * and therefore on every location landing page. Routing all of them through
 * here means the photo is swapped in one place and the rounded/ring/cover
 * treatment cannot drift between them.
 *
 * The source file is a large square PNG. That is deliberate and it is not
 * shipped as-is: next/image resizes to the requested `size` and re-encodes to
 * AVIF/WebP (configured in next.config.js), so the bytes on the wire are a
 * fraction of the source. Keeping the original at full resolution means a
 * larger crop later — an About-page portrait, say — needs no new asset.
 *
 * NEXT_PUBLIC_ADVISOR_PHOTO still overrides, so the photo can be pointed at a
 * different file per environment without a code change. The committed file is
 * the default rather than the fallback, so a fresh clone renders the real
 * face instead of initials.
 *
 * If neither is available the component renders initials in the brand
 * palette — never a broken image, and never a stock photo of someone else.
 */
const ADVISOR_PHOTO = '/images/advisor-headshot.png';

export function AdvisorAvatar({
  size = 64,
  className,
  priority,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  const initials = advisor.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  const photo = process.env.NEXT_PUBLIC_ADVISOR_PHOTO ?? ADVISOR_PHOTO;

  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-navy text-white ring-2 ring-white',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {photo ? (
        <Image
          src={photo}
          alt={`${advisor.name}, ${advisor.credential}`}
          fill
          /*
           * `sizes` is the CSS width the circle occupies, NOT the pixel count
           * to fetch. The browser multiplies by device pixel ratio itself and
           * then picks the next candidate up from the srcSet, so a 72px
           * circle on a 2x screen already resolves to a 256px asset. Doubling
           * this by hand double-counts DPR and just fetches a larger file.
           */
          sizes={`${size}px`}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className="font-display font-semibold"
            style={{ fontSize: size * 0.38 }}
          >
            {initials}
          </span>
          <span className="sr-only">{advisor.name}</span>
        </>
      )}
    </span>
  );
}
