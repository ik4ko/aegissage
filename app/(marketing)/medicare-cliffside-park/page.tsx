import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('cliffside-park')!;

export const metadata = locationMetadata('cliffside-park');

export default function MedicareCliffsideParkPage() {
  return <LocationLandingPage location={location} />;
}
