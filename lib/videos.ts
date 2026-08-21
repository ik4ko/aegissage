/**
 * Video registry for /videos.
 *
 * ── Rules ─────────────────────────────────────────────────────────────────
 *  1. Real, published AegisSage videos only. No test IDs, no placeholders,
 *     no "example" entries — anything in this array renders in production.
 *  2. `description` is plain English written for a reader, not a keyword
 *     string. It is used as the figure caption under the player.
 *  3. When the first real videos land, add VideoObject structured data for
 *     the videos ACTUALLY embedded on the page, using accurate `uploadDate`
 *     and `duration` taken from YouTube — not estimated.
 *
 * The array is intentionally empty until Erekle publishes. /videos renders a
 * genuine "coming soon" state rather than filler.
 */

export type VideoItem = {
  /** YouTube video ID only — not a full URL. */
  youtubeId: string;
  title: string;
  /** Plain-English summary, shown as the caption. */
  description: string;
  /** ISO 8601 date (YYYY-MM-DD), if known. */
  publishDate?: string;
  /** Optional grouping label, e.g. 'Enrollment' or 'Plan basics'. */
  category?: string;
};

export const videos: VideoItem[] = [];

/** Newest first when publish dates exist; undated entries keep their order. */
export function getVideos(): VideoItem[] {
  return [...videos].sort((a, b) => {
    if (!a.publishDate || !b.publishDate) return 0;
    return b.publishDate.localeCompare(a.publishDate);
  });
}
