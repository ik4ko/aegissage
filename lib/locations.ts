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
import { advisor, site } from './site';

// ── Shared local resources (official pages read Nov 17 2026) ─────────────
const CHECKED = '2026-11-17';

const BERGEN_SHIP: LocalResource = {
  name: 'Bergen County SHIP: free Medicare counseling',
  what: 'Trained counselors who do not sell insurance. Run by the Bergen County Division of Senior Services in Hackensack.',
  phone: '201-336-7413',
  url: 'https://www.nj.gov/humanservices/doas/assistance/medicare/offices.shtml',
  checked: CHECKED,
};

const BERGEN_AGING: LocalResource = {
  name: 'Bergen County Division of Senior Services',
  what: 'The county office on aging for every Bergen County town.',
  phone: '201-336-7400',
  url: 'https://www.nj.gov/humanservices/doas/assistance/county-offices',
  checked: CHECKED,
};

const HUDSON_SHIP: LocalResource = {
  name: 'Hudson County SHIP: free Medicare counseling',
  what: 'Trained counselors who do not sell insurance. Run by the Hudson County Department of Aging and Veterans Affairs in Jersey City.',
  phone: '201-369-4313, ext. 4259',
  url: 'https://www.nj.gov/humanservices/doas/assistance/medicare/offices.shtml',
  checked: CHECKED,
};

const HUDSON_AGING: LocalResource = {
  name: 'Hudson County Division on Aging',
  what: 'The county office on aging for every Hudson County town.',
  phone: '201-369-4313',
  url: 'https://www.nj.gov/humanservices/doas/assistance/county-offices',
  checked: CHECKED,
};

const NYC_HIICAP: LocalResource = {
  name: 'HIICAP: free Medicare counseling in New York City',
  what: 'Free, private counseling from NYC Aging. Call Aging Connect and ask for HIICAP.',
  phone: '212-244-6469',
  url: 'https://www.nyc.gov/site/dfta/services/health-insurance-assistance.page',
  checked: CHECKED,
};

/*
  ssa.gov answers automated requests with 403, so this page was confirmed
  through ssa.gov's own search listing ("Field Office Locator"), not read
  directly. npm run check:links lists it under "open by hand".
*/
const SSA_LOCATOR: LocalResource = {
  name: 'Social Security office for your ZIP code',
  what: 'Social Security signs people up for Medicare Part A and Part B. Its office locator shows the office that serves your ZIP code.',
  url: 'https://www.ssa.gov/locator',
  checked: CHECKED,
};

function library(
  name: string,
  where: string,
  phone: string,
  url: string,
): LocalResource {
  return { name, what: where, phone, url, checked: CHECKED };
}

/** Erekle's public phone. In person: within about an hour of Edgewater, NYC included. Philadelphia: phone or video (Nov 26 2026). */
const PHONE = advisor.phone;

export type LocationSection = {
  heading: string;
  paragraphs: string[];
  /**
   * Optional call-to-action rendered after the paragraphs.
   *
   * `paragraphs` is deliberately plain strings — no JSX, no markdown — so that
   * this file stays copy and nothing else. That rules out an inline link, so a
   * section that needs to point somewhere declares it here instead and the
   * landing component renders it.
   */
  link?: { href: string; label: string };
};

/**
 * A free public service near a town: counseling, the county office on aging,
 * Social Security, the public library.
 *
 * Every entry was read on its own official page on `checked`, and `url` is
 * that page. Nothing here is copied from a directory site. When an official
 * page could not be read (Weehawken's library, the Queens library branches,
 * Social Security's office pages refuse automated requests), the item is
 * left out rather than filled from a third-party listing. Recheck the dates
 * once a year; libraries close for construction and phone lines move.
 */
