import { advisor, site, social } from './site';
import { licensedStates } from './states';

const phone = `+${advisor.phoneRaw.replace(/\D/g, '')}`;
const businessImage =
  `${site.url}/api/og?title=${encodeURIComponent(site.name)}` +
  `&kicker=${encodeURIComponent('Medicare guidance')}` +
  `&subtitle=${encodeURIComponent(site.description)}`;

const licensedAreas = licensedStates.map((state) => ({
  '@type': 'State',
  name: state.name,
}));

/**
 * Service areas.
 *
 * States come from lib/states.ts, so this can never drift from the licensed
 * set. The sub-state entries are markets with their own landing pages or
 * named local relevance, each nested under its state via `containedInPlace`.
 *
 * Bergen County appears as an AdministrativeArea the advisor SERVES. It is
 * deliberately not an address, a `location`, or a `LocalBusiness` place:
 * there is no verified public street address, no verified office hours and
 * no Google Business Profile for this advisor, so nothing here may imply a
 * walk-in location. Serving an area and having premises in it are different
 * claims and only the first one is supported by evidence.
 *
 * The named Bergen County towns below (added Aug 14 2026) are the George
 * Washington Bridge corridor — real coverage, since the advisor is licensed
 * statewide in NJ. Naming them explicitly as entities (rather than leaving
 * them implicit inside "Bergen County") is what gives AI search / GEO
 * systems a citable, unambiguous local signal instead of one they have to
 * infer. Do not add towns here that don't have at least this level of real
 * service backing it — the same accuracy standard as the address omission
 * above applies to every entity in this list.
 */
const bergenCountyTowns = [
  'Fort Lee',
  'Edgewater',
  'Cliffside Park',
  'Palisades Park',
  'Ridgefield',
  'Fairview',
  'Hackensack',
  'Teaneck',
  'Englewood',
];

const serviceAreas = [
  ...licensedAreas,
  {
    '@type': 'AdministrativeArea',
    name: 'Bergen County',
    containedInPlace: { '@type': 'State', name: 'New Jersey' },
  },
  ...bergenCountyTowns.map((name) => ({
    '@type': 'City',
    name,
    containedInPlace: { '@type': 'AdministrativeArea', name: 'Bergen County' },
  })),
  { '@type': 'City', name: 'New York City', containedInPlace: { '@type': 'State', name: 'New York' } },
  { '@type': 'City', name: 'Philadelphia', containedInPlace: { '@type': 'State', name: 'Pennsylvania' } },
];

const sameAs = [social.youtube, social.instagram];

/**
 * Subject-matter coverage for the Person and Organization nodes.
 *
 * These are topics the site actually publishes substantive content about.
 * They describe expertise, not products offered — no carrier, plan name or
 * availability claim belongs in this list.
 */
const knowsAbout = [
  'Medicare Advantage',
  'Medicare Supplement Plans',
  'Medigap',
  'Medicare Part D',
  'Dual-Eligible Special Needs Plans (D-SNP)',
  'Medicare enrollment periods',
  'Medicare provider networks',
  'Medicare prescription formularies',
];

export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site.url}#organization`,
        name: site.name,
        url: site.url,
        logo: `${site.url}/icon.svg`,
        description: site.description,
        telephone: phone,
        ...(advisor.emailConfigured ? { email: advisor.email } : {}),
        sameAs,
        areaServed: serviceAreas,
        knowsAbout,
        employee: { '@id': `${site.url}#advisor` },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: phone,
          ...(advisor.emailConfigured ? { email: advisor.email } : {}),
          areaServed: licensedStates.map((state) => `US-${state.code}`),
          availableLanguage: 'English',
        },
      },
      {
        '@type': 'Person',
        '@id': `${site.url}#advisor`,
        name: advisor.name,
        jobTitle: advisor.credential,
        telephone: phone,
        ...(advisor.emailConfigured ? { email: advisor.email } : {}),
        sameAs,
        url: `${site.url}/about`,
        areaServed: serviceAreas,
        knowsAbout,
        knowsLanguage: 'English',
        worksFor: { '@id': `${site.url}#organization` },
      },
      {
        '@type': ['LocalBusiness', 'InsuranceAgency'],
        '@id': `${site.url}#localbusiness`,
        name: site.name,
        url: site.url,
        image: businessImage,
        telephone: phone,
        ...(advisor.emailConfigured ? { email: advisor.email } : {}),
        sameAs,
        areaServed: serviceAreas,
        knowsAbout,
        parentOrganization: { '@id': `${site.url}#organization` },
        /*
         * Intentionally absent: address, geo, openingHours(Specification),
         * hasMap, priceRange, aggregateRating.
         *
         * Google's LocalBusiness guidance treats `address` as required, so
         * this node will not by itself earn a local pack placement or a
         * knowledge panel. That is the correct trade: a fabricated address
         * would be worse than an incomplete node. Add these ONLY when a
         * verified public NAP and Google Business Profile exist.
         */
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}#website`,
        name: site.name,
        url: site.url,
        description: site.description,
        publisher: { '@id': `${site.url}#organization` },
        inLanguage: 'en-US',
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
