import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import type { LessonVariant, QuizQuestion } from '@lumen/domain';
import { describe, expect, it } from 'vitest';
import {
  REVIEW_LOG,
  contentPath,
  loadLesson,
  loadQueue,
  medianMinutes,
  readLog,
  runAction,
  type ReviewContext,
} from '../src/review/review';
import type { ReviewAction, ReviewActionInput } from '../src/review/types';
import { loadTree } from '../src/validate/tree';
import { validateContent } from '../src/validate/validate';
import { asReal, validDocs } from './helpers';

type Json = Record<string, unknown>;
const NOW = new Date('2026-10-30T12:00:00Z');
const repoRootOfThisRepo = resolve(import.meta.dirname, '../../..');

/** A variant/quiz turned back into an unreviewed draft, as a writer session leaves it. */
function asDraft(path: string, data: unknown): unknown {
  if (/variant\.[^.]+\.json$/.test(path)) {
    const v = data as LessonVariant;
    return {
      ...v,
      contentLicense: 'pending',
      reviewStatus: 'draft',
      publicationStatus: 'draft',
      reviewedBy: null,
      reviewedAt: null,
      publishedAt: null,
      generation: { model: 'test-model', promptVersion: 'write-v1', runId: 'run_test' },
      claims: v.claims.map((c) => ({ ...c, humanVerdict: 'pending' })),
    };
  }
  if (/quiz\.[^.]+\.json$/.test(path))
    return (data as QuizQuestion[]).map((q) => ({ ...q, status: 'draft' }));
  return data;
}

async function writeDocs(root: string, docs: Record<string, unknown>) {
  for (const [path, data] of Object.entries(docs)) {
    const abs = join(root, path);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, `${JSON.stringify(data, null, 2)}\n`);
  }
}

/**
 * A temporary repository: the library holds topics, sources and a published lesson a1 in
 * trail cluster_a; the drafts hold a new lesson a2 for the same trail (both locales).
 */
async function setup(): Promise<{ ctx: ReviewContext; root: string }> {
  const root = await mkdtemp(join(tmpdir(), 'lumen-review-'));
  const real = asReal(validDocs());
  const library: Record<string, unknown> = {};
  const drafts: Record<string, unknown> = {};
  for (const [path, data] of Object.entries(real)) {
    library[path] = data;
    if (path.startsWith('lessons/a1/')) {
      const draftPath = path.replace('lessons/a1/', 'lessons/a2/');
      const text = JSON.stringify(data)
        .replaceAll('a1', 'a2')
        .replaceAll('"clusterOrder":1', '"clusterOrder":2');
      drafts[draftPath] = asDraft(draftPath, JSON.parse(text));
    }
  }
  drafts['clusters/cluster_a.json'] = {
    ...(real['clusters/cluster_a.json'] as Json),
    conceptIds: ['concept_a1', 'concept_a2'],
    links: [{ clusterId: 'cluster_b', reason: { 'pt-BR': 'Real ligação', en: 'Real link' } }],
  };
  await writeDocs(join(root, 'content'), library);
  await writeDocs(join(root, 'content/drafts'), drafts);
  const snapshot = 'Intro. Real excerpt one and Real excerpt two appear here. The end.';
  return {
    root,
    ctx: { repoRoot: root, now: () => NOW, readSnapshot: () => Promise.resolve(snapshot) },
  };
}

const read = async (root: string, path: string) =>
  JSON.parse(await readFile(join(root, path), 'utf8')) as Json;
const act = (ctx: ReviewContext, a: ReviewActionInput) => runAction(ctx, { ms: 90_000, ...a });

async function approveAll(ctx: ReviewContext, key: string, locale: 'pt-BR' | 'en') {
  const lesson = await loadLesson(ctx, key);
  for (const c of lesson?.locales[locale]?.variant.claims ?? [])
    expect((await act(ctx, { type: 'approve-claim', key, locale, claimId: c.id })).ok).toBe(true);
  return act(ctx, { type: 'approve-locale', key, locale });
}

async function libraryErrors(root: string) {
  const tree = await loadTree(root, 'content', 'real');
  return validateContent([tree]).issues.filter((i) => i.severity === 'error');
}

