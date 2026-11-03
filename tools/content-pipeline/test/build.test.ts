import {
  ContentIndexSchema,
  MANIFEST_FILE,
  MediaFileSchema,
  restoreMediaHashes,
  topicFilesFor,
  type ContentManifest,
} from '@lumen/domain';
import { describe, expect, it } from 'vitest';
import { buildContent, libraryFromTrees } from '../src/bundle/build';
import { contentStats, dueForReview } from '../src/reports/reports';
import { asReal, get, tree, validDocs } from './helpers';

type Json = Record<string, unknown>;
const CONCEPT = 'lessons/a1/concept.json';
const PT = 'lessons/a1/variant.pt-BR.json';

function docsWithImage(hash = 'aaaa1111') {
  const docs = asReal(validDocs());
  get<Json>(docs, CONCEPT).media = {
    deeper: {
      width: 1200,
      height: 700,
      alt: { 'pt-BR': 'Descrição', en: 'Description' },
      origin: { kind: 'owned', creator: 'Team' },
      accuracyReviewedBy: 'Reviewer',
      addedAt: '2026-10-28',
      hash,
    },
  };
  return docs;
}
const build = (docs: Record<string, unknown>, channel: 'preview' | 'production' = 'preview') =>
  buildContent(libraryFromTrees([tree(docs, 'real')]), channel);
const changed = (a: Map<string, string>, b: Map<string, string>) =>
  [...new Set([...a.keys(), ...b.keys()])].filter((k) => a.get(k) !== b.get(k)).sort();

describe('content:build (D16)', () => {
  it('writes a manifest, an index, a media list and one file per topic and locale', () => {
    const { manifest, files } = build(docsWithImage());
    expect(files.has(MANIFEST_FILE)).toBe(true);
    expect(manifest.index).toMatch(/^index\.[0-9a-f]{8}\.json$/);
    expect(manifest.media).toMatch(/^media\.[0-9a-f]{8}\.json$/);
    expect(Object.keys(manifest.topics.topic_a ?? {}).sort()).toEqual(['en', 'pt-BR']);
    expect(files.size).toBe(5);
  });

  it('a changed image only changes the media list (and the manifest)', () => {
    const before = build(docsWithImage('aaaa1111'));
    const after = build(docsWithImage('bbbb2222'));
    expect(changed(before.files, after.files)).toEqual(
      [MANIFEST_FILE, before.manifest.media, after.manifest.media].sort(),
    );
  });

  it('a changed lesson only changes its topic file in that locale (and the manifest)', () => {
    const docs = docsWithImage();
    const before = build(docs);
    get<Json>(docs, PT).title = 'Real: a new title';
    const after = build(docs);
    expect(changed(before.files, after.files)).toEqual(
      [
        MANIFEST_FILE,
        before.manifest.topics.topic_a?.['pt-BR'],
        after.manifest.topics.topic_a?.['pt-BR'],
      ].sort(),
    );
  });

  it('round-trips image hashes through the media list', () => {
    const { manifest, files } = build(docsWithImage('cafe0123'));
    const index = ContentIndexSchema.parse(JSON.parse(files.get(manifest.index) ?? ''));
    const media = MediaFileSchema.parse(JSON.parse(files.get(manifest.media) ?? ''));
    const restored = restoreMediaHashes(index, media);
    expect(restored.concepts[0]?.media?.deeper?.hash).toBe('cafe0123');
    expect(JSON.stringify(index)).not.toContain('cafe0123');
  });

  it('production leaves out drafts', () => {
    const docs = docsWithImage();
    for (const path of [PT, 'lessons/a1/variant.en.json'])
      Object.assign(get<Json>(docs, path), {
        reviewStatus: 'draft',
        publicationStatus: 'draft',
        publishedAt: null,
      });
    expect(build(docs, 'preview').manifest.topics.topic_a).toBeDefined();
    expect(build(docs, 'production').manifest.topics.topic_a).toBeUndefined();
  });

  it('loads the other locale only for lessons missing in the UI locale', () => {
    const manifest: ContentManifest = {
      version: 1,
      channel: 'preview',
      index: 'index.00000000.json',
      media: 'media.00000000.json',
      topics: { a: { 'pt-BR': 'a.pt.json', en: 'a.en.json' }, b: { 'pt-BR': 'b.pt.json' } },
    };
    const index = {
      topics: [],
      clusters: [],
      concepts: [
        { topicId: 'a', variants: ['pt-BR', 'en'] },
        { topicId: 'b', variants: ['pt-BR'] },
      ],
    } as unknown as Parameters<typeof topicFilesFor>[1];
    expect(topicFilesFor(manifest, index, 'pt-BR')).toEqual(['a.pt.json', 'b.pt.json']);
    expect(topicFilesFor(manifest, index, 'en')).toEqual(['a.en.json', 'b.pt.json']);
  });
});

describe('content:stats and content:due-review', () => {
  it('counts published and draft variants per topic and locale', () => {
    const docs = docsWithImage();
    Object.assign(get<Json>(docs, PT), {
      reviewStatus: 'draft',
      publicationStatus: 'draft',
      publishedAt: null,
    });
    const [row] = contentStats(libraryFromTrees([tree(docs, 'real')]));
    expect(row?.byLocale['pt-BR']).toEqual({ published: 0, reviewed: 0, draft: 1 });
    expect(row?.byLocale.en).toEqual({ published: 1, reviewed: 0, draft: 0 });
  });

  it('lists published variants past reviewAfter', () => {
    const docs = docsWithImage();
    get<Json>(docs, PT).reviewAfter = '2026-01-01T00:00:00Z';
    const due = dueForReview(libraryFromTrees([tree(docs, 'real')]), new Date('2026-10-28'));
    expect(due.map((d) => d.variantId)).toEqual(['lesson_a1__pt-BR']);
  });
});
