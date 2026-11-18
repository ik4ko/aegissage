import { PrintFlyerButton } from '@/components/marketing/print-flyer-button';
import { TpmoDisclaimer } from '@/components/marketing/tpmo-disclaimer';
import { advisor, compliance, site } from '@/lib/site';
import { tpmoAreasFor } from '@/lib/tpmo';
import {
  LANGUAGES,
  WORKSHOP_COVERS,
  WORKSHOP_TITLE,
  formatTime,
  formatWorkshopDate,
  type Workshop,
} from '@/lib/workshops';

/**
 * One-page printable flyer for a workshop session. With no session, date,
 * time and place are blank lines to fill in by hand.
 *
 * The site footer (and with it the TPMO disclaimer) is hidden when printing,
 * so the flyer carries its own copy of the disclaimer, rendered by the same
 * component so the wording cannot drift. Bergen County figures, scoped
 * "in Bergen County, NJ" (lib/tpmo.ts).
 */
export function WorkshopFlyer({ workshop }: { workshop?: Workshop }) {
  const blank = <span className="inline-block min-w-[16rem] border-b-2 border-ink align-bottom">&nbsp;</span>;
  const tpmoAreas = tpmoAreasFor('/workshops');

  return (
    <section className="container max-w-3xl py-10 print:max-w-none print:py-0">
      <div className="mb-8 flex flex-wrap items-center gap-4 print:hidden">
        <PrintFlyerButton resource={`workshop-flyer-${workshop?.id ?? 'blank'}`} />
        <p className="text-base text-ink-soft">Prints on one letter-size page. Save as PDF from the print window to email it.</p>
      </div>

      <article data-print-flyer="" className="rounded-3xl border-2 border-ink p-8 print:rounded-none print:border-0 print:p-0">
        <p className="text-lg font-semibold uppercase tracking-[0.12em] text-ember-deep">
          Free educational workshop
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-[-0.03em] text-ink sm:text-5xl print:text-[30pt]">
          {WORKSHOP_TITLE}
        </h1>
        <p className="mt-4 text-xl leading-relaxed text-ink print:mt-2 print:text-[14pt] print:leading-snug">
          Got a letter saying your Medicare Advantage plan ends in 2027? You keep Medicare. Come
          and learn your dates and your choices, in plain words.
        </p>

        <dl className="mt-6 grid gap-3 text-xl text-ink print:mt-3 print:gap-1 print:text-[14pt]">
          <div>
            <dt className="inline font-bold">Date: </dt>
            <dd className="inline">{workshop ? formatWorkshopDate(workshop.date) : blank}</dd>
          </div>
          <div>
            <dt className="inline font-bold">Time: </dt>
            <dd className="inline">
              {workshop ? `${formatTime(workshop.start)} to ${formatTime(workshop.end)}` : blank}
            </dd>
          </div>
          <div>
            <dt className="inline font-bold">Place: </dt>
            <dd className="inline">
              {workshop
                ? [workshop.venue, workshop.room, workshop.venueAddress, `${workshop.town}, ${workshop.state}`]
                    .filter(Boolean)
                    .join(', ')
                : blank}
            </dd>
          </div>
          <div>
            <dt className="inline font-bold">Language: </dt>
            <dd className="inline">
              {workshop
                ? `${LANGUAGES[workshop.language].label}${workshop.language === 'en' ? '' : ` (${LANGUAGES[workshop.language].native})`}`
                : 'English, Georgian (ქართული) or Russian (Русский)'}
            </dd>
          </div>
        </dl>

        <h2 className="mt-6 font-display text-2xl font-bold text-ink print:mt-3 print:text-[16pt]">What we will cover</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-lg leading-snug text-ink print:space-y-0 print:text-[12pt]">
          {WORKSHOP_COVERS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <p className="mt-5 rounded-xl border-2 border-line p-4 text-lg font-semibold text-ink print:mt-3 print:p-2 print:text-[12pt]">
          Education only. No plans are sold, no applications are taken, and you do not need your
          Medicare number.
        </p>

        <h2 className="mt-6 font-display text-2xl font-bold text-ink print:mt-3 print:text-[16pt]">Save a seat</h2>
        <p className="mt-2 text-xl text-ink print:mt-1 print:text-[14pt]">
          Call or text <strong>{advisor.phone}</strong> or visit{' '}
          <strong>{site.domain}/workshops</strong>
        </p>
        <p className="mt-1 text-base text-ink-soft">{compliance.licensedAgentNotice}</p>

        <p className="mt-5 text-base text-ink print:mt-2 print:text-[11pt]">
          Presented by {advisor.name}, licensed insurance broker, {site.name}. NPN {advisor.npn}.
          Based in {advisor.basedIn}.
        </p>

        <div className="mt-5 border-t-2 border-line pt-3 text-sm leading-snug print:mt-3 print:pt-2 print:text-[10pt] text-ink-soft [&_a]:!text-ink-soft [&_a]:!no-underline">
          <TpmoDisclaimer areas={tpmoAreas} />
        </div>
      </article>
    </section>
  );
}