describe('review queue and lesson', () => {
  it('lists trails and lessons with verdicts and per-locale state', async () => {
    const { ctx } = await setup();
    const queue = await loadQueue(ctx);
    const trail = queue.trails.find((t) => t.clusterId === 'cluster_a');
    expect(trail?.hasDraft).toBe(true);
    const lesson = trail?.lessons[0];
    expect(lesson).toMatchObject({ key: 'a2', conceptId: 'concept_a2', blockers: [] });
    expect(lesson?.locales['pt-BR']).toMatchObject({ state: 'waiting', claims: 1 });
    expect(queue.medianMinutes).toBeNull();
    expect(queue.targetMinutes).toBe(4);
  });

  it('blocks lessons with unsupported or unverified claims', async () => {
    const { ctx, root } = await setup();
    const path = 'content/drafts/lessons/a2/variant.en.json';
    const v = await read(root, path);
    (v.claims as Json[])[0]!.autoVerdict = 'unsupported';
    await writeFile(join(root, path), JSON.stringify(v));
    const lesson = (await loadQueue(ctx)).trails[0]?.lessons[0];
    expect(lesson?.blockers.join(' ')).toMatch(/en: 1 claim\(s\) judged unsupported/);
    const r = await act(ctx, { type: 'approve-locale', key: 'a2', locale: 'en' });
    expect(r.ok).toBe(false);
  });

  it('shows each excerpt with the snapshot text around it, or says the snapshot is missing', async () => {
    const { ctx } = await setup();
    const lesson = await loadLesson(ctx, 'a2');
    const support = lesson?.locales.en?.support.c1 ?? [];
    expect(support[0]?.context).toEqual({
      kind: 'found',
      before: 'Intro. ',
      match: 'Real excerpt one',
      after: ' and Real excerpt two appear here. The end.',
    });
    expect(support[0]?.source?.publisher).toBe('Real Publisher One');
    // The trail-mate in the library comes along for the preview.
    expect(lesson?.neighbors.concepts.map((c) => c.id)).toEqual(['concept_a1']);
    expect(lesson?.neighbors.variants).toHaveLength(2);
    const missing = await loadLesson({ ...ctx, readSnapshot: () => Promise.resolve(null) }, 'a2');
    expect(missing?.locales.en?.support.c1?.[0]?.context).toEqual({ kind: 'missing' });
  });
});

