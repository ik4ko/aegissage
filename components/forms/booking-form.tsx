'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarClock, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { advisor, contactHrefs } from '@/lib/site';
import { trackContactSubmit, trackFormStart, trackFormSubmit } from '@/lib/analytics';
import { captureAttribution, getAttribution } from '@/lib/attribution';
import { BOOKING_SOURCE } from '@/lib/consent';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  Booking interstitial — the step between "Book a time" and Google Calendar.
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  Booking used to go straight to calendar.app.google, which produced no
 *  contacts row, no alert and no attribution for the highest-intent action on
 *  the site. Eric found out someone had booked by looking at his own calendar.
 *
 *  ── The calendar opens OVER this page, it does not replace it ────────────
 *  Recording the lead fixed the data problem and left a second one. Submitting
 *  navigated the whole tab to Google, so /book — the page that explains what
 *  the call is, what to bring, and the number to ring instead — disappeared at
 *  the exact moment someone acted on it. Anyone who then hesitated at Google's
 *  calendar had nothing to return to but the Back button.
 *
 *  So the same appointment schedule is loaded in an <iframe> inside a modal
 *  <dialog> — see contactHrefs.bookingCalendarEmbed. Closing it returns to a
 *  page that is still exactly where they left it.
 *
 *  ── Why the capture happens here and not on Google's side ────────────────
 *  A Google Appointment Schedule link has no documented way to carry UTM
 *  parameters through and hand them back, and a cross-origin iframe hands
 *  nothing back either. Anything not recorded before the calendar opens is
 *  gone, so attribution is only obtainable on this side of that boundary.
 *
 *  Reading the booking back out of Google later would also mean writing a row
 *  with `consent = true` — which the contacts table requires — carrying a
 *  consent_text_version that names wording the person never saw. A real
 *  checkbox here is the difference between recording consent and inventing it.
 *
 *  ── Keep this short ──────────────────────────────────────────────────────
 *  This sits in front of the action we most want people to complete, so every
 *  field is a chance to lose someone. Name and email only; phone is optional
 *  and says so. Do not add fields without a specific reason — a ZIP or a topic
 *  belongs on the contact form, which people reach when they are already
 *  willing to type more.
 * ══════════════════════════════════════════════════════════════════════════
 */

/*
  Shared with lib/consent.ts, which maps it to this form's consent wording
  version. Importing rather than re-declaring means the string cannot drift out
  from under that mapping — which is how this form spent its first day
  recording the ContactForm's consent version against wording it never showed.
*/
const SOURCE = BOOKING_SOURCE;

const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your name.')
    .max(80, 'That name is too long.'),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .max(160, 'That email address is too long.')
    .email('Please enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      'Please enter a 10-digit phone number.',
    )
    .or(z.literal(''))
    .optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please check the box so I know it is okay to contact you.' }),
  }),
  /** Honeypot. Real people leave it empty; the API returns a plain 200. */
  website: z.string().max(200).optional(),
});

type BookingInput = z.input<typeof bookingSchema>;

