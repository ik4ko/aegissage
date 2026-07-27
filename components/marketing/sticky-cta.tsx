'use client';

import { MessageSquareText, Phone } from 'lucide-react';
import { advisor, contactHrefs } from '@/lib/site';
import { trackContactIntent } from '@/lib/analytics';

/**
 * Fixed bottom bar on every viewport — always reachable without scrolling back
 * to the header, with the same two low-friction contact choices everywhere.
 *
 * The matching bottom padding lives on <body> so the bar never covers page
 * content or the disclaimer.
 */
export function StickyCta() {
  return (
    // A labelled landmark, so the bar is reachable as a named region rather
    // than orphaned content sitting outside <main>.
    <aside
      aria-label="Contact shortcuts"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-deep/20 bg-navy-deep/95 backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="container flex items-center justify-between gap-3 p-2.5 sm:py-3">
        <p className="hidden text-sm font-semibold text-white/85 sm:block">Call or text Eric</p>
        <div className="grid flex-1 grid-cols-2 gap-2 sm:flex sm:flex-none">
        <a
          href={contactHrefs.tel}
          onClick={() => trackContactIntent('call', 'sticky-cta')}
          className="flex h-touch items-center justify-center gap-2 rounded-xl bg-ember px-3 text-base font-semibold text-white transition-colors hover:bg-ember-deep active:translate-y-px sm:px-5"
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          Call {advisor.phone}
        </a>
        <a
          href={contactHrefs.sms}
          onClick={() => trackContactIntent('text', 'sticky-cta')}
          className="flex h-touch items-center justify-center gap-2 rounded-xl border-2 border-white/35 px-3 text-base font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/10 active:translate-y-px sm:px-5"
        >
          <MessageSquareText className="h-5 w-5" aria-hidden="true" />
          Text me
        </a>
        </div>
      </div>
    </aside>
  );
}
