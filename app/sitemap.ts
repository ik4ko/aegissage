import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/content';
import { planStates } from '@/lib/states';
import { locationLandings } from '@/lib/locations';
import { site } from '@/lib/site';
import { LANGUAGE_PAGE_PATHS, publishedLocales } from '@/lib/language-pages';
import { GLOSSARY_REVIEWED } from '@/lib/medicare-glossary';
import { CALENDAR_REVIEWED } from '@/lib/enrollment-calendar';
import { QUESTIONS_REVIEWED } from '@/lib/medicare-questions';
import { planEndingPages } from '@/lib/plan-endings';
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
  /*
    No build-time `lastModified`. Every URL used to carry the deploy time, so the
    date changed on every push and search engines learn to ignore it (SEO audit
    M6). A page gets a date only when a real content date exists: an article's
    `updated`, the glossary and calendar review dates, and the newest article in
    a listing. Everything else leaves lastmod out, which the protocol allows.
  */
  const newest = (collection: string) => {
    const dates = getAllArticles()
      .filter((article) => article.collection === collection)
      .map((article) => article.updated)
      .sort();
    const last = dates[dates.length - 1];
    return last ? new Date(`${last}T12:00:00Z`) : undefined;
  };

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/about`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site.url}/how-we-are-paid`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${site.url}/editorial-policy`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${site.url}/accessibility`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${site.url}/partners`, changeFrequency: 'monthly', priority: 0.9 },
    // Flyers under /workshops/flyer are noindex and stay out of the sitemap.
    { url: `${site.url}/workshops`, changeFrequency: 'weekly', priority: 0.9 },
    // Plan-ending pages (lib/plan-endings.ts), dated by their source check.
    ...planEndingPages.map((page) => ({
      url: `${site.url}/${page.slug}`,
      lastModified: new Date(`${page.reviewed}T12:00:00Z`),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    {
      url: `${site.url}/tools/eligibility-check`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${site.url}/tools/penalty-calculator`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${site.url}/tools/irmaa-calculator`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${site.url}/tools/medicare-iq`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${site.url}/tools/plan-comparison`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${site.url}/news`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${site.url}/medicare-basics`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    { url: `${site.url}/plans`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${site.url}/answers`, lastModified: newest('answers'), changeFrequency: 'weekly', priority: 0.9 },
    {
      url: `${site.url}/medicare-questions`,
      lastModified: new Date(`${QUESTIONS_REVIEWED}T12:00:00Z`),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${site.url}/medicare-glossary`,
      lastModified: new Date(`${GLOSSARY_REVIEWED}T12:00:00Z`),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${site.url}/medicare-enrollment-calendar`,
      lastModified: new Date(`${CALENDAR_REVIEWED}T12:00:00Z`),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    { url: `${site.url}/blog`, lastModified: newest('blog'), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${site.url}/videos`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${site.url}/contact`, changeFrequency: 'monthly', priority: 0.8 },
    {
      url: `${site.url}/medicare-checklist`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    { url: `${site.url}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    /*
      Language pages. Only versions that have passed native review are
      listed; an unreviewed translation is noindex and must not be advertised
      here either. See TRANSLATION_REVIEW in lib/language-pages.ts.
    */
    ...publishedLocales().map((locale) => ({
      url: `${site.url}${LANGUAGE_PAGE_PATHS[locale]}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];

  // Local landings are derived from lib/locations.ts rather than listed by
  // hand, so a new location page cannot be added and then forgotten here.
  const locations: MetadataRoute.Sitemap = locationLandings.map((location) => ({
    url: `${site.url}/medicare-${location.slug}`,
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
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...locations, ...articles, ...states];
}
