'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { advisor } from '@/lib/site';
import { trackFormSubmit } from '@/lib/analytics';
import { PartsABField } from './parts-ab-field';
import {
  RSVP_ANY_SESSION,
  RSVP_CONSENT_TEXT,
  RSVP_SMS_CONSENT_TEXT,
  workshopRsvpSchema,
  type WorkshopRsvp,
  type WorkshopRsvpInput,
} from '@/lib/validations/workshop-rsvp';

/**
 * RSVP for a "Your Medicare plan is ending" workshop. Rules:
 * lib/validations/workshop-rsvp.ts. Posts to /api/workshop-rsvp.
 *
 * Sessions are passed in already formatted by the server page, so this
 * client component does not import the workshop config.
 */

const SOURCE = 'workshop-rsvp';

const selectClass =
  'block min-h-touch w-full rounded-xl border-2 border-line bg-white px-4 text-lg text-ink focus-visible:border-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30';

export function WorkshopRsvpForm({
  sessions,
  sourcePage = '/workshops',
}: {
  sessions: { id: string; label: string; language: 'en' | 'ka' | 'ru' }[];
  sourcePage?: string;
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [formError, setFormError] = useState('');
  const hasSessions = sessions.length > 0;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<WorkshopRsvpInput, unknown, WorkshopRsvp>({
    resolver: zodResolver(workshopRsvpSchema),
    defaultValues: {
      workshopId: hasSessions ? (sessions.length === 1 ? sessions[0].id : '') : RSVP_ANY_SESSION,
      attendees: 1,
      language: sessions.length === 1 ? sessions[0].language : 'en',
      consent: false as unknown as true,
      consentSms: false,
      sourcePage,
      website: '',
      town: '',
      phone: '',
      email: '',
    },
  });

  const workshopId = watch('workshopId');

  async function onSubmit(values: WorkshopRsvp) {
    setStatus('sending');
    setFormError('');
    try {
      const res = await fetch('/api/workshop-rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; field?: string };
      if (!res.ok) {
        if (body.field) setError(body.field as keyof WorkshopRsvpInput, { message: body.error });
        else setFormError(body.error ?? `Something went wrong. Please call ${advisor.phone}.`);
        setStatus('idle');
        return;
      }
      trackFormSubmit(SOURCE);
      setStatus('sent');
    } catch {
      setFormError(`Something went wrong. Please call ${advisor.phone}.`);
      setStatus('idle');
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-2xl border-2 border-sage/40 bg-cream p-6 sm:p-8">
        <CheckCircle2 className="h-8 w-8 text-sage" aria-hidden="true" />
        <h3 className="mt-3 font-display text-2xl font-bold text-ink">Thank you. Your seat is noted.</h3>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          {workshopId === RSVP_ANY_SESSION
            ? 'I will let you know when a session is set near you.'
            : 'I will confirm the details with you before the session.'}{' '}
          If something changes, call or text me at {advisor.phone}.
        </p>
      </div>
    );
  }

  const err = (name: keyof WorkshopRsvpInput) => errors[name]?.message as string | undefined;
  const id = (name: string) => `${SOURCE}-${name}`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl border border-line bg-cream p-6 sm:p-8"
    >
      <h3 className="font-display text-2xl font-bold text-ink">
        {hasSessions ? 'Save a seat' : 'Tell me you want a session near you'}
      </h3>
      <p className="mt-3 text-lg leading-relaxed text-ink-soft">
        No Medicare number, Social Security number or date of birth is needed, and none is asked.
      </p>

      <div className="mt-6 space-y-5">
        {hasSessions ? (
          <Field id={id('workshopId')} label="Which session?" error={err('workshopId')} required>
            <select
              id={id('workshopId')}
              {...register('workshopId', {
                onChange: (event) => {
                  const chosen = sessions.find((s) => s.id === event.target.value);
                  if (chosen) setValue('language', chosen.language);
                },
              })}
              aria-invalid={Boolean(errors.workshopId)}
              className={selectClass}
            >
              <option value="" disabled>
                Choose a session
              </option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
              <option value={RSVP_ANY_SESSION}>None of these. Tell me about the next one near me.</option>
            </select>
          </Field>
        ) : (
          <input type="hidden" {...register('workshopId')} />
        )}

        {workshopId === RSVP_ANY_SESSION ? (
          <Field id={id('town')} label="Your town" error={err('town')}>
            <Input id={id('town')} autoComplete="address-level2" {...register('town')} invalid={Boolean(errors.town)} />
          </Field>
        ) : null}

        <Field id={id('name')} label="Your name" error={err('name')} required>
          <Input id={id('name')} autoComplete="name" {...register('name')} invalid={Boolean(errors.name)} />
        </Field>

        <p className="text-base text-ink-soft">A phone number or an email is enough.</p>
        <div className="-mt-2 grid gap-5 sm:grid-cols-2">
          <Field id={id('phone')} label="Phone" error={err('phone')}>
            <Input id={id('phone')} type="tel" autoComplete="tel" {...register('phone')} invalid={Boolean(errors.phone)} />
          </Field>
          <Field id={id('email')} label="Email" error={err('email')}>
            <Input id={id('email')} type="email" autoComplete="email" {...register('email')} invalid={Boolean(errors.email)} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={id('attendees')} label="How many people are coming, including you?" error={err('attendees')} required>
            <select id={id('attendees')} {...register('attendees')} className={selectClass}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field id={id('language')} label="Language you prefer" error={err('language')} required>
            <select id={id('language')} {...register('language')} className={selectClass}>
              <option value="en">English</option>
              <option value="ka">Georgian (ქართული)</option>
              <option value="ru">Russian (Русский)</option>
            </select>
          </Field>
        </div>

        <PartsABField
          registration={register('partsAB')}
          selected={watch('partsAB')}
          error={err('partsAB')}
          idPrefix={SOURCE}
        />

        <div className="space-y-3 rounded-xl border-2 border-line bg-white p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              {...register('consent')}
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={errors.consent ? id('consent-error') : undefined}
              className="mt-1 h-6 w-6 shrink-0 accent-navy"
            />
            <span className="text-base leading-relaxed text-ink">{RSVP_CONSENT_TEXT}</span>
          </label>
          {errors.consent ? (
            <p id={id('consent-error')} role="alert" className="text-base font-semibold text-ember-deep">
              {err('consent')}
            </p>
          ) : null}
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" {...register('consentSms')} className="mt-1 h-6 w-6 shrink-0 accent-navy" />
            <span className="text-base leading-relaxed text-ink">
              {RSVP_SMS_CONSENT_TEXT} <span className="text-ink-soft">(optional)</span>
            </span>
          </label>
        </div>

        {/* Honeypot: hidden from people and screen readers. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
          </label>
        </div>

        {formError ? (
          <p role="alert" className="text-base font-semibold text-ember-deep">
            {formError}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={status === 'sending'}>
          {status === 'sending' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
          {status === 'sending' ? 'Sending…' : hasSessions ? 'Save my seat' : 'Let me know'}
        </Button>
      </div>
    </form>
  );
}
