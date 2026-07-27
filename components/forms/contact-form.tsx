'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ContactActions } from '@/components/marketing/contact-actions';
import { advisor, compliance } from '@/lib/site';
import { trackContactSubmit } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import {
  CONTACT_TOPICS,
  contactSchema,
  type ContactInput,
} from '@/lib/validations/contact';

/**
 * Direct-contact form. The point is a conversation, not a pipeline: the
 * call/text links sit above the form so anyone who would rather just dial can,
 * and the form itself asks for the fewest fields that let the advisor call
 * back.
 *
 * Compliance: the consent language and the scope-of-contact notice are
 * rendered ABOVE the submit button and are visible before any data is sent —
 * never after. Nothing is transmitted until consent is explicitly checked.
 */

type Props = {
  /** Analytics + Supabase `source` value, e.g. "eligibility-quiz". */
  source: string;
  /** Extra context stored with the submission (quiz answers, page, etc). */
  context?: Record<string, string>;
  heading?: string;
  intro?: string;
  className?: string;
};

export function ContactForm({
  source,
  context,
  heading = 'Have me reach out',
  intro = 'Two fields and a note is plenty. I read every one of these myself.',
  className,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { preferredContact: 'phone', source, website: '' },
  });

  const preferred = watch('preferredContact');

  async function onSubmit(values: ContactInput) {
    setStatus('submitting');
    setServerError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, source, context }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? 'Something went wrong on my end.');
      }

      setStatus('success');
      trackContactSubmit(source, 'success');
    } catch (err) {
      setStatus('error');
      setServerError(
        err instanceof Error
          ? err.message
          : 'Something went wrong on my end.',
      );
      trackContactSubmit(source, 'error');
    }
  }

  if (status === 'success') {
    return (
      <div
        className={cn('rounded-2xl border-2 border-sage/40 bg-sage-soft p-7 sm:p-9', className)}
        role="status"
      >
        <CheckCircle2 className="h-10 w-10 text-sage" aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl font-bold text-ink">Got it — thank you.</h2>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Your message is with me. I answer these personally, usually the same day and
          almost always within one business day.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          If it is time-sensitive, do not wait on me — call or text and you will get me
          faster.
        </p>
        <ContactActions where={`${source}-success`} className="mt-6" size="md" />
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-line bg-paper p-6 shadow-card sm:p-8', className)}>
      <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">
        {heading}
      </h2>
      <p className="mt-3 text-base text-ink-soft">{intro}</p>

      {/* The fastest path stays visible above the form. */}
      <div className="mt-6 rounded-xl border-2 border-dashed border-line p-4">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-ink-faint">
          <Phone className="h-4 w-4" aria-hidden="true" />
          Rather skip the form?
        </p>
        <ContactActions where={`${source}-inline`} className="mt-3" size="md" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-7" noValidate>
        {/* Honeypot — visually and programmatically hidden from real users. */}
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
          <label htmlFor={`${source}-website`}>Leave this field empty</label>
          <input
            id={`${source}-website`}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register('website')}
          />
        </div>

        <Field
          id={`${source}-name`}
          label="Your name"
          error={errors.name?.message}
          required
        >
          <Input
            id={`${source}-name`}
            autoComplete="name"
            enterKeyHint="next"
            invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${source}-name-error` : undefined}
            {...register('name')}
          />
        </Field>

        <fieldset>
          <legend className="text-base font-semibold text-ink">
            How should I get back to you?
          </legend>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {(
              [
                ['phone', 'Call me'],
                ['text', 'Text me'],
                ['email', 'Email me'],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={cn(
                  'flex min-h-touch cursor-pointer items-center justify-center rounded-xl border-2 px-4 text-base font-semibold transition-colors',
                  preferred === value
                    ? 'border-navy bg-navy-soft text-navy-deep'
                    : 'border-line bg-paper text-ink-soft hover:border-navy/40',
                )}
              >
                <input type="radio" value={value} className="sr-only" {...register('preferredContact')} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          id={`${source}-phone`}
          label="Phone number"
          hint="Digits only is fine."
          error={errors.phone?.message}
        >
          <Input
            id={`${source}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(908) 555-0142"
            invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${source}-phone-error` : undefined}
            {...register('phone')}
          />
        </Field>

        <Field
          id={`${source}-email`}
          label="Email address"
          error={errors.email?.message}
        >
          <Input
            id={`${source}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${source}-email-error` : undefined}
            {...register('email')}
          />
        </Field>

        <Field
          id={`${source}-zip`}
          label="ZIP code"
          hint="Plan availability is decided county by county — this is how I look yours up."
          error={errors.zip?.message}
        >
          <Input
            id={`${source}-zip`}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder="07090"
            invalid={Boolean(errors.zip)}
            aria-describedby={errors.zip ? `${source}-zip-error` : undefined}
            {...register('zip')}
          />
        </Field>

        <Field id={`${source}-topic`} label="What is going on?" error={errors.topic?.message}>
          <select
            id={`${source}-topic`}
            className="h-14 w-full rounded-xl border-2 border-line bg-paper px-4 text-base text-ink focus-visible:border-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/25"
            defaultValue=""
            {...register('topic')}
          >
            <option value="" disabled>
              Pick the closest one
            </option>
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id={`${source}-message`}
          label="Anything you want me to know"
          hint="Optional. Doctors you want to keep, a letter you got, a deadline you are worried about."
          error={errors.message?.message}
        >
          <Textarea
            id={`${source}-message`}
            rows={4}
            invalid={Boolean(errors.message)}
            {...register('message')}
          />
        </Field>

        {/*
          ── CONSENT BLOCK ──────────────────────────────────────────────────
          Shown before submission, never after. Do not move this below the
          submit button and do not collapse it behind a disclosure.
        */}
        <div className="rounded-xl border-2 border-line bg-cream p-5">
          <label className="flex cursor-pointer gap-4">
            <span className="pt-0.5">
              <Controller
                control={control}
                name="consent"
                render={({ field }) => (
                  <Checkbox
                    ref={field.ref}
                    name={field.name}
                    checked={field.value === true}
                    onBlur={field.onBlur}
                    onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
                    aria-describedby={`${source}-consent-detail`}
                    aria-invalid={Boolean(errors.consent)}
                  />
                )}
              />
            </span>
            <span className="text-base leading-relaxed text-ink">
              Yes, {advisor.name.split(' ')[0]} may contact me about Medicare insurance
              options using the phone number or email address I provided, including by
              text message.
            </span>
          </label>

          <p id={`${source}-consent-detail`} className="mt-4 text-sm leading-relaxed text-ink-soft">
            Submitting this form is a request for information, not an application, and it
            does not enroll you in anything. There is no cost or obligation. Message and
            data rates may apply to text messages, and you can ask me to stop at any time.
            I do not sell or share your information with anyone. You can always compare
            every option available to you at{' '}
            <a
              href={compliance.medicareGovUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-navy underline underline-offset-4"
            >
              medicare.gov
            </a>{' '}
            or by calling {compliance.medicarePhone}.
          </p>

          {errors.consent ? (
            <p className="mt-3 text-sm font-semibold text-ember-deep" role="alert">
              {errors.consent.message}
            </p>
          ) : null}
        </div>

        <div>
          <Button type="submit" size="block" disabled={status === 'submitting'}>
            {status === 'submitting' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              'Send this to me'
            )}
          </Button>

          {status === 'error' ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border-2 border-ember/40 bg-ember-soft p-4 text-base text-ember-deep"
            >
              <p className="font-semibold">{serverError}</p>
              <p className="mt-1.5">
                Do not let my website be the reason you do not get an answer — call or text
                me at {advisor.phone}.
              </p>
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-ember-deep" aria-hidden="true">
            {' '}
            *
          </span>
        ) : (
          <span className="ml-2 text-sm font-normal text-ink-faint">optional</span>
        )}
      </Label>
      {hint ? <p className="mt-1 text-sm text-ink-faint">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-semibold text-ember-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}
