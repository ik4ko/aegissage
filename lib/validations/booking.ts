import { z } from 'zod';
import { PARTS_AB, PARTS_AB_REQUIRED } from '../ai-sources';

/**
 * Validation for the /book interstitial (components/forms/booking-form.tsx).
 *
 * Lives here, not in the component, so scripts/test-lead-forms.mjs can
 * import it without a browser. The API route validates the POST again with
 * contactSchema; this schema only decides what the visitor sees in the form.
 */
export const bookingSchema = z.object({
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
    error: 'Please check the box so I know it is okay to contact you.',
  }),
  /** Required: Yes, No or Not sure. Enrollment status only: never a Medicare number or a date of birth. */
  partsAB: z.enum(PARTS_AB, { error: PARTS_AB_REQUIRED }),
  /** Honeypot. Real people leave it empty; the API returns a plain 200. */
  website: z.string().max(200).optional(),
});

export type BookingInput = z.input<typeof bookingSchema>;
