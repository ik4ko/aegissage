import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tracking-[0.01em]',
  {
    variants: {
      tone: {
        navy: 'bg-navy-soft text-navy-deep',
        ember: 'bg-ember-soft text-ember-deep',
        sage: 'bg-sage-soft text-sage',
        outline: 'border-2 border-line text-ink-soft',
      },
    },
    defaultVariants: { tone: 'navy' },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
