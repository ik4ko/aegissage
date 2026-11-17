import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('englewood')!;

export const metadata = locationMetadata('englewood');

export default function MedicareEnglewoodPage() {
  return <LocationLandingPage location={location} />;
}
