import {
  CARD_WORDS_MAX,
  CARD_WORDS_MIN,
  ClusterSchema,
  ConceptSchema,
  DEEP_DIVE_WORDS_MAX,
  FIXTURE_ID_PREFIX,
  LOCALES,
  LessonVariantSchema,
  QuizFileSchema,
  SourceSchema,
  TAKEAWAY_WORDS_MAX,
  TopicsFileSchema,
  countWords,
  isFixtureId,
  isLocale,
  type Cluster,
  type Concept,
  type LessonVariant,
  type Locale,
  type QuizQuestion,
  type Source,
  type Topic,
} from '@lumen/domain';
import type { z } from 'zod';
import type { ContentFile, ContentTree } from './tree';

export type Severity = 'error' | 'warning';

export interface Issue {
  severity: Severity;
  /** Stable machine-readable code; tests assert on it. */
  code: string;
  file: string;
  /** Field path inside the file, e.g. "cardBlocks[0].text". Empty for whole-file issues. */
  field: string;
  message: string;
}

export interface ValidationResult {
  issues: Issue[];
  counts: {
    topics: number;
    clusters: number;
    concepts: number;
    variants: number;
    questions: number;
    sources: number;
  };
}

interface Located<T> {
  file: string;
  value: T;
  tree: ContentTree;
}

interface Collected {
  topics: Located<Topic>[];
  clusters: Located<Cluster>[];
  concepts: Located<Concept & { dir: string }>[];
  variants: Located<LessonVariant & { dir: string }>[];
  /** Quiz files keyed by "<dir>|<locale>". */
  quizFiles: Map<string, Located<QuizQuestion[]>>;
  sources: Located<Source>[];
}

const RESERVED_HOST = /(^|\.)(invalid|test|example|localhost)$|(^|\.)example\.(com|org|net)$/;
const FIXTURE_TEXT_PREFIX = 'FIXTURE';

function formatPath(path: readonly PropertyKey[]): string {
  let out = '';
  for (const part of path) {
    if (typeof part === 'number') out += `[${part}]`;
    else out += out === '' ? String(part) : `.${String(part)}`;
  }
  return out;
}

class Reporter {
  readonly issues: Issue[] = [];
  error(code: string, file: string, field: string, message: string): void {
    this.issues.push({ severity: 'error', code, file, field, message });
  }
  warn(code: string, file: string, field: string, message: string): void {
    this.issues.push({ severity: 'warning', code, file, field, message });
  }
  /** Draft content gets warnings where published content gets errors. */
  strictness(published: boolean, code: string, file: string, field: string, message: string): void {
    if (published) this.error(code, file, field, message);
    else this.warn(code, file, field, message);
  }
}

function parseWith<S extends z.ZodType>(
  schema: S,
  file: ContentFile,
  report: Reporter,
  fieldPrefix = '',
): z.infer<S> | undefined {
  const result = schema.safeParse(file.data);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    const field = formatPath([...(fieldPrefix ? [fieldPrefix] : []), ...issue.path]);
    report.error('schema', file.path, field, issue.message);
  }
  return undefined;
}

const LESSON_FILE = /^lessons\/([^/]+)\/(concept|variant\.([^.]+)|quiz\.([^.]+))\.json$/;

