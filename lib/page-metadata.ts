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

/**
 * Completes a page's existing metadata instead of replacing it.
 *
 * Titles and descriptions on older pages were written by hand and are left
 * exactly as they are. This fills in only what is missing, so the page gets
 * a full share card:
 *   - og:url, og:type, og:site_name
 *   - an og:image drawn for the page, when it has none of its own
 *   - a Twitter card with the same title, description and image as the
 *     Open Graph card (without this, Next falls back to the sitewide card
 *     and a shared link shows the homepage headline)
 */
export function withShareCard(
  meta: Metadata,
  options: {
    path: string;
    kicker?: string;
    shareTitle?: string;
    /** Headline drawn on the image only, e.g. English text for a page in another script. */
    imageTitle?: string;
    type?: 'website' | 'article';
  },
): Metadata {
  const og = (meta.openGraph ?? {}) as Record<string, unknown>;
  const pageTitle = typeof meta.title === 'string' ? meta.title : site.name;
  const title = options.shareTitle ?? (typeof og.title === 'string' ? og.title : pageTitle);
  const description =
    typeof og.description === 'string' ? og.description : (meta.description ?? site.description);

  const ownImages = og.images as { url: string }[] | undefined;
  const generated = ogImageUrl({
    title: options.imageTitle ?? options.shareTitle ?? pageTitle,
    kicker: options.kicker,
    subtitle: options.imageTitle ? undefined : description,
  });
  const images = ownImages?.length
    ? ownImages
    : [{ url: generated, width: 1200, height: 630, alt: title }];

  return {
    ...meta,
    openGraph: {
      type: options.type ?? 'website',
      siteName: site.name,
      locale: 'en_US',
      url: `${site.url}${options.path}`,
      ...og,
      title,
      description,
      images,
    } as Metadata['openGraph'],
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [String(images[0].url)],
      ...meta.twitter,
    },
  };
}
