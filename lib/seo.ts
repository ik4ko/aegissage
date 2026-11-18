import { advisor, personPublicProfiles, publicProfiles, site } from './site';
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
 * Bergen and Hudson counties appear as AdministrativeAreas the advisor
 * SERVES. They are not a `location` or a walk-in place: the Google Business
 * Profile is a service-area profile with no public street address and no
 * office hours, so nothing here may imply premises. Serving an area and
 * having premises in it are different claims and only the first one is
 * supported by evidence.
 *
 * Nov 15 2026, at Erekle's direction: Hudson County, Brooklyn and Queens
 * added so the schema names every focus area the site and the profiles
 * name. Brooklyn and Queens are nested under New York City.
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
  // Town pages, Nov 17 2026 (Erekle approved adding them to this list).
  'Paramus',
  'Fair Lawn',
];

/** Hudson County towns with their own page (Nov 17 2026). Erekle meets people in person in Bergen and Hudson. */
const hudsonCountyTowns = [
  'Jersey City',
  'Hoboken',
  'Union City',
  'West New York',
  'North Bergen',
  'Weehawken',
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
  {
    '@type': 'AdministrativeArea',
    name: 'Hudson County',
    containedInPlace: { '@type': 'State', name: 'New Jersey' },
  },
  ...hudsonCountyTowns.map((name) => ({
    '@type': 'City',
    name,
    containedInPlace: { '@type': 'AdministrativeArea', name: 'Hudson County' },
  })),
  { '@type': 'City', name: 'New York City', containedInPlace: { '@type': 'State', name: 'New York' } },
  ...['Brooklyn', 'Queens'].map((name) => ({
    '@type': 'Place',
    name,
    containedInPlace: { '@type': 'City', name: 'New York City' },
  })),
  { '@type': 'City', name: 'Philadelphia', containedInPlace: { '@type': 'State', name: 'Pennsylvania' } },
];

/**
 * Every confirmed public profile. Blank entries in `profiles` (lib/site.ts)
 * are already filtered out, so an unfilled profile contributes nothing.
 */
const sameAs = publicProfiles;

/**
 * Town-level address: locality, region and country only.
 *
 * There is NO streetAddress and NO postalCode, on purpose and permanently
 * unless a public street address is ever approved: this is a service-area
 * business. scripts/validate-site.mjs fails the crawl if either appears.
 */
const baseAddress = {
  '@type': 'PostalAddress',
  addressLocality: advisor.basedInTown,
  addressRegion: advisor.basedInRegion,
  addressCountry: 'US',
};

const languageNames = advisor.languages.map((language) => language.name);
const knowsLanguage = advisor.languages.map((language) => ({
  '@type': 'Language',
  name: language.name,
  alternateName: language.code,
}));

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
        alternateName: [site.searchName, site.legacyName],
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
          availableLanguage: languageNames,
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
        sameAs: personPublicProfiles,
        url: `${site.url}/about`,
        address: baseAddress,
        ...(advisor.npn
          ? {
              identifier: {
                '@type': 'PropertyValue',
                propertyID: 'NPN',
                name: 'National Producer Number',
                value: advisor.npn,
              },
            }
          : {}),
        areaServed: serviceAreas,
        knowsAbout,
        knowsLanguage,
        /*
          One credential: the state insurance producer license, identified by
          the National Producer Number. `recognizedBy` is the regulator of his
          resident state. Nothing here states a designation he does not hold.
        */
        ...(advisor.npn
          ? {
              hasCredential: {
                '@type': 'EducationalOccupationalCredential',
                credentialCategory: 'license',
                name: 'Insurance producer license (health)',
                identifier: advisor.npn,
                recognizedBy: {
                  '@type': 'GovernmentOrganization',
                  name: 'New Jersey Department of Banking and Insurance',
                  url: 'https://www.nj.gov/dobi/',
                },
                url: `${site.url}/about#credentials`,
              },
            }
          : {}),
        worksFor: { '@id': organizationId },
      },
      {
        /*
          Both types are schema.org subtypes of LocalBusiness, so this IS a
          LocalBusiness node — more specifically typed than the bare term.

          InsuranceAgency says what the business is. ProfessionalService says
          it is a service-area business rather than a place you visit, which
          is why geo, openingHours and hasMap stay absent and `address`
          carries town, state and country only — no street, no postal code.
        */
        '@type': ['ProfessionalService', 'InsuranceAgency'],
        '@id': professionalServiceId,
        name: site.name,
        alternateName: [site.searchName, site.legacyName],
        url: site.url,
        address: baseAddress,
        founder: { '@id': advisorId },
        availableLanguage: languageNames,
        image: businessImage,
        telephone: phone,
        ...(advisor.emailConfigured ? { email: advisor.email } : {}),
        sameAs,
        areaServed: serviceAreas,
        knowsAbout,
        parentOrganization: { '@id': organizationId },
        /*
         * This is a service-area business signal, not a walk-in location.
         * Intentionally absent: streetAddress, postalCode, geo,
         * openingHours(Specification), hasMap, priceRange, aggregateRating.
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

/**
 * Speakable: tells voice assistants which parts of a page are the short,
 * read-aloud answer. Our pattern is "a spoken question as the H2, answered
 * first in 40 to 50 plain words", so the selector is the first paragraph
 * after each H2 (plus the page's own opening answer).
 * https://schema.org/SpeakableSpecification
 */
export function speakableJsonLd(options: { url: string; name: string; cssSelector: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${options.url}#speakable`,
    url: options.url,
    name: options.name,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: options.cssSelector,
    },
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

/**
 * One educational session (/workshops). Location is the host venue by name,
 * town and state only: no street address or postal code in schema anywhere
 * on this site. Organizer and performer point at the sitewide nodes.
 */
export function workshopEventJsonLd(options: {
  url: string;
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  town: string;
  state: string;
  inLanguage: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    '@id': `${options.url}#${options.id}`,
    name: options.name,
    description: options.description,
    startDate: options.startDate,
    endDate: options.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    isAccessibleForFree: true,
    inLanguage: options.inLanguage,
    url: options.url,
    location: {
      '@type': 'Place',
      name: options.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: options.town,
        addressRegion: options.state,
        addressCountry: 'US',
      },
    },
    organizer: { '@id': organizationId },
    performer: { '@id': advisorId },
    offers: {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: options.url,
    },
  };
}
