import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('palisades-park')!;

export const metadata = locationMetadata('palisades-park');

export default function MedicarePalisadesParkPage() {
  return <LocationLandingPage location={location} />;
}
