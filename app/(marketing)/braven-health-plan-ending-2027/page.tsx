import type { Metadata } from 'next';
import { PlanEndingTemplate } from '@/components/marketing/plan-ending-page';
import { getPlanEndingPage } from '@/lib/plan-endings';
import { pageMetadata } from '@/lib/page-metadata';

/** Content, sources and rules: lib/plan-endings.ts. */
const page = getPlanEndingPage('braven-health-plan-ending-2027');

export const metadata: Metadata = pageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: '/braven-health-plan-ending-2027',
  kicker: 'Plan ending in 2027',
  shareTitle: page.h1,
  type: 'article',
});

export default function Page() {
  return <PlanEndingTemplate page={page} />;
}
