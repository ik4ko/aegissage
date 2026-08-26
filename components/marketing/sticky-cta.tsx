'use client';

import { Phone } from 'lucide-react';
import { advisor, contactHrefs } from '@/lib/site';
import { trackContactIntent } from '@/lib/analytics';

/**
 * Persistent tap-to-call bar, pinned to the bottom of the viewport on phones.
 *
 * Mounted once in the root layout, so it is present on every route at every
 * scroll position. It sits ALONGSIDE the lead form and the "Book a time" CTA
 * and replaces neither — someone who would rather talk now should never have
 * to scroll back to the header to find a number.
 *
 * ── One action, not two ───────────────────────────────────────────────────
 * This bar previously carried Call and Text side by side in a two-column
 * grid. It is now a single primary action. The consequences, recorded so the
 * second button is not "restored" as an oversight:
 *
 *   • Text is still reachable from the CTA bands; only this surface dropped
 *     it, and only this surface's `text_click` events stopped. Taps here
 *     still report as `call_click` with `cta_position: 'sticky-cta'`, the
 *     same event every other call surface emits — one event, position as a
 *     property, so the funnel is not split across two names.
 *   • The full number fits again. In the two-column layout each half was
 *     ~165px at 390px wide while "Call (551) 202-9079" needs roughly 214px,
 *     so the label had to degrade to "Call Erekle" below `sm`. Full width is
 *     ~350px at 390px and ~280px at 320px, so the number now renders in full
 *     at every supported width and the responsive label split is gone.
 *
 * ── Height, and the space reserved for it ─────────────────────────────────
 * 10px + 48px + 10px + 1px border = 69px, above the 56px floor, with a 48px
 * tap target inside it. `env(safe-area-inset-bottom)` is added on top so the
 * button clears the home indicator on notched iPhones rather than sitting
 * under it.
 *
 * The matching reserve is `pb-[5.25rem]` (84px) on <body> in app/layout.tsx,
 * which is static markup rendered in the same pass — the bar never displaces
 * content after paint, so it contributes no CLS. THE TWO MUST FLIP AT THE
 * SAME BREAKPOINT: `md:hidden` here and `md:pb-0` there. Changing one alone
 * leaves either an 84px dead gap under the footer or a bar covering the TPMO
 * disclaimer.
 *
 * That disclaimer is the reason the reserve is generous rather than exact.
 * <DisclaimerFooter /> is the last element in the flow and its final line
 * must be fully readable at maximum scroll; 84px of reserve against a 69px
 * bar leaves the text clear of it with room to spare.
 */
export function StickyCta() {
  return (
    // A labelled landmark, so the bar is reachable as a named region rather
    // than orphaned content sitting outside <main>.
    <aside
      aria-label="Contact shortcuts"
      /*
        Phones only. From `md` up the header carries a visible, tel:-linked
        phone number at all times, so a pinned bar there would cover content
        to repeat something already on screen.
      */
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-deep/20 bg-navy-deep/95 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="container p-2.5">
        <a
          href={contactHrefs.tel}
          onClick={() => trackContactIntent('call', 'sticky-cta')}
          /*
            The visible label reads "Call (551) 202-9079", which a screen
            reader would otherwise announce digit-group by digit-group with no
            indication of who is being called. The aria-label names the action
            and the person; the number is still dialled either way.
          */
          aria-label={`Call ${advisor.name}, ${advisor.credential}, at ${advisor.phone}`}
          /*
            The focus ring is white, not the navy used elsewhere on this site.
            This bar is navy-deep, and `ring-navy/30` over it is effectively
            invisible — a focus indicator that cannot be seen is not one.
          */
          className="flex h-touch w-full items-center justify-center gap-2 rounded-xl bg-ember px-5 text-base font-semibold text-white transition-colors hover:bg-ember-deep active:translate-y-px focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"
        >
          <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">Call {advisor.phone}</span>
        </a>
      </div>
    </aside>
  );
}
