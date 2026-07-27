import type { Metadata } from 'next';
import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding } from '@/lib/locations';
import { site } from '@/lib/site';

const location = getLocationLanding('philadelphia')!;
const ogImage = `/api/og?title=${encodeURIComponent('Medicare in Philadelphia')}&kicker=${encodeURIComponent('Local guidance')}&subtitle=${encodeURIComponent(location.intro)}`;

export const metadata: Metadata = {
  title: 'Medicare in Philadelphia',
  description: location.intro,
  alternates: { canonical: '/medicare-philadelphia' },
  openGraph: {
    title: `Medicare in Philadelphia · ${site.name}`,
    description: location.intro,
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Medicare in Philadelphia' }],
  },
  twitter: { card: 'summary_large_image', images: [ogImage] },
};

export default function MedicarePhiladelphiaPage() {
  return <LocationLandingPage location={location} />;
}
