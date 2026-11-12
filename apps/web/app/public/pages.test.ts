import { SITE_URL, type ContentLibrary, type LessonVariant } from '@lumen/domain';
import { describe, expect, it } from 'vitest';
import { buildLibrary } from '../data/library';
import { headTags, lessonPage, topicPage, trailPage } from './pages';
import { publicLocaleOf, publicPath } from './paths';

const L = (pt: string, en: string) => ({ 'pt-BR': pt, en });

function variant(
  conceptId: string,
  locale: 'pt-BR' | 'en',
  slug: string,
  title: string,
  published: boolean,
): LessonVariant {
  return {
    id: `lesson_${conceptId.replace('concept_', '')}__${locale}`,
    conceptId,
    locale,
    slug,
    title,
    hook: 'hook',
    summary: 'summary',
    cardBlocks: [
      { type: 'paragraph', text: 'um dois três' },
      { type: 'takeaway', text: 'the takeaway' },
    ],
    deepDiveBlocks: [
      { type: 'heading', text: 'More' },
      { type: 'paragraph', text: 'deeper text' },
    ],
    heroMedia: { type: 'illustration', illustrationId: 'x', alt: 'a', license: 'original' },
    claims: [],
    sourceIds: [],
    quizIds: [],
    contentLicense: 'pending',
    generation: null,
    reviewStatus: published ? 'reviewed' : 'draft',
    publicationStatus: published ? 'published' : 'draft',
    reviewedBy: published ? 'Julian' : null,
    reviewedAt: published ? '2026-11-01T00:00:00Z' : null,
    reviewAfter: null,
    publishedAt: published ? '2026-11-01T00:00:00Z' : null,
    updatedAt: '2026-11-02T00:00:00Z',
  };
}

const concept = (id: string, order: number) => ({
  id,
  topicId: 'body',
  clusterId: 'cluster_heart',
  clusterOrder: order,
  tags: [],
  difficulty: 'beginner' as const,
  related: [],
  variants: ['pt-BR' as const, 'en' as const],
});

const raw: ContentLibrary = {
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
      conceptIds: ['concept_beat', 'concept_draft'],
      links: [],
    },
  ],
  concepts: [concept('concept_beat', 1), concept('concept_draft', 2)],
  variants: [
    variant('concept_beat', 'pt-BR', 'quantas-batidas', 'Quantas batidas?', true),
    variant('concept_beat', 'en', 'how-many-beats', 'How many beats?', true),
    variant('concept_draft', 'pt-BR', 'rascunho', 'Rascunho', false),
  ],
  questions: [],
  sources: [],
};

describe('public pages', () => {
  const lib = buildLibrary(raw, 'preview');

  it('builds paths and reads the language back', () => {
    expect(publicPath('pt-BR', 'lesson', 'x')).toBe('/pt/licao/x/');
    expect(publicPath('en', 'trail', 'y')).toBe('/en/trail/y/');
    expect(publicLocaleOf('/en/lesson/x/')).toBe('en');
    expect(publicLocaleOf('/app/discover')).toBeUndefined();
  });

  it('makes a page for a published lesson, linking both languages and the app', () => {
    const page = lessonPage(lib, 'pt-BR', 'quantas-batidas');
    expect(page?.head.alternates).toEqual({
      'pt-BR': '/pt/licao/quantas-batidas/',
      en: '/en/lesson/how-many-beats/',
    });
    expect(page?.takeaway).toBe('the takeaway');
    expect(page?.sections).toEqual([{ title: 'More', paragraphs: ['deeper text'] }]);
    expect(page?.appHref).toBe('/app/trail/coracao?start=concept_beat');
    // The draft in the same trail is left out of the trail list.
    expect(page?.trail.lessons.map((l) => l.title)).toEqual(['Quantas batidas?']);
  });

  it('never makes a page for an unpublished lesson', () => {
    expect(lessonPage(lib, 'pt-BR', 'rascunho')).toBeNull();
    expect(lessonPage(lib, 'en', 'quantas-batidas')).toBeNull();
  });

  it('makes trail and topic pages with only published lessons', () => {
    expect(trailPage(lib, 'en', 'heart')?.lessons.map((l) => l.path)).toEqual([
      '/en/lesson/how-many-beats/',
    ]);
    expect(topicPage(lib, 'pt-BR', 'corpo')?.trails).toHaveLength(1);
  });

  it('writes canonical, hreflang, Open Graph and JSON-LD tags', () => {
    const page = lessonPage(lib, 'en', 'how-many-beats');
    if (!page) throw new Error('no page');
    const tags = headTags(page.head);
    expect(tags).toContainEqual({
      tagName: 'link',
      rel: 'canonical',
      href: `${SITE_URL}/en/lesson/how-many-beats/`,
    });
    expect(tags).toContainEqual({
      tagName: 'link',
      rel: 'alternate',
      hrefLang: 'x-default',
      href: `${SITE_URL}/pt/licao/quantas-batidas/`,
    });
    expect(tags).toContainEqual({ property: 'og:locale', content: 'en_GB' });
    expect(tags).toContainEqual({
      property: 'og:image',
      content: `${SITE_URL}/og/en/lesson/how-many-beats.jpg`,
    });
    expect(tags.some((t) => 'script:ld+json' in t)).toBe(true);
  });
});
