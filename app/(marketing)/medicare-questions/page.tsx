import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactActions } from '@/components/marketing/contact-actions';
import { CtaBand } from '@/components/marketing/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { QUESTIONS_REVIEWED, allQuestions, questionGroups } from '@/lib/medicare-questions';
import { pageMetadata } from '@/lib/page-metadata';
import { breadcrumbJsonLd, faqJsonLd, speakableJsonLd } from '@/lib/seo';
import { advisor, site } from '@/lib/site';
import { formatDate } from '@/lib/utils';

/**
 * /medicare-questions: 29 spoken-style questions, each answered in a few
 * plain sentences and linked to the deeper page (lib/medicare-questions.ts).
 *
 * Built for voice and AI answers: every question is its own heading with a
 * stable anchor, the short answer comes first, the FAQPage schema is built
 * from the same array as the visible text, and Speakable points at the
 * answers. Educational only: no plan or carrier is named.
 */

const PATH = '/medicare-questions';
const H1 = 'Medicare questions, answered out loud';

export const metadata: Metadata = pageMetadata({
  title: 'Medicare questions, answered in plain words',
  description:
    'Twenty-nine short answers to the Medicare questions people ask most: signing up, changing plans, Medigap, costs and where to get help. Each links to the full answer.',
  path: PATH,
  kicker: 'Medicare questions',
  shareTitle: '29 Medicare questions, answered plainly',
});

const pageUrl = `${site.url}${PATH}`;

export default function MedicareQuestionsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Medicare questions', url: pageUrl },
        ])}
      />
      <JsonLd data={faqJsonLd(allQuestions.map(({ question, answer }) => ({ question, answer })))} />
      <JsonLd
        data={speakableJsonLd({
          url: pageUrl,
          name: H1,
          cssSelector: ['[data-spoken-answer]'],
        })}
      />

      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              {H1}
            </h1>
            <p className="mt-5 text-xl leading-relaxed text-ink-soft">
              Twenty-nine questions people ask about Medicare, each answered in a few plain sentences.
              Every answer links to a longer page and to the official source it was checked
              against. Nothing here names a plan or an insurance company.
            </p>
            <p className="mt-4 text-lg text-ink-soft">
              Checked against official sources on {formatDate(QUESTIONS_REVIEWED)}.
            </p>
            <nav aria-label="Question topics" className="mt-8">
              <ul className="flex flex-wrap gap-3">
                {questionGroups.map((group) => (
                  <li key={group.heading}>
                    <a
                      href={`#${group.questions[0].id}`}
                      className="flex min-h-touch items-center rounded-xl border-2 border-line bg-cream px-4 text-base font-semibold text-ink-soft hover:border-navy/50 hover:text-navy"
                    >
                      {group.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      <div className="container py-14 sm:py-16">
        <div className="mx-auto max-w-[68ch]">
          {questionGroups.map((group) => (
            <section key={group.heading} className="mt-4 first:mt-0">
              <p className="mt-10 text-base font-semibold uppercase tracking-[0.12em] text-ember-deep">
                {group.heading}
              </p>
              {group.questions.map((item) => (
                <article key={item.id} id={item.id} className="scroll-mt-28 border-b border-line py-8">
                  <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">
                    <a href={`#${item.id}`} className="hover:text-navy">
                      {item.question}
                    </a>
                  </h2>
                  <p data-spoken-answer="" className="mt-3 text-lg leading-relaxed text-ink">
                    {item.answer}
                  </p>
                  <p className="mt-3 flex flex-col gap-1 text-base">
                    <Link
                      href={item.href}
                      className="inline-flex min-h-touch items-center font-semibold text-navy underline decoration-ember decoration-2 underline-offset-4 hover:text-navy-deep"
                    >
                      {item.hrefLabel} →
                    </Link>
                    <a
                      href={item.source.url}
                      rel="noopener"
                      className="inline-flex min-h-touch items-center text-ink-soft underline underline-offset-4 hover:text-navy"
                    >
                      Source: {item.source.title}
                    </a>
                  </p>
                </article>
              ))}
            </section>
          ))}

          <div className="mt-12 rounded-2xl border-2 border-navy/20 bg-navy-soft p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-navy-deep">
              Your question is not here?
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-ink">
              Ask me. I am {advisor.name}, a licensed insurance broker, and there is no fee to
              talk. If I am not the right person to help, I will tell you who is.
            </p>
            <ContactActions where="medicare-questions" className="mt-6" size="lg" />
          </div>
        </div>
      </div>

      <CtaBand
        where="medicare-questions-band"
        heading="Rather hear it than read it?"
        body={`Call or text ${advisor.phone}. You will get a real person, with no fee and no obligation to enroll.`}
      />
    </>
  );
}
