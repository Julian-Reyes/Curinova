import type { ContentTree } from '../src/validate/tree';
import { validateContent, type Issue } from '../src/validate/validate';

type Json = Record<string, unknown>;
const LOCALES = ['pt-BR', 'en'] as const;
const NOW = '2026-10-23T00:00:00Z';

/** "FIXTURE: lorem …" with exactly `words` words. */
export function fixtureWords(words: number): string {
  return ['FIXTURE:', ...Array.from({ length: words - 1 }, (_, i) => `palavra${i}`)].join(' ');
}

function variant(locale: (typeof LOCALES)[number]): Json {
  return {
    id: `fixture_lesson_a1__${locale}`,
    conceptId: 'fixture_concept_a1',
    locale,
    slug: `fixture-licao-a1-${locale.toLowerCase()}`,
    title: 'FIXTURE: title',
    hook: 'FIXTURE: hook',
    summary: 'FIXTURE: summary',
    cardBlocks: [
      { type: 'paragraph', text: fixtureWords(100) },
      { type: 'takeaway', text: 'FIXTURE: short takeaway.' },
    ],
    deepDiveBlocks: [{ type: 'paragraph', text: fixtureWords(200) }],
    heroMedia: {
      type: 'illustration',
      illustrationId: 'fixture',
      alt: 'FIXTURE alt',
      license: 'original',
    },
    claims: [
      {
        id: 'c1',
        text: 'FIXTURE claim',
        highStakes: true,
        support: [
          { sourceId: 'fixture_src_one', excerpt: 'FIXTURE excerpt one' },
          { sourceId: 'fixture_src_two', excerpt: 'FIXTURE excerpt two' },
        ],
        autoVerdict: 'supported',
        humanVerdict: 'approved',
      },
    ],
    sourceIds: ['fixture_src_one', 'fixture_src_two'],
    quizIds: [`fixture_q_a1_1__${locale}`, `fixture_q_a1_2__${locale}`],
    contentLicense: 'fixture',
    generation: null,
    reviewStatus: 'reviewed',
    publicationStatus: 'published',
    reviewedBy: 'fixture-reviewer',
    reviewedAt: NOW,
    reviewAfter: null,
    publishedAt: NOW,
    updatedAt: NOW,
    fixture: true,
  };
}

function question(locale: (typeof LOCALES)[number], n: number): Json {
  return {
    id: `fixture_q_a1_${n}__${locale}`,
    questionGroupId: `fixture_qg_a1_${n}`,
    conceptId: 'fixture_concept_a1',
    locale,
    prompt: 'FIXTURE: prompt?',
    options: [
      { id: 'a', text: 'FIXTURE option a' },
      { id: 'b', text: 'FIXTURE option b' },
      { id: 'c', text: 'FIXTURE option c' },
    ],
    correctOptionId: 'a',
    explanation: 'FIXTURE explanation',
    claimIds: ['c1'],
    status: 'reviewed',
    fixture: true,
  };
}

function source(id: string, publisher: string): Json {
  return {
    id,
    title: `FIXTURE: ${id}`,
    publisher,
    url: `https://example.invalid/${id}`,
    language: 'en',
    type: 'reference',
    accessedAt: NOW,
    snapshotHash: `sha256:${'0'.repeat(64)}`,
    fixture: true,
  };
}

/** Mutable JSON documents for a valid fixture tree, keyed by path relative to the root. */
export function validDocs(): Record<string, unknown> {
  const docs: Record<string, unknown> = {
    'topics.json': [
      {
        id: 'fixture_topic_a',
        slug: { 'pt-BR': 'fixture-topico-a', en: 'fixture-topic-a' },
        name: { 'pt-BR': 'FIXTURE Tópico A', en: 'FIXTURE Topic A' },
        description: { 'pt-BR': 'FIXTURE descrição', en: 'FIXTURE description' },
        icon: 'fixture',
        accentColor: '#087F75',
        sortOrder: 0,
        fixture: true,
      },
    ],
    'clusters/fixture_cluster_a.json': {
      id: 'fixture_cluster_a',
      topicId: 'fixture_topic_a',
      slug: { 'pt-BR': 'fixture-trilha-a', en: 'fixture-trail-a' },
      title: { 'pt-BR': 'FIXTURE Trilha A', en: 'FIXTURE Trail A' },
      hook: { 'pt-BR': 'FIXTURE gancho', en: 'FIXTURE hook' },
      conceptIds: ['fixture_concept_a1'],
      links: [],
      fixture: true,
    },
    'sources/fixture_src_one.json': source('fixture_src_one', 'FIXTURE Publisher One'),
    'sources/fixture_src_two.json': source('fixture_src_two', 'FIXTURE Publisher Two'),
    'lessons/a1/concept.json': {
      id: 'fixture_concept_a1',
      topicId: 'fixture_topic_a',
      clusterId: 'fixture_cluster_a',
      clusterOrder: 1,
      tags: ['fixture'],
      difficulty: 'beginner',
      related: [],
      variants: ['pt-BR', 'en'],
      fixture: true,
    },
  };
  for (const l of LOCALES) {
    docs[`lessons/a1/variant.${l}.json`] = variant(l);
    docs[`lessons/a1/quiz.${l}.json`] = [question(l, 1), question(l, 2)];
  }
  return docs;
}

export function tree(
  docs: Record<string, unknown>,
  kind: ContentTree['kind'] = 'fixtures',
): ContentTree {
  const root = kind === 'fixtures' ? 'content/fixtures' : 'content';
  return {
    kind,
    root,
    files: Object.entries(docs).map(([path, data]) =>
      typeof data === 'string' && data.startsWith('!!')
        ? { path: `${root}/${path}`, parseError: data.slice(2) }
        : { path: `${root}/${path}`, data },
    ),
  };
}

/** Converts fixture docs into equivalent real-content docs (no flags, no prefixes, real URLs). */
export function asReal(docs: Record<string, unknown>): Record<string, unknown> {
  const text = JSON.stringify(docs)
    .replaceAll('"fixture":true', '"__drop":true')
    .replaceAll('fixture_', '')
    .replaceAll('FIXTURE', 'Real')
    .replaceAll('example.invalid', 'www.nasa.gov')
    .replaceAll('"contentLicense":"fixture"', '"contentLicense":"CC-BY-SA-4.0"')
    .replaceAll('fixture-', '');
  const parsed = JSON.parse(text, (_k, v: unknown) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) delete (v as Json).__drop;
    return v;
  }) as Record<string, unknown>;
  for (const key of Object.keys(parsed)) {
    if (key.startsWith('sources/fixture_')) {
      parsed[key.replace('sources/fixture_', 'sources/')] = parsed[key];
      delete parsed[key];
    }
  }
  return parsed;
}

export function errors(
  docs: Record<string, unknown>,
  kind: ContentTree['kind'] = 'fixtures',
): Issue[] {
  return validateContent([tree(docs, kind)]).issues.filter((i) => i.severity === 'error');
}

export function warnings(
  docs: Record<string, unknown>,
  kind: ContentTree['kind'] = 'fixtures',
): Issue[] {
  return validateContent([tree(docs, kind)]).issues.filter((i) => i.severity === 'warning');
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- test-only typed accessor
export function get<T = Json>(docs: Record<string, unknown>, path: string): T {
  return docs[path] as T;
}
