import type { Metadata } from 'next';
import { site } from './site';

/**
 * Canonical link, Open Graph tags and a Twitter card for one page, with a
 * share image drawn for that page by /api/og.
 *
 * Every page type goes through this (or builds the same fields by hand, as
 * the article templates do) so that a shared link never falls back to the
 * generic sitewide card. Open Graph does not merge with the root layout: a
 * page that sets `openGraph` without `images` gets NO image, which is how
 * several pages ended up with a title and description but a blank preview.
 */
export function ogImageUrl(options: { title: string; kicker?: string; subtitle?: string }): string {
  const params = new URLSearchParams({ title: options.title });
  if (options.kicker) params.set('kicker', options.kicker);
  if (options.subtitle) params.set('subtitle', options.subtitle);
  return `/api/og?${params.toString()}`;
}

export function pageMetadata(options: {
  /** The <title>, before the sitewide template adds the brand. */
  title: string;
  description: string;
  /** Path on this site, starting with "/". */
  path: string;
  /** Small label on the share image, e.g. "Medicare glossary". */
  kicker?: string;
  /** Headline on the share image when the <title> is too long or too terse. */
  shareTitle?: string;
  type?: 'website' | 'article';
  /** Pass through anything else (robots, alternates.languages, absolute titles). */
  extra?: Metadata;
}): Metadata {
  const { title, description, path, kicker, type = 'website', extra } = options;
  const shareTitle = options.shareTitle ?? title;
  const image = ogImageUrl({ title: shareTitle, kicker, subtitle: description });

  return {
    title,
    description,
    ...extra,
    alternates: { canonical: path, ...extra?.alternates },
    openGraph: {
      type,
      siteName: site.name,
      locale: 'en_US',
      title: shareTitle,
      description,
      url: `${site.url}${path === '/' ? '' : path}`,
      images: [{ url: image, width: 1200, height: 630, alt: shareTitle }],
      ...extra?.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: [image],
      ...extra?.twitter,
    },
  };
}
