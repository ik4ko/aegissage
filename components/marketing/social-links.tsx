import { Instagram, Youtube } from 'lucide-react';
import { social } from '@/lib/site';
import { cn } from '@/lib/utils';

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-3', className)} aria-label="Social links">
      <a
        href={social.youtube}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-touch items-center gap-2 rounded-xl border border-line px-3.5 text-sm font-semibold text-ink-soft transition-colors hover:border-navy/40 hover:text-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
      >
        <Youtube className="h-5 w-5" aria-hidden="true" />
        YouTube
      </a>
      <a
        href={social.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-touch items-center gap-2 rounded-xl border border-line px-3.5 text-sm font-semibold text-ink-soft transition-colors hover:border-navy/40 hover:text-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
      >
        <Instagram className="h-5 w-5" aria-hidden="true" />
        Instagram
      </a>
    </div>
  );
}