export function BookingForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'booked'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const startedRef = useRef(false);

  /*
    ── Calendar dialog state ───────────────────────────────────────────────

    Three values rather than a boolean, because "closed" and "never opened"
    have to behave differently.

      'never'  — not requested yet, and the <iframe> is NOT mounted. That
                 keeps /book from making a third-party request to Google on
                 every page view, for the many visitors who only read it.
      'open'   — dialog showing.
      'closed' — dismissed, iframe STILL MOUNTED. Reopening therefore resumes
                 exactly where they were, so a mis-aimed backdrop click
                 halfway through picking a slot costs nothing. Unmounting
                 would silently discard the selection instead.
  */
  const [calendar, setCalendar] = useState<'never' | 'open' | 'closed'>('never');
  const dialogRef = useRef<HTMLDialogElement>(null);

  /*
    Attribution is normally captured on first page view. Someone can land
    directly on /book from a partner link or an ad, so capture here too —
    captureAttribution() is first-touch-only and no-ops if it already ran.
  */
  useEffect(() => {
    captureAttribution();
  }, []);

  /*
    showModal() gives the focus trap, the inert background and Escape for
    free. Driving it from an effect rather than imperatively at the call site
    is what keeps the DOM and React's state from drifting apart — reopening
    after a native Escape close is precisely where that goes wrong.

    If showModal is missing or throws, fall back to the full navigation this
    replaced. Losing the page is bad; losing the booking is worse.
  */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (calendar === 'open' && !dialog.open) {
      if (typeof dialog.showModal !== 'function') {
        window.location.assign(contactHrefs.bookingCalendar);
        return;
      }
      try {
        dialog.showModal();
      } catch {
        window.location.assign(contactHrefs.bookingCalendar);
      }
    } else if (calendar !== 'open' && dialog.open) {
      dialog.close();
    }
  }, [calendar]);

  /*
    Escape and the close button both end in the native `close` event.
    Listening for it is what keeps `calendar` truthful when the dialog is
    dismissed by a route React never sees.
  */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setCalendar((current) => (current === 'open' ? 'closed' : current));
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  /*
    showModal() makes the background inert but does not stop it scrolling, so
    without this a touch drag over the backdrop scrolls the page behind the
    calendar.
  */
  useEffect(() => {
    if (calendar !== 'open') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [calendar]);

  function handleFirstFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackFormStart(SOURCE);
  }

  /*
    A <dialog> does not close on a backdrop click by itself. Clicks inside the
    panel arrive from a descendant, so a target of the dialog element itself
    is the backdrop and nothing else. Clicks inside the iframe are
    cross-origin and never reach here at all.
  */
  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) setCalendar('closed');
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      website: '',
      // Unticked. A pre-checked consent box is not consent.
      consent: false as unknown as true,
    },
  });

  async function onSubmit(values: BookingInput) {
    /*
      Already recorded — this is a reopen, not a second booking.

      Reopening must never POST again: /api/contact matches a repeat booker to
      their existing row and updates it in place, so a second POST would
      rewrite the row we just wrote on behalf of someone who did nothing but
      close a dialog and come back.

      Guarded on `status` rather than a ref because a ref read here is a ref
      read during render — handleSubmit(onSubmit) is called in the render body,
      so the compiler cannot tell this only ever runs from a submit event.
      `status === 'booked'` already means "recorded", so there is no second
      source of truth to keep in step either.
    */
    if (status === 'booked') {
      setCalendar('open');
      return;
    }

    setStatus('submitting');
    setServerError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone || '',
          /*
            They are booking a meeting, so a call is the point. Recording
            'phone' when they gave one and 'email' when they did not keeps
            preferred_contact honest rather than defaulting to either.
          */
          preferredContact: values.phone ? 'phone' : 'email',
          consent: true,
          // Explicit. This form never collects SMS consent.
          consentSms: false,
          source: SOURCE,
          bookingStatus: 'intent',
          website: values.website,
          context: getAttribution(),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setServerError(body?.error ?? 'Something went wrong. Please try again.');
        setStatus('idle');
        trackContactSubmit(SOURCE, 'error');
        return;
      }

      trackContactSubmit(SOURCE, 'success');
      trackFormSubmit(SOURCE, {
        intent: 'booking',
        contactPref: values.phone ? 'phone' : 'email',
      });
    } catch {
      /*
        A network failure must NOT block the booking.

        The visitor's goal is to get on the calendar; ours is to know about
        it. When those conflict, theirs wins — an unattributed booking is a
        far better outcome than a lost one. Validation errors still stop and
        show a message above; only an unreachable API falls through.
      */
      trackContactSubmit(SOURCE, 'error');
    }

    setStatus('booked');
    setCalendar('open');
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} onFocus={handleFirstFocus} noValidate>
        {/* Honeypot. Hidden from people, not from bots. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${SOURCE}-website`}>Website</label>
          <input
            id={`${SOURCE}-website`}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register('website')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={`${SOURCE}-name`} label="Your name" required error={errors.name?.message}>
            <Input
              id={`${SOURCE}-name`}
              autoComplete="name"
              placeholder="Pat Doyle"
              invalid={Boolean(errors.name)}
              {...register('name')}
            />
          </Field>

          <Field
            id={`${SOURCE}-email`}
            label="Email address"
            required
            error={errors.email?.message}
          >
            <Input
              id={`${SOURCE}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field
            id={`${SOURCE}-phone`}
            label="Phone number"
            hint="Only if you would rather I called than emailed about the appointment."
            error={errors.phone?.message}
          >
            <Input
              id={`${SOURCE}-phone`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(551) 202-9079"
              invalid={Boolean(errors.phone)}
              {...register('phone')}
            />
          </Field>
        </div>

        {/*
          Consent sits above the button and is visible before anything is sent —
          the same placement rule as every other form on the site.
        */}
        <div className="mt-6 rounded-2xl border-2 border-line bg-cream p-5">
          <label htmlFor={`${SOURCE}-consent`} className="flex cursor-pointer items-start gap-3">
            <span className="pt-0.5">
              <Controller
                control={control}
                name="consent"
                render={({ field }) => (
                  <Checkbox
                    id={`${SOURCE}-consent`}
                    ref={field.ref}
                    name={field.name}
                    checked={field.value === true}
                    onBlur={field.onBlur}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
            </span>
            <span className="text-base leading-relaxed text-ink">
              Yes, {advisor.firstName} may contact me about the appointment I am booking.
            </span>
          </label>
          {errors.consent?.message ? (
            <p role="alert" className="mt-3 text-sm font-semibold text-ember-deep">
              {errors.consent.message}
            </p>
          ) : null}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Booking a time is a request for information, not an application. It does not enroll you
          in anything. There is no cost or obligation.
        </p>

        {serverError ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-ember-deep">
            {serverError}
          </p>
        ) : null}

        {/*
          Once submitted this button reopens the calendar instead of sending
          anything — see the guard at the top of onSubmit. The label has to say
          so, because someone who closed the dialog by mistake needs an obvious
          way back in that does not read as re-submitting a form they have
          already filled out.
        */}
        <Button type="submit" size="block" className="mt-6" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              One moment…
            </>
          ) : (
            <>
              <CalendarClock className="h-5 w-5" aria-hidden="true" />
              {status === 'booked' ? 'Open the calendar again' : 'Pick a time'}
            </>
          )}
        </Button>
      </form>

      {/*
        The calendar itself. Rendered outside the <form> on purpose: the close
        button would otherwise be a submit button inside it, and the iframe
        would be a form control's sibling for no reason.

        `max-w-none` and `p-0` undo the user-agent dialog styling; `m-auto`
        restores the centring that removing the default margin takes away.
      */}
      <dialog
        ref={dialogRef}
        aria-label={`Pick a time with ${advisor.firstName}`}
        onClick={handleDialogClick}
        className="m-auto w-[min(100vw-1.5rem,46rem)] max-w-none overflow-hidden rounded-3xl border-0 bg-paper p-0 shadow-lift backdrop:bg-ink/60"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
          <p className="font-display text-base font-semibold text-ink">Pick a time</p>
          <button
            type="button"
            onClick={() => setCalendar('closed')}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-cream hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close the calendar</span>
          </button>
        </div>

        {/*
          The iframe paints over this panel once Google responds, so the panel
          is the loading state and, if the frame never loads at all, the way
          out. A spinner alone would leave someone watching it forever behind
          an iframe that a network block had already killed.
        */}
        <div className="relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-navy" aria-hidden="true" />
            <p className="text-base text-ink-soft">Loading the calendar…</p>
            <p className="text-sm text-ink-soft">
              If it does not appear,{' '}
              <a
                href={contactHrefs.bookingCalendar}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-navy underline decoration-line underline-offset-4 hover:decoration-navy"
              >
                open it in a new tab
              </a>{' '}
              or call {advisor.phone}.
            </p>
          </div>

          {calendar === 'never' ? null : (
            <iframe
              src={contactHrefs.bookingCalendarEmbed}
              title={`Book a time with ${advisor.name}`}
              className="relative block h-[min(78vh,44rem)] w-full border-0"
            />
          )}
        </div>
      </dialog>
    </>
  );
}
