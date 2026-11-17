import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('union-city')!;

export const metadata = locationMetadata('union-city');

export default function MedicareUnionCityPage() {
  return <LocationLandingPage location={location} />;
}
