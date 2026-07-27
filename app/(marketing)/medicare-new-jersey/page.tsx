import type { Metadata } from 'next';
import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding } from '@/lib/locations';
import { site } from '@/lib/site';

const location = getLocationLanding('new-jersey')!;
const ogImage = `/api/og?title=${encodeURIComponent('Medicare in New Jersey')}&kicker=${encodeURIComponent('Local guidance')}&subtitle=${encodeURIComponent(location.intro)}`;

export const metadata: Metadata = {
  title: 'Medicare in New Jersey',
  description: location.intro,
  alternates: { canonical: '/medicare-new-jersey' },
  openGraph: {
    title: `Medicare in New Jersey · ${site.name}`,
    description: location.intro,
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Medicare in New Jersey' }],
  },
  twitter: { card: 'summary_large_image', images: [ogImage] },
};

export default function MedicareNewJerseyPage() {
  return <LocationLandingPage location={location} />;
}
