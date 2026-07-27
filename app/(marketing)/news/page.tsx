import type { Metadata } from 'next';
import Link from 'next/link';
import { NewsCard } from '@/components/marketing/news-card';
import { CtaBand } from '@/components/marketing/cta-band';
import { TrustBar } from '@/components/marketing/trust-bar';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { getArticles } from '@/lib/content';

const TITLE = 'Medicare News & Updates';
const DESCRIPTION =
  'Short, frequent updates: deadline reminders, plan-year changes, rule changes and the myth of the week. The things worth knowing without reading a whole guide.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/news' },
  openGraph: {
    title: `${TITLE} — ${'AegisSage'}`,
    description: DESCRIPTION,
    images: [
      {
        url:
          `/api/og?title=${encodeURIComponent('Medicare news, without the noise')}` +
          `&kicker=${encodeURIComponent('Updates')}` +
          `&subtitle=${encodeURIComponent('Deadline reminders, rule changes and the myth of the week.')}`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
};

export default function NewsPage() {
  const items = getArticles('news');

  return (
    <>
      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
              Updates
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              Medicare news, without the noise.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
              Short items, posted often. Deadlines that are coming up, rules that changed,
              and the myths I hear most that week. Nothing here takes more than a minute.
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <TrustBar className="mt-9 max-w-3xl" />
          </Reveal>
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        {items.length === 0 ? (
          <p className="text-lg text-ink-soft">
            Nothing posted yet. Check back — this updates often.
          </p>
        ) : (
          <RevealGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <RevealItem key={item.href}>
                <NewsCard item={item} from="index" headingLevel={2} className="h-full" />
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        <Reveal className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/tools/medicare-iq">Test your Medicare IQ →</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/medicare-basics">Read the full guides</Link>
          </Button>
        </Reveal>
      </section>

      <CtaBand
        where="news-cta"
        heading="Something here apply to you?"
        body="If one of these made you wonder whether it affects your situation, that is exactly the kind of question worth a phone call. No fee, no obligation."
      />
    </>
  );
}
