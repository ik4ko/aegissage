import { z } from 'zod';
import { PARTS_AB, PARTS_AB_REQUIRED } from '../ai-sources';

/**
 * Validation for the homepage capture band
 * (components/forms/deadline-capture.tsx).
 *
 * Lives here, not in the component, so scripts/test-lead-forms.mjs can
 * import it without a browser. The API route validates the POST again with
 * contactSchema; this schema only decides what the visitor sees in the form.
 */
export const captureSchema = z.object({
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
    error: 'Please check the box so I know it is okay to email you.',
  }),
  /** Required: Yes, No or Not sure. Enrollment status only: never a Medicare number or a date of birth. */
  partsAB: z.enum(PARTS_AB, { error: PARTS_AB_REQUIRED }),
  /** Honeypot. Real people leave it empty; the API returns a plain 200. */
  website: z.string().max(200).optional(),
});

export type CaptureInput = z.input<typeof captureSchema>;
