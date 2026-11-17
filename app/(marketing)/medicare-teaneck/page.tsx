import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('teaneck')!;

export const metadata = locationMetadata('teaneck');

export default function MedicareTeaneckPage() {
  return <LocationLandingPage location={location} />;
}
