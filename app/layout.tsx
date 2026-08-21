import type { Metadata, Viewport } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { StickyCta } from '@/components/marketing/sticky-cta';
import { DisclaimerFooter } from '@/components/marketing/disclaimer-footer';
import { JsonLd } from '@/components/seo/json-ld';
import { AttributionCapture } from '@/components/analytics/attribution-capture';
import { advisor, site } from '@/lib/site';
import { siteJsonLd } from '@/lib/seo';
import './globals.css';

const sans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// Fraunces is a variable font, used only for headings.
//
// No optional axes are requested. An earlier revision pulled in SOFT and WONK,
// which materially enlarges the font file — and nothing in the stylesheet ever
// varies them, so it was paying for range it never used. Headings are the LCP
// element on most pages here, so that weight showed up directly in the score.
const display = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: advisor.name }],
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_US',
    url: site.url,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: '/api/og', width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ['/api/og'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#FBF8F3',
  // Zoom is never disabled on this site — a large share of readers rely on it.
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <head>
        <JsonLd data={siteJsonLd()} />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-VW5X8553VN"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VW5X8553VN');
            `,
          }}
        />
        {/*
          Scroll-reveal elements are server-rendered in their hidden state.
          Without JS they would never animate in, so force them visible. The
          text is in the DOM either way — this only affects opacity/transform.
        */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: '[data-reveal]{opacity:1!important;transform:none!important}',
            }}
          />
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col pb-[5.25rem] lg:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-navy focus:px-5 focus:py-3 focus:text-base focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>

        <SiteHeader />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter />

        {/*
          TPMO disclaimer is mounted here, once, for every route in the app.
          Individual pages must never render their own copy of this text.
        */}
        <DisclaimerFooter />

        <StickyCta />

        {/*
          @vercel/analytics is page-view/audience data. It does NOT report
          Core Web Vitals, which is why no field CWV data existed for this
          site until now.

          SpeedInsights is the field-data half: it reports real LCP/INP/CLS
          from real visitors on real devices. Both inject their script with
          `afterInteractive` strategy, so neither is on the critical path.

          Until this has been live long enough to collect samples, there is
          no field data and no basis for claiming Core Web Vitals pass. Lab
          numbers are not field numbers.
        */}
        <Analytics />
        <SpeedInsights />

        {/*
          Records first-touch UTM/referrer attribution once per session so a
          contact submission can be traced to the page that produced it.
          Renders nothing and runs in an effect — never on the critical path.
        */}
        <AttributionCapture />
      </body>
    </html>
  );
}
