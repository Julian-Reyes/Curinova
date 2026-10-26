import { describe, expect, it } from 'vitest';
import { buildLibrary, normalize } from './library';
import type { ContentLibrary } from '@lumen/domain';

const L = (pt: string, en: string) => ({ 'pt-BR': pt, en });
function raw(withEnglish = false): ContentLibrary {
  const variant = (locale: 'pt-BR' | 'en', title: string) => ({
    id: `lesson_heart__${locale}`,
    conceptId: 'concept_heart',
    locale,
    slug: `heart-${locale.toLowerCase()}`,
    title,
    hook: 'h',
    summary: 's',
    cardBlocks: [{ type: 'paragraph' as const, text: 'um dois três quatro cinco' }],
    deepDiveBlocks: [],
    heroMedia: {
      type: 'illustration' as const,
      illustrationId: 'x',
      alt: 'a',
      license: 'original' as const,
    },
    claims: [],
    sourceIds: [],
    quizIds: [`q_heart_1__${locale}`],
    contentLicense: 'pending' as const,
    generation: null,
    reviewStatus: 'draft' as const,
    publicationStatus: 'draft' as const,
    reviewedBy: null,
    reviewedAt: null,
    reviewAfter: null,
    publishedAt: null,
    updatedAt: '2026-10-23T00:00:00Z',
  });
  const q = (locale: 'pt-BR' | 'en') => ({
    id: `q_heart_1__${locale}`,
    questionGroupId: 'qg_heart_1',
    conceptId: 'concept_heart',
    locale,
    prompt: `p-${locale}`,
    options: [
      { id: 'a', text: 'a' },
      { id: 'b', text: 'b' },
      { id: 'c', text: 'c' },
    ],
    correctOptionId: 'a',
    explanation: 'e',
    claimIds: [],
    status: 'draft' as const,
  });
  return {
    topics: [
      {
        id: 'body',
        slug: L('corpo', 'body'),
        name: L('Corpo', 'Body'),
        description: L('d', 'd'),
        icon: 'body',
        accentColor: '#D8574B',
        sortOrder: 0,
      },
    ],
    clusters: [
      {
        id: 'cluster_heart',
        topicId: 'body',
        slug: L('coracao', 'heart'),
        title: L('Coração', 'Heart'),
        hook: L('h', 'h'),
        conceptIds: ['concept_heart'],
        links: [],
      },
    ],
    concepts: [
      {
        id: 'concept_heart',
        topicId: 'body',
        clusterId: 'cluster_heart',
        clusterOrder: 1,
        tags: ['cardio'],
        difficulty: 'beginner',
        related: [],
        variants: withEnglish ? ['pt-BR', 'en'] : ['pt-BR'],
      },
    ],
    variants: [
      variant('pt-BR', 'Quantas vezes o coração bate?'),
      ...(withEnglish ? [variant('en', 'How often does the heart beat?')] : []),
    ],
    questions: [q('pt-BR'), q('en')],
    sources: [],
  };
}

describe('library', () => {
  const lib = buildLibrary(raw(), 'preview');

  it('searches accent-insensitively in the active locale', () => {
    expect(normalize('Coração')).toBe('coracao');
    expect(lib.search('coracao bate', 'pt-BR').map((c) => c.id)).toEqual(['concept_heart']);
    expect(lib.search('cardio', 'pt-BR')).toHaveLength(1);
    expect(lib.search('lua', 'pt-BR')).toHaveLength(0);
  });

  it('falls back to the other locale when a variant is missing', () => {
    expect(lib.variant('concept_heart', 'en')?.locale).toBe('pt-BR');
  });

  it('finds the question for a group in the current locale', () => {
    const bilingual = buildLibrary(raw(true), 'preview');
    expect(bilingual.questionForGroup('qg_heart_1', 'en')?.id).toBe('q_heart_1__en');
    expect(bilingual.questionForGroup('qg_heart_1', 'pt-BR')?.id).toBe('q_heart_1__pt-BR');
    // Without an English variant, the Portuguese question is used.
    expect(lib.questionForGroup('qg_heart_1', 'en')?.id).toBe('q_heart_1__pt-BR');
  });

  it('resolves slugs from either locale', () => {
    expect(lib.clusterBySlug('heart', 'pt-BR')?.id).toBe('cluster_heart');
    expect(lib.topicBySlug('corpo', 'en')?.id).toBe('body');
  });

  it('shows nothing in the production channel until content is reviewed', () => {
    expect(buildLibrary(raw(), 'production').concepts).toHaveLength(0);
  });
});
