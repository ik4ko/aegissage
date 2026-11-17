'use client';

import { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { advisor } from '@/lib/site';
import {
  ORGANIZATION_TYPES,
  REQUEST_KINDS,
  looksLikePersonalInfo,
  PERSONAL_INFO_MESSAGE,
} from '@/lib/validations/partner-request';

/**
 * Organization request form. Asks only about the organization and the person
 * writing; nothing about any patient, resident, member or employee
 * (lib/validations/partner-request.ts). Sends to /api/partner-request, which
 * emails Erekle and adds a row to the "Partner Requests" Sheet tab.
 */

type Props = {
  /** Where the form sits, recorded with the request. */
  sourcePage: string;
  /** Pre-selects the organization type on an audience page. */
  defaultType?: (typeof ORGANIZATION_TYPES)[number]['value'];
  heading?: string;
};

type Errors = Partial<Record<string, string>>;

export function PartnerRequestForm({ sourcePage, defaultType, heading = 'Ask for a talk, guides or a help day' }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const id = (name: string) => `partner-${sourcePage.replace(/[^a-z0-9]+/gi, '-')}-${name}`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (k: string) => String(form.get(k) ?? '').trim();
    const data = {
      organization: value('organization'),
      organizationType: value('organizationType'),
      contactName: value('contactName'),
      role: value('role'),
      email: value('email'),
      phone: value('phone'),
      town: value('town'),
      requests: form.getAll('requests').map(String),
      timing: value('timing'),
      message: value('message'),
      sourcePage,
      website: value('website'),
    };

    const next: Errors = {};
    if (data.organization.length < 2) next.organization = 'Please enter the organization name.';
    if (!data.organizationType) next.organizationType = 'Please choose the kind of organization.';
    if (data.contactName.length < 2) next.contactName = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(data.email)) next.email = 'Please enter a work email address.';
    if (data.town.length < 2) next.town = 'Please enter the town or city.';
    if (data.requests.length === 0) next.requests = 'Please choose at least one thing you would like.';
    if (looksLikePersonalInfo(`${data.message} ${data.timing} ${data.role}`)) next.message = PERSONAL_INFO_MESSAGE;
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length > 0) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/partner-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; field?: string };
      if (!res.ok) {
        if (body.field) setErrors({ [body.field]: body.error ?? 'Please check this field.' });
        else setFormError(body.error ?? `Something went wrong. Please call ${advisor.phone}.`);
        setStatus('idle');
        return;
      }
      setStatus('sent');
    } catch {
      setFormError(`Something went wrong. Please call ${advisor.phone}.`);
      setStatus('idle');
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-2xl border-2 border-sage/40 bg-cream p-6 sm:p-8">
        <h3 className="font-display text-2xl font-bold text-ink">Thank you. I have your request.</h3>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          I will reply by email within two business days. If it is time-sensitive, call or text
          me at {advisor.phone}.
        </p>
      </div>
    );
  }

  const describe = (name: string) => (errors[name] ? `${id(name)}-error` : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-line bg-cream p-6 sm:p-8">
      <h3 className="font-display text-2xl font-bold text-ink">{heading}</h3>
      <p className="mt-3 text-lg leading-relaxed text-ink-soft">
        Tell me about your organization. Please do not include anything about a patient,
        resident or employee. People who want help contact me themselves.
      </p>

      <div className="mt-6 space-y-5">
        <Field id={id('organization')} label="Organization name" error={errors.organization} required>
          <Input id={id('organization')} name="organization" autoComplete="organization" invalid={Boolean(errors.organization)} aria-describedby={describe('organization')} />
        </Field>

        <Field id={id('organizationType')} label="Kind of organization" error={errors.organizationType} required>
          <select
            id={id('organizationType')}
            name="organizationType"
            defaultValue={defaultType ?? ''}
            aria-invalid={Boolean(errors.organizationType)}
            aria-describedby={describe('organizationType')}
            className="block min-h-touch w-full rounded-xl border-2 border-line bg-white px-4 text-lg text-ink focus-visible:border-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
          >
            <option value="" disabled>
              Choose one
            </option>
            {ORGANIZATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={id('contactName')} label="Your name" error={errors.contactName} required>
            <Input id={id('contactName')} name="contactName" autoComplete="name" invalid={Boolean(errors.contactName)} aria-describedby={describe('contactName')} />
          </Field>
          <Field id={id('role')} label="Your role" error={errors.role}>
            <Input id={id('role')} name="role" autoComplete="organization-title" />
          </Field>
          <Field id={id('email')} label="Work email" error={errors.email} required>
            <Input id={id('email')} name="email" type="email" autoComplete="email" invalid={Boolean(errors.email)} aria-describedby={describe('email')} />
          </Field>
          <Field id={id('phone')} label="Work phone" error={errors.phone}>
            <Input id={id('phone')} name="phone" type="tel" autoComplete="tel" />
          </Field>
        </div>

        <Field id={id('town')} label="Town or city" error={errors.town} required>
          <Input id={id('town')} name="town" autoComplete="address-level2" invalid={Boolean(errors.town)} aria-describedby={describe('town')} />
        </Field>

        <fieldset aria-describedby={describe('requests')}>
          <legend className="text-base font-semibold text-ink">What would help? Choose any.</legend>
          <div className="mt-3 space-y-2">
            {REQUEST_KINDS.map((k) => (
              <label key={k.value} className="flex min-h-touch cursor-pointer items-center gap-3 rounded-xl border-2 border-line bg-white px-4 text-base text-ink hover:border-navy/50">
                <input type="checkbox" name="requests" value={k.value} className="h-6 w-6 accent-navy" />
                {k.label}
              </label>
            ))}
          </div>
          {errors.requests ? (
            <p id={`${id('requests')}-error`} role="alert" className="mt-2 text-base font-semibold text-ember-deep">
              {errors.requests}
            </p>
          ) : null}
        </fieldset>

        <Field id={id('timing')} label="Dates or times that work" error={errors.timing}>
          <Input id={id('timing')} name="timing" />
        </Field>

        <Field id={id('message')} label="Anything else I should know" hint="About your organization only. No names or details of patients, residents or employees." error={errors.message}>
          <Textarea id={id('message')} name="message" rows={4} invalid={Boolean(errors.message)} aria-describedby={describe('message')} />
        </Field>

        {/* Honeypot: hidden from people and screen readers. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {formError ? (
          <p role="alert" className="text-base font-semibold text-ember-deep">
            {formError}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send request'}
        </Button>
        <p className="text-base text-ink-soft">
          There is no fee and no paid arrangement of any kind, in either direction.
        </p>
      </div>
    </form>
  );
}
