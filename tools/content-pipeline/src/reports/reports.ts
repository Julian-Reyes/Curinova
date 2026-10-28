import { LOCALES, isPublishedVariant, type ContentLibrary, type Locale } from '@lumen/domain';

export interface TopicStats {
  topicId: string;
  trails: number;
  concepts: number;
  /** Per locale: published (reviewed + published), reviewed but unpublished, drafts. */
  byLocale: Record<Locale, { published: number; reviewed: number; draft: number }>;
}

/** Coverage by topic and locale, and the review backlog (§5.7 content:stats). */
export function contentStats(lib: ContentLibrary): TopicStats[] {
  return [...lib.topics]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((topic) => {
      const conceptIds = new Set(
        lib.concepts.filter((c) => c.topicId === topic.id).map((c) => c.id),
      );
      const byLocale = Object.fromEntries(
        LOCALES.map((locale) => {
          const vs = lib.variants.filter((v) => v.locale === locale && conceptIds.has(v.conceptId));
          return [
            locale,
            {
              published: vs.filter(isPublishedVariant).length,
              reviewed: vs.filter((v) => v.reviewStatus === 'reviewed' && !isPublishedVariant(v))
                .length,
              draft: vs.filter((v) => v.reviewStatus === 'draft' || v.reviewStatus === 'in_review')
                .length,
            },
          ];
        }),
      ) as TopicStats['byLocale'];
      return {
        topicId: topic.id,
        trails: lib.clusters.filter((c) => c.topicId === topic.id).length,
        concepts: conceptIds.size,
        byLocale,
      };
    });
}

export interface DueReview {
  variantId: string;
  reviewAfter: string;
}

/** Published variants past their reviewAfter date (§5.7 content:due-review; reports come in P1). */
export function dueForReview(lib: ContentLibrary, now: Date): DueReview[] {
  return lib.variants
    .filter(
      (v) => isPublishedVariant(v) && v.reviewAfter !== null && new Date(v.reviewAfter) <= now,
    )
    .map((v) => ({ variantId: v.id, reviewAfter: v.reviewAfter ?? '' }))
    .sort((a, b) => a.reviewAfter.localeCompare(b.reviewAfter));
}
