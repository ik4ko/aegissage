import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('west-new-york')!;

export const metadata = locationMetadata('west-new-york');

export default function MedicareWestNewYorkPage() {
  return <LocationLandingPage location={location} />;
}
