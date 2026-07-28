import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('new-jersey')!;

export const metadata = locationMetadata('new-jersey');

export default function MedicareNewJerseyPage() {
  return <LocationLandingPage location={location} />;
}
