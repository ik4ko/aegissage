/**
 * Inline glossary. Any Medicare term used on the site should have an entry
 * here so <GlossaryTerm> can explain it in place instead of assuming the
 * reader already knows the jargon.
 *
 * Definitions are deliberately plain-language and avoid any comparative or
 * benefit-promising phrasing.
 */
export const glossary = {
  'part-a': {
    term: 'Part A',
    definition:
      'Hospital insurance. Covers inpatient hospital stays, skilled nursing facility care, hospice, and some home health care. Most people pay no premium for it because they paid Medicare taxes while working.',
  },
  'part-b': {
    term: 'Part B',
    definition:
      'Medical insurance. Covers doctor visits, outpatient care, lab work, preventive services, and durable medical equipment. Part B has a monthly premium that nearly everyone pays.',
  },
  'part-c': {
    term: 'Part C',
    definition:
      'Also called Medicare Advantage. A plan offered by a private insurance company approved by Medicare that provides your Part A and Part B coverage, and usually other coverage, through that plan instead of Original Medicare.',
  },
  'part-d': {
    term: 'Part D',
    definition:
      'Prescription drug coverage, offered through private plans approved by Medicare. It can be a standalone plan or built into a Medicare Advantage plan.',
  },
  medigap: {
    term: 'Medigap',
    definition:
      'Medicare Supplement Insurance sold by private companies. It pays some of the costs Original Medicare leaves to you, such as coinsurance and deductibles. Medigap works alongside Original Medicare, not instead of it.',
  },
  irmaa: {
    term: 'IRMAA',
    definition:
      'Income-Related Monthly Adjustment Amount. If your reported income is above a set threshold, Social Security adds a surcharge to your Part B and Part D premiums. It is based on your tax return from two years ago.',
  },
  iep: {
    term: 'Initial Enrollment Period',
    definition:
      'The seven-month window around your 65th birthday when you can first sign up for Medicare: the three months before your birthday month, your birthday month, and the three months after.',
  },
  sep: {
    term: 'Special Enrollment Period',
    definition:
      'A window outside the normal enrollment periods when you are allowed to make a coverage change because of a qualifying life event, such as losing employer coverage or moving out of your plan service area.',
  },
  aep: {
    term: 'Annual Enrollment Period',
    definition:
      'October 15 through December 7 each year, when anyone with Medicare can change their Medicare Advantage or Part D coverage for the following year.',
  },
  'gep': {
    term: 'General Enrollment Period',
    definition:
      'January 1 through March 31 each year, for people who did not sign up for Part B when they were first eligible and do not qualify for a Special Enrollment Period.',
  },
  'moop': {
    term: 'Maximum Out-of-Pocket',
    definition:
      'The most you would pay in a plan year for covered in-network services under a Medicare Advantage plan. Once you reach it, the plan pays 100% of covered services for the rest of the year. Original Medicare has no such limit on its own.',
  },
  formulary: {
    term: 'Formulary',
    definition:
      'The list of prescription drugs a Part D or Medicare Advantage plan covers, organized into tiers that determine what you pay. Formularies differ from plan to plan and can change year to year.',
  },
  'creditable-coverage': {
    term: 'Creditable coverage',
    definition:
      'Drug coverage that is expected to pay, on average, at least as much as standard Medicare Part D. Keeping creditable coverage is how you avoid a late enrollment penalty if you delay Part D.',
  },
  'guaranteed-issue': {
    term: 'Guaranteed issue right',
    definition:
      'A situation in which an insurance company must sell you a Medigap policy without medical underwriting. These rights are limited and mostly time-sensitive.',
  },
  underwriting: {
    term: 'Medical underwriting',
    definition:
      'The process an insurer uses to review your health history before deciding whether to issue a policy and at what price. It applies to most Medigap applications outside a guaranteed issue window.',
  },
  'lis': {
    term: 'Extra Help',
    definition:
      'A federal program, also called the Low-Income Subsidy, that helps pay Part D premiums, deductibles and copays for people with limited income and resources.',
  },
} as const;

export type GlossaryKey = keyof typeof glossary;

export function isGlossaryKey(key: string): key is GlossaryKey {
  return key in glossary;
}
