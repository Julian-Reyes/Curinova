import { appendFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import {
  ClusterSchema,
  ConceptSchema,
  LOCALES,
  LessonVariantSchema,
  QuizFileSchema,
  SourceSchema,
  TopicsFileSchema,
  type Claim,
  type Cluster,
  type Concept,
  type LessonVariant,
  type Locale,
  type QuizQuestion,
  type Source,
} from '@lumen/domain';
import * as prettier from 'prettier';
import { checkDrafts } from '../drafts/check';
import { normalizeText } from '../sources/fetch';
import { readSnapshot } from '../sources/store';
import { loadTree, type ContentTree } from '../validate/tree';
import { validateContent, type Issue } from '../validate/validate';
import { locateClaims, textFields } from './claims';
import type {
  ActionResult,
  LessonEdit,
  LessonLocaleView,
  LessonView,
  LocaleState,
  Queue,
  QueueLesson,
  QueueTrail,
  ReadyLesson,
  ReviewAction,
  ReviewLogLine,
  SupportView,
} from './types';

/** The founder reviews every lesson (D20); the name is public in the repository. */
export const REVIEWER = 'Julian';
/** §5.5: median ≤ 4 minutes per variant. */
export const TARGET_MINUTES = 4;
export const REVIEW_LOG = 'content/review-log.jsonl';
/** The license a human review sets (D21). Writers leave "pending". */
export const REVIEWED_LICENSE = 'all-rights-reserved';

const CONTENT = 'content';
const DRAFTS = 'content/drafts';
const CONTEXT_CHARS = 300;
const KEY_PATTERN = /^[a-z0-9_]+$/;

export interface ReviewContext {
  repoRoot: string;
  /** Injectable clock for tests. */
  now?: () => Date;
  readSnapshot?: (sourceId: string) => Promise<string | null>;
}

const nowOf = (ctx: ReviewContext) => (ctx.now ?? (() => new Date()))();
const snapshotsOf = (ctx: ReviewContext) =>
  ctx.readSnapshot ?? ((id: string) => readSnapshot(ctx.repoRoot, id));

/**
 * Absolute path of a repo-relative path, refusing anything outside content/ (the review tool
 * only ever reads and writes the content directory).
 */
export function contentPath(repoRoot: string, rel: string): string {
  const root = resolve(repoRoot, CONTENT);
  const abs = resolve(repoRoot, rel);
  if (abs !== root && !abs.startsWith(root + sep))
    throw new Error(`refusing a path outside content/: ${rel}`);
  return abs;
}

function checkKey(key: string): string {
  if (!KEY_PATTERN.test(key)) throw new Error(`not a lesson folder name: "${key}"`);
  return key;
}

// ---- State: the library and the drafts, as trees, with pending changes applied ----------

interface State {
  library: ContentTree;
  drafts: ContentTree;
}

/** Repo-relative path → new JSON (null deletes the file). */
type Changes = Map<string, unknown>;

async function loadState(repoRoot: string): Promise<State> {
  const [library, drafts] = await Promise.all([
    loadTree(repoRoot, CONTENT, 'real'),
    loadTree(repoRoot, DRAFTS, 'real'),
  ]);
  return { library, drafts };
}

function applyChanges(state: State, changes: Changes): State {
  const apply = (tree: ContentTree): ContentTree => {
    const files = tree.files.filter((f) => !changes.has(f.path));
    for (const [path, data] of changes) {
      const inTree = path.startsWith(`${tree.root}/`);
      const inDrafts = path.startsWith(`${DRAFTS}/`);
      if (data !== null && inTree && (tree.root === DRAFTS || !inDrafts))
        files.push({ path, data });
    }
    return { ...tree, files: files.sort((a, b) => a.path.localeCompare(b.path)) };
  };
  return { library: apply(state.library), drafts: apply(state.drafts) };
}

function doc(tree: ContentTree, path: string): unknown {
  return tree.files.find((f) => f.path === path)?.data;
}

const lessonDir = (root: string, key: string) => `${root}/lessons/${key}`;
const variantPath = (root: string, key: string, l: Locale) =>
  `${lessonDir(root, key)}/variant.${l}.json`;
const quizPath = (root: string, key: string, l: Locale) => `${lessonDir(root, key)}/quiz.${l}.json`;
const conceptPath = (root: string, key: string) => `${lessonDir(root, key)}/concept.json`;

function parse<T>(
  schema: { safeParse: (d: unknown) => { success: boolean; data?: T } },
  data: unknown,
): T | undefined {
  if (data === undefined) return undefined;
  const r = schema.safeParse(data);
  return r.success ? r.data : undefined;
}

const variantIn = (tree: ContentTree, key: string, l: Locale) =>
  parse<LessonVariant>(LessonVariantSchema, doc(tree, variantPath(tree.root, key, l)));
const quizIn = (tree: ContentTree, key: string, l: Locale) =>
  parse<QuizQuestion[]>(QuizFileSchema, doc(tree, quizPath(tree.root, key, l)));
const conceptIn = (tree: ContentTree, key: string) =>
  parse<Concept>(ConceptSchema, doc(tree, conceptPath(tree.root, key)));

function lessonKeys(tree: ContentTree): string[] {
  const prefix = `${tree.root}/lessons/`;
  const keys = new Set<string>();
  for (const f of tree.files)
    if (f.path.startsWith(prefix)) keys.add(f.path.slice(prefix.length).split('/')[0] ?? '');
  return [...keys].filter((k) => KEY_PATTERN.test(k)).sort();
}

function clustersIn(tree: ContentTree): { path: string; cluster: Cluster }[] {
  return tree.files
    .filter((f) => f.path.startsWith(`${tree.root}/clusters/`))
    .map((f) => ({ path: f.path, cluster: parse<Cluster>(ClusterSchema, f.data) }))
    .filter((c): c is { path: string; cluster: Cluster } => c.cluster !== undefined);
}

function conceptIdsIn(tree: ContentTree): Set<string> {
  return new Set(
    lessonKeys(tree)
      .map((k) => conceptIn(tree, k)?.id)
      .filter((id): id is string => id !== undefined),
  );
}

// ---- Checks --------------------------------------------------------------------------

const issueKey = (i: Issue) => `${i.code}|${i.file}|${i.field}|${i.message}`;

/** Errors of the library on its own, plus check-drafts errors (drafts merged over it). */
async function errorsOf(state: State, ctx: ReviewContext): Promise<Issue[]> {
  const library = validateContent([state.library]).issues;
  const drafts = (await checkDrafts(state.library, state.drafts, snapshotsOf(ctx))).issues;
  const seen = new Set<string>();
  return [...library, ...drafts].filter((i) => {
    if (i.severity !== 'error' || seen.has(issueKey(i))) return false;
    seen.add(issueKey(i));
    return true;
  });
}

const lessonErrors = (errors: Issue[], key: string) =>
  errors.filter((i) => i.file.startsWith(`${lessonDir(DRAFTS, key)}/`));

function verdictCounts(v: LessonVariant | undefined): Record<Claim['autoVerdict'], number> {
  const out = { pending: 0, supported: 0, partial: 0, unsupported: 0 };
  for (const c of v?.claims ?? []) out[c.autoVerdict] += 1;
  return out;
}

function blockersFor(drafts: Partial<Record<Locale, LessonVariant>>, errors: Issue[]): string[] {
  const out: string[] = [];
  for (const [l, v] of Object.entries(drafts)) {
    const n = verdictCounts(v);
    if (n.unsupported > 0)
      out.push(`${l}: ${String(n.unsupported)} claim(s) judged unsupported by the verifier`);
    if (n.pending > 0) out.push(`${l}: ${String(n.pending)} claim(s) not verified yet`);
  }
  if (errors.length > 0) out.push(`${String(errors.length)} check-drafts error(s)`);
  return out;
}

function localeState(
  draft: LessonVariant | undefined,
  lib: LessonVariant | undefined,
): LocaleState {
  if (draft)
    return draft.reviewStatus === 'reviewed'
      ? 'approved'
      : draft.reviewStatus === 'rejected'
        ? 'rejected'
        : 'waiting';
  return lib?.reviewStatus === 'reviewed' ? 'approved' : 'missing';
}

// ---- Review log ------------------------------------------------------------------------

export async function readLog(repoRoot: string): Promise<ReviewLogLine[]> {
  let raw: string;
  try {
    raw = await readFile(contentPath(repoRoot, REVIEW_LOG), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  return raw
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as ReviewLogLine);
}

/** Median minutes on the lesson screen per approved or rejected variant. */
export function medianMinutes(log: ReviewLogLine[]): { median: number | null; count: number } {
  const ms = log
    .filter((l) => l.action === 'approve-locale' || l.action === 'reject')
    .map((l) => l.ms)
    .sort((a, b) => a - b);
  if (ms.length === 0) return { median: null, count: 0 };
  const mid = Math.floor(ms.length / 2);
  const value = ms.length % 2 === 1 ? (ms[mid] ?? 0) : ((ms[mid - 1] ?? 0) + (ms[mid] ?? 0)) / 2;
  return { median: Math.round((value / 60000) * 10) / 10, count: ms.length };
}

// ---- Queue -----------------------------------------------------------------------------

export async function loadQueue(ctx: ReviewContext): Promise<Queue> {
  const state = await loadState(ctx.repoRoot);
  const errors = await errorsOf(state, ctx);
  const draftClusters = clustersIn(state.drafts);
  const libClusters = clustersIn(state.library);
  const trails = new Map<string, QueueTrail>();
  const trail = (id: string): QueueTrail => {
    let t = trails.get(id);
    if (!t) {
      const draft = draftClusters.find((c) => c.cluster.id === id)?.cluster;
      const cluster = draft ?? libClusters.find((c) => c.cluster.id === id)?.cluster;
      t = {
        clusterId: id,
        title: cluster?.title ?? {},
        hasDraft: draft !== undefined,
        lessons: [],
      };
      trails.set(id, t);
    }
    return t;
  };
  for (const { cluster } of draftClusters) trail(cluster.id);

  for (const key of lessonKeys(state.drafts)) {
    const concept = conceptIn(state.drafts, key) ?? conceptIn(state.library, key);
    const own = lessonErrors(errors, key);
    const lesson: QueueLesson = {
      key,
      conceptId: concept?.id ?? key,
      clusterOrder: concept?.clusterOrder ?? 0,
      titles: {},
      locales: {},
      errors: own,
      blockers: [],
      waitingFor: [],
    };
    const drafts: Partial<Record<Locale, LessonVariant>> = {};
    for (const l of concept?.variants ?? LOCALES) {
      const draft = variantIn(state.drafts, key, l);
      const lib = variantIn(state.library, key, l);
      if (draft) drafts[l] = draft;
      const v = draft ?? lib;
      if (v) lesson.titles[l] = v.title;
      lesson.locales[l] = {
        state: localeState(draft, lib),
        verdicts: verdictCounts(v),
        claims: v?.claims.length ?? 0,
        approvedClaims:
          v?.claims.filter((c) => c.humanVerdict === 'approved' || c.humanVerdict === 'edited')
            .length ?? 0,
      };
    }
    lesson.blockers = concept
      ? blockersFor(drafts, own)
      : ['no readable concept.json in the drafts or the library'];
    if (concept && Object.values(lesson.locales).every((x) => x.state === 'approved')) {
      const inLibrary = conceptIdsIn(state.library);
      lesson.waitingFor = concept.related
        .map((r) => r.conceptId)
        .filter((id) => !inLibrary.has(id));
    }
    trail(concept?.clusterId ?? 'unknown').lessons.push(lesson);
  }

  for (const t of trails.values()) {
    const order = draftClusters.find((c) => c.cluster.id === t.clusterId)?.cluster.conceptIds;
    const rank = (l: QueueLesson) => {
      const i = order?.indexOf(l.conceptId) ?? -1;
      return i === -1 ? 100 + l.clusterOrder : i;
    };
    t.lessons.sort((a, b) => rank(a) - rank(b));
  }

  const ready: ReadyLesson[] = [];
  for (const key of lessonKeys(state.library)) {
    const variants = LOCALES.map((l) => variantIn(state.library, key, l));
    const reviewedUnpublished = variants.some(
      (v) => v?.reviewStatus === 'reviewed' && v.publicationStatus !== 'published',
    );
    if (!reviewedUnpublished) continue;
    const concept = conceptIn(state.library, key);
    ready.push({
      key,
      conceptId: concept?.id ?? key,
      titles: Object.fromEntries(
        variants.filter((v) => v !== undefined).map((v) => [v.locale, v.title]),
      ),
      blockers: publishBlockers(state, key, hasOpenDrafts(state, key)),
    });
  }

  const log = await readLog(ctx.repoRoot);
  const { median, count } = medianMinutes(log);
  return {
    trails: [...trails.values()],
    ready,
    medianMinutes: median,
    reviewedVariants: count,
    targetMinutes: TARGET_MINUTES,
  };
}

/** Draft variants of a lesson still waiting for (or rejected in) review. */
function hasOpenDrafts(state: State, key: string): boolean {
  return LOCALES.some((l) => {
    const d = variantIn(state.drafts, key, l);
    return d !== undefined && d.reviewStatus !== 'reviewed';
  });
}

function publishBlockers(state: State, key: string, hasDrafts: boolean): string[] {
  const out: string[] = [];
  if (hasDrafts) out.push('has drafts waiting for review; finish or clear them first');
  for (const l of LOCALES) {
    const v = variantIn(state.library, key, l);
    if (!v) out.push(`${l}: no variant in the library (both locales are published together)`);
    else if (v.reviewStatus !== 'reviewed') out.push(`${l}: not approved yet`);
    else if (v.contentLicense === 'pending') out.push(`${l}: license is still "pending"`);
  }
  return out;
}

// ---- Lesson ----------------------------------------------------------------------------

function contextFor(snapshot: string, excerpt: string): SupportView['context'] {
  const text = normalizeText(snapshot);
  const fold = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  const at = fold(text).indexOf(fold(normalizeText(excerpt)));
  if (at === -1) return { kind: 'not-found' };
  const end = at + normalizeText(excerpt).length;
  return {
    kind: 'found',
    before: text.slice(Math.max(0, at - CONTEXT_CHARS), at),
    match: text.slice(at, end),
    after: text.slice(end, end + CONTEXT_CHARS),
  };
}

/** content/drafts/verify/<date>-<cluster>[-rN].md for a trail, newest first. */
async function verifierReports(
  repoRoot: string,
  clusterId: string,
): Promise<{ name: string; text: string }[]> {
  const dir = contentPath(repoRoot, `${DRAFTS}/verify`);
  let names: string[];
  try {
    names = await readdir(dir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const re = new RegExp(`^(\\d{4}-\\d{2}-\\d{2})-${clusterId}(?:-r(\\d+))?\\.md$`);
  const matched = names
    .map((name) => ({ name, m: re.exec(name) }))
    .filter((x): x is { name: string; m: RegExpExecArray } => x.m !== null)
    .sort(
      (a, b) =>
        (b.m[1] ?? '').localeCompare(a.m[1] ?? '') || Number(b.m[2] ?? 1) - Number(a.m[2] ?? 1),
    );
  return Promise.all(
    matched.map(async ({ name }) => ({ name, text: await readFile(join(dir, name), 'utf8') })),
  );
}

function sourcesOf(state: State): Map<string, Source> {
  const out = new Map<string, Source>();
  for (const tree of [state.library, state.drafts])
    for (const f of tree.files)
      if (f.path.startsWith(`${tree.root}/sources/`)) {
        const s = parse<Source>(SourceSchema, f.data);
        if (s) out.set(s.id, s);
      }
  return out;
}

export async function loadLesson(ctx: ReviewContext, rawKey: string): Promise<LessonView | null> {
  const key = checkKey(rawKey);
  const state = await loadState(ctx.repoRoot);
  const concept = conceptIn(state.drafts, key) ?? conceptIn(state.library, key);
  if (!concept) return null;
  const errors = lessonErrors(await errorsOf(state, ctx), key);
  const sources = sourcesOf(state);
  const read = snapshotsOf(ctx);
  const snapshots = new Map<string, string | null>();

  const locales: LessonView['locales'] = {};
  const drafts: Partial<Record<Locale, LessonVariant>> = {};
  const cited = new Set<string>();
  for (const l of concept.variants) {
    const draft = variantIn(state.drafts, key, l);
    const lib = variantIn(state.library, key, l);
    const variant = draft ?? lib;
    if (!variant) continue;
    if (draft) drafts[l] = draft;
    const support: Record<string, SupportView[]> = {};
    for (const claim of variant.claims) {
      support[claim.id] = [];
      for (const s of claim.support) {
        cited.add(s.sourceId);
        if (!snapshots.has(s.sourceId)) snapshots.set(s.sourceId, await read(s.sourceId));
        const snapshot = snapshots.get(s.sourceId) ?? null;
        const src = sources.get(s.sourceId);
        support[claim.id]?.push({
          sourceId: s.sourceId,
          excerpt: s.excerpt,
          locator: s.locator,
          source: src ? { title: src.title, publisher: src.publisher, url: src.url } : null,
          context: snapshot === null ? { kind: 'missing' } : contextFor(snapshot, s.excerpt),
        });
      }
    }
    const view: LessonLocaleView = {
      variant,
      fromDraft: draft !== undefined,
      questions: (draft ? quizIn(state.drafts, key, l) : quizIn(state.library, key, l)) ?? [],
      state: localeState(draft, lib),
      locations: locateClaims(variant),
      support,
    };
    locales[l] = view;
  }

  const topics = parse(TopicsFileSchema, doc(state.library, `${CONTENT}/topics.json`)) ?? [];
  const cluster =
    clustersIn(state.drafts).find((c) => c.cluster.id === concept.clusterId)?.cluster ??
    clustersIn(state.library).find((c) => c.cluster.id === concept.clusterId)?.cluster ??
    null;
  const neighborIds = new Set([
    ...(cluster?.conceptIds ?? []),
    ...concept.related.map((r) => r.conceptId),
  ]);
  neighborIds.delete(concept.id);
  const neighbors: LessonView['neighbors'] = { concepts: [], variants: [] };
  for (const k of new Set([...lessonKeys(state.drafts), ...lessonKeys(state.library)])) {
    const c = conceptIn(state.drafts, k) ?? conceptIn(state.library, k);
    if (!c || !neighborIds.has(c.id)) continue;
    neighbors.concepts.push(c);
    for (const l of c.variants) {
      const v = variantIn(state.drafts, k, l) ?? variantIn(state.library, k, l);
      if (v) neighbors.variants.push(v);
    }
  }
  const log = await readLog(ctx.repoRoot);
  return {
    key,
    concept,
    neighbors,
    topic: topics.find((t) => t.id === concept.topicId) ?? null,
    cluster,
    locales,
    sources: [...cited].map((id) => sources.get(id)).filter((s): s is Source => s !== undefined),
    reports: await verifierReports(ctx.repoRoot, concept.clusterId),
    notes: log.filter((line) => line.conceptId === concept.id && line.note !== null),
    errors,
    blockers: blockersFor(drafts, errors),
  };
}

// ---- Writing ---------------------------------------------------------------------------

async function formatted(path: string, text: string, parser?: string): Promise<string> {
  const options = (await prettier.resolveConfig(path)) ?? {};
  return prettier.format(text, { ...options, filepath: path, ...(parser ? { parser } : {}) });
}

/**
 * Applies `changes` only if they introduce no new error in the library or the drafts (the
 * content validator plus check-drafts). Errors already present elsewhere don't block, so one
 * broken draft can't stop every other review; on any new error nothing is written.
 */
async function commit(
  ctx: ReviewContext,
  state: State,
  changes: Changes,
  extra: { notes?: { path: string; append: string; header: string } } = {},
): Promise<Issue[]> {
  for (const path of changes.keys()) contentPath(ctx.repoRoot, path);
  const before = new Set((await errorsOf(state, ctx)).map(issueKey));
  const after = await errorsOf(applyChanges(state, changes), ctx);
  const added = after.filter((i) => !before.has(issueKey(i)));
  if (added.length > 0) return added;

  const emptied = new Set<string>();
  for (const [path, data] of changes) {
    const abs = contentPath(ctx.repoRoot, path);
    if (data === null) {
      await rm(abs, { force: true });
      emptied.add(dirname(abs));
    } else {
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, await formatted(abs, JSON.stringify(data, null, 2)));
    }
  }
  for (const dir of emptied)
    if ((await readdir(dir)).length === 0) await rm(dir, { recursive: true });
  if (extra.notes) {
    const abs = contentPath(ctx.repoRoot, extra.notes.path);
    let current = extra.notes.header;
    try {
      current = await readFile(abs, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, await formatted(abs, `${current.trimEnd()}\n\n${extra.notes.append}\n`));
  }
  return [];
}

async function appendLog(ctx: ReviewContext, line: ReviewLogLine): Promise<void> {
  const abs = contentPath(ctx.repoRoot, REVIEW_LOG);
  await mkdir(dirname(abs), { recursive: true });
  await appendFile(abs, `${JSON.stringify(line)}\n`);
}

const fail = (message: string, issues: Issue[] = []): ActionResult => ({
  ok: false,
  message,
  issues,
});

/**
 * Updates content/clusters/<id>.json from the trail's draft: only concepts already in the
 * library (planned order kept) and only links to trails in the library. The draft trail is
 * removed once all its lessons are in the library and none still has drafts.
 */
function syncTrail(state: State, changes: Changes, clusterId: string): void {
  const draft = clustersIn(state.drafts).find((c) => c.cluster.id === clusterId);
  if (!draft) return;
  const next = applyChanges(state, changes);
  const inLibrary = conceptIdsIn(next.library);
  const existing = clustersIn(next.library).find((c) => c.cluster.id === clusterId);
  const libClusters = new Set([...clustersIn(next.library).map((c) => c.cluster.id), clusterId]);
  const cluster: Cluster = {
    ...draft.cluster,
    conceptIds: draft.cluster.conceptIds.filter((id) => inLibrary.has(id)),
    links: draft.cluster.links.filter((l) => libClusters.has(l.clusterId)),
  };
  changes.set(existing?.path ?? `${CONTENT}/clusters/${clusterId}.json`, cluster);
  const stillDrafted = lessonKeys(next.drafts).some(
    (k) => conceptIn(next.drafts, k)?.clusterId === clusterId,
  );
  if (!stillDrafted && draft.cluster.conceptIds.every((id) => inLibrary.has(id)))
    changes.set(draft.path, null);
}

/** The library's copy of a drafted concept: only what the library can resolve yet. */
function libraryConcept(next: State, key: string, draft: Concept): Concept {
  const inLibrary = conceptIdsIn(next.library);
  const media = conceptIn(next.library, key)?.media;
  return {
    ...draft,
    // Images already in the library are kept if the draft doesn't carry them.
    ...(draft.media === undefined && media !== undefined ? { media } : {}),
    // Approving one locale of a new lesson: list only the locales the library has.
    variants: LOCALES.filter(
      (l) => draft.variants.includes(l) && variantIn(next.library, key, l) !== undefined,
    ),
    // Links to lessons not in the library yet are added once those lessons arrive.
    related: draft.related.filter((r) => inLibrary.has(r.conceptId)),
  };
}

/**
 * Writes the library concept.json of `key` and of every fully approved draft lesson, and
 * removes a lesson's draft folder once both locales are approved and all its related lessons
 * are in the library (until then the draft concept keeps the links the library can't hold
 * yet). Returns the keys whose draft folder is removed.
 */
function settleApproved(state: State, changes: Changes, key: string): string[] {
  const next = applyChanges(state, changes);
  const done: string[] = [];
  for (const k of lessonKeys(next.drafts)) {
    const draft = conceptIn(next.drafts, k);
    if (!draft) continue;
    const approved = draft.variants.every((l) => {
      const d = variantIn(next.drafts, k, l);
      return d
        ? d.reviewStatus === 'reviewed'
        : variantIn(next.library, k, l)?.reviewStatus === 'reviewed';
    });
    if (k !== key && !approved) continue;
    const concept = libraryConcept(next, k, draft);
    if (JSON.stringify(concept) !== JSON.stringify(conceptIn(next.library, k)))
      changes.set(conceptPath(CONTENT, k), concept);
    if (approved && concept.related.length === draft.related.length) {
      deleteDraftLesson(next, changes, k);
      done.push(k);
    }
  }
  return done;
}

function deleteDraftLesson(state: State, changes: Changes, key: string): void {
  const prefix = `${lessonDir(DRAFTS, key)}/`;
  for (const f of state.drafts.files) if (f.path.startsWith(prefix)) changes.set(f.path, null);
}

export async function runAction(ctx: ReviewContext, action: ReviewAction): Promise<ActionResult> {
  const key = checkKey(action.key);
  const state = await loadState(ctx.repoRoot);
  const now = nowOf(ctx).toISOString();
  const concept = conceptIn(state.drafts, key) ?? conceptIn(state.library, key);
  if (!concept) return fail(`no lesson "${key}"`);
  const changes: Changes = new Map();
  let notes: { path: string; append: string; header: string } | undefined;
  let message: string;
  const log = (locale: Locale | null, claimId: string | null, note: string | null) =>
    appendLog(ctx, {
      at: now,
      reviewer: REVIEWER,
      conceptId: concept.id,
      locale,
      action: action.type,
      claimId,
      note,
      ms: Math.max(0, Math.round(action.ms)),
    });

  switch (action.type) {
    case 'approve-claim': {
      const v = variantIn(state.drafts, key, action.locale);
      const claim = v?.claims.find((c) => c.id === action.claimId);
      if (!v || !claim)
        return fail(`no draft claim ${action.claimId} in ${key} (${action.locale})`);
      if (claim.autoVerdict === 'unsupported' || claim.autoVerdict === 'pending')
        return fail(`claim ${claim.id} is "${claim.autoVerdict}"; it can't be approved`);
      changes.set(variantPath(DRAFTS, key, action.locale), {
        ...v,
        claims: v.claims.map((c) => (c.id === claim.id ? { ...c, humanVerdict: 'approved' } : c)),
      });
      message = `Approved claim ${claim.id} (${action.locale}).`;
      break;
    }

    case 'approve-locale': {
      const l = action.locale;
      const v = variantIn(state.drafts, key, l);
      const quiz = quizIn(state.drafts, key, l);
      const draftConcept = conceptIn(state.drafts, key);
      if (!v || !quiz || !draftConcept) return fail(`no complete ${l} draft for ${key}`);
      const drafts = Object.fromEntries(
        LOCALES.map((x) => [x, variantIn(state.drafts, key, x)]).filter(([, d]) => d),
      ) as Partial<Record<Locale, LessonVariant>>;
      const blockers = blockersFor(drafts, lessonErrors(await errorsOf(state, ctx), key));
      if (blockers.length > 0) return fail(`can't approve: ${blockers.join('; ')}`);
      const open = v.claims.filter(
        (c) => c.humanVerdict !== 'approved' && c.humanVerdict !== 'edited',
      );
      if (open.length > 0)
        return fail(`approve every claim first: ${open.map((c) => c.id).join(', ')} still open`);

      changes.set(variantPath(CONTENT, key, l), {
        ...v,
        contentLicense: REVIEWED_LICENSE,
        reviewStatus: 'reviewed',
        publicationStatus: 'draft',
        reviewedBy: REVIEWER,
        reviewedAt: now,
        publishedAt: null,
        updatedAt: now,
      } satisfies LessonVariant);
      changes.set(
        quizPath(CONTENT, key, l),
        quiz.map((q) => ({ ...q, status: 'reviewed' }) satisfies QuizQuestion),
      );
      changes.set(variantPath(DRAFTS, key, l), {
        ...v,
        reviewStatus: 'reviewed',
        updatedAt: now,
      } satisfies LessonVariant);
      const done = settleApproved(state, changes, key);
      syncTrail(state, changes, draftConcept.clusterId);
      message = done.includes(key)
        ? `Approved ${l}. Both locales are in the library; the draft folder was removed.`
        : `Approved ${l} into the library.`;
      break;
    }

    case 'edit': {
      const l = action.locale;
      const v = variantIn(state.drafts, key, l);
      const quiz = quizIn(state.drafts, key, l);
      if (!v || !quiz) return fail(`no ${l} draft for ${key}`);
      const edited = applyEdit(v, quiz, action.edit);
      if (typeof edited === 'string') return fail(edited);
      changes.set(variantPath(DRAFTS, key, l), { ...edited.variant, updatedAt: now });
      changes.set(quizPath(DRAFTS, key, l), edited.questions);
      message =
        edited.touched.length > 0
          ? `Saved. Claims marked edited: ${edited.touched.join(', ')}.`
          : 'Saved.';
      break;
    }

    case 'reject': {
      const l = action.locale;
      const note = action.note.trim();
      if (note === '') return fail('a rejection needs a note');
      const v = variantIn(state.drafts, key, l);
      if (!v) return fail(`no ${l} draft for ${key}`);
      if (action.claimId !== null && !v.claims.some((c) => c.id === action.claimId))
        return fail(`no claim ${action.claimId} in ${key} (${l})`);
      changes.set(variantPath(DRAFTS, key, l), {
        ...v,
        reviewStatus: 'rejected',
        updatedAt: now,
        claims: v.claims.map((c) =>
          c.id === action.claimId ? { ...c, humanVerdict: 'rejected' } : c,
        ),
      } satisfies LessonVariant);
      const day = now.slice(0, 10);
      notes = {
        path: `${DRAFTS}/review/${day}-${concept.clusterId}.md`,
        header: `# Review notes: ${concept.clusterId}, ${day}\n\nWritten by the review tool when a variant is rejected. Writer sessions resolve each note (docs/content/WRITER.md).`,
        append: [
          `## ${key} · ${l}${action.claimId ? ` · claim ${action.claimId}` : ''}`,
          '',
          `- Lesson: \`${concept.id}\` (\`content/drafts/lessons/${key}/variant.${l}.json\`)`,
          `- Rejected by ${REVIEWER} at ${now}`,
          '',
          note,
        ].join('\n'),
      };
      message = `Rejected ${l}; the note is in ${notes.path}.`;
      break;
    }

    case 'note': {
      const note = action.note.trim();
      if (note === '') return fail('the note is empty');
      await log(action.locale, action.claimId, note);
      return { ok: true, message: 'Note added to the review log.' };
    }

    case 'publish': {
      const blockers = publishBlockers(state, key, hasOpenDrafts(state, key));
      if (blockers.length > 0) return fail(`can't publish: ${blockers.join('; ')}`);
      for (const l of LOCALES) {
        const v = variantIn(state.library, key, l);
        if (v)
          changes.set(variantPath(CONTENT, key, l), {
            ...v,
            publicationStatus: 'published',
            publishedAt: now,
            updatedAt: now,
          } satisfies LessonVariant);
      }
      message = 'Published both locales.';
      break;
    }
  }

  const issues = await commit(ctx, state, changes, notes ? { notes } : {});
  if (issues.length > 0)
    return fail('Nothing was written: the change would make the content invalid.', issues);
  const locale = 'locale' in action ? action.locale : null;
  const claimId = 'claimId' in action ? action.claimId : null;
  await log(locale, claimId, 'note' in action ? action.note.trim() : null);
  return { ok: true, message };
}

// ---- Editing ---------------------------------------------------------------------------

function setText(current: string, next: string | undefined): string {
  return next === undefined ? current : next.trim();
}

/**
 * Applies a reviewer's text edit. Only text fields change; IDs, excerpts and sources never do.
 * Claims whose wording changed, claims placed in a changed sentence's field, and claims a
 * changed quiz question relies on become "edited". Returns an error message for an edit that
 * doesn't fit the lesson's structure.
 */
export function applyEdit(
  v: LessonVariant,
  questions: QuizQuestion[],
  edit: LessonEdit,
): { variant: LessonVariant; questions: QuizQuestion[]; touched: string[] } | string {
  if (edit.cardText !== undefined && v.cardText === undefined)
    return 'this lesson has no card text to edit';
  for (const [blocks, name] of [
    [edit.cardBlocks, 'cardBlocks'],
    [edit.deepDiveBlocks, 'deepDiveBlocks'],
  ] as const)
    for (const i of Object.keys(blocks ?? {}))
      if (v[name][Number(i)] === undefined) return `no ${name}[${i}]`;
  for (const id of Object.keys(edit.claims ?? {}))
    if (!v.claims.some((c) => c.id === id)) return `no claim ${id}`;
  for (const [id, q] of Object.entries(edit.questions ?? {})) {
    const question = questions.find((x) => x.id === id);
    if (!question) return `no question ${id}`;
    for (const o of Object.keys(q.options ?? {}))
      if (!question.options.some((x) => x.id === o)) return `no option ${o} in ${id}`;
    if (
      q.misconception !== undefined &&
      question.misconception === undefined &&
      q.misconception.trim() !== ''
    )
      return `question ${id} has no misconception text to edit`;
  }

  const variant: LessonVariant = {
    ...v,
    title: setText(v.title, edit.title),
    hook: setText(v.hook, edit.hook),
    summary: setText(v.summary, edit.summary),
    ...(v.cardText !== undefined ? { cardText: setText(v.cardText, edit.cardText) } : {}),
    cardBlocks: v.cardBlocks.map((b, i) => ({ ...b, text: setText(b.text, edit.cardBlocks?.[i]) })),
    deepDiveBlocks: v.deepDiveBlocks.map((b, i) => ({
      ...b,
      text: setText(b.text, edit.deepDiveBlocks?.[i]),
    })),
    claims: v.claims.map((c) => ({ ...c, text: setText(c.text, edit.claims?.[c.id]) })),
  };
  const nextQuestions = questions.map((q) => {
    const e = edit.questions?.[q.id];
    if (!e) return q;
    return {
      ...q,
      prompt: setText(q.prompt, e.prompt),
      options: q.options.map((o) => ({ ...o, text: setText(o.text, e.options?.[o.id]) })),
      explanation: setText(q.explanation, e.explanation),
      ...(q.misconception !== undefined
        ? { misconception: setText(q.misconception, e.misconception) }
        : {}),
    };
  });

  const before = new Map(textFields(v));
  const changedFields = new Set(
    textFields(variant)
      .filter(([field, text]) => before.get(field) !== text)
      .map(([field]) => field),
  );
  const touched = new Set<string>();
  for (const loc of locateClaims(v)) if (changedFields.has(loc.field)) touched.add(loc.claimId);
  v.claims.forEach((c, i) => {
    if (variant.claims[i]?.text !== c.text) touched.add(c.id);
  });
  nextQuestions.forEach((q, i) => {
    if (JSON.stringify(q) !== JSON.stringify(questions[i]))
      for (const id of q.claimIds) touched.add(id);
  });

  const changed =
    changedFields.size > 0 ||
    touched.size > 0 ||
    JSON.stringify(nextQuestions) !== JSON.stringify(questions);
  return {
    variant: {
      ...variant,
      // An edited variant waits for approval again.
      reviewStatus: changed ? 'draft' : v.reviewStatus,
      claims: variant.claims.map((c) => (touched.has(c.id) ? { ...c, humanVerdict: 'edited' } : c)),
    },
    questions: nextQuestions,
    touched: [...touched].sort(),
  };
}
