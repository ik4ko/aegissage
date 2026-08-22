'use client';

import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { advisor } from '@/lib/site';
import { trackContactSubmit, trackFormStart, trackFormSubmit } from '@/lib/analytics';
import { getAttribution } from '@/lib/attribution';
import { HOMEPAGE_CAPTURE_SOURCE } from '@/lib/consent';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  Homepage lead capture — the only email-first path on the site.
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  Every other homepage CTA is call, text, book, or open-a-tool. All four
 *  assume the visitor is ready to act today. Someone eight months out from
 *  turning 65 is the highest-value reader this site has and had no way to
 *  leave a trace, so they left without one.
 *
 *  ── Deliberately NOT here ────────────────────────────────────────────────
 *  No phone field and NO SMS opt-in. Not an oversight: this form asks for the
 *  minimum that lets someone be emailed two dates. Adding a phone number
 *  would turn an educational request into a lead-gen capture, and an SMS
 *  checkbox on a form nobody expected to be a form is exactly the pattern
 *  that makes TCPA consent contestable. Email only. Four fields.
 *
 *  ── Where the TPMO disclosure is ─────────────────────────────────────────
 *  NOT in this component. This band collects a ZIP, so `/` is registered in
 *  ZIP_ROUTES (lib/tpmo.ts) and the sitewide footer disclosure on the
 *  homepage resolves to the counted variant automatically.
 *
 *  An earlier version rendered a second copy inline here. It was redundant
 *  rather than wrong, but it broke the one-disclosure-per-page rule that
 *  <DisclaimerFooter /> exists to enforce. Do not re-add it — registering the
 *  route is the whole mechanism.
 *
 *  ── Consent ──────────────────────────────────────────────────────────────
 *  One checkbox, unticked, whose text explicitly authorises ongoing email.
 *  It maps to BOTH `consent` (permission to reply to this request) and
 *  `consentMarketing` (permission for future guides), because the wording
 *  covers both and the visitor can read it. It NEVER sets `consentSms`,
 *  which stays false — see the note in lib/notify/sms.ts, where SMS consent
 *  is re-checked at send time and can never be inferred.
 *
 *  A pre-checked box is not consent. `defaultValue: false`, and the submit
 *  is blocked until it is ticked.
 * ══════════════════════════════════════════════════════════════════════════
 */

/*
  Shared with lib/consent.ts, which maps it to this form's consent wording
  version. Importing rather than re-declaring means the string cannot drift
  out from under that mapping and start recording the wrong consent text.
*/
const SOURCE = HOMEPAGE_CAPTURE_SOURCE;

const captureSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'Please enter your first name.')
    .max(80, 'That name is too long.'),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .max(160, 'That email address is too long.')
    .email('Please enter a valid email address.'),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Please enter a 5-digit ZIP code.'),
  /** Native month input — "YYYY-MM" or empty. Optional by design. */
  turns65: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, 'Please pick a month and year.')
    .or(z.literal(''))
    .optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please check the box so I know it is okay to email you.' }),
  }),
  /** Honeypot. Real people leave it empty; the API returns a plain 200. */
  website: z.string().max(200).optional(),
});

type CaptureInput = z.input<typeof captureSchema>;

