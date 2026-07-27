import type { Metadata } from 'next';
import { MedicareIqGame } from '@/components/tools/medicare-iq-game';
import { CtaBand } from '@/components/marketing/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/badge';
import { IQ_ROUNDS, roundById } from '@/lib/medicare-iq';
import { breadcrumbJsonLd } from '@/lib/seo';
import { site } from '@/lib/site';

const TITLE = 'Medicare IQ — how much do you actually know?';
const DESCRIPTION =
  'A short Medicare trivia round with a new question set every visit. You find out why after each answer. No signup, no email — your score stays in your browser.';

type SearchParams = Promise<{ score?: string; of?: string; round?: string }>;

/**
 * A shared result URL carries ?score=&of=&round=, and the OG image is built
 * from it — so a link someone posts says "I scored 5/6" rather than repeating
 * the generic page title. The page itself always starts a fresh round; the
 * params only shape the preview card.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { score, of, round } = await searchParams;

  const parsedScore = Number(score);
  const parsedTotal = Number(of);
  const hasScore =
    Number.isInteger(parsedScore) &&
    Number.isInteger(parsedTotal) &&
    parsedTotal > 0 &&
    parsedTotal <= 50 &&
    parsedScore >= 0 &&
    parsedScore <= parsedTotal;

  const roundTitle = roundById(round)?.title;

  const ogTitle = hasScore
    ? `I scored ${parsedScore}/${parsedTotal} on the Medicare IQ quiz`
    : 'How much do you actually know about Medicare?';
  const ogSubtitle = hasScore
    ? 'Think you can beat that? It takes about two minutes.'
    : 'A short trivia round. New questions every visit. No signup.';

  const ogUrl =
    `/api/og?title=${encodeURIComponent(ogTitle)}` +
    `&kicker=${encodeURIComponent(roundTitle ? `Medicare IQ · ${roundTitle}` : 'Medicare IQ')}` +
    `&subtitle=${encodeURIComponent(ogSubtitle)}`;

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/tools/medicare-iq' },
    openGraph: {
      title: ogTitle,
      description: DESCRIPTION,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogSubtitle,
      images: [ogUrl],
    },
  };
}

export default function MedicareIqPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Medicare IQ', url: `${site.url}/tools/medicare-iq` },
        ])}
      />
      <div className="container py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Badge tone="ember">Free · about 2 minutes · {IQ_ROUNDS.length} rotating rounds</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">
            Medicare IQ
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Most people score worse than they expect, and that is not a knock — this system
            is confusing on purpose in places. Come back for a different set of questions.
          </p>
        </div>

        <div className="mt-12">
          <MedicareIqGame />
        </div>
      </div>

      <CtaBand
        where="medicare-iq-cta"
        heading="Questions the quiz did not answer?"
        body="Those are usually the ones worth asking out loud. Call or text me — no obligation, no fee to you, and no pitch."
      />
    </>
  );
}
