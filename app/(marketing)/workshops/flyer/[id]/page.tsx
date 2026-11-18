import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WorkshopFlyer } from '@/components/marketing/workshop-flyer';
import { pageMetadata } from '@/lib/page-metadata';
import { getWorkshop, workshops, workshopLabel } from '@/lib/workshops';

/** One flyer per configured session (lib/workshops.ts). Not indexed. */

type Params = { id: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  // Next needs at least one param for a static route; an unknown id 404s.
  return workshops.length > 0 ? workshops.map((w) => ({ id: w.id })) : [{ id: 'none' }];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const workshop = getWorkshop(id);
  return pageMetadata({
    title: 'Printable workshop flyer',
    description: workshop ? workshopLabel(workshop) : 'Workshop flyer',
    path: `/workshops/flyer/${id}`,
    kicker: 'Workshops',
    extra: { robots: { index: false, follow: true }, alternates: { canonical: '/workshops' } },
  });
}

export default async function SessionFlyerPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const workshop = getWorkshop(id);
  if (!workshop) notFound();
  return <WorkshopFlyer workshop={workshop} />;
}
