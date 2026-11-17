import { medigapLineFor } from '@/lib/medigap';

/**
 * One fixed sentence naming the Medigap carriers for a state. Renders nothing
 * for a state whose carriers are unconfirmed. See lib/medigap.ts for the
 * rules; do not add prices, rankings or logos here.
 */
export function MedigapLine({ state }: { state: string }) {
  const line = medigapLineFor(state);
  if (!line) return null;
  return <p data-medigap-line>{line}</p>;
}
