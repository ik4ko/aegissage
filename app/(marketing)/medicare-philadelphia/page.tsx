import type { Metadata } from 'next';
import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding } from '@/lib/locations';
import { site } from '@/lib/site';

const location = getLocationLanding('philadelphia')!;

export const metadata: Metadata = {
  title: 'Medicare in Philadelphia',
  description: location.intro,
  alternates: { canonical: '/medicare-philadelphia' },
  openGraph: {
    title: `Medicare in Philadelphia · ${site.name}`,
    description: location.intro,
  },
};

export default function MedicarePhiladelphiaPage() {
  return <LocationLandingPage location={location} />;
}
