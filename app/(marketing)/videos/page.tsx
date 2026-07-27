import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Youtube } from 'lucide-react';
import { VideoEmbed } from '@/components/marketing/prose';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/motion/reveal';
import { TrustBar } from '@/components/marketing/trust-bar';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo';
import { site, social } from '@/lib/site';

type VideoItem = {
  youtubeId: string;
  title: string;
  description: string;
};

// Add published videos here in one pass: ID, title, and plain-English description.
// Keep this empty until Eric has real AegisSage videos to publish.
const videos: VideoItem[] = [];

export const metadata: Metadata = {
  title: 'Videos',
  description:
    'Plain-English Medicare videos from Eric at AegisSage. New videos will be added here as they are published.',
  alternates: { canonical: '/videos' },
  openGraph: {
    title: 'Medicare videos from Eric — AegisSage',
    description:
      'Plain-English Medicare explanations, enrollment guidance, and practical questions to ask before you choose a route.',
    images: [
      {
        url: `/api/og?title=${encodeURIComponent('Medicare videos from Eric')}&kicker=${encodeURIComponent('Watch and learn')}&subtitle=${encodeURIComponent('Plain-English guidance from AegisSage')}`,
        width: 1200,
        height: 630,
        alt: 'Medicare videos from Eric at AegisSage',
      },
    ],
  },
};

export default function VideosPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: `${site.url}/` },
          { name: 'Videos', url: `${site.url}/videos` },
        ])}
      />

      <section className="border-b border-line bg-paper">
        <div className="container py-14 sm:py-20">
          <Reveal className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
              <Youtube className="h-5 w-5" aria-hidden="true" /> Watch and learn
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              Medicare answers, in video form.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
              Short explanations for the questions people usually ask after a mailer,
              commercial, or enrollment deadline has them second-guessing everything.
            </p>
          </Reveal>
          <TrustBar className="mt-9 max-w-3xl" />
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        {videos.length === 0 ? (
          <Reveal className="mx-auto max-w-2xl rounded-3xl border border-line bg-cream p-8 text-center shadow-card sm:p-12">
            <Youtube className="mx-auto h-10 w-10 text-ember-deep" aria-hidden="true" />
            <h2 className="mt-5 font-display text-3xl font-bold tracking-[-0.025em] text-ink">
              New videos are on the way.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Eric is building a library of practical Medicare explanations. Until then,
              browse the written guides or go straight to the channel.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/medicare-basics">
                  Read Medicare Basics <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={social.youtube} target="_blank" rel="noreferrer">
                  Open YouTube <Youtube className="h-5 w-5" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {videos.map((video) => (
              <article key={video.youtubeId} className="rounded-3xl border border-line bg-cream p-5 shadow-card sm:p-7">
                <VideoEmbed youtubeId={video.youtubeId} title={video.title} caption={video.description} />
                <h2 className="mt-5 font-display text-2xl font-bold tracking-[-0.02em] text-ink">
                  {video.title}
                </h2>
              </article>
            ))}
          </div>
        )}
      </section>

      <CtaBand where="videos-cta" />
    </>
  );
}
