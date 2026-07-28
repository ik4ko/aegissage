/**
 * External resource registry.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  READ THIS BEFORE ADDING ANYTHING
 * ══════════════════════════════════════════════════════════════════════════
 *
 * This registry exists so that IF commercial resources are ever published,
 * they cannot be published without a disclosure. It is not an invitation to
 * add them. Today it holds official, non-commercial, government or
 * non-profit resources only, and nothing here pays this site anything.
 *
 * ── Permanently prohibited, regardless of compensation ────────────────────
 * Do not add any of the following, ever, without written legal review:
 *
 *   • OTC stores, supplements, medical devices, or "Medicare OTC benefit"
 *     storefronts
 *   • provider-referral offers or paid provider directories
 *   • insurer-paid placements or carrier-sponsored links
 *   • paid product recommendations of any kind
 *   • lead-generation forms operated by a third party
 *   • anything that pays a referral fee tied to Medicare-related business
 *
 * The last one is not a style preference. Federal anti-kickback and
 * beneficiary-inducement rules treat payments connected to Medicare business
 * very differently from ordinary affiliate marketing, and CMS marketing rules
 * constrain what a TPMO may present alongside Medicare content. "It is only
 * an affiliate link" is not a defence. Route it through counsel first.
 *
 * ── The invariant this file guarantees ────────────────────────────────────
 * `affiliate: true` REQUIRES a non-empty `disclosure`, and `approved` must be
 * explicitly true for anything to render. Both are enforced by
 * `assertResourceIntegrity()` below, which runs at module load — i.e. at
 * build time — so a non-disclosed commercial link fails `next build` rather
 * than shipping. The rendering component refuses to draw an affiliate item
 * without its disclosure as a second, independent guard.
 */

export type ResourceCategory =
  | 'Official Medicare'
  | 'Social Security'
  | 'State assistance'
  | 'Consumer advocacy';

export type Resource = {
  title: string;
  category: ResourceCategory;
  /** Plain-English description of what the visitor will find there. */
  description: string;
  url: string;
  /**
   * True if this site has ANY commercial relationship with the destination —
   * affiliate, referral fee, sponsorship, paid placement, revenue share.
   * When true, `disclosure` is mandatory and rendered adjacent to the link.
   */
  affiliate: boolean;
  /** Required whenever `affiliate` is true. Shown next to the link, never in a footnote. */
  disclosure?: string;
  /** ISO date (YYYY-MM-DD) the link and its description were last verified. */
  reviewed: string;
  /** Nothing renders unless this is explicitly true. */
  approved: boolean;
};

/**
 * Official, non-commercial resources only.
 *
 * Every entry is a government or established non-profit destination, none
 * pays this site anything, and every `affiliate` flag is false. Descriptions
 * state what the site is — they make no claim about plans, benefits,
 * eligibility outcomes or availability.
 */
export const resources: Resource[] = [
  {
    title: 'Medicare Plan Finder',
    category: 'Official Medicare',
    description:
      'The federal government’s own tool for looking up every plan available in your ZIP code, including ones no agent carries. This is the complete list.',
    url: 'https://www.medicare.gov/plan-compare',
    affiliate: false,
    reviewed: '2026-07-27',
    approved: true,
  },
  {
    title: 'Medicare.gov',
    category: 'Official Medicare',
    description:
      'The official Medicare site: coverage rules, enrollment periods, appeals, and what each part does.',
    url: 'https://www.medicare.gov',
    affiliate: false,
    reviewed: '2026-07-27',
    approved: true,
  },
  {
    title: 'Social Security Administration',
    category: 'Social Security',
    description:
      'Where you actually enroll in Medicare Part A and Part B, and where Part B premium and IRMAA questions are handled.',
    url: 'https://www.ssa.gov/medicare',
    affiliate: false,
    reviewed: '2026-07-27',
    approved: true,
  },
  {
    title: 'State Health Insurance Assistance Program (SHIP)',
    category: 'State assistance',
    description:
      'Free, unbiased Medicare counseling run by your state. They sell nothing and are not paid by any insurance company.',
    url: 'https://www.shiphelp.org',
    affiliate: false,
    reviewed: '2026-07-27',
    approved: true,
  },
  {
    title: 'Medicare Rights Center',
    category: 'Consumer advocacy',
    description:
      'An independent non-profit consumer service organization with a free national helpline for Medicare questions and appeals.',
    url: 'https://www.medicarerights.org',
    affiliate: false,
    reviewed: '2026-07-27',
    approved: true,
  },
];

/**
 * Build-time integrity check.
 *
 * Runs on module load, which for this app means during `next build`. A
 * violation throws and fails the build — the whole point is that it is not
 * possible to ship a commercial link without a disclosure by accident.
 */
function assertResourceIntegrity() {
  for (const resource of resources) {
    if (resource.affiliate && !resource.disclosure?.trim()) {
      throw new Error(
        `lib/resources.ts: "${resource.title}" is flagged affiliate but has no ` +
          'disclosure. A commercial link must carry a disclosure rendered next ' +
          'to it. Add `disclosure`, or remove the affiliate flag if it is wrong.',
      );
    }

    if (!/^https:\/\//.test(resource.url)) {
      throw new Error(
        `lib/resources.ts: "${resource.title}" must use an https:// URL.`,
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(resource.reviewed)) {
      throw new Error(
        `lib/resources.ts: "${resource.title}" needs a YYYY-MM-DD review date.`,
      );
    }
  }
}

assertResourceIntegrity();

/** Approved resources only. Unapproved entries never reach a page. */
export function getApprovedResources(): Resource[] {
  return resources.filter((resource) => resource.approved);
}

/** Approved resources grouped by category, for a future /resources page. */
export function getResourcesByCategory(): [ResourceCategory, Resource[]][] {
  const groups = new Map<ResourceCategory, Resource[]>();
  for (const resource of getApprovedResources()) {
    if (!groups.has(resource.category)) groups.set(resource.category, []);
    groups.get(resource.category)!.push(resource);
  }
  return [...groups.entries()];
}
