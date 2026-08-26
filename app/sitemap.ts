import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/content';
import { planStates } from '@/lib/states';
import { locationLandings } from '@/lib/locations';
import { site } from '@/lib/site';
/*
  Imported for its side effect: runs every build-time guard and throws one
  combined report if any of them find a problem.

  Today that is the content frontmatter check (required fields, approval
  status, expiry, cited plan claims) and the TPMO route check (ZIP_ROUTES
  still matches the location and state pages that actually exist, so a new
  page cannot ship with the wrong disclaimer variant). Both run on every
  build and both report together — see lib/build-guard.ts.

  This file already enumerates every route, which makes it the natural place
  to hang them.
*/
import '@/lib/build-guard';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    {
      url: `${site.url}/tools/eligibility-check`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${site.url}/tools/penalty-calculator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${site.url}/tools/irmaa-calculator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${site.url}/tools/medicare-iq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${site.url}/tools/plan-comparison`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${site.url}/news`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${site.url}/medicare-basics`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    { url: `${site.url}/plans`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${site.url}/videos`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    {
      url: `${site.url}/medicare-checklist`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    { url: `${site.url}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Local landings are derived from lib/locations.ts rather than listed by
  // hand, so a new location page cannot be added and then forgotten here.
  const locations: MetadataRoute.Sitemap = locationLandings.map((location) => ({
    url: `${site.url}/medicare-${location.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  const articles: MetadataRoute.Sitemap = getAllArticles().map((article) => ({
    url: `${site.url}${article.href}`,
    lastModified: new Date(`${article.updated}T12:00:00Z`),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const states: MetadataRoute.Sitemap = planStates.map((state) => ({
    url: `${site.url}/plans/${state.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...locations, ...articles, ...states];
}
