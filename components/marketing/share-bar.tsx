'use client';

import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { site } from '@/lib/site';
import { trackShare } from '@/lib/analytics';

/**
 * Share affordance for articles. Uses the native share sheet where it exists
 * (which is the phone, where the social traffic lands) and falls back to
 * copy-to-clipboard on desktop.
 */
export function ShareBar({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${site.url}${path}`;

  async function onShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        trackShare('native', path);
        return;
      } catch {
        // User dismissed the sheet — fall through to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackShare('copy', path);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked; nothing useful to do but leave the button alone.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="quiet" size="md" onClick={onShare}>
        {copied ? (
          <Check className="h-5 w-5 text-sage" aria-hidden="true" />
        ) : (
          <Share2 className="h-5 w-5" aria-hidden="true" />
        )}
        {copied ? 'Link copied' : 'Share this'}
      </Button>
      <span className="flex items-center gap-1.5 text-sm text-ink-faint">
        <Link2 className="h-4 w-4" aria-hidden="true" />
        Send it to whoever needs it
      </span>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Link copied to clipboard' : ''}
      </span>
    </div>
  );
}
