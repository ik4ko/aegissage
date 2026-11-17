import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('hoboken')!;

export const metadata = locationMetadata('hoboken');

export default function MedicareHobokenPage() {
  return <LocationLandingPage location={location} />;
}
