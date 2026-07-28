/**
 * Local landing pages.
 *
 * ── Editorial rules for this file ─────────────────────────────────────────
 * Everything here is published copy. Two hard constraints:
 *
 *  1. NO INVENTED FACTS. Nothing in this file may name a carrier, a plan, a
 *     premium, a hospital or health system, a provider network, a star
 *     rating, or a count of plans available in a county. Those are all
 *     county-and-contract-year specific and none of them are verified.
 *     What IS allowed is civil geography (New Jersey has 21 counties; the
 *     City of Philadelphia and Philadelphia County are the same territory;
 *     the five boroughs of New York City are five New York counties) and
 *     federal Medicare structure (service areas are drawn at county level;
 *     AEP is October 15 – December 7; a permanent move out of a plan's
 *     service area opens a Special Enrollment Period). Those are stable,
 *     checkable, and not marketing claims.
 *
 *  2. NO INTERNAL NOTES IN PUBLIC COPY. An earlier revision shipped
 *     "Verification needed:" bullets and a "Before launch:" box straight to
 *     production readers. If something needs verifying, it does not go in
 *     this file — it goes in a comment, like this one.
 *
 * ── Why this is a nested model ────────────────────────────────────────────
 * `parentSlug` makes Bergen County a child of New Jersey rather than a
 * fourth sibling. That drives the breadcrumb trail, the schema
 * `containedInPlace`, and the cross-links at the foot of each page — so the
 * county page inherits state authority instead of competing with it.
 *
 * Each landing supplies its OWN headings and paragraphs. They deliberately
 * do not share a template body: a set of pages whose only difference is the
 * place name is a thin-content pattern and reads like one to a person too.
 */

import type { Metadata } from 'next';
import { site } from './site';

export type LocationSection = {
  heading: string;
  paragraphs: string[];
};

export type LocationLanding = {
  slug: string;
  /** Full place name, used in prose and schema. */
  name: string;
  /** Shorter form for CTAs and tight headings. */
  shortName: string;
  /** Badge text. */
  region: string;
  /** 'state' | 'county' | 'city' — drives the schema place type. */
  kind: 'state' | 'county' | 'city';
  /** Slug of the containing landing, if any. Drives breadcrumbs + schema. */
  parentSlug?: string;
  /** The state this place sits in, for schema `containedInPlace`. */
  inState: string;
  /** Page <h1>. Deliberately not "Medicare in {name}" on every page. */
  headline: string;
  /** Lede paragraph, also used as the meta description. */
  intro: string;
  /** Body. Each landing defines its own section headings. */
  sections: LocationSection[];
  /** Locally relevant questions. Different per page. */
  questions: string[];
  context: Record<string, string>;
};

