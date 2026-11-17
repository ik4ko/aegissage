import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('brooklyn')!;

export const metadata = locationMetadata('brooklyn');

export default function MedicareBrooklynPage() {
  return <LocationLandingPage location={location} />;
}
