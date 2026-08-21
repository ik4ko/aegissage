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
      /*
        Mobile only. On desktop the header, the hero and every CTA band carry
        a visible Call action, so a permanently pinned bar was covering content
        to repeat something already on screen. Calling and texting stay
        available at every width — this only removes the duplicate.
      */
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-deep/20 bg-navy-deep/95 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="container flex items-center justify-between gap-3 p-2.5 sm:py-3">
        <p className="hidden text-sm font-semibold text-white/85 sm:block">Call or text Erekle</p>
        <div className="grid flex-1 grid-cols-2 gap-2 sm:flex sm:flex-none">
        <a
          href={contactHrefs.tel}
          onClick={() => trackContactIntent('call', 'sticky-cta')}
          className="flex h-touch items-center justify-center gap-2 rounded-xl bg-ember px-3 text-base font-semibold text-white transition-colors hover:bg-ember-deep active:translate-y-px sm:px-5"
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          {/*
            The full number does not fit here on a narrow phone. At 390px each
            half of this two-column grid is about 165px, and "Call (551)
            202-9079" needs roughly 214px once the icon, gap and padding are
            counted — so it wrapped inside a fixed-height button and looked
            clipped. The number is still one tap away (this dials it), and it
            is printed in full in the header, the hero, the footer and every
            CTA band.
          */}
          <span className="sm:hidden">Call {advisor.firstName}</span>
          <span className="hidden sm:inline">Call {advisor.phone}</span>
        </a>
        <a
          href={contactHrefs.sms}
          onClick={() => trackContactIntent('text', 'sticky-cta')}
          className="flex h-touch items-center justify-center gap-2 rounded-xl border-2 border-white/35 px-3 text-base font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/10 active:translate-y-px sm:px-5"
        >
          <MessageSquareText className="h-5 w-5" aria-hidden="true" />
          Text {advisor.firstName}
        </a>
        </div>
      </div>
    </aside>
  );
}