export type LocalResource = {
  name: string;
  /** One plain sentence: what it is, and why a person 64+ would call. */
  what: string;
  /** As printed on the source page. */
  phone?: string;
  url: string;
  /** YYYY-MM-DD the official page was read. */
  checked: string;
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
  /**
   * County, when the parent landing is not the county page (Hudson towns sit
   * under New Jersey, Brooklyn and Queens under New York City). Used for
   * schema `areaServed` and to group "nearby" links.
   */
  county?: string;
  /** Free public help near this place. Town pages only. */
  localHelp?: LocalResource[];
  /** Exactly three answer slugs (content/answers). Town pages only. */
  relatedAnswers?: [string, string, string];
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
      'Independent Medicare help in Bergen County, NJ. Plan availability is set county by county — here is what that means for your doctors, and how to reach Erekle.',
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
          'One more thing worth knowing before the conversation rather than during it: whether a late enrollment penalty applies to you. It is the question people most often discover the answer to too late, and it takes a couple of minutes to check.',
        ],
        link: {
          href: '/tools/penalty-calculator',
          label: 'Estimate a late enrollment penalty →',
        },
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
        heading: 'Does living next to the bridge change my Medicare plan options?',
        paragraphs: [
          'No. Fort Lee is in Bergen County, New Jersey, so your Medicare Advantage and Part D choices are the plans approved for Bergen County. How close Manhattan feels does not change that. What it can change is whether your Manhattan doctors are in a plan’s network.',
          'Fort Lee is dense and largely high-rise, and it faces the Washington Heights neighborhood of Manhattan directly across the Hudson. Plenty of people here have spent decades going back and forth — for work, for family, for a doctor they have seen since before the bridge traffic got bad.',
        ],
      },
      {
        heading: 'Can I keep my Manhattan doctor on a New Jersey plan?',
        paragraphs: [
          'It depends on the plan. Original Medicare works with any doctor who accepts Medicare, on either side of the river. A Medicare Advantage plan has a network built for New Jersey, so check each Manhattan doctor by name before you join.',
          'I am not going to guess on a web page whether your specific doctor is in a specific network — that changes by plan and by year. What I can tell you is that in Fort Lee, more than in most towns I work in, this is the question that actually decides which plan makes sense.',
        ],
      },
      {
        heading: 'Why does the doctor check matter so much in Fort Lee?',
        paragraphs: [
          'Many Fort Lee families, including one of the larger Korean-American communities in New Jersey, have doctors, jobs and relatives across the bridge in New York. When your care crosses a state line, the network matters more than the premium, so it is the first thing to check.',
        ],
      },
      {
        heading: 'What should I have written down before calling about Medicare?',
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
        heading: 'Does moving to Edgewater change my Medicare options?',
        paragraphs: [
          'It can. Edgewater is in Bergen County, New Jersey, and your Medicare Advantage and Part D choices come from the Bergen County list. If you moved here from another county or from New York, your old plan may not work here, so check soon.',
          'Edgewater has grown quickly over the last decade, and that means the town is a genuine mix of people who have been here for decades and people who just arrived. Both groups tend to ask me the same first question, just from different directions: newer residents ask what changes when they move here; longtime residents ask what changes if their doctor is somewhere they have always gone, across the river.',
        ],
      },
      {
        heading: 'Will a New Jersey plan cover my doctor across the river?',
        paragraphs: [
          'Original Medicare will, as long as the doctor accepts Medicare. A Medicare Advantage plan may or may not, because its network is built for a New Jersey service area. If you take the ferry to a doctor in Manhattan, check that doctor by name first.',
          'A lot of Edgewater life runs through the ferry landing, and a lot of that traffic is people heading into Manhattan for work, for family, or for a doctor they have seen for years. Original Medicare travels with you on that ferry without any issue — any provider who accepts Medicare assignment can see you, no matter which side of the river they are on.',
        ],
      },
      {
        heading: 'What do I need ready for a Medicare call?',
        paragraphs: [
          'Your Medicare card, your ZIP code, every doctor and facility you want to keep, including anywhere you go across the river, and every prescription you take with its dose. That is the difference between a real answer and a guess.',
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
      'Medicare help in Cliffside Park, NJ, one of the most densely populated towns in the state, with a large 65-and-over population. Plain-English guidance.',
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
        heading: 'Does living in such a dense town change my plan choices?',
        paragraphs: [
          'No. Cliffside Park is about one square mile with over 25,000 residents, and about one in five is 65 or older. But plan choices are set by county, so you choose from the same Bergen County list as every other town nearby.',
        ],
      },
      {
        heading: 'Does my language or background change Medicare enrollment?',
        paragraphs: [
          'No. Medicare rules and deadlines are the same wherever you or your family are from. Cliffside Park has a large foreign-born population, and what differs from home to home is which doctors and pharmacy you use. Check those against any plan before you join.',
        ],
      },
      {
        heading: 'What should I bring to a Medicare conversation?',
        paragraphs: [
          'Your ZIP code, every doctor and facility you want to keep, and every prescription with its dose. In a town this compact, it is tempting to assume a neighbor’s answer fits you. It usually does not, because those three things differ for every household.',
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

  /* ════════════════════════════════════════════════════════════════════════
     Town pages, Nov 17 2026.

     Same rules as above, plus: every local service named on a page sits in
     `localHelp` with the official page it came from and the date it was
     read. No hospital, clinic, plan or carrier is named. Erekle meets people in
     person within about an hour of Edgewater, New York City included;
     Philadelphia and farther is by phone or video (Erekle, Nov 26 2026,
     superseding the Nov 17 "NYC by phone or video only" rule). Body text must stay under 30%
     overlap with every other location page (scripts/test-location-pages.mjs).
     ════════════════════════════════════════════════════════════════════════ */

  // ── Hackensack (Bergen) ─────────────────────────────────────────────────
  {
    slug: 'hackensack',
    metaDescription:
      'Medicare help in Hackensack, NJ, the Bergen County seat. Where the free county counselors are, and what to bring when you call Erekle.',
    name: 'Hackensack',
    shortName: 'Hackensack',
    region: 'Hackensack, NJ',
    kind: 'city',
    parentSlug: 'bergen-county',
    inState: 'New Jersey',
    headline: 'Hackensack is the county seat. A lot of free Medicare help is already in town.',
    intro:
      'Hackensack is the seat of Bergen County government. The county’s free Medicare counselors work out of One Bergen County Plaza, right in the city. So if you live here, two kinds of help are close by: free, neutral counseling from the county, and a licensed broker you can call to compare plans.',
    sections: [
      {
        heading: 'Should I call SHIP or a broker first?',
        paragraphs: [
          'Either is fine, and many people use both. Bergen County’s SHIP counselors in Hackensack explain Medicare and help with problems, and they sell nothing. A licensed broker like me can compare the plans sold in Bergen County against your doctors and drugs, and help you enroll.',
        ],
      },
      {
        heading: 'Is the plan menu in Hackensack different from other Bergen towns?',
        paragraphs: [
          'No. Medicare Advantage and Part D plans are approved county by county, so Hackensack has the same plan menu as the rest of Bergen County. What changes from person to person is which doctors you see and which drugs you take, and that is what we check.',
          'If you are thinking about moving across the Hackensack River or out of the county, ask before you move. Leaving your plan’s service area opens a Special Enrollment Period, and the timing depends on when you tell the plan.',
        ],
      },
      {
        heading: 'How do I reach a Medicare broker in Hackensack?',
        paragraphs: [
          `Call or text me at ${PHONE}. I speak English, Georgian and Russian, and we can also meet in person in Hackensack. Have your Medicare card, your doctor list and your pill bottles or a drug list nearby. There is no fee to talk.`,
        ],
      },
    ],
    questions: [
      'Should I see a SHIP counselor first, or call a broker?',
      'Is the plan menu in Hackensack different from the rest of Bergen County?',
      'I am moving out of Bergen County. When can I change my plan?',
      'Can someone check that my doctors take the plan I am looking at?',
      'I got a letter from my plan that I do not understand. Who can read it with me?',
    ],
    context: { Location: 'Hackensack' },
    localHelp: [
      BERGEN_SHIP,
      BERGEN_AGING,
      SSA_LOCATOR,
      library(
        'Johnson Public Library',
        'Hackensack’s public library, at 274 Main Street.',
        '201-343-4169',
        'https://www.johnsonlib.org/',
      ),
    ],
    relatedAnswers: [
      'turning-65-new-jersey',
      'extra-help-medicare-savings-programs-new-jersey',
      'what-to-bring-to-a-medicare-appointment',
    ],
  },

  // ── Englewood (Bergen) ──────────────────────────────────────────────────
  {
    slug: 'englewood',
    metaDescription:
      'Medicare help in Englewood, NJ. Many people here see doctors on both sides of the Hudson. How to check a plan before you join.',
    name: 'Englewood',
    shortName: 'Englewood',
    region: 'Englewood, NJ',
    kind: 'city',
    parentSlug: 'bergen-county',
    inState: 'New Jersey',
    headline: 'In Englewood, the first Medicare question is usually about a doctor.',
    intro:
      'Englewood is a small city in eastern Bergen County, a short drive from the George Washington Bridge. People who call me from Englewood often have a doctor they have seen for many years, some in town and some in New York. Keeping that doctor is usually what they care about most.',
    sections: [
      {
        heading: 'Can I keep my doctor if I join a Medicare plan?',
        paragraphs: [
          'With Original Medicare, yes, if your doctor accepts Medicare, anywhere in the country. A Medicare Advantage plan has a network built for your county, so the answer depends on the plan. Many people in Englewood see doctors in New York too, so check each name first.',
          'So the real question is not which plan is popular. It is whether your own doctors are in the network of the plan you are thinking about. We can check that name by name before you sign anything.',
        ],
      },
      {
        heading: 'Do I need Part B if I am still working at 65?',
        paragraphs: [
          'Some people in Englewood keep working past 65 and keep coverage from their job. Whether you need Part B right away depends on the size of the employer and the kind of coverage. Getting this wrong can mean a late penalty that lasts for life, so it is worth checking.',
          'If you are about to retire, the order matters. Line up Part B and any other coverage before the job coverage ends, so there is no gap.',
        ],
      },
      {
        heading: 'How do I talk with a Medicare broker in Englewood?',
        paragraphs: [
          `Call me at ${PHONE}, or fill in the form on this page and I will call you back. Tell me your ZIP code, your doctors and your drugs. I also meet people in person in Englewood. There is no fee to talk with me.`,
        ],
      },
    ],
    questions: [
      'My doctor is in Manhattan. Can I keep seeing them on a New Jersey plan?',
      'I am still working at 65. Do I need Part B now?',
      'How do I check a plan’s network before I join?',
      'What is the difference between Original Medicare and Medicare Advantage for my doctors?',
      'Can my adult child join the call?',
    ],
    context: { Location: 'Englewood' },
    localHelp: [
      BERGEN_SHIP,
      BERGEN_AGING,
      SSA_LOCATOR,
      library(
        'Englewood Public Library',
        'Englewood’s public library, at 31 Engle Street.',
        '(201) 568-2215',
        'https://www.englewoodlibrary.org/',
      ),
    ],
    relatedAnswers: [
      'how-to-check-if-a-doctor-is-in-a-medicare-plan',
      'medicare-while-still-working',
      'medigap-new-jersey',
    ],
  },

  // ── Teaneck (Bergen) ────────────────────────────────────────────────────
  {
    slug: 'teaneck',
    metaDescription:
      'Medicare help in Teaneck, NJ. Turning 65, leaving a job, or changing plans in the fall. Plain answers and a licensed broker to call.',
    name: 'Teaneck',
    shortName: 'Teaneck',
    region: 'Teaneck, NJ',
    kind: 'city',
    parentSlug: 'bergen-county',
    inState: 'New Jersey',
    headline: 'Teaneck: Medicare in the right order, one step at a time.',
    intro:
      'Teaneck is a township in the middle of Bergen County. Most calls I get from Teaneck are about timing: someone is turning 65, leaving a job, or wondering whether to change plans this fall. Medicare has a clock, and doing things in the right order saves trouble later.',
    sections: [
      {
        heading: 'When can I sign up for Medicare in Teaneck?',
        paragraphs: [
          'Your first window is seven months around your 65th birthday: three months before your birthday month, that month, and three months after. If you already get Social Security, you are usually signed up for Part A and Part B automatically, and your card arrives by mail.',
        ],
      },
      {
        heading: 'When can I change my Medicare plan each year?',
        paragraphs: [
          'From October 15 to December 7 each year, anyone with Medicare can change their health or drug plan, and the new plan starts January 1. Before then, read the Annual Notice of Change your plan mails in the fall. It lists what will be different.',
        ],
      },
      {
        heading: 'How do I reach a Medicare broker from Teaneck?',
        paragraphs: [
          `Call or text me at ${PHONE}. If English is not your first language, I also speak Georgian and Russian. A family member is always welcome, on the phone or at the kitchen table if you would rather meet in person in Teaneck.`,
        ],
      },
    ],
    questions: [
      'When does my seven-month sign-up window start and end?',
      'I already get Social Security. Do I need to do anything to get Part A and Part B?',
      'My plan sent an Annual Notice of Change. What should I look for?',
      'I am leaving my job next year. When should I sign up for Part B?',
      'If I change plans in December, when does the new one start?',
    ],
    context: { Location: 'Teaneck' },
    localHelp: [
      BERGEN_SHIP,
      BERGEN_AGING,
      SSA_LOCATOR,
      library(
        'Teaneck Public Library',
        'Teaneck’s public library, at 840 Teaneck Road.',
        '(201) 837-4171',
        'https://www.teanecklibrary.org/',
      ),
    ],
    relatedAnswers: [
      'turning-65-new-jersey',
      'leaving-employer-coverage-after-65',
      'how-to-switch-medicare-plans',
    ],
  },

  // ── Paramus (Bergen) ────────────────────────────────────────────────────
  {
    slug: 'paramus',
    metaDescription:
      'Medicare help in Paramus, NJ. What to do when a plan letter arrives, which windows let you switch, and who to call.',
    name: 'Paramus',
    shortName: 'Paramus',
    region: 'Paramus, NJ',
    kind: 'city',
    parentSlug: 'bergen-county',
    inState: 'New Jersey',
    headline: 'Paramus: when a Medicare letter shows up, here is what to do next.',
    intro:
      'Paramus sits where Route 4 and Route 17 meet, in the middle of Bergen County. People here call me most often after a letter arrives: a plan is changing, a plan is ending, or a drug is no longer covered. This page explains what those letters mean and what choices you have.',
    sections: [
      {
        heading: 'What happens if my Medicare Advantage plan is ending?',
        paragraphs: [
          'Your plan must send a letter, often called a non-renewal notice. It gives you a special window to choose a new plan. If you do nothing, you go back to Original Medicare and may need a drug plan, so do not let the letter sit in a drawer.',
        ],
      },
      {
        heading: 'What can I do if my plan is changing next year?',
        paragraphs: [
          'Most plans change rather than end: costs, networks and the drug list can all be different next year. You can switch from October 15 to December 7. If you are in a Medicare Advantage plan, you can also make one change from January 1 to March 31.',
        ],
      },
      {
        heading: 'Can someone go through my Medicare letter with me?',
        paragraphs: [
          `Yes. Call or text me at ${PHONE} with the letter in front of you, read me the top of it, and we will work out which window applies. If the letter is long, we can go through it together in person in Paramus.`,
        ],
      },
    ],
    questions: [
      'My plan says it is not renewing. What happens if I do nothing?',
      'What is the January to March window, and who can use it?',
      'A drug I take was dropped from my plan’s list. What can I do?',
      'How do I know if my plan is ending or only changing?',
      'Can you look at my letter over the phone?',
    ],
    context: { Location: 'Paramus' },
    localHelp: [
      BERGEN_SHIP,
      BERGEN_AGING,
      SSA_LOCATOR,
      library(
        'Paramus Public Library',
        'Paramus’s public library, at 116 East Century Road, with a branch at 239 West Midland Avenue.',
        '(201) 599-1300',
        'https://www.paramuslibrary.org/',
      ),
    ],
    relatedAnswers: [
      'medicare-advantage-plan-ending-non-renewal-letter',
      'medicare-enrollment-periods-explained',
      'how-to-check-if-a-doctor-is-in-a-medicare-plan',
    ],
  },

  // ── Fair Lawn (Bergen) ──────────────────────────────────────────────────
  {
    slug: 'fair-lawn',
    metaDescription:
      'Medicare help in Fair Lawn, NJ, on the Passaic County line. Why a short move next door can change your plan options.',
    name: 'Fair Lawn',
    shortName: 'Fair Lawn',
    region: 'Fair Lawn, NJ',
    kind: 'city',
    parentSlug: 'bergen-county',
    inState: 'New Jersey',
    headline: 'Fair Lawn is on the county line. That matters if you move.',
    intro:
      'Fair Lawn is on the western edge of Bergen County, right next to Paterson and Hawthorne in Passaic County. A move of a mile or two can put you in a different county. For Medicare Advantage and Part D, a different county can mean a different set of plans.',
    sections: [
      {
        heading: 'Does a short move from Fair Lawn change my Medicare plan?',
        paragraphs: [
          'It can. Moving to Glen Rock keeps you in Bergen County, but moving to Paterson or Hawthorne puts you in Passaic County. If your plan does not serve the new county, you get a Special Enrollment Period to pick a new one. Tell your plan early.',
        ],
      },
      {
        heading: 'Should I keep retiree coverage when I get Medicare?',
        paragraphs: [
          'Ask the retiree plan how it works with Medicare before you change anything, because dropping retiree coverage can be hard to undo. For Medigap, the six months after your Part B starts is the safest time to buy, because you cannot be turned down for health reasons.',
        ],
      },
      {
        heading: 'How can I meet with a Medicare broker in Fair Lawn?',
        paragraphs: [
          `Call or text me at ${PHONE}, and we can talk on the phone or meet in Fair Lawn, whichever is easier. If you are planning a move, tell me both addresses, and I will tell you what changes and what does not.`,
        ],
      },
    ],
    questions: [
      'I am moving from Fair Lawn to Paterson. Does my plan follow me?',
      'Does moving to Glen Rock or Ridgewood change anything?',
      'I have retiree coverage. Should I keep it with Medicare?',
      'When is the best time to buy a Medigap policy?',
      'Should I tell my plan before or after I move?',
    ],
    context: { Location: 'Fair Lawn' },
    localHelp: [
      BERGEN_SHIP,
      BERGEN_AGING,
      SSA_LOCATOR,
      library(
        'Maurice M. Pine Free Public Library',
        'Fair Lawn’s public library, at 10-01 Fair Lawn Avenue.',
        '201-796-3400',
        'https://www.fairlawnlibrary.org/',
      ),
    ],
    relatedAnswers: [
      'how-to-switch-medicare-plans',
      'retiree-coverage-and-medicare',
      'medigap-new-jersey',
    ],
  },

  // ── Palisades Park (Bergen) ─────────────────────────────────────────────
  {
    slug: 'palisades-park',
    metaDescription:
      'Medicare help in Palisades Park, NJ. How to get ready for a Medicare call, help with costs, and what to ask any agent.',
    name: 'Palisades Park',
    shortName: 'Palisades Park',
    region: 'Palisades Park, NJ',
    kind: 'city',
    parentSlug: 'bergen-county',
    inState: 'New Jersey',
    headline: 'Palisades Park: a little preparation makes the Medicare call short.',
    intro:
      'Palisades Park is a small borough in southeastern Bergen County, next to Fort Lee and Ridgefield. Many families here help an older parent with Medicare. This page is for them too: what to gather, where to get free help, and what to ask any agent before you trust them.',
    sections: [
      {
        heading: 'What should my parent bring to a Medicare call?',
        paragraphs: [
          'Three things: the red, white and blue Medicare card, a list of every doctor, and every medicine with its dose. Pill bottles work if there is no list. If you are helping a parent, sit with them, because I need to talk with them directly.',
        ],
      },
      {
        heading: 'Is there help paying Medicare costs in New Jersey?',
        paragraphs: [
          'Yes, for people with lower incomes. Extra Help lowers drug costs, and Medicare Savings Programs can pay the Part B premium. The rules depend on income and savings and change each year. The county SHIP office can help you apply for free, and so can I.',
        ],
      },
      {
        heading: 'How do I check that a Medicare agent is licensed?',
        paragraphs: [
          'Ask for a license number and look it up with the state, and ask whether there is a fee. With me there is no fee, and my license can be checked on the About page. I can also meet you and your parent in person in Palisades Park.',
        ],
      },
    ],
    questions: [
      'What should my mother bring to a Medicare call?',
      'Can I be on the call to help my father?',
      'Is there help paying the Part B premium?',
      'How do I check that an agent is licensed?',
      'Does it cost anything to talk with you?',
    ],
    context: { Location: 'Palisades Park' },
    localHelp: [
      BERGEN_SHIP,
      BERGEN_AGING,
      SSA_LOCATOR,
      library(
        'Palisades Park Public Library',
        'Palisades Park’s public library, at 257 2nd Street.',
        '201-585-4150',
        'https://www.palparklibrary.org/',
      ),
    ],
    relatedAnswers: [
      'what-to-bring-to-a-medicare-appointment',
      'extra-help-medicare-savings-programs-new-jersey',
      'how-to-choose-medicare-agent-bergen-hudson-county',
    ],
  },

  // ── Jersey City (Hudson) ────────────────────────────────────────────────
  {
    slug: 'jersey-city',
    metaDescription:
      'Medicare help in Jersey City, NJ. Free Hudson County counseling, help with costs, and Medicare with Medicaid, explained plainly.',
    name: 'Jersey City',
    shortName: 'Jersey City',
    region: 'Jersey City, NJ',
    kind: 'city',
    parentSlug: 'new-jersey',
    county: 'Hudson County',
    inState: 'New Jersey',
    headline: 'Jersey City: Medicare help in Hudson County, starting with the free kind.',
    intro:
      'Jersey City is the seat of Hudson County. Both the county’s free Medicare counselors and the city’s Division of Senior Affairs are here. If you have Medicare and Medicaid, or need help with costs, start with them. If you want to compare plans and enroll, you can call me.',
    sections: [
      {
        heading: 'Are Medicare plans in Jersey City the same as in Bergen County?',
        paragraphs: [
          'No. Medicare Advantage and Part D plans are approved by county, and Hudson County has its own list. A plan a friend has in Fort Lee or Hackensack may not be sold in Jersey City at all, so advice from across the county line may not fit you.',
        ],
      },
      {
        heading: 'How do Medicare and Medicaid work together?',
        paragraphs: [
          'Medicare pays first, and New Jersey Medicaid can help with what Medicare leaves, like premiums and copays. People with both have more chances during the year to change plans, and some plans are built only for them. Ask before you switch, so the two keep working together.',
        ],
      },
      {
        heading: 'How do I reach a Medicare broker in Jersey City?',
        paragraphs: [
          `Call or text me at ${PHONE}. I work with people across Hudson County by phone or in person, in English, Georgian or Russian. Free, neutral counseling is also available in Jersey City through the Hudson County SHIP office listed on this page.`,
        ],
      },
    ],
    questions: [
      'Are the plans in Jersey City the same as in Bergen County?',
      'I have Medicare and Medicaid. Can I change my plan?',
      'Where can I get free Medicare counseling in Hudson County?',
      'Is there help paying my Medicare premiums?',
      'Can you help me in Russian or Georgian?',
    ],
    context: { Location: 'Jersey City, Hudson County' },
    localHelp: [
      HUDSON_SHIP,
      HUDSON_AGING,
      {
        name: 'Jersey City Division of Senior Affairs',
        what: 'The city office for senior residents, at 394 Central Avenue.',
        phone: '(201) 547-5750',
        url: 'https://www.jerseycitynj.gov/cityhall/health/division_of_senior_affairs',
        checked: CHECKED,
      },
      SSA_LOCATOR,
    ],
    relatedAnswers: [
      'medicare-and-medicaid-together',
      'extra-help-medicare-savings-programs-new-jersey',
      'how-to-choose-medicare-agent-bergen-hudson-county',
    ],
  },

  // ── Hoboken (Hudson) ────────────────────────────────────────────────────
  {
    slug: 'hoboken',
    metaDescription:
      'Medicare help in Hoboken, NJ. Still working at 65, leaving a job, or on COBRA? The order you sign up in matters.',
    name: 'Hoboken',
    shortName: 'Hoboken',
    region: 'Hoboken, NJ',
    kind: 'city',
    parentSlug: 'new-jersey',
    county: 'Hudson County',
    inState: 'New Jersey',
    headline: 'Hoboken: working past 65, and what to do when the job ends.',
    intro:
      'Hoboken is about one square mile on the Hudson, across from Manhattan. A lot of people here work in the city, and some keep working well past 65. The Medicare questions I hear from Hoboken are mostly about jobs: do I need Part B yet, and what happens when I stop working?',
    sections: [
      {
        heading: 'Do I need Part B if I am still working at 65 in Hoboken?',
        paragraphs: [
          'Maybe not. If you have health coverage from your own job or your spouse’s current job, you may be able to wait on Part B without a penalty, depending on the employer’s size and the coverage. When that coverage ends, you get eight months to sign up.',
        ],
      },
      {
        heading: 'Does COBRA give me more time to sign up for Medicare?',
        paragraphs: [
          'No. COBRA does not count as job coverage for Medicare. The eight-month window starts when the job or the job coverage ends, not when COBRA ends. If you wait for COBRA to run out, you can miss the window and pay a Part B penalty for life.',
        ],
      },
      {
        heading: 'How can I talk with a Medicare broker in Hoboken?',
        paragraphs: [
          `Call or text me at ${PHONE} and tell me when your job coverage ends. I will lay out the dates for you, so nothing is missed. We can also meet in person in Hoboken if that is easier for you.`,
        ],
      },
    ],
    questions: [
      'I am 66 and still working. Do I need Part B?',
      'My job ends in March. When must I sign up for Part B?',
      'Does COBRA count as job coverage for Medicare?',
      'My spouse is retiring. What happens to my coverage?',
      'Is there a penalty if I sign up late?',
    ],
    context: { Location: 'Hoboken, Hudson County' },
    localHelp: [
      HUDSON_SHIP,
      HUDSON_AGING,
      SSA_LOCATOR,
      library(
        'Hoboken Public Library, Grand Street Branch',
        'At 124 Grand Street, second floor. The main library on Park Avenue closed for work in November 2026 and plans to reopen its upper floors on February 1, 2027.',
        '(201) 420-2346, ext. 5301',
        'https://www.hobokenlibrary.org/',
      ),
    ],
    relatedAnswers: [
      'medicare-while-still-working',
      'cobra-and-medicare',
      'leaving-employer-coverage-after-65',
    ],
  },

  // ── Union City (Hudson) ─────────────────────────────────────────────────
  {
    slug: 'union-city',
    metaDescription:
      'Medicare help in Union City, NJ. Help with costs, Medicare with Medicaid, and a short list of what to bring to a call.',
    name: 'Union City',
    shortName: 'Union City',
    region: 'Union City, NJ',
    kind: 'city',
    parentSlug: 'new-jersey',
    county: 'Hudson County',
    inState: 'New Jersey',
    headline: 'Union City: many neighbors, one plan menu, and your own choice to make.',
    intro:
      'Union City is one of the most crowded cities in the country, with Bergenline Avenue running through the middle. Neighbors share news fast here, including news about Medicare plans. But the right plan for a neighbor may be wrong for you, because your doctors and drugs are different.',
    sections: [
      {
        heading: 'Should I join the same Medicare plan as my neighbor?',
        paragraphs: [
          'Not without checking. Everyone in Union City chooses from the same Hudson County list, but one plan may cover your neighbor’s drugs well and yours badly, or include their doctor and not yours. The only way to know is to check your own doctors and drugs.',
        ],
      },
      {
        heading: 'Is there help with Medicare costs if money is tight?',
        paragraphs: [
          'Yes. Extra Help lowers drug costs, Medicare Savings Programs can pay the Part B premium, and New Jersey Medicaid can help with more. You apply based on income and savings. The county SHIP counselors can help you apply for free, and I can point you to programs.',
        ],
      },
      {
        heading: 'How do I reach a Medicare broker in Union City?',
        paragraphs: [
          `Call or text me at ${PHONE}. Have your Medicare card, your doctor list and your drug list nearby. Meeting in person in Union City works too, and your son or daughter is welcome to join the call or the visit.`,
        ],
      },
    ],
    questions: [
      'My neighbor likes her plan. Should I join it too?',
      'Is there help paying for my medicines?',
      'I have Medicaid. Does that change my Medicare choices?',
      'What should I have in front of me when I call?',
      'Can my son or daughter call for me?',
    ],
    context: { Location: 'Union City, Hudson County' },
    localHelp: [
      HUDSON_SHIP,
      HUDSON_AGING,
      SSA_LOCATOR,
      library(
        'Union City Public Library, Summit Avenue branch',
        'At 1800 Summit Avenue. The main library on 43rd Street is closed for construction.',
        '201-866-7503',
        'http://www.uclibrary.org/',
      ),
    ],
    relatedAnswers: [
      'medicare-and-medicaid-together',
      'extra-help-medicare-savings-programs-new-jersey',
      'what-to-bring-to-a-medicare-appointment',
    ],
  },

  // ── West New York (Hudson) ──────────────────────────────────────────────
  {
    slug: 'west-new-york',
    metaDescription:
      'Medicare help in West New York, NJ. Turning 65, the sign-up windows, and how to check your doctors before you choose a plan.',
    name: 'West New York',
    shortName: 'West New York',
    region: 'West New York, NJ',
    kind: 'city',
    parentSlug: 'new-jersey',
    county: 'Hudson County',
    inState: 'New Jersey',
    headline: 'West New York is in New Jersey. Your Medicare plan follows New Jersey rules.',
    intro:
      'Despite the name, West New York is a town in Hudson County, New Jersey, on the cliffs above the Hudson River. The name confuses mail and websites, and it can confuse plan searches too. Your plans are the ones sold in Hudson County, New Jersey.',
    sections: [
      {
        heading: 'Is West New York in New York or New Jersey for Medicare?',
        paragraphs: [
          'New Jersey. West New York is a town in Hudson County, on the cliffs above the Hudson River. When you look up plans online, search by your ZIP code, not the town name, because a search for West New York can show New York State plans.',
        ],
      },
      {
        heading: 'When can I sign up for or change Medicare in West New York?',
        paragraphs: [
          'When you turn 65, you have seven months: three before your birthday month, that month, and three after. After that, the main window to change plans is October 15 to December 7 each year. Other windows open after a move or losing job coverage.',
        ],
      },
      {
        heading: 'How do I reach a Medicare broker in West New York?',
        paragraphs: [
          `Call or text me at ${PHONE}. Tell me your ZIP code first, and I will only show you plans that are actually sold where you live. In-person meetings in West New York are fine as well, and there is no fee to talk.`,
        ],
      },
    ],
    questions: [
      'Is West New York in New York or New Jersey for Medicare?',
      'A mailer showed me New York plans. Can I join one?',
      'When is my seven-month window?',
      'How do I check that my doctor is in a plan?',
      'What other windows let me change plans?',
    ],
    context: { Location: 'West New York, Hudson County' },
    localHelp: [
      HUDSON_SHIP,
      HUDSON_AGING,
      SSA_LOCATOR,
      library(
        'West New York Public Library',
        'West New York’s public library, at 425 60th Street.',
        '201-295-5135',
        'https://www.westnewyorknj.org/pages/west-new-york-public-library/',
      ),
    ],
    relatedAnswers: [
      'turning-65-new-jersey',
      'medicare-enrollment-periods-explained',
      'how-to-check-if-a-doctor-is-in-a-medicare-plan',
    ],
  },

  // ── North Bergen (Hudson) ───────────────────────────────────────────────
  {
    slug: 'north-bergen',
    metaDescription:
      'Medicare help in North Bergen, NJ. It is in Hudson County, not Bergen, and that decides your plan list.',
    name: 'North Bergen',
    shortName: 'North Bergen',
    region: 'North Bergen, NJ',
    kind: 'city',
    parentSlug: 'new-jersey',
    county: 'Hudson County',
    inState: 'New Jersey',
    headline: 'North Bergen is in Hudson County, not Bergen County.',
    intro:
      'The name trips people up. North Bergen is a township in Hudson County, on the Bergen County line. Medicare plans are sold by county, so North Bergen residents choose from the Hudson County list, not the Bergen one.',
    sections: [
      {
        heading: 'Is North Bergen in Bergen County for Medicare?',
        paragraphs: [
          'No. North Bergen is a township in Hudson County, on the Bergen County line, so you choose from the Hudson County plan list. A friend in Fairview, just over the line, lives in Bergen County and may have different plans. Moving across that line changes your county.',
        ],
      },
      {
        heading: 'Does my New York Medicare plan work after I move to North Bergen?',
        paragraphs: [
          'A New York Medicare Advantage or Part D plan does not follow you across the river, so you will need a New Jersey plan. Medigap rules differ too: New York lets you buy Medigap at any time, but New Jersey does not after your first six months.',
        ],
      },
      {
        heading: 'How do I reach a Medicare broker in North Bergen?',
        paragraphs: [
          `Call or text me at ${PHONE}. If you just moved, tell me your old and new addresses and the date you moved, so we know which window applies. I can come to you in North Bergen if that is easier.`,
        ],
      },
    ],
    questions: [
      'Is North Bergen in Bergen County for Medicare?',
      'I moved from Queens. Does my New York plan still work?',
      'Can I keep my Medigap policy after moving to New Jersey?',
      'If I move to Fairview, does my plan change?',
      'How long do I have to pick a new plan after a move?',
    ],
    context: { Location: 'North Bergen, Hudson County' },
    localHelp: [
      HUDSON_SHIP,
      HUDSON_AGING,
      SSA_LOCATOR,
      library(
        'North Bergen Free Public Library',
        'The main library, the Sai Rao Public Library, is at 8411 Bergenline Avenue.',
        '(201) 869-4715',
        'https://nbpl.org/',
      ),
    ],
    relatedAnswers: [
      'moved-medicare-new-jersey-new-york',
      'medigap-underwriting-new-jersey-new-york',
      'how-to-choose-medicare-agent-bergen-hudson-county',
    ],
  },

  // ── Weehawken (Hudson) ──────────────────────────────────────────────────
  /*
    No library item: weehawken-nj.us refused automated reads on Nov 17 2026
    and no other official page for the library could be read. Add it once
    someone opens https://www.weehawken-nj.us/ by hand and confirms it.
  */
  {
    slug: 'weehawken',
    metaDescription:
      'Medicare help in Weehawken, NJ, at the Lincoln Tunnel. If your doctors are in Manhattan, check the plan network first.',
    name: 'Weehawken',
    shortName: 'Weehawken',
    region: 'Weehawken, NJ',
    kind: 'city',
    parentSlug: 'new-jersey',
    county: 'Hudson County',
    inState: 'New Jersey',
    headline: 'Weehawken: Manhattan is one tunnel away. Your plan network may not be.',
    intro:
      'Weehawken is the New Jersey end of the Lincoln Tunnel, with ferries to Manhattan from the waterfront. Many people here see doctors in the city. That is the first thing to check before choosing a Medicare plan.',
    sections: [
      {
        heading: 'Will a Weehawken Medicare plan cover my Manhattan doctors?',
        paragraphs: [
          'It depends on the plan. Weehawken is in Hudson County, so you choose from Hudson County plans, and some include Manhattan doctors while others do not. With Original Medicare, any doctor who accepts Medicare will see you. With Medicare Advantage, check each doctor by name.',
        ],
      },
      {
        heading: 'What changes if I move between Manhattan and Weehawken?',
        paragraphs: [
          'Your Part A and Part B stay the same. Only the private plans change: a move between states means a new Medicare Advantage or Part D plan. Tell your plan about the move as early as you can, so your window to choose a new one starts on time.',
        ],
      },
      {
        heading: 'How do I reach a Medicare broker in Weehawken?',
        paragraphs: [
          `Call or text me at ${PHONE}. Have your doctors’ names and addresses ready, including the ones in New York, so we can check them. If you would rather sit down together, I meet people in person in Weehawken, at no cost.`,
        ],
      },
    ],
    questions: [
      'My doctors are in Manhattan. Which kind of coverage keeps them?',
      'I am moving from Manhattan to Weehawken. What do I need to change?',
      'Does my Part B change when I move states?',
      'How do I check a doctor in a plan’s network?',
      'I have retiree coverage from a New York job. How does it work with Medicare?',
    ],
    context: { Location: 'Weehawken, Hudson County' },
    localHelp: [HUDSON_SHIP, HUDSON_AGING, SSA_LOCATOR],
    relatedAnswers: [
      'how-to-check-if-a-doctor-is-in-a-medicare-plan',
      'moving-between-new-jersey-new-york-pennsylvania',
      'retiree-coverage-and-medicare',
    ],
  },

  // ── Brooklyn (Kings County) ─────────────────────────────────────────────
  {
    slug: 'brooklyn',
    metaDescription:
      'Medicare help in Brooklyn, in English and Russian. Brighton Beach and Sheepshead Bay: New York Medigap rules, Medicaid, free counseling.',
    name: 'Brooklyn',
    shortName: 'Brooklyn',
    region: 'Brooklyn, NY',
    kind: 'city',
    parentSlug: 'new-york-city',
    county: 'Kings County',
    inState: 'New York',
    headline: 'Brooklyn: Medicare help in Russian, for Brighton Beach and Sheepshead Bay.',
    intro:
      'Brooklyn is Kings County, and Brighton Beach and Sheepshead Bay are home to many Russian-speaking families. I speak Russian. If you or your parents would rather go over Medicare in Russian, we can do the whole call that way.',
    sections: [
      {
        heading: 'Can I get help with Medicare in Russian in Brooklyn?',
        paragraphs: [
          'Yes. I speak Russian, and we can do the whole call in Russian, or part in English and part in Russian if your children join. Medicare words like deductible and network are easier to understand in the language you think in. We can talk by phone or video, or meet in person if that is easier.',
        ],
      },
      {
        heading: 'How are New York Medigap rules different?',
        paragraphs: [
          'In New York, Medigap insurers must sell to you at any time of year, whatever your health. In most states, including New Jersey, that is not true after your first six months. It gives you more room to change your mind later, but it does not set the price.',
        ],
      },
      {
        heading: 'What if I have both Medicare and Medicaid in Brooklyn?',
        paragraphs: [
          `Then there are special plans for people with both, and extra chances to change plans during the year. Call or text me at ${PHONE}, and we will check what you have now before changing anything. In Brooklyn we can talk by phone or video call, or meet in person.`,
        ],
      },
    ],
    questions: [
      'Can we do the whole Medicare call in Russian?',
      'Can I buy Medigap in New York at any age or time?',
      'I have Medicare and Medicaid. Which plans can I join?',
      'Where can I get free Medicare counseling in Brooklyn?',
      'My mother lives in Brighton Beach and I live in New Jersey. Can I help her by phone?',
    ],
    context: { Location: 'Brooklyn (Kings County), New York' },
    localHelp: [
      NYC_HIICAP,
      SSA_LOCATOR,
      library(
        'Brighton Beach Library',
        'Brooklyn Public Library branch at 16 Brighton First Road, at Brighton Beach Avenue.',
        '718.946.2917',
        'https://www.bklynlibrary.org/locations/brighton-beach',
      ),
      library(
        'Sheepshead Bay Library',
        'Brooklyn Public Library branch at 2636 East 14th Street, at Avenue Z.',
        '718.368.1815',
        'https://www.bklynlibrary.org/locations/sheepshead-bay',
      ),
    ],
    relatedAnswers: [
      'medicare-help-new-york-city',
      'medigap-underwriting-new-jersey-new-york',
      'medicare-and-medicaid-together',
    ],
  },

  // ── Queens (Queens County) ──────────────────────────────────────────────
  /*
    No library item: queenslibrary.org branch pages redirect to a host that
    refused automated reads on Nov 17 2026. Add Forest Hills (and Rego Park,
    which QPL has said is being rebuilt) once confirmed by hand.
  */
  {
    slug: 'queens',
    metaDescription:
      'Medicare help in Queens, in English and Russian, for Forest Hills and Rego Park. Moving, doctors, and free counseling.',
    name: 'Queens',
    shortName: 'Queens',
    region: 'Queens, NY',
    kind: 'city',
    parentSlug: 'new-york-city',
    county: 'Queens County',
    inState: 'New York',
    headline: 'Queens: Medicare help for Forest Hills and Rego Park, in Russian too.',
    intro:
      'Queens is its own county, Queens County. Forest Hills and Rego Park have large Russian-speaking communities, and many families there help a parent with Medicare. I can go through it in Russian or English, whichever is easier for you.',
    sections: [
      {
        heading: 'Does my Medicare plan change if I move within New York City?',
        paragraphs: [
          'It can. Each borough is its own county, and Medicare Advantage and Part D plans are sold by county, so Queens has its own plan list. Moving to Brooklyn or Long Island changes your county, and a new window opens to choose a plan.',
        ],
      },
      {
        heading: 'How do I keep my Russian-speaking doctor on a Medicare plan?',
        paragraphs: [
          'Check each doctor by name before you join a Medicare Advantage plan, because its network decides who you can see. With Original Medicare, any doctor who accepts Medicare can see you. Many people in Forest Hills and Rego Park check this first.',
        ],
      },
      {
        heading: 'How can I get Medicare help in Russian in Queens?',
        paragraphs: [
          `Call or text me at ${PHONE} and say whether you want to talk in Russian or English. If a son or daughter helps you with Medicare, they can join the call. I help people in Queens by phone, by video call or in person, and there is no fee.`,
        ],
      },
    ],
    questions: [
      'Can you explain Medicare to my mother in Russian?',
      'I am moving from Rego Park to Brooklyn. Does my plan change?',
      'How do I check that my Russian-speaking doctor is in a plan?',
      'Where can I get free Medicare counseling in Queens?',
      'Which keeps my doctors: Original Medicare or Medicare Advantage?',
    ],
    context: { Location: 'Queens (Queens County), New York' },
    localHelp: [NYC_HIICAP, SSA_LOCATOR],
    relatedAnswers: [
      'medicare-help-new-york-city',
      'moved-medicare-new-jersey-new-york',
      'how-to-check-if-a-doctor-is-in-a-medicare-plan',
    ],
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
