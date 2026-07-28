import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('philadelphia')!;

export const metadata = locationMetadata('philadelphia');

export default function MedicarePhiladelphiaPage() {
  return <LocationLandingPage location={location} />;
}
