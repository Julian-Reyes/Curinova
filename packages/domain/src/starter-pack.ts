import type { Locale } from './locale';
import type { Cluster, Concept, Topic } from './schemas/content';

/** Most photo bytes the starter pack may download (§15, D28). */
export const STARTER_PACK_BUDGET_BYTES = 3_000_000;

/**
 * The starter pack (§12, D28): lessons whose Discover photos are saved for offline use right
 * after onboarding. The first lessons of each topic's first trail in `locale`, taken in turn
 * across topics (one from each, then the next from each…), until the next photo would pass
 * the budget. `photoBytes` is the size of a lesson's full Discover file, the largest the app
 * may load; lessons without one are skipped.
 */
export function starterPack(
  content: { topics: Topic[]; clusters: Cluster[]; concepts: Concept[] },
  locale: Locale,
  photoBytes: (conceptId: string) => number | undefined,
  budget = STARTER_PACK_BUDGET_BYTES,
): { conceptIds: string[]; bytes: number } {
  const concepts = new Map(content.concepts.map((c) => [c.id, c]));
  const queues = [...content.topics]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((topic) =>
      (content.clusters.find((c) => c.topicId === topic.id)?.conceptIds ?? []).flatMap((id) => {
        const concept = concepts.get(id);
        const bytes = photoBytes(id);
        return concept?.variants.includes(locale) && concept.media?.discover && bytes
          ? [{ id, bytes }]
          : [];
      }),
    );
  const conceptIds: string[] = [];
  let bytes = 0;
  for (let round = 0; queues.some((q) => round < q.length); round++) {
    for (const queue of queues) {
      const next = queue[round];
      if (!next) continue;
      if (bytes + next.bytes > budget) return { conceptIds, bytes };
      conceptIds.push(next.id);
      bytes += next.bytes;
    }
  }
  return { conceptIds, bytes };
}
