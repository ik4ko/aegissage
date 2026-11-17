import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('north-bergen')!;

export const metadata = locationMetadata('north-bergen');

export default function MedicareNorthBergenPage() {
  return <LocationLandingPage location={location} />;
}
