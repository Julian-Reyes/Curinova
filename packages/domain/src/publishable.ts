import type { ContentLibrary, LessonVariant } from './schemas/content';

/**
 * Which content a build may include.
 * - production: reviewed + published variants only; fixtures never.
 * - preview: also unreviewed drafts (shown with a "draft" label); fixtures never.
 * - fixtures: fixtures only (tests and development tooling).
 */
export type ContentChannel = 'production' | 'preview' | 'fixtures';

export function isPublishedVariant(v: LessonVariant): boolean {
  return v.publicationStatus === 'published' && v.reviewStatus === 'reviewed';
}

function variantAllowed(v: LessonVariant, channel: ContentChannel): boolean {
  if (channel === 'fixtures') return v.fixture === true;
  if (v.fixture === true) return false;
  if (channel === 'production') return isPublishedVariant(v);
  return v.reviewStatus !== 'rejected' && v.publicationStatus !== 'unpublished';
}

/** Pure selector used by the content build (M3), link checker (M3) and the app. */
export function selectContent(lib: ContentLibrary, channel: ContentChannel): ContentLibrary {
  const wantFixture = channel === 'fixtures';
  const keep = (item: { fixture?: true | undefined }) => (item.fixture === true) === wantFixture;

  const variants = lib.variants.filter((v) => variantAllowed(v, channel));
  const variantIds = new Set(variants.map((v) => v.id));
  const conceptIds = new Set(variants.map((v) => v.conceptId));
  const quizIds = new Set(variants.flatMap((v) => v.quizIds));
  const sourceIds = new Set(variants.flatMap((v) => v.sourceIds));

  const concepts = lib.concepts
    .filter((c) => keep(c) && conceptIds.has(c.id))
    .map((c) => ({
      ...c,
      variants: c.variants.filter((locale) =>
        variants.some((v) => v.conceptId === c.id && v.locale === locale && variantIds.has(v.id)),
      ),
      related: c.related.filter((r) => conceptIds.has(r.conceptId)),
    }));

  const clusters = lib.clusters
    .filter(keep)
    .map((cl) => ({ ...cl, conceptIds: cl.conceptIds.filter((id) => conceptIds.has(id)) }))
    .filter((cl) => cl.conceptIds.length > 0);
  const clusterIds = new Set(clusters.map((cl) => cl.id));

  return {
    topics: lib.topics.filter((t) => keep(t) && clusters.some((cl) => cl.topicId === t.id)),
    clusters: clusters.map((cl) => ({
      ...cl,
      links: cl.links.filter((l) => clusterIds.has(l.clusterId)),
    })),
    concepts,
    variants,
    questions: lib.questions.filter((q) => keep(q) && quizIds.has(q.id)),
    sources: lib.sources.filter((s) => keep(s) && sourceIds.has(s.id)),
  };
}
