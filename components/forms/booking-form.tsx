'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarClock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { advisor, contactHrefs } from '@/lib/site';
import { trackContactSubmit, trackFormStart, trackFormSubmit } from '@/lib/analytics';
import { captureAttribution, getAttribution } from '@/lib/attribution';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  Booking interstitial — the step between "Book a time" and Google Calendar.
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  Booking used to go straight to calendar.app.google, which produced no
 *  contacts row, no alert and no attribution for the highest-intent action on
 *  the site. Eric found out someone had booked by looking at his own calendar.
 *
 *  ── Why the capture happens here and not on Google's side ────────────────
 *  A Google Appointment Schedule link has no documented way to carry UTM
 *  parameters through and hand them back. Anything not recorded before the
 *  redirect is gone, so attribution is only obtainable on this side of it.
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

const SOURCE = 'booking-interstitial';

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
  const [status, setStatus] = useState<'idle' | 'submitting' | 'redirecting'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const startedRef = useRef(false);

  /*
    Attribution is normally captured on first page view. Someone can land
    directly on /book from a partner link or an ad, so capture here too —
    captureAttribution() is first-touch-only and no-ops if it already ran.
  */
  useEffect(() => {
    captureAttribution();
  }, []);

  function handleFirstFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackFormStart(SOURCE);
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

    setStatus('redirecting');
    /*
      `assign()` rather than `location.href = …`: the React compiler lint rule
      treats the assignment as mutating state defined outside the component.
      Same navigation, same history entry — back from Google returns here, so
      someone who changes their mind can retry rather than losing the page.
    */
    window.location.assign(contactHrefs.bookingCalendar);
  }

  return (
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

        <Field id={`${SOURCE}-email`} label="Email address" required error={errors.email?.message}>
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

      <Button type="submit" size="block" className="mt-6" disabled={status !== 'idle'}>
        {status === 'idle' ? (
          <>
            <CalendarClock className="h-5 w-5" aria-hidden="true" />
            Pick a time
          </>
        ) : (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            {status === 'submitting' ? 'One moment…' : 'Opening the calendar…'}
          </>
        )}
      </Button>
    </form>
  );
}
