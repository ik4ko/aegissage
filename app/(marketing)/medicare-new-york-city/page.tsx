import type { Metadata } from 'next';
import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding } from '@/lib/locations';
import { site } from '@/lib/site';

const location = getLocationLanding('new-york-city')!;

export const metadata: Metadata = {
  title: 'Medicare in New York City',
  description: location.intro,
  alternates: { canonical: '/medicare-new-york-city' },
  openGraph: {
    title: `Medicare in New York City · ${site.name}`,
    description: location.intro,
  },
};

export default function MedicareNewYorkCityPage() {
  return <LocationLandingPage location={location} />;
}
