'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackResourceUse } from '@/lib/analytics';

/**
 * Print trigger for the checklist.
 *
 * The page is designed to print correctly from the browser's own menu too —
 * this is a convenience, not the only route to paper. It is the one genuinely
 * interactive element on an otherwise fully static page, so it is the only
 * client component on it.
 */
export function PrintButton({ resource }: { resource: string }) {
  return (
    <Button
      type="button"
      size="lg"
      variant="navy"
      className="print:hidden"
      onClick={() => {
        trackResourceUse(resource, 'print');
        window.print();
      }}
    >
      <Printer className="h-5 w-5" aria-hidden="true" />
      Print this checklist
    </Button>
  );
}
