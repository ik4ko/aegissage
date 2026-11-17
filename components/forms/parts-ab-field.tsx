import type { UseFormRegisterReturn } from 'react-hook-form';
import { PARTS_AB } from '@/lib/ai-sources';
import { FORM_STRINGS } from '@/lib/form-strings';
import { cn } from '@/lib/utils';

/**
 * "Do you have Medicare Part A and Part B?" for the two short forms (the
 * homepage capture band and the booking step). Same question, options and
 * wording as <ContactForm />, from the same strings, so the three forms
 * cannot drift apart.
 *
 * Optional, four fixed choices, no free text. It asks about enrollment
 * status only. Never add a Medicare number, a date of birth or a health
 * question here.
 */
export function PartsABField({
  registration,
  selected,
}: {
  registration: UseFormRegisterReturn;
  selected: string | undefined;
}) {
  const t = FORM_STRINGS.en;
  return (
    <fieldset className="mt-6">
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
              selected === value
                ? 'border-navy bg-navy-soft text-navy-deep'
                : 'border-line bg-paper text-ink-soft hover:border-navy/40',
            )}
          >
            <input type="radio" value={value} className="sr-only" {...registration} />
            {t.partsABOptions[value]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
