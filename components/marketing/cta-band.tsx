import { Reveal } from '@/components/motion/reveal';
import { ContactActions } from './contact-actions';
import { AdvisorAvatar } from './trust-bar';
import { advisor } from '@/lib/site';

/**
 * The recurring "talk to a person" block. Trust signals sit inside the same
 * card as the buttons by design — the advisor, a photo and a real phone number
 * appear next to every CTA, not only on About.
 */
export function CtaBand({
  where,
  heading = 'Still not sure what applies to you?',
  body = 'That is the normal state of things. Call or text Eric and talk it through — no script, no obligation, and no fee to you for the conversation.',
}: {
  where: string;
  heading?: string;
  body?: string;
}) {
  return (
    <section className="container py-14 sm:py-20">
      <Reveal className="overflow-hidden rounded-3xl border border-navy-deep/20 bg-navy-deep text-white shadow-lift">
        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 max-w-xl text-lg text-white/80">{body}</p>

            <ContactActions where={where} className="mt-8" size="lg" onDark />
          </div>

          <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
            <div className="flex items-center gap-4">
              <AdvisorAvatar size={60} />
              <div>
                <p className="font-display text-lg font-semibold text-white">{advisor.name}</p>
                <p className="text-sm text-white/70">{advisor.credential}</p>
              </div>
            </div>
            {/*
              No response-time promise here. There is no system behind this
              site that can guarantee one — it is one person with a phone — and
              a turnaround claim the advisor cannot always meet is the kind of
              small broken promise that costs trust on the first contact.
            */}
            <p className="mt-5 text-base leading-relaxed text-white/80">
              You reach Eric directly, not a call center. If he is with someone, leave a
              message or send a text and he will get back to you.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
