import Link from 'next/link';
import { ContactActions } from '@/components/marketing/contact-actions';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ember-deep">
          404
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
          That page is not here.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Either I moved it or the link was wrong. Either way, do not let it stop you — the
          guides are one tap away, and so am I.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/medicare-basics">Read the guides</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back to the homepage</Link>
          </Button>
        </div>

        <div className="mt-10 flex justify-center">
          <ContactActions where="404" size="md" />
        </div>
      </div>
    </div>
  );
}
