import { z } from 'zod';
import { PARTS_AB, PARTS_AB_REQUIRED } from '../ai-sources';
import { looksLikePersonalInfo } from './partner-request';

/**
 * Workshop RSVP (/workshops).
 *
 * A consumer form, so the lead-form rules in CLAUDE.md apply:
 *  - the Part A and Part B question, required, Yes / No / Not sure
 *  - an unchecked consent box naming Erekle Niniashvili / Aegis Sage, and a
 *    separate unchecked box for text messages
 *  - never a Medicare number, Social Security number or date of birth, and
 *    no health questions. The one free-text field (town) is checked for
 *    anything that looks like one.
 */

export const RSVP_ANY_SESSION = 'any';

/**
 * Consent wording, shown next to the boxes and stored with each RSVP.
 * Change the text and you must add a new version in lib/consent.ts.
 */
export const RSVP_CONSENT_TEXT =
  'I agree that Erekle Niniashvili of Aegis Sage, a licensed insurance broker, may contact me by phone or email about this workshop and about Medicare plans. I can ask him to stop at any time.';
export const RSVP_SMS_CONSENT_TEXT =
  'Also OK to text me at the number above about this workshop. Message and data rates may apply. Reply STOP to stop.';

export const RSVP_LANGUAGES = ['en', 'ka', 'ru'] as const;

const phoneRegex = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

export const workshopRsvpSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your name.').max(80, 'That name is too long.'),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Please enter a 10-digit phone number.')
      .or(z.literal(''))
      .optional()
      .default(''),
    email: z
      .string()
      .trim()
      .max(160)
      .email('Please enter a valid email address.')
      .or(z.literal(''))
      .optional()
      .default(''),
    workshopId: z.string().trim().min(1, 'Please choose a session.').max(80),
    town: z.string().trim().max(80).optional().default(''),
    attendees: z.coerce
      .number({ error: 'Please say how many people are coming.' })
      .int()
      .min(1, 'Please say how many people are coming.')
      .max(6, 'For more than 6 people, please call so I can plan the room.'),
    language: z.enum(RSVP_LANGUAGES, { error: 'Please choose a language.' }),
    partsAB: z.enum(PARTS_AB, { error: PARTS_AB_REQUIRED }),
    consent: z.literal(true, {
      error: 'Please check the box so I know it is okay to contact you.',
    }),
    consentSms: z.boolean().optional().default(false),
    sourcePage: z.string().trim().max(200).optional().default(''),
    // Honeypot: real people never see or fill this.
    website: z.string().max(200).optional(),
  })
  .refine((v) => Boolean(v.phone) || Boolean(v.email), {
    message: 'Please give me a phone number or an email address so I can confirm your seat.',
    path: ['phone'],
  })
  .superRefine((v, ctx) => {
    if (looksLikePersonalInfo(v.town)) {
      ctx.addIssue({ code: 'custom', path: ['town'], message: 'Please enter just the name of your town.' });
    }
  });

export type WorkshopRsvp = z.infer<typeof workshopRsvpSchema>;
export type WorkshopRsvpInput = z.input<typeof workshopRsvpSchema>;
