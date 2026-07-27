import { Reveal } from '@/components/motion/reveal';
import { ContactActions } from './contact-actions';
import { AdvisorAvatar } from './trust-bar';
import { advisor } from '@/lib/site';

/**
 * The recurring "talk to a person" block. Trust signals sit inside the same
 * card as the buttons by design — the rule is that a license badge, a photo
 * and a real phone number appear next to every CTA, not only on About.
 */
export function CtaBand({
  where,
  heading = 'Still not sure what applies to you?',
  body = 'That is the normal state of things. Call or text me and we will sort it out in about ten minutes — no script, no obligation, no fee to you.',
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
                <p className="text-sm text-white/70">
                  NPN {advisor.npn} · {advisor.yearsLicensed} years licensed
                </p>
              </div>
            </div>
            <p className="mt-5 text-base leading-relaxed text-white/80">
              You will reach me, not a queue. If I am with someone, leave a message or send a
              text and you will hear back the same day.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
