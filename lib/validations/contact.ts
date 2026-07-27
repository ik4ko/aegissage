import { z } from 'zod';

export const CONTACT_TOPICS = [
  'I am turning 65 soon',
  'I am losing employer coverage',
  'I want to review my current coverage',
  'I am helping a parent or relative',
  'Something else',
] as const;

export const PREFERRED_CONTACT = ['phone', 'text', 'email'] as const;

/** 10 US digits, with or without a leading 1 and any punctuation. */
const phoneRegex = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Please enter your name.')
      .max(80, 'That name is too long.'),
    email: z
      .string()
      .trim()
      .max(160, 'That email address is too long.')
      .email('Please enter a valid email address.')
      .or(z.literal(''))
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Please enter a 10-digit phone number.')
      .or(z.literal(''))
      .optional(),
    zip: z
      .string()
      .trim()
      .regex(/^\d{5}$/, 'Please enter a 5-digit ZIP code.')
      .or(z.literal(''))
      .optional(),
    topic: z.enum(CONTACT_TOPICS).optional(),
    preferredContact: z.enum(PREFERRED_CONTACT).default('phone'),
    message: z.string().trim().max(2000, 'Please keep this under 2000 characters.').optional(),
    /** Where the submission came from, e.g. "eligibility-quiz" or "about". */
    source: z.string().trim().max(80).default('contact-form'),
    /** Optional quiz answers attached to a submission from the quiz. */
    context: z.record(z.string(), z.string()).optional(),
    consent: z.literal(true, {
      errorMap: () => ({ message: 'Please check the box so I know it is okay to contact you.' }),
    }),
    /**
     * Honeypot — real people leave this empty. It deliberately accepts any
     * value: rejecting it here would return a validation error that tells a
     * bot exactly which field to stop filling. The API route checks it and
     * returns a plain 200 instead.
     */
    website: z.string().max(200).optional(),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: 'Please give me either an email address or a phone number so I can reach you.',
    path: ['email'],
  })
  .refine((data) => data.preferredContact !== 'email' || Boolean(data.email), {
    message: 'You chose email — please add your email address.',
    path: ['email'],
  })
  .refine(
    (data) => !(data.preferredContact === 'phone' || data.preferredContact === 'text') || Boolean(data.phone),
    {
      message: 'You chose phone or text — please add your phone number.',
      path: ['phone'],
    },
  );

export type ContactInput = z.input<typeof contactSchema>;
export type ContactPayload = z.output<typeof contactSchema>;