describe('review actions', () => {
  it('approving a locale writes the reviewed variant, quiz, concept and trail', async () => {
    const { ctx, root } = await setup();
    const early = await act(ctx, { type: 'approve-locale', key: 'a2', locale: 'pt-BR' });
    expect(early).toMatchObject({ ok: false, message: expect.stringMatching(/c1 still open/) });

    expect((await approveAll(ctx, 'a2', 'pt-BR')).ok).toBe(true);
    const v = await read(root, 'content/lessons/a2/variant.pt-BR.json');
    expect(v).toMatchObject({
      reviewStatus: 'reviewed',
      publicationStatus: 'draft',
      reviewedBy: 'Julian',
      reviewedAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
      contentLicense: 'all-rights-reserved',
    });
    const quiz = (await read(root, 'content/lessons/a2/quiz.pt-BR.json')) as unknown as Json[];
    expect(quiz.every((q) => q.status === 'reviewed')).toBe(true);
    // Only the approved locale is in the library yet, so the concept lists only it.
    expect((await read(root, 'content/lessons/a2/concept.json')).variants).toEqual(['pt-BR']);
    expect(existsSync(join(root, 'content/drafts/lessons/a2/variant.en.json'))).toBe(true);
    // Trail: concepts in the library only; links only to trails in the library.
    const cluster = await read(root, 'content/clusters/cluster_a.json');
    expect(cluster.conceptIds).toEqual(['concept_a1', 'concept_a2']);
    expect(cluster.links).toEqual([]);
    expect(existsSync(join(root, 'content/drafts/clusters/cluster_a.json'))).toBe(true);
    expect((await loadQueue(ctx)).trails[0]?.lessons[0]?.locales['pt-BR']?.state).toBe('approved');

    expect((await approveAll(ctx, 'a2', 'en')).ok).toBe(true);
    expect(existsSync(join(root, 'content/drafts/lessons/a2'))).toBe(false);
    expect(existsSync(join(root, 'content/drafts/clusters/cluster_a.json'))).toBe(false);
    expect((await read(root, 'content/lessons/a2/concept.json')).variants).toEqual(['pt-BR', 'en']);
    expect(await libraryErrors(root)).toEqual([]);
  });

  it('writes nothing when a change would break validation', async () => {
    const { ctx, root } = await setup();
    const path = 'content/drafts/lessons/a2/variant.en.json';
    const before = await readFile(join(root, path), 'utf8');
    const r = await act(ctx, {
      type: 'edit',
      key: 'a2',
      locale: 'en',
      edit: { cardBlocks: { 0: 'Far too short.' } },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.issues.map((i) => i.code)).toContain('card-words');
    expect(await readFile(join(root, path), 'utf8')).toBe(before);
    expect(await readLog(root)).toEqual([]);
  });

  it('editing marks the touched claims "edited" and sends the variant back for approval', async () => {
    const { ctx, root } = await setup();
    expect((await approveAll(ctx, 'a2', 'en')).ok).toBe(true);
    const r = await act(ctx, {
      type: 'edit',
      key: 'a2',
      locale: 'en',
      edit: {
        claims: { c1: 'Real claim, reworded' },
        questions: { q_a2_1__en: { prompt: 'Real: a clearer prompt?' } },
      },
    });
    expect(r).toMatchObject({ ok: true, message: 'Saved. Claims marked edited: c1.' });
    const v = (await read(root, 'content/drafts/lessons/a2/variant.en.json')) as LessonVariant;
    expect(v.claims[0]).toMatchObject({ text: 'Real claim, reworded', humanVerdict: 'edited' });
    expect(v.reviewStatus).toBe('draft');
    const quiz = (await read(root, 'content/drafts/lessons/a2/quiz.en.json')) as unknown as Json[];
    expect(quiz[0]?.prompt).toBe('Real: a clearer prompt?');
    // IDs and excerpts can't be edited: unknown fields are refused.
    const bad = await act(ctx, {
      type: 'edit',
      key: 'a2',
      locale: 'en',
      edit: { claims: { c9: 'x' } },
    });
    expect(bad).toMatchObject({ ok: false, message: 'no claim c9' });
  });

  it('rejecting needs a note, keeps the draft and writes the note and a log line', async () => {
    const { ctx, root } = await setup();
    expect(
      (await act(ctx, { type: 'reject', key: 'a2', locale: 'en', claimId: 'c1', note: ' ' })).ok,
    ).toBe(false);
    const r = await act(ctx, {
      type: 'reject',
      key: 'a2',
      locale: 'en',
      claimId: 'c1',
      note: 'The excerpt does not say this.',
    });
    expect(r.ok).toBe(true);
    const v = (await read(root, 'content/drafts/lessons/a2/variant.en.json')) as LessonVariant;
    expect(v.reviewStatus).toBe('rejected');
    expect(v.claims[0]?.humanVerdict).toBe('rejected');
    const notes = await readFile(
      join(root, 'content/drafts/review/2026-10-30-cluster_a.md'),
      'utf8',
    );
    expect(notes).toContain('## a2 · en · claim c1');
    expect(notes).toContain('The excerpt does not say this.');
    expect(await readLog(root)).toEqual([
      {
        at: NOW.toISOString(),
        reviewer: 'Julian',
        conceptId: 'concept_a2',
        locale: 'en',
        action: 'reject',
        claimId: 'c1',
        note: 'The excerpt does not say this.',
        ms: 90_000,
      },
    ]);
    expect((await loadQueue(ctx)).trails[0]?.lessons[0]?.locales.en?.state).toBe('rejected');
  });

  it('logs every action, and notes show on the lesson', async () => {
    const { ctx, root } = await setup();
    await act(ctx, { type: 'note', key: 'a2', locale: null, claimId: null, note: 'Check later.' });
    await approveAll(ctx, 'a2', 'en');
    const log = await readLog(root);
    expect(log.map((l) => l.action)).toEqual(['note', 'approve-claim', 'approve-locale']);
    expect((await loadLesson(ctx, 'a2'))?.notes.map((n) => n.note)).toEqual(['Check later.']);
    expect((await loadQueue(ctx)).medianMinutes).toBe(1.5);
  });

  it('publishes both locales together, only once both are reviewed and licensed', async () => {
    const { ctx, root } = await setup();
    await approveAll(ctx, 'a2', 'pt-BR');
    const early = await act(ctx, { type: 'publish', key: 'a2' });
    expect(early.ok).toBe(false);
    expect(early.message).toMatch(/has drafts waiting for review/);
    expect(early.message).toMatch(/en: no variant in the library/);

    await approveAll(ctx, 'a2', 'en');
    // A reviewed variant whose license is still pending (e.g. edited by hand) is refused.
    const path = 'content/lessons/a2/variant.en.json';
    const v = await read(root, path);
    await writeFile(join(root, path), JSON.stringify({ ...v, contentLicense: 'pending' }));
    const pending = await act(ctx, { type: 'publish', key: 'a2' });
    expect(pending.message).toMatch(/en: license is still "pending"/);
    await writeFile(join(root, path), JSON.stringify(v));

    expect((await loadQueue(ctx)).ready.map((r) => [r.key, r.blockers])).toEqual([['a2', []]]);
    expect((await act(ctx, { type: 'publish', key: 'a2' })).ok).toBe(true);
    for (const l of ['pt-BR', 'en'])
      expect(await read(root, `content/lessons/a2/variant.${l}.json`)).toMatchObject({
        publicationStatus: 'published',
        publishedAt: NOW.toISOString(),
      });
    expect(await libraryErrors(root)).toEqual([]);
    expect((await loadQueue(ctx)).ready).toEqual([]);
  });
});

describe('review safety', () => {
  it('refuses paths outside content/ and odd lesson keys', async () => {
    const { ctx } = await setup();
    expect(() => contentPath('/repo', 'content/lessons/a/variant.en.json')).not.toThrow();
    expect(() => contentPath('/repo', 'content/../package.json')).toThrow(/outside content/);
    expect(() => contentPath('/repo', '/etc/passwd')).toThrow(/outside content/);
    await expect(loadLesson(ctx, '../../etc')).rejects.toThrow(/not a lesson folder/);
    await expect(act(ctx, { type: 'publish', key: 'a2/../../x' })).rejects.toThrow();
  });

  it('computes the median review time per variant', () => {
    const line = (ms: number, action: ReviewAction['type'] = 'approve-locale') => ({
      at: '',
      reviewer: 'Julian',
      conceptId: 'concept_x',
      locale: 'en' as const,
      action,
      claimId: null,
      note: null,
      ms,
    });
    expect(medianMinutes([line(60_000), line(180_000), line(5, 'approve-claim')])).toEqual({
      median: 2,
      count: 2,
    });
  });
});

describe('dry run: a fixture trail from drafts to published', () => {
  it('reviews every lesson of a trail and the library stays valid', async () => {
    const root = await mkdtemp(join(tmpdir(), 'lumen-review-dry-'));
    const fixtures = await loadTree(repoRootOfThisRepo, 'content/fixtures', 'fixtures');
    const docs = Object.fromEntries(
      fixtures.files.map((f) => [f.path.slice('content/fixtures/'.length), f.data]),
    );
    const real = asReal(docs);
    const library: Record<string, unknown> = {};
    const drafts: Record<string, unknown> = {};
    const excerpts: string[] = [];
    for (const [path, data] of Object.entries(real)) {
      if (path === 'topics.json' || path.startsWith('sources/')) library[path] = data;
      else if (path === 'clusters/cluster_a.json') drafts[path] = data;
      else if (/^lessons\/a\d\//.test(path)) {
        drafts[path] = asDraft(path, data);
        if (path.includes('variant.'))
          for (const c of (data as LessonVariant).claims)
            for (const s of c.support) excerpts.push(s.excerpt);
      }
    }
    await writeDocs(join(root, 'content'), library);
    await writeDocs(join(root, 'content/drafts'), drafts);
    const ctx: ReviewContext = {
      repoRoot: root,
      now: () => NOW,
      readSnapshot: () => Promise.resolve(excerpts.join(' ')),
    };

    const queue = await loadQueue(ctx);
    const keys = queue.trails[0]?.lessons.map((l) => l.key) ?? [];
    expect(keys).toEqual(['a1', 'a2', 'a3', 'a4']);
    expect(queue.trails[0]?.lessons.every((l) => l.blockers.length === 0)).toBe(true);
    for (const key of keys)
      for (const locale of ['pt-BR', 'en'] as const) {
        const r = await approveAll(ctx, key, locale);
        expect(r, `${key} ${locale}: ${JSON.stringify(r)}`).toMatchObject({ ok: true });
      }
    expect(await readdir(join(root, 'content/drafts/lessons'))).toEqual([]);
    expect(existsSync(join(root, 'content/drafts/clusters/cluster_a.json'))).toBe(false);
    expect(await libraryErrors(root)).toEqual([]);

    for (const key of keys) expect((await act(ctx, { type: 'publish', key })).ok).toBe(true);
    expect(await libraryErrors(root)).toEqual([]);
    expect((await read(root, 'content/clusters/cluster_a.json')).conceptIds).toEqual([
      'concept_a1',
      'concept_a2',
      'concept_a3',
      'concept_a4',
    ]);
    expect((await readLog(root)).filter((l) => l.action === 'publish')).toHaveLength(4);
    expect(existsSync(join(root, REVIEW_LOG))).toBe(true);
  });
});
