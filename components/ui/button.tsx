import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Every size here clears the 48x48 minimum tap target. `sm` exists for dense
 * desktop chrome only and still runs 44px tall with generous horizontal
 * padding — do not add anything smaller.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl',
    'font-semibold tracking-[-0.01em] transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
    'disabled:pointer-events-none disabled:opacity-55',
    'active:translate-y-px',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-ember text-white shadow-card hover:bg-ember-deep',
        navy: 'bg-navy text-white shadow-card hover:bg-navy-deep',
        outline: 'border-2 border-navy/25 bg-paper text-navy hover:border-navy/60 hover:bg-navy-soft',
        ghost: 'text-navy hover:bg-navy-soft',
        quiet: 'border-2 border-line bg-paper text-ink hover:border-ink/30',
      },
      size: {
        sm: 'h-11 px-5 text-sm',
        md: 'h-touch px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        xl: 'h-16 px-9 text-lg sm:text-xl',
        block: 'h-14 w-full px-6 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
