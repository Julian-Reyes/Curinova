import type { MediaSlot } from './schemas/content';

/** Folder name for a lesson's images: the concept ID without its "concept_" prefix. */
export function mediaKey(conceptId: string): string {
  return conceptId.replace(/^(fixture_)?concept_/, '$1');
}

/**
 * Public URL of a processed lesson image; "sm" is the 2/3-size file. `version` (the image's
 * file hash) busts the offline cache when an image is replaced.
 */
export function lessonImageUrl(
  conceptId: string,
  slot: MediaSlot,
  size: 'full' | 'sm',
  version?: string,
): string {
  const path = `/media/${mediaKey(conceptId)}/${slot}${size === 'sm' ? '-sm' : ''}.webp`;
  return version === undefined ? path : `${path}?v=${version}`;
}

/** Width of the "sm" file for a full-size width (the media script writes both). */
export function smallWidth(width: number): number {
  return Math.round((width * 2) / 3);
}

/** Public URL of a topic's picture (Explore tile, topic page). */
export function topicImageUrl(topicId: string, size: 'full' | 'sm', version?: string): string {
  const path = `/media/topics/${topicId}${size === 'sm' ? '-sm' : ''}.webp`;
  return version === undefined ? path : `${path}?v=${version}`;
}

/** Public URL of a public page's link-preview image (1200×630 JPEG, made at build time, §7.2). */
export function ogImageUrl(
  locale: 'pt-BR' | 'en',
  kind: 'lesson' | 'topic' | 'trail' | 'page',
  slug: string,
): string {
  return `/og/${locale === 'pt-BR' ? 'pt' : 'en'}/${kind}/${slug}.jpg`;
}
