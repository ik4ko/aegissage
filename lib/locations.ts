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
  /** Lede paragraph. Shown on the page; NOT used as the meta description. */
  intro: string;
  /**
   * Search-result description, ~150 chars.
   *
   * Separate from `intro` on purpose. The lede is written to be read on the
   * page and runs 250-350 characters; Google truncates a description around
   * 155, so reusing it meant every location page was cut mid-sentence in
   * results. Each one names what is actually different about that place.
   */
  metaDescription: string;
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
    metaDescription:
      'Independent Medicare help in Bergen County, NJ. Plan availability is set county by county — here is what that means for your doctors, and how to reach Eric.',
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
    metaDescription:
      'Medicare in New Jersey, explained plainly. All 21 counties behave as separate plan markets, and the Medigap window runs on the federal clock.',
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
    metaDescription:
      'Medicare in New York City, explained plainly. Each borough is its own county for plan availability, and the Medigap rules differ from New Jersey.',
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
    metaDescription:
      'Medicare in Philadelphia, explained plainly. The city and the county cover identical ground — which changes the moment you cross into a neighboring county.',
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

  // ── Fort Lee ────────────────────────────────────────────────────────────
  {
    slug: 'fort-lee',
    metaDescription:
      'Medicare help in Fort Lee, NJ — right at the foot of the George Washington Bridge. What the bridge changes about your provider network, and what it does not.',
    name: 'Fort Lee',
    shortName: 'Fort Lee',
    region: 'Fort Lee, NJ',
    kind: 'city',
    parentSlug: 'bergen-county',
    inState: 'New Jersey',
    headline: 'Fort Lee sits at the foot of the bridge. Your plan still follows New Jersey rules.',
    intro:
      'Fort Lee is the western anchorage of the George Washington Bridge — Manhattan is close enough to see, and for a lot of longtime residents, close enough that their doctors are there too. That closeness is exactly what makes the Medicare Advantage network question sharper here than almost anywhere else I work.',
    sections: [
      {
        heading: 'A town built around the bridge',
        paragraphs: [
          'Fort Lee is dense and largely high-rise, and it faces the Washington Heights neighborhood of Manhattan directly across the Hudson. Plenty of people here have spent decades going back and forth — for work, for family, for a doctor they have seen since before the bridge traffic got bad.',
          'None of that changes which county governs your Medicare Advantage and Part D plan menu. Fort Lee is Bergen County, New Jersey, and the plans available to you are the ones approved for a New Jersey service area — regardless of how close Manhattan feels.',
        ],
      },
      {
        heading: 'Close by geography, separate by network',
        paragraphs: [
          'Original Medicare does not care about the bridge — any provider who accepts Medicare assignment can see you, on either side of the river. Medicare Advantage is different, because those plans are built around a contracted network tied to a specific service area, and a network approved for New Jersey may or may not reach a specific practice in Manhattan.',
          'I am not going to guess on a web page whether your specific doctor is in a specific network — that changes by plan and by year. What I can tell you is that in Fort Lee, more than in most towns I work in, this is the question that actually decides which plan makes sense.',
        ],
      },
      {
        heading: 'A community with deep, longstanding ties on both sides of the river',
        paragraphs: [
          'Fort Lee has one of the larger Korean-American communities in New Jersey, alongside residents with roots across dozens of other countries, and many families here have relationships — medical, professional, personal — that run straight across the bridge into New York. That pattern is exactly why the network check matters more here than the premium does.',
        ],
      },
      {
        heading: 'What to have written down before we talk',
        paragraphs: [
          'Three things, in this order: your ZIP code, every doctor and facility you want to keep — on either side of the bridge — and every prescription you take with its dose. That is what turns a general conversation into a specific one.',
        ],
      },
    ],
    questions: [
      'I live in Fort Lee but my doctor is in Manhattan. How do I check if a plan covers that?',
      'Does living this close to New York change which plans I can enroll in?',
      'I am turning 65 and still have ties to a job or coverage across the river — what applies to me?',
      'My family has used the same specialist in Washington Heights for years. What should I check first?',
      'If I move a few blocks in either direction, does anything about my coverage change?',
    ],
    context: { Location: 'Fort Lee' },
  },

  // ── Edgewater ───────────────────────────────────────────────────────────
  {
    slug: 'edgewater',
    metaDescription:
      'Medicare help in Edgewater, NJ, from someone who grew up there. A narrow river town with a ferry to Manhattan — here is what that means for your plan.',
    name: 'Edgewater',
    shortName: 'Edgewater',
    region: 'Edgewater, NJ',
    kind: 'city',
    parentSlug: 'bergen-county',
    inState: 'New Jersey',
    headline:
      'Edgewater is where I am from. Here is what the ferry does and does not change about your Medicare.',
    intro:
      'Edgewater is a narrow strip of land along the Hudson River, with the Palisades cliff at its back and a ferry to Manhattan at its front. I grew up here, so I know firsthand how many people in this town have a foot on each side of the river — a ferry commute, a doctor in the city, family in both places.',
    sections: [
      {
        heading: 'A river town, and a fast-growing one',
        paragraphs: [
          'Edgewater has grown quickly over the last decade, and that means the town is a genuine mix of people who have been here for decades and people who just arrived. Both groups tend to ask me the same first question, just from different directions: newer residents ask what changes when they move here; longtime residents ask what changes if their doctor is somewhere they have always gone, across the river.',
          'The answer starts in the same place either way. Edgewater is Bergen County, New Jersey, and that is the service area your Medicare Advantage and Part D plan choices are built around.',
        ],
      },
      {
        heading: 'The ferry connects two states — and two different rulebooks',
        paragraphs: [
          'A lot of Edgewater life runs through the ferry landing, and a lot of that traffic is people heading into Manhattan for work, for family, or for a doctor they have seen for years. Original Medicare travels with you on that ferry without any issue — any provider who accepts Medicare assignment can see you, no matter which side of the river they are on.',
          'Medicare Advantage plans work differently, because they are built around a contracted network approved for a specific service area. A plan approved for New Jersey may or may not include a specific practice across the water, and that is worth checking by provider name rather than assuming either way.',
        ],
      },
      {
        heading: 'What to have written down before we talk',
        paragraphs: [
          'Your ZIP code, every doctor and facility you want to keep — including anywhere you go across the river — and every prescription you take with its dose. That is the difference between a real answer and a guess.',
        ],
      },
    ],
    questions: [
      'I take the ferry into the city for my doctor. Will a New Jersey plan cover that?',
      'I just moved to Edgewater — does that change my Medicare options from where I lived before?',
      'I have lived in Edgewater my whole life and I am about to turn 65 — where do I start?',
      'Does anything about my coverage change if I move from Edgewater up the hill to Cliffside Park or Fort Lee?',
      'My spouse and I split time between here and another state. How does that affect enrollment?',
    ],
    context: { Location: 'Edgewater' },
  },

  // ── Cliffside Park ──────────────────────────────────────────────────────
  {
    slug: 'cliffside-park',
    metaDescription:
      'Medicare help in Cliffside Park, NJ — one of the most densely populated towns in the state, with one of its largest 65-and-over populations. Plain-English guidance.',
    name: 'Cliffside Park',
    shortName: 'Cliffside Park',
    region: 'Cliffside Park, NJ',
    kind: 'city',
    parentSlug: 'bergen-county',
    inState: 'New Jersey',
    headline:
      'Cliffside Park packs more people into one square mile than almost anywhere else in New Jersey.',
    intro:
      'Cliffside Park is about one square mile and among the most densely populated municipalities in the state — and roughly one in five residents is 65 or older. In a town this size, Medicare questions tend to travel fast between neighbors, which is exactly why I would rather you get a straight answer than a secondhand one.',
    sections: [
      {
        heading: 'A small town carrying a lot of people — and a lot of Medicare-age residents',
        paragraphs: [
          'Cliffside Park sits at roughly one square mile with over 25,000 residents, making it one of the most densely populated towns in New Jersey. About one in five residents is 65 or older, which is a meaningfully larger share than the county average.',
          'That density does not change the underlying rule: Cliffside Park is Bergen County, and your Medicare Advantage and Part D plan choices are set at the county level, same as every other town covered on this site.',
        ],
      },
      {
        heading: 'A genuinely diverse community',
        paragraphs: [
          'Cliffside Park has a large foreign-born population and a majority of residents speak a language other than English at home. Medicare enrollment rules and deadlines apply exactly the same regardless of where you or your family are from — the part that varies is making sure the specific plan you are looking at actually covers the specific doctors and pharmacy you already use.',
        ],
      },
      {
        heading: 'What to have written down before we talk',
        paragraphs: [
          'Your ZIP code, every doctor and facility you want to keep, and every prescription you take with its dose. In a town this compact, it is tempting to assume everyone nearby has the same plan or the same answer — they usually do not, because those three things are different for every household.',
        ],
      },
    ],
    questions: [
      'A neighbor told me about their Medicare plan — does the same one make sense for me?',
      'I am turning 65 soon. Where do I start?',
      'Does living in such a small, dense town change which plans are available to me?',
      'My family and I speak a language other than English at home — does that change anything about enrollment?',
      'If I move from Cliffside Park to a nearby Bergen County town, does my plan change?',
    ],
    context: { Location: 'Cliffside Park' },
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
    description: location.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title: `${title} · ${site.name}`,
      description: location.metaDescription,
      url: `${site.url}${path}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · ${site.name}`,
      description: location.metaDescription,
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
