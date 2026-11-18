'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackResourceUse } from '@/lib/analytics';

/** Print trigger for the workshop flyers. Hidden on paper. */
export function PrintFlyerButton({ resource }: { resource: string }) {
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
      Print this flyer
    </Button>
  );
}
