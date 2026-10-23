import type { Locale } from './locale';

export const CARD_WORDS_MIN = 80;
export const CARD_WORDS_MAX = 150;
export const TAKEAWAY_WORDS_MAX = 25;
export const DEEP_DIVE_WORDS_MAX = 400;

/** Average silent reading speed used for the displayed reading time. */
const WORDS_PER_MINUTE = 200;

const segmenters = new Map<Locale, Intl.Segmenter>();

/**
 * Counts words with Intl.Segmenter so accented words ("não", "coração") count as one.
 * Numbers count as words; punctuation does not. Hyphenated compounds count per part.
 */
export function countWords(text: string, locale: Locale): number {
  let segmenter = segmenters.get(locale);
  if (segmenter === undefined) {
    segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
    segmenters.set(locale, segmenter);
  }
  let count = 0;
  for (const segment of segmenter.segment(text)) {
    if (segment.isWordLike === true) count += 1;
  }
  return count;
}

/** Reading time in seconds, rounded up to the nearest 15 s, never below 15 s. */
export function readingTimeSeconds(words: number): number {
  const seconds = (words / WORDS_PER_MINUTE) * 60;
  return Math.max(15, Math.ceil(seconds / 15) * 15);
}
