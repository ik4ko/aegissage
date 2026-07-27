'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 28px box inside a 48px hit area — the visual control stays proportionate to
 * the text while the tap target meets the site-wide minimum.
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'relative grid h-7 w-7 shrink-0 place-items-center rounded-md border-2 border-ink/35 bg-paper',
      'transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30',
      'data-[state=checked]:border-navy data-[state=checked]:bg-navy data-[state=checked]:text-white',
      'after:absolute after:-inset-2.5 after:content-[""]',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="grid place-items-center text-current">
      <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