export const locationLandings: LocationLanding[] = [
  // ── Bergen County ───────────────────────────────────────────────────────
  {
    slug: 'bergen-county',
    name: 'Bergen County',
    shortName: 'Bergen County',
    region: 'Bergen County, NJ',
    kind: 'county',
    parentSlug: 'new-jersey',
    inState: 'New Jersey',
    headline: 'Medicare in Bergen County starts with your county, not your town.',
    intro:
      'Bergen County is where I live and where most of my in-person conversations happen. It is also a useful place to explain something people find genuinely surprising: for Medicare Advantage and Part D, your county — not your municipality — is the unit that decides which plans you are allowed to choose from.',
    sections: [
      {
        heading: 'Why the county line matters more than the town line',
        paragraphs: [
          'Medicare Advantage and Part D plans are approved by CMS to operate in specific service areas, and those service areas are drawn from counties. Bergen County has a lot of municipalities, and moving between them — Fort Lee to Mahwah, Teaneck to Ramsey — does not change the county you live in. So in the vast majority of local moves, your available plan set does not change either.',
          'That cuts both ways. People often assume a move means they have to redo their coverage, and inside one county they usually do not. People also assume a short move is harmless, and if it crosses into Passaic, Hudson, Essex or Rockland County, it is not. The distance is a bad predictor. The county line is the thing to check.',
          'What does vary within the county is which providers are convenient to you, and that is a separate question from which plans exist. Both matter. They are just answered differently.',
        ],
      },
      {
        heading: 'Living in Bergen County, getting care in New York',
        paragraphs: [
          'Bergen County sits on the New York State line and a lot of people here have spent a working lifetime crossing it. It is common to live in New Jersey and have a long-standing relationship with a doctor or a hospital in New York City or in Rockland or Westchester County.',
          'Medicare itself does not care about the state line — Original Medicare is accepted by any provider who accepts Medicare assignment, anywhere in the country. Where the line starts to matter is with Medicare Advantage, because those plans are built around contracted networks, and a network built for a New Jersey service area may or may not include the specific out-of-state providers you use.',
          'I am not going to tell you on a web page whether a given plan covers a given doctor, because that changes by plan and by contract year and I would be guessing. What I will tell you is that this is the single most common thing Bergen County callers get wrong, and it is entirely checkable before you enroll — provider by provider, by name.',
        ],
      },
      {
        heading: 'If you move, even a few towns over',
        paragraphs: [
          'A permanent move out of your plan’s service area is a qualifying life event, and it opens a Special Enrollment Period. The length and start of that window depend on whether you tell your plan before or after you move, so the practical advice is to raise it early rather than sort it out afterward.',
          'A move that stays inside Bergen County generally does not open that window, because you have not left the service area. That is worth knowing before you assume a move gives you a chance to switch plans — sometimes it does not, and the next opportunity is the Annual Enrollment Period from October 15 to December 7.',
          'If you are moving in either direction across the state line, treat it as a coverage decision with a deadline attached, not an address change.',
        ],
      },
      {
        heading: 'What to have written down before we talk',
        paragraphs: [
          'Three things, and they matter in this order: your ZIP code, every doctor and facility you want to keep, and every prescription you take with its dose. That list is what turns a vague conversation into a specific one.',
          'Bring it and we can look at what is actually available to you. Without it, anything either of us says about a specific plan is speculation.',
        ],
      },
    ],
    questions: [
      'If I move from one Bergen County town to another, does my plan change?',
      'I live in Bergen County but see a doctor in New York — how do I check that before I enroll?',
      'Does crossing into Passaic, Hudson, Essex or Rockland County change my options?',
      'I am moving out of state to be near family. When does my enrollment window open and close?',
      'My prescriptions changed this year. Does that change which route makes sense for me?',
    ],
    context: { Location: 'Bergen County, New Jersey' },
  },

  // ── New Jersey ──────────────────────────────────────────────────────────
  {
    slug: 'new-jersey',
    name: 'New Jersey',
    shortName: 'New Jersey',
    region: 'New Jersey',
    kind: 'state',
    inState: 'New Jersey',
    headline: 'One state, twenty-one separate Medicare plan markets.',
    intro:
      'New Jersey has 21 counties, and for Medicare Advantage and Part D purposes each one is its own market. A plan available in Cape May may not exist in Sussex. That is why a statewide answer to "what should I pick" is not a real answer, and why the first question is always where you live.',
    sections: [
      {
        heading: 'Why "what is good in New Jersey" is the wrong question',
        paragraphs: [
          'Medicare Advantage and Part D service areas are approved county by county. New Jersey’s 21 counties therefore behave as 21 different sets of options, and they are not evenly sized — a dense northern county and a rural southern one can look very different from each other.',
          'The parts of Medicare that are federal do not vary at all. Your Initial Enrollment Period is the seven months around your 65th birthday everywhere in the state. The Annual Enrollment Period is October 15 to December 7 everywhere. Late enrollment penalties for Part B and Part D are federal and permanent once they start. None of that is a New Jersey question.',
          'What is a New Jersey question is which plans exist where you live, which providers are in them, and how your drug list is treated. Those are county-level and contract-year-level, which is exactly why I do not publish plan lists here — a stale list is worse than none.',
        ],
      },
      {
        heading: 'Medigap in New Jersey runs on the federal clock',
        paragraphs: [
          'New Jersey does not add its own Medigap enrollment rules on top of the federal ones. In practice that means the six-month Medigap Open Enrollment Period that starts when you are 65 or older and enrolled in Part B is the window that matters most here, because during it you cannot be turned down or surcharged for health reasons.',
          'This is a meaningful difference from New York, immediately next door, which requires Medigap to be sold on a continuous guaranteed-issue basis. If you are comparing notes with family across the Hudson, you are not comparing the same rules. That is worth knowing before you assume you can switch later on the same terms.',
        ],
      },
      {
        heading: 'Retiring, downsizing, or moving within the state',
        paragraphs: [
          'A permanent move that takes you out of your current plan’s service area opens a Special Enrollment Period. Inside New Jersey, that usually means a move across a county line rather than a move across town.',
          'The window’s timing depends on when you notify your plan relative to the move, so it is better raised early. If you are downsizing, moving closer to adult children, or splitting time between two homes, the address you are actually a permanent resident of is the one that drives your options.',
        ],
      },
    ],
    questions: [
      'Which of New Jersey’s 21 counties am I actually enrolling in?',
      'Do my current doctors participate under the route I am considering?',
      'Is my six-month Medigap window still open, and what happens after it closes?',
      'I am moving to another New Jersey county — does that open an enrollment window?',
      'I split time between New Jersey and another state. Which address governs?',
    ],
    context: { Location: 'New Jersey' },
  },

  // ── New York City ───────────────────────────────────────────────────────
  {
    slug: 'new-york-city',
    name: 'New York City',
    shortName: 'New York City',
    region: 'New York City',
    kind: 'city',
    inState: 'New York',
    headline: 'Five boroughs, five counties, five sets of options.',
    intro:
      'Each of New York City’s five boroughs is also a New York county — Manhattan is New York County, Brooklyn is Kings, Staten Island is Richmond, and Queens and the Bronx carry their own names. Because Medicare Advantage and Part D service areas are drawn from counties, the borough you live in is a plan-eligibility fact, not just an address.',
    sections: [
      {
        heading: 'The borough is a county, and the county is the unit',
        paragraphs: [
          'People move between boroughs the way people elsewhere move between neighborhoods, and it does not feel like relocating. For Medicare purposes it can be, because you have changed counties. A move from Brooklyn to Queens is a county change even if your commute barely shifts.',
          'The practical consequence is that a plan you are happy with may not follow you, and that a move can open a Special Enrollment Period you did not know you had. Both are worth checking against the new address before the move rather than after.',
        ],
      },
      {
        heading: 'New York’s Medigap rules are genuinely unusual',
        paragraphs: [
          'Most states let Medigap insurers use medical underwriting once your six-month open enrollment window has closed. New York does not. Medigap policies in New York are sold on a continuous open-enrollment, guaranteed-issue basis, which means you cannot be turned down for a Medigap policy on the basis of your health history.',
          'That is a real structural difference and it changes the shape of the decision here compared with New Jersey or Pennsylvania. It does not make any particular route automatically correct — guaranteed issue affects whether you can get a policy, not what it costs you or whether it suits your situation. But it does mean the "you may not be able to switch back later" concern that applies in most states applies differently in New York, and you should not take that warning secondhand from a national advertisement.',
        ],
      },
      {
        heading: 'Specialists, referrals, and a city built on them',
        paragraphs: [
          'New Yorkers tend to accumulate specialists, and often ones they have seen for many years. That makes the network question sharper here than the premium question. Under Original Medicare, any provider accepting Medicare assignment can see you. Under Medicare Advantage, the plan’s contracted network and its referral rules govern.',
          'I will not tell you from a web page whether a specific practice participates in a specific plan — that is plan-and-year specific and I would be guessing. It is checkable by name before you enroll, and for most of the people I talk to in the city it is the check that decides the answer.',
        ],
      },
    ],
    questions: [
      'Which county is my borough, and what does that change?',
      'I am moving from one borough to another — does my plan follow me?',
      'How does New York’s guaranteed-issue Medigap rule apply to my situation?',
      'Are the specialists I have seen for years reachable under what I am considering?',
      'I spend part of the year outside the city. How is that treated?',
    ],
    context: { Location: 'New York City' },
  },

  // ── Philadelphia ────────────────────────────────────────────────────────
  {
    slug: 'philadelphia',
    name: 'Philadelphia',
    shortName: 'Philadelphia',
    region: 'Philadelphia, PA',
    kind: 'city',
    inState: 'Pennsylvania',
    headline: 'In Philadelphia, the city and the county are the same thing.',
    intro:
      'The City of Philadelphia and Philadelphia County cover identical territory — one of the few places where the city limit and the county line are the same line. That makes the Medicare geography unusually clean inside the city, and unusually consequential the moment you step outside it.',
    sections: [
      {
        heading: 'One line does two jobs',
        paragraphs: [
          'Because city and county are coterminous here, moving anywhere within Philadelphia keeps you in the same Medicare Advantage and Part D service area. There is no equivalent of the intra-county municipal patchwork you get elsewhere in the region.',
          'Crossing that line is a different matter. Montgomery, Bucks, Delaware and Chester Counties are separate counties, so a move from the city into any of them is a county change — with everything that follows from it for plan availability and for enrollment windows.',
        ],
      },
      {
        heading: 'A metro area that crosses the river',
        paragraphs: [
          'The Philadelphia region reaches across the Delaware River into New Jersey, and plenty of people here cross that line for care or for work without thinking about it. Original Medicare travels with you: any provider who accepts Medicare assignment can see you regardless of which state they are in.',
          'Medicare Advantage works differently, because the plan is built around a contracted network tied to an approved service area. If your care routinely crosses into another state, that is a specific thing to verify by provider name before enrolling, not something to infer from how close the provider feels.',
          'I hold licenses in both Pennsylvania and New Jersey, which is genuinely useful in this metro area — a household that moves across the river does not have to start over with a new advisor.',
        ],
      },
      {
        heading: 'Timing, and what actually opens a window',
        paragraphs: [
          'The Annual Enrollment Period runs October 15 through December 7 and applies here exactly as it does everywhere else. If you are in a Medicare Advantage plan, the Medicare Advantage Open Enrollment Period runs January 1 through March 31 and lets you make one change.',
          'Outside those, you generally need a qualifying event. A permanent move out of your plan’s service area is the most common one in this area — which, given how tight the county lines are around the city, happens more often here than people expect.',
        ],
      },
    ],
    questions: [
      'I am moving from the city into Montgomery, Bucks, Delaware or Chester County — what changes?',
      'I live in Philadelphia but cross into New Jersey for care. How do I check that?',
      'Does moving within Philadelphia open an enrollment window?',
      'What is the difference between AEP and the Medicare Advantage Open Enrollment Period for me?',
      'My employer coverage is ending. Which window does that put me in?',
    ],
    context: { Location: 'Philadelphia' },
  },
];

