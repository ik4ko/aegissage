import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', invalid, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex h-14 w-full rounded-xl border-2 bg-paper px-4 text-base text-ink',
        'placeholder:text-ink-faint/70',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/25',
        'disabled:cursor-not-allowed disabled:opacity-60',
        invalid ? 'border-ember focus-visible:border-ember' : 'border-line focus-visible:border-navy',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex min-h-[7.5rem] w-full rounded-xl border-2 bg-paper p-4 text-base text-ink',
        'placeholder:text-ink-faint/70',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/25',
        invalid ? 'border-ember focus-visible:border-ember' : 'border-line focus-visible:border-navy',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Input, Textarea };