function collect(trees: ContentTree[], report: Reporter): Collected {
  const out: Collected = {
    topics: [],
    clusters: [],
    concepts: [],
    variants: [],
    quizFiles: new Map(),
    sources: [],
  };

  for (const tree of trees) {
    for (const file of tree.files) {
      if (file.parseError !== undefined) {
        report.error('json', file.path, '', `invalid JSON: ${file.parseError}`);
        continue;
      }
      const rel = file.path.slice(tree.root.length + 1);
      if (rel === 'topics.json') {
        const topics = parseWith(TopicsFileSchema, file, report);
        topics?.forEach((value) => out.topics.push({ file: file.path, value, tree }));
        continue;
      }
      if (/^clusters\/[^/]+\.json$/.test(rel)) {
        const value = parseWith(ClusterSchema, file, report);
        if (value) out.clusters.push({ file: file.path, value, tree });
        continue;
      }
      if (/^sources\/[^/]+\.json$/.test(rel)) {
        const value = parseWith(SourceSchema, file, report);
        if (value) out.sources.push({ file: file.path, value, tree });
        continue;
      }
      const m = LESSON_FILE.exec(rel);
      if (m === null) {
        report.error(
          'unknown-file',
          file.path,
          '',
          'unexpected file. Allowed: topics.json, clusters/*.json, sources/*.json, lessons/<dir>/{concept,variant.<locale>,quiz.<locale>}.json',
        );
        continue;
      }
      const dir = `${tree.root}/lessons/${m[1]}`;
      const locale = m[3] ?? m[4];
      if (locale !== undefined && !isLocale(locale)) {
        report.error(
          'unknown-locale',
          file.path,
          '',
          `unknown locale "${locale}" in file name; expected one of ${LOCALES.join(', ')}`,
        );
        continue;
      }
      if (m[2] === 'concept') {
        const value = parseWith(ConceptSchema, file, report);
        if (value) out.concepts.push({ file: file.path, value: { ...value, dir }, tree });
      } else if (m[3] !== undefined) {
        const value = parseWith(LessonVariantSchema, file, report);
        if (value) {
          if (value.locale !== locale) {
            report.error(
              'locale-mismatch',
              file.path,
              'locale',
              `is "${value.locale}" but the file name says "${locale}"`,
            );
          }
          out.variants.push({ file: file.path, value: { ...value, dir }, tree });
        }
      } else {
        const value = parseWith(QuizFileSchema, file, report);
        if (value) out.quizFiles.set(`${dir}|${locale}`, { file: file.path, value, tree });
      }
    }
  }
  return out;
}

function checkUnique<T>(
  items: Located<T>[],
  key: (v: T) => string | undefined,
  what: string,
  field: string,
  report: Reporter,
): void {
  const seen = new Map<string, string>();
  for (const item of items) {
    const k = key(item.value);
    if (k === undefined) continue;
    const prev = seen.get(k);
    if (prev !== undefined)
      report.error('duplicate', item.file, field, `duplicate ${what} "${k}" (also in ${prev})`);
    else seen.set(k, item.file);
  }
}

/** Fixture isolation and "obviously fake" guardrails, both directions. */
function checkFixtureFlag(
  item: Located<{ id: string; fixture?: true | undefined }>,
  report: Reporter,
  field = '',
): void {
  const isFixtureTree = item.tree.kind === 'fixtures';
  const at = (f: string) => (field ? `${field}.${f}` : f);
  if (isFixtureTree && item.value.fixture !== true) {
    report.error(
      'fixture-flag-missing',
      item.file,
      at('fixture'),
      'files under content/fixtures/ must set "fixture": true',
    );
  }
  if (!isFixtureTree && item.value.fixture === true) {
    report.error(
      'fixture-outside-fixtures',
      item.file,
      at('fixture'),
      '"fixture": true is only allowed under content/fixtures/',
    );
  }
  if (isFixtureTree && !isFixtureId(item.value.id)) {
    report.error(
      'fixture-id-prefix',
      item.file,
      at('id'),
      `fixture IDs must start with "${FIXTURE_ID_PREFIX}"`,
    );
  }
  if (!isFixtureTree && isFixtureId(item.value.id)) {
    report.error(
      'fixture-id-in-real',
      item.file,
      at('id'),
      `real content must not use the "${FIXTURE_ID_PREFIX}" ID prefix`,
    );
  }
}

