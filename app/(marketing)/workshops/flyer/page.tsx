import type { Metadata } from 'next';
import { WorkshopFlyer } from '@/components/marketing/workshop-flyer';
import { pageMetadata } from '@/lib/page-metadata';

/** Blank flyer: date, time and place are lines to fill in by hand. */
export const metadata: Metadata = pageMetadata({
  title: 'Printable workshop flyer (blank)',
  description: 'A one-page flyer for a "Your Medicare plan is ending" workshop, with blanks for the date, time and place.',
  path: '/workshops/flyer',
  kicker: 'Workshops',
  extra: { robots: { index: false, follow: true }, alternates: { canonical: '/workshops' } },
});

export default function BlankFlyerPage() {
  return <WorkshopFlyer />;
}
