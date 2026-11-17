import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('weehawken')!;

export const metadata = locationMetadata('weehawken');

export default function MedicareWeehawkenPage() {
  return <LocationLandingPage location={location} />;
}
