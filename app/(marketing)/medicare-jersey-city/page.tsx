import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('jersey-city')!;

export const metadata = locationMetadata('jersey-city');

export default function MedicareJerseyCityPage() {
  return <LocationLandingPage location={location} />;
}