function requireFixturePrefix(file: string, field: string, value: string, report: Reporter): void {
  if (!value.startsWith(FIXTURE_TEXT_PREFIX)) {
    report.error(
      'fixture-text-prefix',
      file,
      field,
      `fixture text must start with "${FIXTURE_TEXT_PREFIX}" so it can never be mistaken for real content`,
    );
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

export function validateContent(trees: ContentTree[]): ValidationResult {
  const report = new Reporter();
  const c = collect(trees, report);

  // ---- Uniqueness --------------------------------------------------------
  checkUnique(c.topics, (t) => t.id, 'topic id', 'id', report);
  checkUnique(c.clusters, (t) => t.id, 'cluster id', 'id', report);
  checkUnique(c.concepts, (t) => t.id, 'concept id', 'id', report);
  checkUnique(c.variants, (t) => t.id, 'variant id', 'id', report);
  checkUnique(c.sources, (t) => t.id, 'source id', 'id', report);
  for (const locale of LOCALES) {
    checkUnique(c.topics, (t) => t.slug[locale], `${locale} topic slug`, `slug.${locale}`, report);
    checkUnique(
      c.clusters,
      (t) => t.slug[locale],
      `${locale} trail slug`,
      `slug.${locale}`,
      report,
    );
    checkUnique(
      c.variants,
      (v) => (v.locale === locale ? v.slug : undefined),
      `${locale} lesson slug`,
      'slug',
      report,
    );
  }

  const topics = new Map(c.topics.map((t) => [t.value.id, t]));
  const clusters = new Map(c.clusters.map((t) => [t.value.id, t]));
  const concepts = new Map(c.concepts.map((t) => [t.value.id, t]));
  const sources = new Map(c.sources.map((t) => [t.value.id, t]));
  const variantsByDir = new Map<string, Located<LessonVariant & { dir: string }>[]>();
  for (const v of c.variants)
    variantsByDir.set(v.value.dir, [...(variantsByDir.get(v.value.dir) ?? []), v]);
  const crossesTree = (a: Located<unknown>, b: Located<unknown> | undefined) =>
    b !== undefined && a.tree.kind !== b.tree.kind;

  // ---- Topics ------------------------------------------------------------
  c.topics.forEach((t, i) => {
    checkFixtureFlag(t, report, `[${i}]`);
    if (t.tree.kind === 'fixtures') {
      requireFixturePrefix(t.file, `[${i}].name.pt-BR`, t.value.name['pt-BR'], report);
      requireFixturePrefix(t.file, `[${i}].name.en`, t.value.name.en, report);
    }
  });

  // ---- Clusters ----------------------------------------------------------
  for (const cl of c.clusters) {
    checkFixtureFlag(cl, report);
    if (cl.tree.kind === 'fixtures') {
      for (const l of LOCALES)
        requireFixturePrefix(cl.file, `title.${l}`, cl.value.title[l], report);
    }
    const topic = topics.get(cl.value.topicId);
    if (!topic)
      report.error('missing-ref', cl.file, 'topicId', `topic "${cl.value.topicId}" does not exist`);
    else if (crossesTree(cl, topic))
      report.error(
        'cross-tree-ref',
        cl.file,
        'topicId',
        'fixtures and real content must not reference each other',
      );
    cl.value.conceptIds.forEach((id, i) => {
      const concept = concepts.get(id);
      if (!concept)
        report.error('missing-ref', cl.file, `conceptIds[${i}]`, `concept "${id}" does not exist`);
      else if (crossesTree(cl, concept))
        report.error(
          'cross-tree-ref',
          cl.file,
          `conceptIds[${i}]`,
          'fixtures and real content must not reference each other',
        );
      else if (concept.value.clusterId !== cl.value.id) {
        report.error(
          'cluster-mismatch',
          cl.file,
          `conceptIds[${i}]`,
          `concept "${id}" says its cluster is "${concept.value.clusterId}"`,
        );
      }
    });
    if (new Set(cl.value.conceptIds).size !== cl.value.conceptIds.length) {
      report.error('duplicate', cl.file, 'conceptIds', 'lists the same concept more than once');
    }
    cl.value.links.forEach((link, i) => {
      if (!clusters.has(link.clusterId))
        report.error(
          'missing-ref',
          cl.file,
          `links[${i}].clusterId`,
          `trail "${link.clusterId}" does not exist`,
        );
      if (link.clusterId === cl.value.id)
        report.error('self-ref', cl.file, `links[${i}].clusterId`, 'a trail cannot link to itself');
    });
    const n = cl.value.conceptIds.length;
    if (n < 5 || n > 8)
      report.warn(
        'trail-size',
        cl.file,
        'conceptIds',
        `has ${n} concepts; §5.3 recommends 5–8 per trail`,
      );
  }

  // ---- Sources -----------------------------------------------------------
  const usedSources = new Set<string>();
  for (const s of c.sources) {
    checkFixtureFlag(s, report);
    const host = hostOf(s.value.url);
    if (s.tree.kind === 'fixtures') {
      requireFixturePrefix(s.file, 'title', s.value.title, report);
      requireFixturePrefix(s.file, 'publisher', s.value.publisher, report);
      if (!host.endsWith('.invalid'))
        report.error(
          'fixture-url',
          s.file,
          'url',
          'fixture source URLs must use a host on the .invalid TLD, e.g. https://example.invalid/…',
        );
    } else if (RESERVED_HOST.test(host)) {
      report.error(
        'placeholder-url',
        s.file,
        'url',
        `"${host}" is a reserved placeholder host; real sources need a real URL`,
      );
    }
  }

  // ---- Concepts, variants and quizzes ------------------------------------
  for (const concept of c.concepts) {
    const cv = concept.value;
    checkFixtureFlag(concept, report);
    const topic = topics.get(cv.topicId);
    if (!topic)
      report.error('missing-ref', concept.file, 'topicId', `topic "${cv.topicId}" does not exist`);
    else if (crossesTree(concept, topic))
      report.error(
        'cross-tree-ref',
        concept.file,
        'topicId',
        'fixtures and real content must not reference each other',
      );
    const cluster = clusters.get(cv.clusterId);
    if (!cluster) {
      report.error(
        'missing-ref',
        concept.file,
        'clusterId',
        `trail "${cv.clusterId}" does not exist`,
      );
    } else {
      if (cluster.value.topicId !== cv.topicId) {
        report.error(
          'cluster-mismatch',
          concept.file,
          'clusterId',
          `trail "${cv.clusterId}" belongs to topic "${cluster.value.topicId}", not "${cv.topicId}"`,
        );
      }
      const index = cluster.value.conceptIds.indexOf(cv.id);
      if (index === -1)
        report.error(
          'cluster-mismatch',
          concept.file,
          'clusterId',
          `trail "${cv.clusterId}" does not list this concept in conceptIds`,
        );
      else if (index + 1 !== cv.clusterOrder) {
        report.error(
          'cluster-order',
          concept.file,
          'clusterOrder',
          `is ${cv.clusterOrder} but the concept is at position ${index + 1} in ${cluster.file}`,
        );
      }
    }
    cv.related.forEach((r, i) => {
      const target = concepts.get(r.conceptId);
      if (!target)
        report.error(
          'missing-ref',
          concept.file,
          `related[${i}].conceptId`,
          `concept "${r.conceptId}" does not exist`,
        );
      else if (crossesTree(concept, target))
        report.error(
          'cross-tree-ref',
          concept.file,
          `related[${i}].conceptId`,
          'fixtures and real content must not reference each other',
        );
      if (r.conceptId === cv.id)
        report.error(
          'self-ref',
          concept.file,
          `related[${i}].conceptId`,
          'a concept cannot relate to itself',
        );
      for (const locale of cv.variants) {
        if (r.reason[locale] === undefined)
          report.error(
            'missing-locale',
            concept.file,
            `related[${i}].reason.${locale}`,
            `missing; the concept declares a ${locale} variant`,
          );
      }
    });
    if (new Set(cv.variants).size !== cv.variants.length)
      report.error('duplicate', concept.file, 'variants', 'lists a locale more than once');

    const variants = variantsByDir.get(cv.dir) ?? [];
    const anyPublished = variants.some((v) => v.value.publicationStatus === 'published');
    const requiredLocales: readonly Locale[] =
      concept.tree.kind === 'fixtures' || anyPublished ? LOCALES : cv.variants;
    for (const locale of requiredLocales) {
      const why =
        concept.tree.kind === 'fixtures'
          ? 'fixtures always need both locales'
          : anyPublished
            ? 'published concepts need both pt-BR and en'
            : 'declared in variants';
      if (!cv.variants.includes(locale))
        report.error(
          'missing-locale',
          concept.file,
          'variants',
          `must include "${locale}" (${why})`,
        );
      if (!variants.some((v) => v.value.locale === locale))
        report.error(
          'missing-locale',
          concept.file,
          'variants',
          `has no variant.${locale}.json (${why})`,
        );
    }
    if (anyPublished) {
      for (const v of variants) {
        if (v.value.publicationStatus !== 'published') {
          report.error(
            'missing-locale',
            v.file,
            'publicationStatus',
            `is "${v.value.publicationStatus}" but the other locale is published; publish both locales together`,
          );
        }
      }
    }
    for (const v of variants) {
      if (!cv.variants.includes(v.value.locale))
        report.error(
          'undeclared-variant',
          v.file,
          'locale',
          `"${v.value.locale}" is not listed in ${concept.file} → variants`,
        );
    }
  }

  const groupsByConcept = new Map<string, Map<Locale, Set<string>>>();

  for (const variant of c.variants) {
    const v = variant.value;
    const f = variant.file;
    const published = v.publicationStatus === 'published';
    checkFixtureFlag(variant, report);
    const concept = c.concepts.find((x) => x.value.dir === v.dir);
    if (!concept) report.error('missing-ref', f, '', `no concept.json in ${v.dir}`);
    else if (concept.value.id !== v.conceptId)
      report.error(
        'missing-ref',
        f,
        'conceptId',
        `is "${v.conceptId}" but ${concept.file} has id "${concept.value.id}"`,
      );
    if (!v.id.endsWith(`__${v.locale}`))
      report.error('id-locale', f, 'id', `must end with "__${v.locale}"`);

    // Publication state consistency.
    if (v.publicationStatus === 'published') {
      if (v.reviewStatus !== 'reviewed')
        report.error(
          'unreviewed-published',
          f,
          'reviewStatus',
          `is "${v.reviewStatus}"; only "reviewed" variants may be published`,
        );
      if (v.reviewedBy === null)
        report.error('unreviewed-published', f, 'reviewedBy', 'published variants need a reviewer');
      if (v.reviewedAt === null)
        report.error(
          'unreviewed-published',
          f,
          'reviewedAt',
          'published variants need a review date',
        );
      if (v.publishedAt === null)
        report.error(
          'unreviewed-published',
          f,
          'publishedAt',
          'published variants need a publication date',
        );
    }

    // License fields.
    if (variant.tree.kind === 'fixtures' && v.contentLicense !== 'fixture') {
      report.error('license', f, 'contentLicense', 'fixtures must use "fixture"');
    }
    if (variant.tree.kind === 'real' && v.contentLicense === 'fixture') {
      report.error(
        'license',
        f,
        'contentLicense',
        '"fixture" is only allowed under content/fixtures/',
      );
    }
    if (published && v.contentLicense === 'pending') {
      report.error(
        'license',
        f,
        'contentLicense',
        'is "pending"; choose a license before publishing (founder decision §5.6)',
      );
    }

    // Fixture guardrails.
    if (variant.tree.kind === 'fixtures') {
      requireFixturePrefix(f, 'title', v.title, report);
      requireFixturePrefix(f, 'hook', v.hook, report);
      requireFixturePrefix(f, 'summary', v.summary, report);
      v.cardBlocks.forEach((b, i) => {
        requireFixturePrefix(f, `cardBlocks[${i}].text`, b.text, report);
      });
    }

    // Word limits (all statuses).
    const paragraphs = v.cardBlocks.filter((b) => b.type === 'paragraph');
    const takeaways = v.cardBlocks.filter((b) => b.type === 'takeaway');
    const bodyWords = paragraphs.reduce((n, b) => n + countWords(b.text, v.locale), 0);
    if (paragraphs.length === 0)
      report.error('card-words', f, 'cardBlocks', 'needs at least one paragraph block');
    else if (bodyWords < CARD_WORDS_MIN || bodyWords > CARD_WORDS_MAX) {
      report.error(
        'card-words',
        f,
        'cardBlocks',
        `card body has ${bodyWords} words (allowed ${CARD_WORDS_MIN}–${CARD_WORDS_MAX}; the takeaway is not counted)`,
      );
    }
    if (takeaways.length > 1)
      report.error(
        'takeaway',
        f,
        'cardBlocks',
        `has ${takeaways.length} takeaway blocks; at most 1 is allowed`,
      );
    v.cardBlocks.forEach((b, i) => {
      if (b.type !== 'takeaway') return;
      const n = countWords(b.text, v.locale);
      if (n > TAKEAWAY_WORDS_MAX)
        report.error(
          'takeaway',
          f,
          `cardBlocks[${i}].text`,
          `takeaway has ${n} words (max ${TAKEAWAY_WORDS_MAX})`,
        );
    });
    const deepWords = v.deepDiveBlocks.reduce((n, b) => n + countWords(b.text, v.locale), 0);
    if (deepWords > DEEP_DIVE_WORDS_MAX)
      report.error(
        'deep-dive-words',
        f,
        'deepDiveBlocks',
        `deep dive has ${deepWords} words (max ${DEEP_DIVE_WORDS_MAX})`,
      );

    // Sources and claims.
    v.sourceIds.forEach((id, i) => {
      const src = sources.get(id);
      usedSources.add(id);
      if (!src)
        report.error(
          'missing-ref',
          f,
          `sourceIds[${i}]`,
          `source "${id}" does not exist in sources/`,
        );
      else if (crossesTree(variant, src))
        report.error(
          'cross-tree-ref',
          f,
          `sourceIds[${i}]`,
          'fixtures and real content must not reference each other',
        );
    });
    if (v.claims.length === 0) {
      report.strictness(
        published,
        'no-claims',
        f,
        'claims',
        'has no claims; every factual statement must be extracted as a claim with source support',
      );
    }
    checkUnique(
      v.claims.map((value) => ({ file: f, value, tree: variant.tree })),
      (cl) => cl.id,
      'claim id',
      'claims',
      report,
    );
    v.claims.forEach((claim, i) => {
      const at = `claims[${i}]`;
      if (claim.support.length === 0) {
        report.strictness(
          published,
          'claim-unsupported',
          f,
          `${at}.support`,
          `claim "${claim.id}" is not mapped to any {sourceId, excerpt}`,
        );
      }
      claim.support.forEach((s, j) => {
        if (!sources.has(s.sourceId))
          report.error(
            'missing-ref',
            f,
            `${at}.support[${j}].sourceId`,
            `source "${s.sourceId}" does not exist`,
          );
        else if (!v.sourceIds.includes(s.sourceId))
          report.error(
            'source-not-listed',
            f,
            `${at}.support[${j}].sourceId`,
            `"${s.sourceId}" is not listed in sourceIds`,
          );
      });
      if (claim.highStakes) {
        const ids = new Set(claim.support.map((s) => s.sourceId));
        const publishers = new Set(
          [...ids]
            .map((id) => sources.get(id)?.value.publisher.trim().toLowerCase())
            .filter((p) => p !== undefined),
        );
        if (ids.size < 2 || publishers.size < 2) {
          report.strictness(
            published,
            'high-stakes-sources',
            f,
            `${at}.support`,
            `high-stakes claim "${claim.id}" needs 2 independent sources (different source IDs and different publishers); has ${ids.size} source(s) from ${publishers.size} publisher(s)`,
          );
        }
      }
      if (published) {
        if (claim.autoVerdict === 'unsupported')
          report.error(
            'claim-verdict',
            f,
            `${at}.autoVerdict`,
            `claim "${claim.id}" was judged unsupported; it blocks publication`,
          );
        if (claim.humanVerdict !== 'approved' && claim.humanVerdict !== 'edited') {
          report.error(
            'claim-verdict',
            f,
            `${at}.humanVerdict`,
            `claim "${claim.id}" is "${claim.humanVerdict}"; published claims must be approved`,
          );
        }
      }
    });

    // Quiz.
    const quiz = c.quizFiles.get(`${v.dir}|${v.locale}`);
    if (!quiz) {
      report.error('quiz-missing', f, 'quizIds', `no quiz.${v.locale}.json next to this variant`);
      continue;
    }
    const questions = quiz.value;
    if (questions.length < 2 || questions.length > 3) {
      report.error(
        'quiz-count',
        quiz.file,
        '',
        `has ${questions.length} questions; each variant needs 2–3`,
      );
    }
    const qids = questions.map((q) => q.id);
    const listed = new Set(v.quizIds);
    if (qids.length !== listed.size || qids.some((id) => !listed.has(id))) {
      report.error(
        'quiz-ids',
        f,
        'quizIds',
        `must list exactly the questions in ${quiz.file}: [${qids.join(', ')}]`,
      );
    }
    const claimIds = new Set(v.claims.map((cl) => cl.id));
    const groups = new Set<string>();
    questions.forEach((q, i) => {
      const at = `[${i}]`;
      checkFixtureFlag({ ...quiz, value: q }, report, at);
      if (quiz.tree.kind === 'fixtures')
        requireFixturePrefix(quiz.file, `${at}.prompt`, q.prompt, report);
      if (q.conceptId !== v.conceptId)
        report.error(
          'missing-ref',
          quiz.file,
          `${at}.conceptId`,
          `is "${q.conceptId}" but the variant's concept is "${v.conceptId}"`,
        );
      if (q.locale !== v.locale)
        report.error(
          'locale-mismatch',
          quiz.file,
          `${at}.locale`,
          `is "${q.locale}" but the file is for "${v.locale}"`,
        );
      if (!q.id.endsWith(`__${v.locale}`))
        report.error('id-locale', quiz.file, `${at}.id`, `must end with "__${v.locale}"`);
      const optionIds = q.options.map((o) => o.id);
      if (new Set(optionIds).size !== optionIds.length)
        report.error('quiz-options', quiz.file, `${at}.options`, 'option IDs must be unique');
      const texts = q.options.map((o) => o.text.trim().toLowerCase());
      if (new Set(texts).size !== texts.length)
        report.error('quiz-options', quiz.file, `${at}.options`, 'two options have the same text');
      const correct = optionIds.filter((id) => id === q.correctOptionId).length;
      if (correct !== 1) {
        report.error(
          'quiz-correct',
          quiz.file,
          `${at}.correctOptionId`,
          `"${q.correctOptionId}" must match exactly one option ID (${optionIds.join(', ')})`,
        );
      }
      if (groups.has(q.questionGroupId))
        report.error(
          'duplicate',
          quiz.file,
          `${at}.questionGroupId`,
          `"${q.questionGroupId}" is used twice in this locale`,
        );
      groups.add(q.questionGroupId);
      q.claimIds.forEach((cid, j) => {
        if (!claimIds.has(cid))
          report.error(
            'missing-ref',
            quiz.file,
            `${at}.claimIds[${j}]`,
            `claim "${cid}" does not exist in ${f}`,
          );
      });
      if (published) {
        if (q.claimIds.length === 0)
          report.error(
            'quiz-claims',
            quiz.file,
            `${at}.claimIds`,
            'published questions must reference the claims that support the answer',
          );
        if (q.status !== 'reviewed')
          report.error(
            'quiz-status',
            quiz.file,
            `${at}.status`,
            `is "${q.status}"; published questions must be "reviewed"`,
          );
      }
    });
    const byLocale = groupsByConcept.get(v.conceptId) ?? new Map<Locale, Set<string>>();
    byLocale.set(v.locale, groups);
    groupsByConcept.set(v.conceptId, byLocale);
  }

  // questionGroupId must pair across locales (so review progress survives a language switch).
  for (const [conceptId, byLocale] of groupsByConcept) {
    const pt = byLocale.get('pt-BR');
    const en = byLocale.get('en');
    if (!pt || !en) continue;
    const dir = c.concepts.find((x) => x.value.id === conceptId)?.value.dir;
    for (const [mine, theirs, locale, other] of [
      [pt, en, 'pt-BR', 'en'],
      [en, pt, 'en', 'pt-BR'],
    ] as const) {
      for (const g of mine) {
        if (!theirs.has(g)) {
          const file = c.quizFiles.get(`${dir}|${locale}`)?.file ?? conceptId;
          report.error(
            'question-group',
            file,
            'questionGroupId',
            `"${g}" has no matching question in quiz.${other}.json`,
          );
        }
      }
    }
  }

  for (const s of c.sources) {
    if (!usedSources.has(s.value.id))
      report.warn('unused-source', s.file, 'id', 'no lesson variant cites this source');
  }

  // Quiz files without a variant.
  for (const [key, quiz] of c.quizFiles) {
    if (!c.variants.some((v) => `${v.value.dir}|${v.value.locale}` === key)) {
      report.error('orphan-quiz', quiz.file, '', 'has no matching variant file');
    }
  }

  return {
    issues: report.issues,
    counts: {
      topics: c.topics.length,
      clusters: c.clusters.length,
      concepts: c.concepts.length,
      variants: c.variants.length,
      questions: [...c.quizFiles.values()].reduce((n, q) => n + q.value.length, 0),
      sources: c.sources.length,
    },
  };
}
