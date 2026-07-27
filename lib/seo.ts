import { advisor, site } from './site';
import { licensedStates } from './states';

const phone = `+${advisor.phoneRaw.replace(/\D/g, '')}`;
const businessImage =
  `${site.url}/api/og?title=${encodeURIComponent(site.name)}` +
  `&kicker=${encodeURIComponent('Medicare guidance')}` +
  `&subtitle=${encodeURIComponent(site.description)}`;

const serviceAreas = [
  { '@type': 'State', name: 'New Jersey' },
  { '@type': 'State', name: 'New York' },
  { '@type': 'State', name: 'Pennsylvania' },
  { '@type': 'City', name: 'New York City', containedInPlace: { '@type': 'State', name: 'New York' } },
  { '@type': 'City', name: 'Philadelphia', containedInPlace: { '@type': 'State', name: 'Pennsylvania' } },
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
        email: advisor.email,
        areaServed: serviceAreas,
        employee: { '@id': `${site.url}#advisor` },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: phone,
          email: advisor.email,
          areaServed: ['US-NJ', 'US-NY', 'US-PA'],
          availableLanguage: 'English',
        },
      },
      {
        '@type': 'Person',
        '@id': `${site.url}#advisor`,
        name: advisor.name,
        jobTitle: advisor.credential,
        identifier: {
          '@type': 'PropertyValue',
          propertyID: 'National Producer Number',
          value: advisor.npn,
        },
        telephone: phone,
        email: advisor.email,
        url: `${site.url}/about`,
        areaServed: licensedStates.map((state) => ({ '@type': 'State', name: state.name })),
        worksFor: { '@id': `${site.url}#organization` },
      },
      {
        '@type': ['LocalBusiness', 'InsuranceAgency'],
        '@id': `${site.url}#localbusiness`,
        name: site.name,
        url: site.url,
        image: businessImage,
        telephone: phone,
        email: advisor.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Westfield',
          addressRegion: 'NJ',
          addressCountry: 'US',
        },
        areaServed: serviceAreas,
        parentOrganization: { '@id': `${site.url}#organization` },
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
