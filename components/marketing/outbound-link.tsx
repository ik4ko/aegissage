'use client';

import { trackOutboundClick } from '@/lib/analytics';

/**
 * External link that records the destination HOST when followed.
 *
 * Only the host is recorded — never the full URL, which can carry query
 * parameters (search terms, ids) we have no business logging.
 *
 * Always opens in a new tab with `rel="noopener noreferrer"`. `noreferrer`
 * is deliberate as well as safe: it stops this site's URL from being handed
 * to the destination, which matters when the destination is a government
 * health site and the referring page is, say, a Medicare enrollment guide.
 */
export function OutboundLink({
  href,
  where,
  kind = 'other',
  className,
  children,
}: {
  href: string;
  /** Page/component surface the link sits on. */
  where: string;
  kind?: 'official' | 'social' | 'other';
  className?: string;
  children: React.ReactNode;
}) {
  function onClick() {
    let host = 'unknown';
    try {
      host = new URL(href).host;
    } catch {
      // Non-absolute href — record nothing rather than guess.
    }
    trackOutboundClick(host, where, kind);
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={className}
    >
      {children}
    </a>
  );
}
