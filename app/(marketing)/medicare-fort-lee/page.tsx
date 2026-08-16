import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('fort-lee')!;

export const metadata = locationMetadata('fort-lee');

export default function MedicareFortLeePage() {
  return <LocationLandingPage location={location} />;
}
