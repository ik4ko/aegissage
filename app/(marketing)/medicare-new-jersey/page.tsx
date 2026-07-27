import type { Metadata } from 'next';
import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding } from '@/lib/locations';
import { site } from '@/lib/site';

const location = getLocationLanding('new-jersey')!;

export const metadata: Metadata = {
  title: 'Medicare in New Jersey',
  description: location.intro,
  alternates: { canonical: '/medicare-new-jersey' },
  openGraph: {
    title: `Medicare in New Jersey · ${site.name}`,
    description: location.intro,
  },
};

export default function MedicareNewJerseyPage() {
  return <LocationLandingPage location={location} />;
}
