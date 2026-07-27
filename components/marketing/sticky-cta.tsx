'use client';

import { usePathname } from 'next/navigation';
import { MessageSquareText, Phone } from 'lucide-react';
import { advisor, contactHrefs } from '@/lib/site';
import { trackContactIntent } from '@/lib/analytics';

/**
 * Fixed bottom bar on mobile viewports — always thumb-reachable, always a real
 * phone number, never more than two choices. Hidden at `sm` and up, where the
 * header CTA is already visible.
 *
 * The matching bottom padding lives on <body> (`pb-[5.5rem] sm:pb-0`) so the
 * bar never covers page content or the disclaimer.
 */
export function StickyCta() {
  const pathname = usePathname();

  // The quiz has its own full-width submit affordance at the bottom of every
  // step; a second fixed bar there would fight it for the same thumb.
  if (pathname?.startsWith('/tools/eligibility-check')) return null;

  return (
    // A labelled landmark, so the bar is reachable as a named region rather
    // than orphaned content sitting outside <main>.
    <aside
      aria-label="Contact shortcuts"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-deep/20 bg-navy-deep/95 backdrop-blur-sm sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-2 gap-2 p-2.5">
        <a
          href={contactHrefs.tel}
          onClick={() => trackContactIntent('call', 'sticky-cta')}
          className="flex h-touch items-center justify-center gap-2 rounded-xl bg-ember text-base font-semibold text-white active:translate-y-px"
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          Call {advisor.phone}
        </a>
        <a
          href={contactHrefs.sms}
          onClick={() => trackContactIntent('text', 'sticky-cta')}
          className="flex h-touch items-center justify-center gap-2 rounded-xl border-2 border-white/35 text-base font-semibold text-white active:translate-y-px"
        >
          <MessageSquareText className="h-5 w-5" aria-hidden="true" />
          Text me
        </a>
      </div>
    </aside>
  );
}
