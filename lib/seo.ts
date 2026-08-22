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

const organizationId = `${site.url}#organization`;
const advisorId = `${site.url}#advisor`;
const professionalServiceId = `${site.url}#professional-service`;

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
        '@id': organizationId,
        name: site.name,
        url: site.url,
        logo: `${site.url}/icon.svg`,
        description: site.description,
        telephone: phone,
        ...(advisor.emailConfigured ? { email: advisor.email } : {}),
        sameAs,
        areaServed: serviceAreas,
        knowsAbout,
        employee: { '@id': advisorId },
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
        '@id': advisorId,
        name: advisor.name,
        /*
          The ONLY place the nickname appears anywhere in this codebase.
          Body copy uses one name; this exists so a search for "Eric
          Niniashvili" still resolves to the same person, which is a real
          query given he is introduced that way in person and on video.
        */
        alternateName: 'Eric Niniashvili',
        jobTitle: advisor.credential,
        telephone: phone,
        ...(advisor.emailConfigured ? { email: advisor.email } : {}),
        sameAs,
        url: `${site.url}/about`,
        areaServed: serviceAreas,
        knowsAbout,
        knowsLanguage: 'English',
        worksFor: { '@id': organizationId },
      },
      {
        /*
          Both types are schema.org subtypes of LocalBusiness, so this IS a
          LocalBusiness node — more specifically typed than the bare term.

          InsuranceAgency says what the business is. ProfessionalService says
          it is a service-area business rather than a place you visit, which
          is why address, geo, openingHours and hasMap stay absent: Google
          treats `address` as required for a LocalBusiness, and a fabricated
          one would be far worse than an incomplete node.
        */
        '@type': ['ProfessionalService', 'InsuranceAgency'],
        '@id': professionalServiceId,
        name: site.name,
        url: site.url,
        image: businessImage,
        telephone: phone,
        ...(advisor.emailConfigured ? { email: advisor.email } : {}),
        sameAs,
        areaServed: serviceAreas,
        knowsAbout,
        parentOrganization: { '@id': organizationId },
        /*
         * This is a service-area business signal, not a walk-in location.
         * Intentionally absent: address, geo, openingHours(Specification),
         * hasMap, priceRange, aggregateRating.
         *
         * Add a public address or hours only after they are verified and
         * approved for publication. The current service-area details include
         * Edgewater and Bergen County, but do not imply premises there.
         */
      },
      ...serviceJsonLd().map((service) => ({
        ...service,
        provider: { '@id': organizationId },
      })),
      {
        '@type': 'WebSite',
        '@id': `${site.url}#website`,
        name: site.name,
        url: site.url,
        description: site.description,
        publisher: { '@id': organizationId },
        inLanguage: 'en-US',
      },
    ],
  };
}

/**
 * Services named by the visible site content. Keep descriptions factual and
 * educational; do not add plan, price, savings, eligibility, or outcome claims.
 */
export function serviceJsonLd() {
  return [
    {
      '@type': 'Service',
      '@id': `${site.url}#service-medicare-education`,
      name: 'Medicare education',
      serviceType: 'Medicare education and guidance',
      description:
        'Plain-English Medicare guides and explanations covering enrollment windows, Medicare parts, provider networks, and prescription formularies.',
      areaServed: serviceAreas,
    },
    {
      '@type': 'Service',
      '@id': `${site.url}#service-enrollment-guidance`,
      name: 'Medicare enrollment guidance',
      serviceType: 'Medicare enrollment guidance',
      description:
        'General education about Medicare enrollment windows, deadlines, and the questions to bring to a coverage conversation.',
      areaServed: serviceAreas,
    },
    {
      '@type': 'Service',
      '@id': `${site.url}#service-coverage-guidance`,
      name: 'Medicare coverage and provider-network guidance',
      serviceType: 'Medicare coverage and provider-network guidance',
      description:
        'Help organizing doctors, prescriptions, ZIP code, and current coverage before comparing Medicare options.',
      areaServed: serviceAreas,
    },
  ];
}

/**
 * Per-page LocalBusiness node for a local-area page.
 *
 * The sitewide node in `siteJsonLd()` declares the whole service area. This
 * narrows it to the one place a given page is about, so /medicare-fort-lee
 * says Fort Lee rather than repeating the full list on every page.
 *
 * `@id` is per-page and distinct from the sitewide `#professional-service`
 * node — two nodes sharing an @id with different areaServed is a contradiction
 * a validator will flag. `parentOrganization` ties it back to the same
 * Organization so the graph stays connected.
 *
 * Deliberately absent, for the same reason as the sitewide node: address,
 * geo, openingHours, hasMap, priceRange, aggregateRating. Add them only when
 * a verified public address exists and has been approved for publication.
 */
export function localBusinessJsonLd(options: {
  /** Page path, e.g. "/medicare-fort-lee". */
  path: string;
  /** The place this page is about, e.g. "Fort Lee, New Jersey". */
  areaServed: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'InsuranceAgency'],
    '@id': `${site.url}${options.path}#business`,
    name: site.name,
    url: `${site.url}${options.path}`,
    image: businessImage,
    telephone: phone,
    email: advisor.email,
    areaServed: options.areaServed,
    knowsAbout,
    parentOrganization: { '@id': organizationId },
    employee: { '@id': advisorId },
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
