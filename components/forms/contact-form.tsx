'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { ContactActions } from '@/components/marketing/contact-actions';
import { advisor, compliance, site } from '@/lib/site';
import { trackContactSubmit, trackFormStart, trackFormSubmit } from '@/lib/analytics';
import { getAttribution } from '@/lib/attribution';
import { cn } from '@/lib/utils';
import { FORM_STRINGS, localizeError, type FormLocale } from '@/lib/form-strings';
import { FOUND_VIA, PARTS_AB } from '@/lib/ai-sources';
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
  /**
   * Language of the form's own labels, hints, consent text and messages.
   * Defaults to English. See lib/form-strings.ts for the rules that apply to
   * the translated consent wording.
   */
  locale?: FormLocale;
};

export function ContactForm({
  source,
  context,
  heading = 'Have me reach out',
  intro = 'Two fields and a note is plenty. I read every one of these myself.',
  className,
  locale = 'en',
}: Props) {
  const t = FORM_STRINGS[locale];
  const err = (message: string | undefined) => localizeError(t, message);
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
    defaultValues: {
      preferredContact: 'phone',
      source,
      website: '',
      // Both start unticked. A pre-checked consent box is not consent.
      partsAB: '',
      foundVia: '',
      consentSms: false,
      consentMarketing: false,
    },
  });

  /* form_start fires once per mount, on first focus anywhere in the form. */
  const startedRef = useRef(false);

  function handleFirstFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackFormStart(source);
  }

  const preferred = watch('preferredContact');
  const partsAB = watch('partsAB');

  async function onSubmit(values: ContactInput) {
    setStatus('submitting');
    setServerError(null);

    try {
      /*
        First-touch attribution rides along in `context` so a submission can
        be traced back to the landing page and campaign that produced it.

        Everything merged in here is sanitized in lib/attribution.ts and is
        non-personal by construction: UTM tokens, a pathname, a referring
        host. The page's own context (quiz answers, location) is spread last
        so it always wins a key collision — attribution must never be able to
        overwrite what the page meant to record.
      */
      const attribution = getAttribution();

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          source,
          context: { ...attribution, ...context },
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? t.errorFallback);
      }

      setStatus('success');
      trackContactSubmit(source, 'success');
      /*
        `topic` is a fixed enum from CONTACT_TOPICS and preferredContact is
        one of phone/text/email — both are categories the form defines, never
        anything the visitor typed. No ZIP: see trackFormSubmit.
      */
      trackFormSubmit(source, {
        intent: values.topic ?? 'unspecified',
        contactPref: values.preferredContact ?? 'unspecified',
        foundVia: values.foundVia || 'unspecified',
      });
    } catch (caught) {
      setStatus('error');
      setServerError(
        caught instanceof Error ? caught.message : t.errorFallback,
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
        <h2 className="mt-4 font-display text-2xl font-bold text-ink">{t.successHeading}</h2>
        {/*
          Says what the system actually does — saved, then emailed to Erekle —
          instead of promising a turnaround nothing here can enforce. The old
          copy claimed "usually the same day and almost always within one
          business day", which is a guarantee one person with a phone cannot
          make on every message.
        */}
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          {t.successBody}
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          {t.successUrgent}
        </p>
        <ContactActions where={`${source}-success`} className="mt-6" size="md" labels={t.actions} />
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
          {t.skipForm}
        </p>
        <ContactActions where={`${source}-inline`} className="mt-3" size="md" labels={t.actions} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} onFocus={handleFirstFocus} className="mt-8 space-y-7" noValidate>
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
          label={t.name}
          error={err(errors.name?.message)}
          optionalLabel={t.optional}
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
            {t.contactLegend}
          </legend>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {(
              [
                ['phone', t.callMe],
                ['text', t.textMe],
                ['email', t.emailMe],
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
          label={t.phone}
          hint={t.phoneHint}
          error={err(errors.phone?.message)}
          optionalLabel={t.optional}
        >
          <Input
            id={`${source}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(201) 555-0143"
            invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${source}-phone-error` : undefined}
            {...register('phone')}
          />
        </Field>

        <Field
          id={`${source}-email`}
          label={t.email}
          error={err(errors.email?.message)}
          optionalLabel={t.optional}
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
          label={t.zip}
          hint={t.zipHint}
          error={err(errors.zip?.message)}
          optionalLabel={t.optional}
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

        <Field
          id={`${source}-topic`}
          label={t.topic}
          error={err(errors.topic?.message)}
          optionalLabel={t.optional}
        >
          <select
            id={`${source}-topic`}
            className="h-14 w-full rounded-xl border-2 border-line bg-paper px-4 text-base text-ink focus-visible:border-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/25"
            defaultValue=""
            {...register('topic')}
          >
            <option value="" disabled>
              {t.topicPlaceholder}
            </option>
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {t.topics[topic]}
              </option>
            ))}
          </select>
        </Field>

        {/*
          ── Part A and Part B ─────────────────────────────────────────────
          Asked on every lead form (Erekle's rule, Nov 2026). It is enrollment
          status, not health information, and it is optional to answer. The
          hint tells the person NOT to send a Medicare number: this form must
          never collect one, and the free-text box below is where it would
          otherwise turn up.
        */}
        <fieldset>
          <legend className="text-base font-semibold text-ink">
            {t.partsAB}
            <span className="ml-2 text-sm font-normal text-ink-faint">{t.optional}</span>
          </legend>
          <p className="mt-1 text-sm text-ink-faint">{t.partsABHint}</p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {PARTS_AB.map((value) => (
              <label
                key={value}
                className={cn(
                  'flex min-h-touch cursor-pointer items-center justify-center rounded-xl border-2 px-4 text-base font-semibold transition-colors',
                  partsAB === value
                    ? 'border-navy bg-navy-soft text-navy-deep'
                    : 'border-line bg-paper text-ink-soft hover:border-navy/40',
                )}
              >
                <input type="radio" value={value} className="sr-only" {...register('partsAB')} />
                {t.partsABOptions[value]}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          id={`${source}-message`}
          label={t.message}
          hint={t.messageHint}
          error={err(errors.message?.message)}
          optionalLabel={t.optional}
        >
          <Textarea
            id={`${source}-message`}
            rows={4}
            invalid={Boolean(errors.message)}
            {...register('message')}
          />
        </Field>

        {/*
          ── How did you find us? ──────────────────────────────────────────
          Optional, and a fixed list on purpose: there is no "other, please
          specify" box, because free text is where personal details end up.
          The value is one token (lib/ai-sources.ts) stored with the lead and
          sent to analytics as `found_via`.
        */}
        <Field
          id={`${source}-found-via`}
          label={t.foundVia}
          error={err(errors.foundVia?.message)}
          optionalLabel={t.optional}
        >
          <select
            id={`${source}-found-via`}
            className="h-14 w-full rounded-xl border-2 border-line bg-paper px-4 text-base text-ink focus-visible:border-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/25"
            defaultValue=""
            {...register('foundVia')}
          >
            <option value="">{t.foundViaPlaceholder}</option>
            {FOUND_VIA.map((value) => (
              <option key={value} value={value}>
                {t.foundViaOptions[value]}
              </option>
            ))}
          </select>
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
              {t.consent}
              {t.consentEnglish ? (
                <span lang="en" className="mt-2 block text-sm text-ink-soft">
                  English: {t.consentEnglish}
                </span>
              ) : null}
            </span>
          </label>

          {/*
            ── OPTIONAL PERMISSIONS ─────────────────────────────────────────
            Two separate, unticked boxes. Neither is required to submit, and
            neither may be inferred from anything else on this form — a phone
            number is not SMS consent, and "text me back" is not permission to
            send automated messages. Do not merge these into the box above.
          */}
          <div className="mt-5 space-y-4 border-t border-line pt-5">
            <p className="text-sm font-semibold uppercase tracking-[0.1em] text-ink-faint">
              {t.optionalPermissions}
            </p>

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
                      aria-describedby={`${source}-sms-detail`}
                    />
                  )}
                />
              </span>
              <span className="text-base leading-relaxed text-ink">
                {t.consentSms}
                <span id={`${source}-sms-detail`} className="mt-1 block text-sm text-ink-soft">
                  {t.consentSmsDetail}
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer gap-4">
              <span className="pt-0.5">
                <Controller
                  control={control}
                  name="consentMarketing"
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
                {t.consentMarketing}
              </span>
            </label>
          </div>

          <p id={`${source}-consent-detail`} className="mt-4 text-sm leading-relaxed text-ink-soft">
            {t.consentDetail}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            <strong className="font-semibold text-ink">{t.privacyLead}</strong>{' '}
            {t.privacyBody}{' '}
            <strong className="font-semibold text-ink">{t.privacyPromise}</strong>{' '}
            {t.privacyDelete} {t.privacyLinkBefore}{' '}
            <Link
              href="/privacy"
              className="font-semibold text-navy underline underline-offset-4"
            >
              {t.privacyLink}
            </Link>
            {t.privacyLinkAfter === '.' ? '.' : ` ${t.privacyLinkAfter}`}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {t.compareBefore}{' '}
            <a
              href={compliance.medicareGovUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-navy underline underline-offset-4"
            >
              medicare.gov
            </a>{' '}
            {t.compareOr} {compliance.medicarePhone}.
          </p>

          {errors.consent ? (
            <p className="mt-3 text-sm font-semibold text-ember-deep" role="alert">
              {err(errors.consent.message)}
            </p>
          ) : null}
        </div>

        <div>
          <Button type="submit" size="block" disabled={status === 'submitting'}>
            {status === 'submitting' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                {t.sending}
              </>
            ) : (
              /* Named. "Send this to me" is ambiguous read on its own —
                 a screen-reader user hears it as sending it to themselves. */
              t.submit
            )}
          </Button>

          {status === 'error' ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border-2 border-ember/40 bg-ember-soft p-4 text-base text-ember-deep"
            >
              <p className="font-semibold">{err(serverError ?? undefined)}</p>
              <p className="mt-1.5">
                {t.errorTail} {advisor.phone}.
              </p>
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}

