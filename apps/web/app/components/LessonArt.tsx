import {
  lessonImageUrl,
  smallWidth,
  type Concept,
  type LessonVariant,
  type MediaSlot,
} from '@lumen/domain';
import { useState } from 'react';
import { Illustration } from './Illustration';

/** How wide each slot is drawn, for the browser to pick the full or "sm" file. */
const SIZES: Record<MediaSlot | 'thumb', string> = {
  discover: '(min-width: 1024px) 500px, 100vw',
  deeper: '(min-width: 1024px) 560px, 92vw',
  review: '(min-width: 1024px) 520px, 90vw',
  diagram: '(min-width: 1024px) 520px, 88vw',
  thumb: '(min-width: 1024px) 280px, 45vw',
};

/**
 * The file URLs and sizes for a lesson image in one slot. The offline saver (D28) loads
 * the same ones, so the browser picks, and saves, the file the card will show.
 */
export function lessonImageSources(
  conceptId: string,
  slot: MediaSlot | 'thumb',
  image: { width: number; hash: string },
): { src: string; srcSet: string; sizes: string } {
  const source = slot === 'thumb' ? 'deeper' : slot;
  const full = lessonImageUrl(conceptId, source, 'full', image.hash);
  const sm = lessonImageUrl(conceptId, source, 'sm', image.hash);
  return {
    src: full,
    srcSet: `${sm} ${smallWidth(image.width)}w, ${full} ${image.width}w`,
    sizes: SIZES[slot],
  };
}

/**
 * A lesson's image for one slot (D15/P10): the processed photo or artwork when the lesson
 * has one, otherwise the lesson's original diagram on a topic-tinted panel. "thumb" uses
 * the Go Deeper image. If the image can't load (e.g. offline and not cached, P15), the
 * diagram takes its place, so a card never looks broken.
 */
export function LessonArt({
  concept,
  variant,
  slot,
  accent,
  priority = false,
  className = '',
  plateClassName = '',
}: {
  concept: Concept;
  variant: LessonVariant;
  slot: MediaSlot | 'thumb';
  accent: string;
  /** The image is likely on screen first: load it eagerly at high priority. */
  priority?: boolean;
  className?: string;
  plateClassName?: string;
}) {
  const source = slot === 'thumb' ? 'deeper' : slot;
  const image = concept.media?.[source];
  const [failed, setFailed] = useState(false);

  if (image && !failed) {
    const alt = image.alt[variant.locale] ?? image.alt.en ?? image.alt['pt-BR'] ?? '';
    return (
      <img
        {...lessonImageSources(concept.id, slot, image)}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={`lesson-art-img ${className}`}
        onError={() => {
          setFailed(true);
        }}
      />
    );
  }
  return (
    <div
      className={`lesson-art-plate ${className} ${plateClassName}`}
      role="img"
      aria-label={variant.heroMedia.alt}
    >
      <Illustration
        id={
          variant.heroMedia.type === 'illustration' ? variant.heroMedia.illustrationId : 'fixture'
        }
        accent={accent}
        className="lesson-art-svg"
      />
    </div>
  );
}

/** Minimal on-screen credit for a lesson's images (P11): licensed photos only. */
export function imageCredits(concept: Concept): string[] {
  const credits = new Set<string>();
  for (const image of Object.values(concept.media ?? {})) {
    const origin = image?.origin;
    if (origin?.kind === 'licensed')
      credits.add(origin.platform ? `${origin.creator}, ${origin.platform}` : origin.creator);
  }
  return [...credits];
}
