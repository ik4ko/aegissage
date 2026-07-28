import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('bergen-county')!;

export const metadata = locationMetadata('bergen-county');

export default function MedicareBergenCountyPage() {
  return <LocationLandingPage location={location} />;
}
