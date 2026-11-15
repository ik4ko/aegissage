import { Label } from '@/components/ui/label';

/**
 * Label + hint + error wrapper for a single form control.
 *
 * Extracted from <ContactForm /> when the homepage lead-capture band needed
 * the same treatment. Shared rather than copied so the two forms cannot
 * drift: the `optional` affordance in particular is a compliance-adjacent
 * detail — a visitor must be able to tell at a glance which fields they are
 * actually required to hand over, and two implementations of that would
 * eventually disagree.
 *
 * Marks the OPTIONAL fields rather than the required ones. On a form where
 * most fields are required, asterisking the majority is noise; naming the few
 * a visitor can skip is the useful signal.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  optionalLabel = 'optional',
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Text of the "optional" marker, for forms in another language. */
  optionalLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-ember-deep" aria-hidden="true">
            {' '}
            *
          </span>
        ) : (
          <span className="ml-2 text-sm font-normal text-ink-faint">{optionalLabel}</span>
        )}
      </Label>
      {hint ? <p className="mt-1 text-sm text-ink-faint">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-semibold text-ember-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}
