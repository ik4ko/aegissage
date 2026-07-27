import type { Metadata } from 'next';
import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding } from '@/lib/locations';
import { site } from '@/lib/site';

const location = getLocationLanding('new-york-city')!;
const ogImage = `/api/og?title=${encodeURIComponent('Medicare in New York City')}&kicker=${encodeURIComponent('Local guidance')}&subtitle=${encodeURIComponent(location.intro)}`;

export const metadata: Metadata = {
  title: 'Medicare in New York City',
  description: location.intro,
  alternates: { canonical: '/medicare-new-york-city' },
  openGraph: {
    title: `Medicare in New York City · ${site.name}`,
    description: location.intro,
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Medicare in New York City' }],
  },
  twitter: { card: 'summary_large_image', images: [ogImage] },
};

export default function MedicareNewYorkCityPage() {
  return <LocationLandingPage location={location} />;
}
