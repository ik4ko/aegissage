import Link from 'next/link';
import { Mail, MessageSquareText, Phone } from 'lucide-react';
import { advisor, contactHrefs, nav, site } from '@/lib/site';
import { planStates } from '@/lib/states';
import { locationLandings } from '@/lib/locations';
import { ShieldMark } from './site-header';
import { SocialLinks } from './social-links';

export function SiteFooter() {
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
                className="flex min-h-touch items-center gap-2.5 break-all text-base text-ink-soft hover:text-navy"
              >
                <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
                {advisor.email}
              </a>
            </li>
          </ul>
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
            {locationLandings.map((location) => (
              <li key={location.slug}>
                <Link
                  href={`/medicare-${location.slug}`}
                  className="flex min-h-touch items-center text-base text-ink-soft hover:text-navy"
                >
                  {location.name}
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Plan pages
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
            {planStates.map((state) => (
              <li key={state.code}>
                <Link
                  href={`/plans/${state.slug}`}
                  className="inline-flex min-h-[2.25rem] items-center text-sm text-ink-soft underline decoration-line underline-offset-4 hover:text-navy hover:decoration-navy"
                >
                  {state.code}
                </Link>
              </li>
            ))}
          </ul>
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
