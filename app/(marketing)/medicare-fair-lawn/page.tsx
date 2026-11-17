import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('fair-lawn')!;

export const metadata = locationMetadata('fair-lawn');

export default function MedicareFairLawnPage() {
  return <LocationLandingPage location={location} />;
}
