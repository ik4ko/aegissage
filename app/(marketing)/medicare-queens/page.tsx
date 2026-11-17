import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('queens')!;

export const metadata = locationMetadata('queens');

export default function MedicareQueensPage() {
  return <LocationLandingPage location={location} />;
}
