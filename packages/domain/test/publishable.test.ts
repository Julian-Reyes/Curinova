import { describe, expect, it } from 'vitest';
import { selectContent } from '../src/publishable';
import type {
  Cluster,
  Concept,
  ContentLibrary,
  LessonVariant,
  QuizQuestion,
  Topic,
} from '../src/schemas/content';

function lib(): ContentLibrary {
  const topic = (id: string, fixture?: true) => ({ id, ...(fixture ? { fixture } : {}) }) as Topic;
  const cluster = (id: string, topicId: string, conceptIds: string[], fixture?: true) =>
    ({ id, topicId, conceptIds, links: [], ...(fixture ? { fixture } : {}) }) as unknown as Cluster;
  const concept = (id: string, clusterId: string, fixture?: true) =>
    ({
      id,
      clusterId,
      related: [],
      variants: ['pt-BR', 'en'],
      ...(fixture ? { fixture } : {}),
    }) as unknown as Concept;
  const variant = (
    conceptId: string,
    locale: 'pt-BR' | 'en',
    status: 'published' | 'draft',
    fixture?: true,
  ) =>
    ({
      id: `${conceptId}__${locale}`,
      conceptId,
      locale,
      reviewStatus: status === 'published' ? 'reviewed' : 'draft',
      publicationStatus: status,
      quizIds: [`q_${conceptId}__${locale}`],
      sourceIds: [],
      ...(fixture ? { fixture } : {}),
    }) as unknown as LessonVariant;
  const q = (id: string, fixture?: true) =>
    ({ id, ...(fixture ? { fixture } : {}) }) as unknown as QuizQuestion;
  return {
    topics: [topic('space'), topic('fixture_topic', true)],
    clusters: [
      cluster('cluster_moon', 'space', ['concept_pub', 'concept_draft']),
      cluster('fixture_cluster', 'fixture_topic', ['fixture_concept'], true),
    ],
    concepts: [
      concept('concept_pub', 'cluster_moon'),
      concept('concept_draft', 'cluster_moon'),
      concept('fixture_concept', 'fixture_cluster', true),
    ],
    variants: [
      variant('concept_pub', 'pt-BR', 'published'),
      variant('concept_pub', 'en', 'published'),
      variant('concept_draft', 'pt-BR', 'draft'),
      variant('fixture_concept', 'pt-BR', 'published', true),
      variant('fixture_concept', 'en', 'published', true),
    ],
    questions: [
      q('q_concept_pub__pt-BR'),
      q('q_concept_pub__en'),
      q('q_concept_draft__pt-BR'),
      q('q_fixture_concept__pt-BR', true),
    ],
    sources: [],
  };
}

describe('selectContent', () => {
  it('production: only reviewed + published, never fixtures', () => {
    const out = selectContent(lib(), 'production');
    expect(out.variants.map((v) => v.id)).toEqual(['concept_pub__pt-BR', 'concept_pub__en']);
    expect(out.concepts.map((c) => c.id)).toEqual(['concept_pub']);
    expect(out.clusters[0]?.conceptIds).toEqual(['concept_pub']);
    expect(out.topics.map((t) => t.id)).toEqual(['space']);
    expect(out.questions.map((q) => q.id)).toEqual(['q_concept_pub__pt-BR', 'q_concept_pub__en']);
  });

  it('preview: includes drafts but still excludes fixtures', () => {
    const out = selectContent(lib(), 'preview');
    expect(out.variants.some((v) => v.fixture === true)).toBe(false);
    expect(out.concepts.map((c) => c.id)).toEqual(['concept_pub', 'concept_draft']);
    expect(out.concepts[1]?.variants).toEqual(['pt-BR']);
  });

  it('fixtures: only fixtures', () => {
    const out = selectContent(lib(), 'fixtures');
    expect(out.topics.map((t) => t.id)).toEqual(['fixture_topic']);
    expect(out.variants.every((v) => v.fixture === true)).toBe(true);
  });
});
