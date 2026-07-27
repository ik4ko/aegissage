import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { advisor, site } from '@/lib/site';

export const runtime = 'edge';

/**
 * Dynamic OG images.
 *
 * A shared link is often the first impression this brand makes, so these are
 * built to look designed rather than templated: an off-white card on a deep
 * navy field, a wide serif headline that resizes to the length of the title,
 * an ember rule, and the advisor's credentials along the bottom so the
 * legitimacy signal survives the trip into iMessage.
 *
 * Query params (all optional):
 *   title    — the headline
 *   kicker   — small uppercase label above the headline
 *   subtitle — one line under the headline
 *
 * Everything is drawn with inline styles because Satori supports only a
 * subset of CSS and no external stylesheets.
 */

const BRAND = {
  navy: '#0B2942',
  navyMid: '#123E63',
  cream: '#FBF8F3',
  ink: '#12212F',
  inkSoft: '#3A4A59',
  ember: '#B4530A',
} as const;

/** Longer headlines step down so they never overflow the card. */
function titleSize(title: string): number {
  if (title.length > 96) return 52;
  if (title.length > 68) return 62;
  if (title.length > 44) return 74;
  return 86;
}

function clamp(value: string | null, max: number, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const title = clamp(searchParams.get('title'), 120, site.tagline);
  const kicker = clamp(searchParams.get('kicker'), 40, 'Medicare, explained');
  const subtitle = clamp(
    searchParams.get('subtitle'),
    140,
    `Independent guidance from ${advisor.basedIn}`,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: 44,
          background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyMid} 100%)`,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '58px 64px',
            borderRadius: 28,
            background: BRAND.cream,
          }}
        >
          {/* Header: shield mark + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width="46" height="46" viewBox="0 0 32 32">
              <path
                d="M16 2.5 4.5 7v9.2c0 6.6 4.7 11.6 11.5 13.3 6.8-1.7 11.5-6.7 11.5-13.3V7L16 2.5Z"
                fill={BRAND.navyMid}
              />
              <path
                d="M10.5 16.2 14.4 20l7.4-8"
                fill="none"
                stroke="#F6B26B"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: BRAND.ink,
              }}
            >
              {site.name}
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: BRAND.ember,
              }}
            >
              {kicker}
            </span>
          </div>

          {/* Headline block */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: titleSize(title),
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: '-0.035em',
                color: BRAND.ink,
              }}
            >
              {title}
            </div>

            <div
              style={{
                width: 96,
                height: 7,
                marginTop: 30,
                borderRadius: 4,
                background: BRAND.ember,
              }}
            />

            <div
              style={{
                display: 'flex',
                marginTop: 26,
                fontSize: 30,
                lineHeight: 1.35,
                color: BRAND.inkSoft,
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Footer: who is saying it */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              paddingTop: 26,
              borderTop: `2px solid #E2DCD1`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 58,
                height: 58,
                borderRadius: 999,
                background: BRAND.navyMid,
                color: '#FFFFFF',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {advisor.name
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: BRAND.ink }}>
                {advisor.name}
              </span>
              <span style={{ fontSize: 21, color: BRAND.inkSoft }}>
                {advisor.credential} · NPN {advisor.npn}
              </span>
            </div>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 24,
                fontWeight: 600,
                color: BRAND.navyMid,
              }}
            >
              {site.domain}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // Titles are stable per article, so these cache hard at the edge.
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  );
}
