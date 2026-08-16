import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('edgewater')!;

export const metadata = locationMetadata('edgewater');

export default function MedicareEdgewaterPage() {
  return <LocationLandingPage location={location} />;
}
