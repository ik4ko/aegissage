import Link from 'next/link';
import { Mail, MessageSquareText, Phone } from 'lucide-react';
import { advisor, compliance, contactHrefs, nav, site } from '@/lib/site';
import { planStates } from '@/lib/states';
import { getLocationLanding, locationLandings } from '@/lib/locations';
import { ShieldMark } from './site-header';
import { SocialLinks } from './social-links';

/**
 * ── Why the footer does not list every state ──────────────────────────────
 * This column used to render all 25 plan pages as two-letter codes. That was
 * ~1,575 sitewide internal links (25 × every page) whose anchor text was
 * "AL", "MI", "MN" — unreadable for an audience that skews 65+, and worthless
 * as anchor text. /plans already links all 25 by full name, and every one is
 * in the sitemap, so the pages keep a real internal link and the equity flows
 * through one hub instead of being spread across meaningless anchors.
 *
 * Do not re-add the per-state grid here. If a state needs more prominence,
 * that belongs on /plans, which is built for it.
 *
 * ── Why the towns nest ────────────────────────────────────────────────────
 * lib/locations.ts models three levels (state → county → town). Rendering
 * that flat put Fort Lee alongside New Jersey as if they were peers. Only the
 * county level nests here, so the footer stays two deep and still reads as a
 * hierarchy. Derived from `parentSlug`, so a new town appears correctly with
 * no change to this file.
 */
function groupLocations() {
  const isTown = (slug?: string) =>
    slug ? getLocationLanding(slug)?.kind === 'county' : false;

  const topLevel = locationLandings.filter((location) => !isTown(location.parentSlug));

  return topLevel.map((location) => ({
    location,
    towns: locationLandings.filter((town) => town.parentSlug === location.slug && isTown(town.parentSlug)),
  }));
}

export function SiteFooter() {
  const areas = groupLocations();

  return (
    <footer className="border-t border-line bg-paper">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <ShieldMark />
            <span className="font-display text-xl font-bold text-ink">{site.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-base text-ink-soft">
            Independent Medicare guidance from {advisor.basedIn}. No call centers, no
            hand-offs — you get me.
          </p>
          <SocialLinks className="mt-5" />
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Reach me directly
          </h2>
          <ul className="mt-4 space-y-1">
            <li>
              <a
                href={contactHrefs.tel}
                className="flex min-h-touch items-center gap-2.5 text-base font-semibold text-navy hover:underline"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                {advisor.phone}
              </a>
            </li>
            <li>
              <a
                href={contactHrefs.sms}
                className="flex min-h-touch items-center gap-2.5 text-base text-ink-soft hover:text-navy"
              >
                <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                Send a text
              </a>
            </li>
            <li>
              <a
                href={contactHrefs.mailto}
                className="flex min-h-touch items-center gap-2.5 text-base text-ink-soft hover:text-navy"
              >
                <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
                {/* The literal address wrapped mid-word on small screens.
                    The mailto target is unchanged. */}
                Email {advisor.firstName}
              </a>
            </li>
          </ul>

          {/*
            Required CMS disclosure for published agent phone numbers, in the
            footer contact block per the second required placement. Verbatim —
            see lib/site.ts. Sized down but not faded: ink-faint is the same
            token the surrounding footer text uses, not a lower-contrast one.
          */}
          <p className="mt-3 max-w-xs text-sm text-ink-faint">
            {compliance.licensedAgentNotice}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Learn
          </h2>
          <ul className="mt-4 space-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-touch items-center text-base text-ink-soft hover:text-navy"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Local areas
          </h2>
          <ul className="mt-4 space-y-1">
            {areas.map(({ location, towns }) => (
              <li key={location.slug}>
                <Link
                  href={`/medicare-${location.slug}`}
                  className="flex min-h-touch items-center text-base text-ink-soft hover:text-navy"
                >
                  {location.name}
                </Link>

                {towns.length > 0 ? (
                  <ul className="border-l border-line pl-3">
                    {towns.map((town) => (
                      <li key={town.slug}>
                        <Link
                          href={`/medicare-${town.slug}`}
                          className="flex min-h-touch items-center text-base text-ink-soft hover:text-navy"
                        >
                          {town.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>

          <Link
            href="/plans"
            className="mt-5 inline-flex min-h-touch items-center text-base text-ink-soft underline decoration-line underline-offset-4 hover:text-navy hover:decoration-navy"
          >
            Plan pages for all {planStates.length} states →
          </Link>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="container py-6 text-sm text-ink-faint">
          © {new Date().getFullYear()} {site.name}. {advisor.name}, {advisor.credential}.
        </p>
      </div>
    </footer>
  );
}
