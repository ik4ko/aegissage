'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Phone, X } from 'lucide-react';
import { advisor, contactHrefs, nav, site } from '@/lib/site';
import { trackContactIntent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Route change closes the menu; without this the panel survives navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/92 backdrop-blur">
      <div className="container flex h-[4.5rem] items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg py-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
        >
          <ShieldMark />
          <span className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
            {site.name}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-11 items-center rounded-lg px-3.5 text-base font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30',
                      active ? 'text-navy underline decoration-ember decoration-2 underline-offset-8' : 'text-ink-soft hover:text-navy',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={contactHrefs.tel}
            onClick={() => trackContactIntent('call', 'header')}
            className="hidden h-touch items-center gap-2 rounded-xl bg-ember px-5 font-semibold text-white shadow-card transition-colors hover:bg-ember-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30 sm:flex"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            {advisor.phone}
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="grid h-touch w-touch place-items-center rounded-xl border-2 border-line text-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30 lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="animate-fade-up border-t border-line bg-cream lg:hidden"
        >
          <ul className="container flex flex-col py-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-touch items-center border-b border-line/70 py-3.5 text-lg font-medium text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

export function ShieldMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('h-8 w-8', className)}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16 2.5 4.5 7v9.2c0 6.6 4.7 11.6 11.5 13.3 6.8-1.7 11.5-6.7 11.5-13.3V7L16 2.5Z"
        fill="#123E63"
      />
      <path
        d="M10.5 16.2 14.4 20l7.4-8"
        fill="none"
        stroke="#F6B26B"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
