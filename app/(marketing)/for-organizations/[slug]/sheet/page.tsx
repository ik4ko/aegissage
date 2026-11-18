import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/marketing/print-button';
import { ORG_HUB_PATH, getOrgAudience, orgAudiences } from '@/lib/organizations';
import { advisor, site } from '@/lib/site';
import { pageMetadata } from '@/lib/page-metadata';

/**
 * Printable one-page "Medicare Help Partner" sheet, to email as a PDF or drop
 * off. Printing hides the site header, sticky bar and footer navigation
 * (app/globals.css) and keeps the TPMO disclosure, which this sheet needs:
 * it carries Erekle's name and number. Not indexed; the audience page is the
 * page for search.
 */

type Params = { slug: string };

export function generateStaticParams() {
  return orgAudiences.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getOrgAudience(slug);
  if (!a) return {};
  return pageMetadata({
    title: `Medicare Help Partner sheet: ${a.kicker}`,
    description: a.description,
    path: `${ORG_HUB_PATH}/${a.slug}/sheet`,
    kicker: 'Medicare Help Partner',
    shareTitle: a.h1,
    extra: {
      robots: { index: false, follow: true },
      alternates: { canonical: `${ORG_HUB_PATH}/${a.slug}` },
    },
  });
}

export default async function OrgSheetPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const a = getOrgAudience(slug);
  if (!a) notFound();

  return (
    <section className="container py-10 print:py-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 print:hidden">
          <PrintButton resource={`org-sheet-${a.slug}`} label="Print this sheet" />
          <p className="mt-3 text-base text-ink-soft">
            Prints on one page. To email it, choose &ldquo;Save as PDF&rdquo; in the print window.
          </p>
        </div>

        <article className="rounded-2xl border-2 border-navy/20 bg-white p-8 print:rounded-none print:border-0 print:p-0">
          <p className="text-base font-semibold uppercase tracking-[0.12em] text-ember-deep">Medicare Help Partner · {a.kicker}</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink">{a.h1}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink">{a.answer}</p>

          <ul className="mt-5 grid gap-2 text-lg text-ink sm:grid-cols-2 print:grid-cols-2">
            {a.sheet.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" className="font-bold text-ember-deep">✓</span>
                {line}
              </li>
            ))}
          </ul>

          <h2 className="mt-6 font-display text-xl font-bold text-ink">How it works</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-6 text-base leading-relaxed text-ink">
            {a.steps.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>

          <h2 className="mt-6 font-display text-xl font-bold text-ink">What I do not do</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed text-ink">
            {a.whatIDont.slice(0, 4).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="mt-6 break-inside-avoid rounded-xl bg-navy-soft p-5 print:bg-transparent print:p-0">
            <p className="font-display text-2xl font-bold text-navy-deep">{advisor.name}</p>
            <p className="text-lg text-ink">
              Licensed insurance broker · NPN {advisor.npn} · Edgewater, NJ
            </p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {advisor.phone} · {advisor.email} · {site.domain}
              {ORG_HUB_PATH}/{a.slug}
            </p>
            <p className="mt-1 text-base text-ink">English · Georgian · Russian</p>
          </div>
        </article>
      </div>
    </section>
  );
}
