'use client';

import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { ContactActions } from '@/components/marketing/contact-actions';
import { trackContactSubmit, trackFormStart, trackFormSubmit } from '@/lib/analytics';
import { getAttribution } from '@/lib/attribution';
import { FORM_STRINGS } from '@/lib/form-strings';
import { ARTICLE_REVIEW_SOURCE } from '@/lib/consent';
import { cn } from '@/lib/utils';
import { PartsABField } from './parts-ab-field';
import { contactSchema, type ContactInput } from '@/lib/validations/contact';

/**
 * Short review-request form for the end of an article (Erekle, Nov 26 2026).
 *
 * Copy is Erekle's, word for word: headline, body, button and small print.
 * Fields: name, ZIP, phone, the Part A/B question, and consent.
 *
 * Two places differ from the brief, both because CLAUDE.md requires them:
 *  - Part A/B is the site's required Yes / No / Not sure question, not a
 *    single checkbox.
 *  - "You can call or text me" is split into two unticked boxes. The call box
 *    is required to send (it is the request to be contacted); the text box is
 *    optional and is the only thing that records SMS permission.
 *
 * It posts to the same /api/contact route as every other lead form, so the
 * lead is stored, consent is recorded with its own text version
 * (lib/consent.ts), and the alert email goes to NOTIFY_EMAIL_TO.
 */
const COPY = {
  headline: 'Want me to run your numbers the same way?',
  body: 'A free one-on-one review. I will check your doctors, your prescriptions, and your total yearly cost, and show you the numbers. You decide from there.',
  consentCall: 'You can call me about a free Medicare review.',
  consentText: 'You can text me about a free Medicare review.',
  button: 'Get my free review',
  smallPrint: 'I am a licensed insurance agent, not connected with the government or Medicare.',
} as const;

export function ReviewRequestForm({ className }: { className?: string }) {
  const t = FORM_STRINGS.en;
  const source = ARTICLE_REVIEW_SOURCE;
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      preferredContact: 'phone',
      source,
      website: '',
      email: '',
      consentSms: false,
      consentMarketing: false,
    },
  });

  const startedRef = useRef(false);
  function handleFirstFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackFormStart(source);
  }

  async function onSubmit(values: ContactInput) {
    // ZIP is optional in the shared schema; this form asks for it.
    if (!values.zip) {
      setError('zip', { message: 'Please enter a 5-digit ZIP code.' });
      return;
    }
    setStatus('submitting');
    setServerError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          source,
          context: { ...getAttribution(), form: 'article-review' },
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? t.errorFallback);
      }
      setStatus('success');
      trackContactSubmit(source, 'success');
      trackFormSubmit(source, { intent: 'review', contactPref: 'phone', foundVia: 'unspecified' });
    } catch (caught) {
      setStatus('error');
      setServerError(caught instanceof Error ? caught.message : t.errorFallback);
      trackContactSubmit(source, 'error');
    }
  }

  if (status === 'success') {
    return (
      <div className={cn('rounded-2xl border-2 border-sage/40 bg-sage-soft p-7 sm:p-9', className)} role="status">
        <CheckCircle2 className="h-10 w-10 text-sage" aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl font-bold text-ink">{t.successHeading}</h2>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">{t.successBody}</p>
        <ContactActions where={`${source}-success`} className="mt-6" size="md" />
      </div>
    );
  }

  return (
    <div
      id="review"
      className={cn('scroll-mt-28 rounded-2xl border border-line bg-paper p-6 shadow-card sm:p-8', className)}
    >
      <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">{COPY.headline}</h2>
      <p className="mt-3 text-lg leading-relaxed text-ink-soft">{COPY.body}</p>

      <form noValidate onSubmit={handleSubmit(onSubmit)} onFocus={handleFirstFocus} className="mt-6 space-y-5">
        <div className="sr-only" aria-hidden="true">
          <label htmlFor={`${source}-website`}>Leave this field empty</label>
          <input id={`${source}-website`} tabIndex={-1} autoComplete="off" {...register('website')} />
        </div>

        <Field id={`${source}-name`} label="Name" error={errors.name?.message}>
          <Input id={`${source}-name`} autoComplete="name" invalid={Boolean(errors.name)} {...register('name')} />
        </Field>

        <Field id={`${source}-zip`} label="ZIP code" error={errors.zip?.message}>
          <Input
            id={`${source}-zip`}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            invalid={Boolean(errors.zip)}
            {...register('zip')}
          />
        </Field>

        <Field id={`${source}-phone`} label="Phone" error={errors.phone?.message}>
          <Input id={`${source}-phone`} type="tel" autoComplete="tel" invalid={Boolean(errors.phone)} {...register('phone')} />
        </Field>

        <PartsABField
          registration={register('partsAB')}
          selected={watch('partsAB')}
          error={errors.partsAB?.message as string | undefined}
          idPrefix={source}
        />

        <div className="space-y-4 rounded-xl border-2 border-line bg-cream p-5">
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
                    aria-invalid={Boolean(errors.consent)}
                  />
                )}
              />
            </span>
            <span className="text-base leading-relaxed text-ink">{COPY.consentCall}</span>
          </label>
          {errors.consent ? <p className="text-base font-semibold text-red-700">{errors.consent.message}</p> : null}

          <label className="flex cursor-pointer gap-4">
            <span className="pt-0.5">
              <Controller
                control={control}
                name="consentSms"
                render={({ field }) => (
                  <Checkbox
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
              {COPY.consentText}
              <span className="mt-1 block text-sm text-ink-soft">{t.consentSmsDetail}</span>
            </span>
          </label>
        </div>

        {serverError ? (
          <p role="alert" className="text-base font-semibold text-red-700">
            {serverError}
          </p>
        ) : null}

        <Button type="submit" size="lg" variant="primary" disabled={status === 'submitting'} className="w-full sm:w-auto">
          {status === 'submitting' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
          {COPY.button}
        </Button>
        <p className="text-sm text-ink-soft">{COPY.smallPrint}</p>
      </form>
    </div>
  );
}
