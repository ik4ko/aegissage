import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactActions } from '@/components/marketing/contact-actions';
import { ContactForm } from '@/components/forms/contact-form';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { site } from '@/lib/site';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { FORM_STRINGS } from '@/lib/form-strings';
import { tpmoAreasFor } from '@/lib/tpmo';
import {
  HTML_LANG,
  LANGUAGE_PAGE_PATHS,
  LANGUAGE_PAGES,
  REVIEW_DATE,
  SOURCES,
  TRANSLATION_REVIEW,
  publishedLocales,
  type PageLocale,
} from '@/lib/language-pages';

/**
 * "Medicare help in Georgian and Russian", rendered in one of three languages.
 * All copy lives in lib/language-pages.ts; this file is layout only.
 *
 * The root layout sets <html lang="en">, so the translated body is wrapped in
 * an element carrying its own `lang`. The site header, footer and the
 * sitewide English TPMO disclaimer stay in English on every version: the
 * English disclaimer is the required text, and the translation above it is
 * an aid to reading it.
 */

/** hreflang map: only versions that have passed native review are listed. */
function alternateLanguages(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const locale of publishedLocales()) {
    map[HTML_LANG[locale]] = LANGUAGE_PAGE_PATHS[locale];
  }
  map['x-default'] = LANGUAGE_PAGE_PATHS.en;
  return map;
}

export function languagePageMetadata(locale: PageLocale): Metadata {
  const page = LANGUAGE_PAGES[locale];
  const path = LANGUAGE_PAGE_PATHS[locale];
  const reviewed = TRANSLATION_REVIEW[locale].reviewed;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: path, languages: alternateLanguages() },
    // An unreviewed translation must not be indexed. See lib/language-pages.ts.
    robots: reviewed ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: 'article',
      title: page.metaTitle,
      description: page.metaDescription,
      url: `${site.url}${path}`,
      locale: HTML_LANG[locale].replace('-', '_'),
    },
  };
}

export function LanguageHelpPage({ locale }: { locale: PageLocale }) {
  const page = LANGUAGE_PAGES[locale];
  const path = LANGUAGE_PAGE_PATHS[locale];
  const review = TRANSLATION_REVIEW[locale];
  const lang = HTML_LANG[locale];
  const translated = locale !== 'en';
  const actions = FORM_STRINGS[locale].actions;

  // Same counts the sitewide English disclaimer states on this route.
  const areas = tpmoAreasFor(path);
  const count = areas[0];
  const disclaimer = count
    ? page.disclaimerCounted
        .replace('{org}', String(count.organizationCount))
        .replace('{products}', String(count.productCount))
    : page.disclaimerGeneric;

  const usedSources = [
    ...new Set(page.sections.flatMap((section) => section.sources ?? [])),
  ];
  const others = (Object.keys(LANGUAGE_PAGE_PATHS) as PageLocale[]).filter(
    (other) => other !== locale && (other === 'en' || TRANSLATION_REVIEW[other].reviewed),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: page.h1, url: `${site.url}${path}` },
        ])}
      />
      <JsonLd data={{ ...faqJsonLd(page.faq), inLanguage: lang }} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${site.url}${path}#webpage`,
          url: `${site.url}${path}`,
          name: page.metaTitle,
          description: page.metaDescription,
          inLanguage: lang,
          dateModified: REVIEW_DATE,
          about: { '@id': `${site.url}#advisor` },
          author: { '@id': `${site.url}#advisor` },
          publisher: { '@id': `${site.url}#organization` },
        }}
      />

      {translated && !review.reviewed ? (
        <div className="border-b-2 border-ember bg-ember-soft" lang="en">
          <p className="container py-3 text-base font-semibold text-ember-deep">
            Draft translation, awaiting review by a fluent reader. This page is hidden from
            search engines until it is approved.
          </p>
        </div>
      ) : null}

      <div lang={lang} className="font-sans">
        <section className="border-b border-line bg-paper">
          <div className="container max-w-3xl py-14 sm:py-20">
            <Badge tone="ember">{page.badge}</Badge>
            <h1 className="mt-5 font-sans text-4xl font-bold tracking-[-0.02em] text-ink sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-ink-soft">{page.lede}</p>
            <ContactActions where={`language-${locale}-hero`} className="mt-9" size="xl" labels={actions} />
            <p className="mt-4 text-base text-ink-soft">
              {page.agentNotice}
              {translated ? (
                <span lang="en" className="block text-sm text-ink-faint">
                  Calling this number will direct you to a licensed insurance agent.
                </span>
              ) : null}
            </p>
            {others.length > 0 ? (
              <p className="mt-6 text-base text-ink-soft">
                {page.otherLanguages}:{' '}
                {others.map((other, index) => (
                  <span key={other}>
                    {index > 0 ? ' · ' : ''}
                    <Link
                      href={LANGUAGE_PAGE_PATHS[other]}
                      hrefLang={HTML_LANG[other]}
                      lang={HTML_LANG[other]}
                      className="font-semibold text-navy underline underline-offset-4"
                    >
                      {page.languageNames[other]}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </section>

        <section className="container max-w-3xl py-14 sm:py-16">
          <div className="article-body">
            {page.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-sans">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ))}

            <h2 className="font-sans">{page.faqHeading}</h2>
            {page.faq.map((item) => (
              <div key={item.question}>
                <h3 className="font-sans">{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}

            <h2 className="font-sans">{page.sourcesHeading}</h2>
            <p>{page.sourcesNote}</p>
            <ul>
              {usedSources.map((id) => (
                <li key={id}>
                  <a href={SOURCES[id].url} target="_blank" rel="noopener noreferrer" lang="en">
                    {SOURCES[id].title}
                  </a>
                </li>
              ))}
            </ul>
            <p>{page.reviewedLine}</p>
            <p>{page.translationNotice}</p>
          </div>
        </section>

        <section className="border-y border-line bg-paper">
          <div className="container max-w-2xl py-14 sm:py-16">
            <ContactForm
              source={`language-${locale}`}
              heading={page.formHeading}
              intro={page.formIntro}
              locale={locale}
              context={{ locale }}
            />
          </div>
        </section>

        {translated ? (
          <section className="container max-w-3xl py-10" data-compliance="tpmo-disclaimer-translation">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-faint">
              {page.disclaimerHeading}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink">{disclaimer}</p>
            <p className="mt-3 text-sm text-ink-soft">{page.disclaimerEnglishNote}</p>
          </section>
        ) : null}
      </div>
    </>
  );
}