export function DeadlineCapture() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  /*
    form_start fires once per mount, on the first focus anywhere in the form.
    A ref rather than state: re-rendering on first focus would be a pointless
    render, and the flag must not reset when status changes.
  */
  const startedRef = useRef(false);

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
  } = useForm<CaptureInput>({
    resolver: zodResolver(captureSchema),
    defaultValues: {
      firstName: '',
      email: '',
      zip: '',
      turns65: '',
      website: '',
      // Unticked. A pre-checked consent box is not consent.
      consent: false as unknown as true,
    },
  });

  async function onSubmit(values: CaptureInput) {
    setStatus('submitting');
    setServerError(null);

    try {
      /*
        Posts to the same /api/contact route as every other form, so this
        inherits the durable write, the advisor alert, the delivery audit and
        the CRM handoff rather than growing a second pipeline that would need
        its own monitoring. `source` is what distinguishes it downstream.
      */
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.firstName,
          email: values.email,
          zip: values.zip,
          // Email is the only channel this form offers, so it is the only
          // preference it can honestly record.
          preferredContact: 'email',
          consent: true,
          consentMarketing: true,
          // Explicit, not merely omitted. This form never collects SMS
          // consent and must never appear to.
          consentSms: false,
          source: SOURCE,
          website: values.website,
          context: {
            ...getAttribution(),
            ...(values.turns65 ? { turns65: values.turns65 } : {}),
          },
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setServerError(body?.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        trackContactSubmit(SOURCE, 'error');
        return;
      }

      setStatus('sent');
      trackContactSubmit(SOURCE, 'success');
      /*
        intent is fixed for this form: everyone here is asking for deadline
        dates. contact_pref is email because email is the only channel it
        offers. No ZIP — see the note on trackFormSubmit.
      */
      trackFormSubmit(SOURCE, { intent: 'deadlines', contactPref: 'email' });
    } catch {
      setServerError('Something went wrong. Please try again.');
      setStatus('error');
      trackContactSubmit(SOURCE, 'error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-3xl border border-line bg-paper p-7 text-center shadow-lift sm:p-9">
        <CheckCircle2 className="mx-auto h-10 w-10 text-sage" aria-hidden="true" />
        <h3 className="mt-4 font-display text-2xl font-bold text-ink">Got it — thank you.</h3>
        <p className="mx-auto mt-3 max-w-prose text-base leading-relaxed text-ink-soft">
          {advisor.firstName} will email you the two deadlines that apply to your situation.
          No plan pitches, and no phone call unless you ask for one.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-paper p-7 shadow-lift sm:p-9">
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
          <Field
            id={`${SOURCE}-firstName`}
            label="First name"
            required
            error={errors.firstName?.message}
          >
            <Input
              id={`${SOURCE}-firstName`}
              autoComplete="given-name"
              placeholder="Pat"
              invalid={Boolean(errors.firstName)}
              aria-describedby={errors.firstName ? `${SOURCE}-firstName-error` : undefined}
              {...register('firstName')}
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
              aria-describedby={errors.email ? `${SOURCE}-email-error` : undefined}
              {...register('email')}
            />
          </Field>

          <Field
            id={`${SOURCE}-zip`}
            label="ZIP code"
            required
            hint="Deadlines are federal, but plan availability is decided county by county."
            error={errors.zip?.message}
          >
            <Input
              id={`${SOURCE}-zip`}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              placeholder="07090"
              invalid={Boolean(errors.zip)}
              aria-describedby={errors.zip ? `${SOURCE}-zip-error` : undefined}
              {...register('zip')}
            />
          </Field>

          <Field
            id={`${SOURCE}-turns65`}
            label="Month & year you turn 65"
            hint="Skip it if that is not what brought you here."
            error={errors.turns65?.message}
          >
            <Input
              id={`${SOURCE}-turns65`}
              type="month"
              invalid={Boolean(errors.turns65)}
              aria-describedby={errors.turns65 ? `${SOURCE}-turns65-error` : undefined}
              {...register('turns65')}
            />
          </Field>
        </div>

        {/*
          Consent sits ABOVE the submit button and is visible before anything
          is sent — same placement rule as <ContactForm />. Do not move it
          below the button or into a collapsed element.
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
              Yes, {advisor.firstName} may email me about Medicare deadlines and guides. I can
              unsubscribe anytime.
            </span>
          </label>
          {errors.consent?.message ? (
            <p role="alert" className="mt-3 text-sm font-semibold text-ember-deep">
              {errors.consent.message}
            </p>
          ) : null}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Submitting this is a request for information, not an application. It does not enroll
          you in anything. There is no cost or obligation.
        </p>

        {serverError ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-ember-deep">
            {serverError}
          </p>
        ) : null}

        <Button type="submit" size="block" className="mt-6" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            'Send it to me'
          )}
        </Button>
      </form>

    </div>
  );
}
