import { LocationLandingPage } from '@/components/marketing/location-landing';
import { getLocationLanding, locationMetadata } from '@/lib/locations';

const location = getLocationLanding('hackensack')!;

export const metadata = locationMetadata('hackensack');

export default function MedicareHackensackPage() {
  return <LocationLandingPage location={location} />;
}
