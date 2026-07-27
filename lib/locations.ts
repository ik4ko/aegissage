export type LocationLanding = {
  slug: string;
  name: string;
  shortName: string;
  region: string;
  intro: string;
  localFocus: string[];
  enrollment: string;
  todo: string;
  context: Record<string, string>;
};

export const locationLandings: LocationLanding[] = [
  {
    slug: 'new-jersey',
    name: 'New Jersey',
    shortName: 'New Jersey',
    region: 'NJ',
    intro:
      'Medicare decisions in New Jersey are personal, but the plan choices are local. County lines can change the networks, formularies, and Medicare Advantage options you are comparing.',
    localFocus: [
      'A move from North Jersey to the shore, or even across a county line, can change which plans serve your new ZIP code. Treat a move as a coverage question, not just an address update.',
      'If you are comparing Original Medicare, Medigap, or Medicare Advantage, start with the doctors and prescriptions you need in New Jersey. A familiar hospital or specialist may matter more than a premium headline.',
      'TODO: add the advisor’s verified county-by-county plan availability examples for the New Jersey counties served before publishing specific plan or carrier references.',
    ],
    enrollment:
      'The Annual Enrollment Period runs October 15 through December 7. A move, loss of employer coverage, or another qualifying event may create a Special Enrollment Period; the exact window depends on what happened and when.',
    todo: 'TODO: confirm the counties and local plan-market facts this page should name for the current contract year.',
    context: { Location: 'New Jersey' },
  },
  {
    slug: 'new-york-city',
    name: 'New York City',
    shortName: 'New York City',
    region: 'NYC',
    intro:
      'Medicare coverage in New York City is not one single market. Manhattan, Brooklyn, Queens, the Bronx, and Staten Island can have different provider networks and plan availability, so the ZIP code and doctor list come first.',
    localFocus: [
      'A move between boroughs can change the service area for a Medicare Advantage plan even when your doctors feel close by. Check the new address before assuming your current coverage follows you.',
      'New Yorkers often weigh Original Medicare and Medigap against the network structure of Medicare Advantage. The right comparison depends on the specialists, hospitals, and prescriptions you actually use.',
      'TODO: add verified borough-level availability and any New York-specific Medigap protections after the advisor confirms the current-year details.',
    ],
    enrollment:
      'The Annual Enrollment Period is October 15 through December 7. Moving, losing qualifying coverage, or another documented life change can open a Special Enrollment Period; the applicable dates are situation-specific.',
    todo: 'TODO: confirm the boroughs, counties, and current-year New York rules that should be named on this page.',
    context: { Location: 'New York City' },
  },
  {
    slug: 'philadelphia',
    name: 'Philadelphia',
    shortName: 'Philadelphia',
    region: 'PA',
    intro:
      'Philadelphia sits beside several suburban counties, but Medicare plan service areas do not follow a simple city-versus-suburb assumption. Your Philadelphia ZIP code, doctors, prescriptions, and county determine what is worth comparing.',
    localFocus: [
      'Crossing from Philadelphia County into Montgomery, Delaware, Bucks, or Chester County can change the plans and networks available to you. A move across the metro area deserves a fresh coverage check.',
      'For people who use health systems on both sides of the city line, network details deserve more attention than a commercial’s monthly-premium promise.',
      'TODO: add verified Philadelphia-area county availability and provider-network examples after the advisor confirms the current-year facts.',
    ],
    enrollment:
      'The Annual Enrollment Period runs October 15 through December 7. A move into or out of a plan service area can create a Special Enrollment Period, but the qualifying dates depend on the move and prior coverage.',
    todo: 'TODO: confirm the exact Philadelphia-area counties and local market details that should be referenced for this contract year.',
    context: { Location: 'Philadelphia' },
  },
];

export function getLocationLanding(slug: string) {
  return locationLandings.find((location) => location.slug === slug);
}
