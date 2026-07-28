import type { Config } from 'tailwindcss';

/**
 * AegisSage design language.
 *
 * Two rules drive every token here:
 *  1. The primary reader is 65+ on a phone. Body copy starts at 19px, never
 *     below 18px, and every interactive target clears 48x48.
 *  2. Contrast is checked against the cream page background, not pure white.
 *     Measured ratios against `cream` (#FBF8F3):
 *
 *       ink       #12212F  15.43:1  AAA
 *       ink-soft  #3A4A59   8.60:1  AAA
 *       ink-faint #485665   7.09:1  AAA   (was #5B6B7A at 5.18:1 — AA only)
 *       navy      #123E63  10.46:1  AAA
 *       ember     #B4530A   4.74:1  AA    — large text, borders and filled
 *                                           buttons only, never small body copy
 *       ember-deep #8C3F06  7.01:1  AAA   — the one to use for small accent text
 *
 *     `ink-faint` was darkened to clear AAA for the timestamps, captions and
 *     figure text it is used on. It still sits a clear step below `ink-soft`,
 *     so the three-level text hierarchy is intact.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.mdx',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem' },
      screens: { '2xl': '1180px' },
    },
    extend: {
      colors: {
        cream: '#FBF8F3',
        paper: '#FFFFFF',
        ink: {
          DEFAULT: '#12212F',
          soft: '#3A4A59',
          faint: '#485665',
        },
        navy: {
          DEFAULT: '#123E63',
          deep: '#0B2942',
          soft: '#E6EEF5',
        },
        ember: {
          DEFAULT: '#B4530A',
          deep: '#8C3F06',
          soft: '#FDF0E3',
        },
        sage: {
          DEFAULT: '#186B5A',
          soft: '#E4F1ED',
        },
        line: '#E2DCD1',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      fontSize: {
        // Senior-friendly scale. `base` is 19px, not 16px.
        sm: ['1rem', { lineHeight: '1.6' }],
        base: ['1.1875rem', { lineHeight: '1.7' }],
        lg: ['1.3125rem', { lineHeight: '1.65' }],
        xl: ['1.5rem', { lineHeight: '1.5' }],
        '2xl': ['1.8125rem', { lineHeight: '1.35' }],
        '3xl': ['2.25rem', { lineHeight: '1.2' }],
        '4xl': ['2.75rem', { lineHeight: '1.12' }],
        '5xl': ['3.5rem', { lineHeight: '1.05' }],
        '6xl': ['4.25rem', { lineHeight: '1.02' }],
      },
      spacing: {
        touch: '3rem', // 48px — the minimum tap target on this site.
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,33,47,0.04), 0 8px 24px -12px rgba(18,33,47,0.18)',
        lift: '0 2px 4px rgba(18,33,47,0.06), 0 18px 40px -18px rgba(18,33,47,0.28)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in': 'slide-in 0.35s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
