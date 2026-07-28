import Image from 'next/image';
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
        <li className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-sage" aria-hidden="true" />
          Bergen County · NJ · NYC · Philadelphia
        </li>
      </ul>
    </div>
  );
}

/**
 * The advisor's photo. Until a real headshot is dropped at
 * public/advisor.jpg, this renders initials in the brand palette rather than
 * a broken image or a stock photo.
 */
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

  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-navy text-white ring-2 ring-white',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {process.env.NEXT_PUBLIC_ADVISOR_PHOTO ? (
        <Image
          src={process.env.NEXT_PUBLIC_ADVISOR_PHOTO}
          alt={`${advisor.name}, ${advisor.credential}`}
          fill
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