export function getLocationLanding(slug: string) {
  return locationLandings.find((location) => location.slug === slug);
}

/**
 * Metadata for a local landing, including an absolute OG image and a matching
 * Twitter card. Every location route uses this so the four pages cannot drift
 * apart on canonical, OG or card coverage.
 */
export function locationMetadata(slug: string): Metadata {
  const location = getLocationLanding(slug);
  if (!location) return {};

  const path = `/medicare-${location.slug}`;
  const title = `Medicare in ${location.name}`;
  const ogImage =
    `${site.url}/api/og?title=${encodeURIComponent(title)}` +
    `&kicker=${encodeURIComponent(location.region)}` +
    `&subtitle=${encodeURIComponent(location.headline)}`;

  return {
    title,
    description: location.intro,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title: `${title} · ${site.name}`,
      description: location.intro,
      url: `${site.url}${path}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · ${site.name}`,
      description: location.intro,
      images: [ogImage],
    },
  };
}

/** Landings that name `slug` as their parent. Drives the cross-link block. */
export function getChildLocations(slug: string) {
  return locationLandings.filter((location) => location.parentSlug === slug);
}

/** Sibling/peer landings, for the "nearby" cross-links at the foot of a page. */
export function getPeerLocations(slug: string) {
  return locationLandings.filter((location) => location.slug !== slug);
}
