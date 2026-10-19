'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { trackContactIntent } from '@/lib/analytics';

/**
 * A plain <a> that reports a contact tap (channel + surface only, never who).
 * Lets server components such as the hero emit the same call/text events as
 * the header and sticky bar without becoming client components themselves.
 */
export function TrackedContactLink({
  channel,
  where,
  onClick,
  ...props
}: ComponentPropsWithoutRef<'a'> & {
  channel: 'call' | 'text' | 'email' | 'book';
  where: string;
}) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackContactIntent(channel, where);
        onClick?.(event);
      }}
    />
  );
}
