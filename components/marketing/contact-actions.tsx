'use client';

import { CalendarClock, Mail, MessageSquareText, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { advisor, contactHrefs } from '@/lib/site';
import { trackContactIntent } from '@/lib/analytics';

/**
 * Direct call / text / email actions. These are plain tel:, sms: and mailto:
 * links — the fastest path to a conversation. Every placement passes a `where`
 * so the funnel report can tell which surface actually produces contact.
 */

type Props = {
  /** Analytics id for the surface this is rendered on. */
  where: string;
  layout?: 'row' | 'stack';
  size?: 'md' | 'lg' | 'xl';
  className?: string;
  /** Show the email action alongside call and text. */
  includeEmail?: boolean;
  /**
   * Set on dark backgrounds (the navy CTA band). The default outline and
   * ghost styles are navy-on-light and become unreadable on navy — this
   * switches them to the light-on-dark equivalents.
   */
  onDark?: boolean;
};

export function ContactActions({
  where,
  layout = 'row',
  size = 'lg',
  className,
  includeEmail = true,
  onDark = false,
}: Props) {
  const darkFocus = onDark
    ? 'focus-visible:ring-white/60 focus-visible:ring-offset-navy-deep'
    : undefined;

  return (
    <div
      className={cn(
        'flex gap-3',
        layout === 'row' ? 'flex-col sm:flex-row sm:flex-wrap sm:items-center' : 'flex-col',
        className,
      )}
    >
      <Button asChild size={size} variant="primary" className={cn(darkFocus)}>
        <a href={contactHrefs.tel} onClick={() => trackContactIntent('call', where)}>
          <Phone className="h-5 w-5" aria-hidden="true" />
          Call {advisor.phone}
        </a>
      </Button>

      <Button asChild size={size} variant="primary" className={cn(darkFocus)}>
        <a
          href={contactHrefs.booking}
          onClick={() => trackContactIntent('book', where)}
        >
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
          Book a Time
        </a>
      </Button>

      <Button
        asChild
        size={size}
        variant="outline"
        className={cn(darkFocus, onDark && 'border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10')}
      >
        {/*
          Named, not "Text me". Screen readers and voice control surface
          buttons out of context ("Text me" — text who?), and these three sit
          next to each other, so the label has to stand alone.
        */}
        <a href={contactHrefs.sms} onClick={() => trackContactIntent('text', where)}>
          <MessageSquareText className="h-5 w-5" aria-hidden="true" />
          Text {advisor.firstName}
        </a>
      </Button>

      {includeEmail ? (
        <Button
          asChild
          size={size}
          variant="ghost"
          className={cn(darkFocus, onDark && 'text-white underline underline-offset-4 hover:bg-white/10')}
        >
          <a href={contactHrefs.mailto} onClick={() => trackContactIntent('email', where)}>
            <Mail className="h-5 w-5" aria-hidden="true" />
            Email {advisor.firstName}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
