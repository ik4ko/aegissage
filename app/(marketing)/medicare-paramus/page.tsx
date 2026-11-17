import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('paramus')!;

export const metadata = locationMetadata('paramus');

export default function MedicareParamusPage() {
  return <LocationLandingPage location={location} />;
}
