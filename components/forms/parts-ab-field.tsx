import type { UseFormRegisterReturn } from 'react-hook-form';
import { PARTS_AB } from '@/lib/ai-sources';
import { FORM_STRINGS, localizeError, type FormLocale } from '@/lib/form-strings';
import { cn } from '@/lib/utils';

/**
 * "Do you have Medicare Part A and Part B?" on all three lead forms: the
 * contact form, the homepage capture band and the booking step. One
 * component and one set of strings, so the forms cannot drift apart.
 *
 * Required. Three fixed answers: Yes, No, Not sure. No free text. It asks
 * about enrollment status only. Never add a Medicare number, a date of birth
 * or a health question here.
 */
export function PartsABField({
  registration,
  selected,
  error,
  idPrefix,
  locale = 'en',
  className,
}: {
  registration: UseFormRegisterReturn;
  selected: unknown;
  /** The schema's message when nothing is chosen. */
  error?: string;
  /** Keeps ids unique when two forms share a page. */
  idPrefix: string;
  locale?: FormLocale;
  className?: string;
}) {
  const t = FORM_STRINGS[locale];
  const hintId = `${idPrefix}-partsAB-hint`;
  const errorId = `${idPrefix}-partsAB-error`;
  return (
    <fieldset
      className={className}
      role="radiogroup"
      aria-required="true"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${hintId} ${errorId}` : hintId}
    >
      <legend className="text-base font-semibold text-ink">{t.partsAB}</legend>
      <p id={hintId} className="mt-1 text-sm text-ink-soft">
        {t.partsABHint}
      </p>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
        {PARTS_AB.map((value) => (
          <label
            key={value}
            className={cn(
              'flex min-h-touch cursor-pointer items-center justify-center rounded-xl border-2 px-4 text-base font-semibold transition-colors',
              'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy',
              selected === value
                ? 'border-navy bg-navy-soft text-navy-deep'
                : error
                  ? 'border-ember-deep bg-paper text-ink-soft hover:border-navy/40'
                  : 'border-line bg-paper text-ink-soft hover:border-navy/40',
            )}
          >
            <input type="radio" value={value} className="sr-only" {...registration} />
            {t.partsABOptions[value]}
          </label>
        ))}
      </div>
      {error ? (
        <p id={errorId} className="mt-3 text-sm font-semibold text-ember-deep" role="alert">
          {localizeError(t, error)}
        </p>
      ) : null}
    </fieldset>
  );
}
