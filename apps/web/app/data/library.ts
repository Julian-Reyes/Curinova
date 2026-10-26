import {
  ClusterSchema,
  ConceptSchema,
  LessonVariantSchema,
  QuizQuestionSchema,
  SourceSchema,
  TopicSchema,
  countWords,
  readingTimeSeconds,
  selectContent,
  type Cluster,
  type Concept,
  type ContentChannel,
  type ContentLibrary,
  type LessonVariant,
  type Locale,
  type QuizQuestion,
  type Source,
  type Topic,
} from '@lumen/domain';
import { z } from 'zod';

/** Read-only, indexed view of the content bundle (the P0 StaticContentRepository, §9.7). */
export interface Library {
  channel: ContentChannel;
  topics: Topic[];
  clusters: Cluster[];
  concepts: Concept[];
  topic(id: string): Topic | undefined;
  cluster(id: string): Cluster | undefined;
  concept(id: string): Concept | undefined;
  /** The variant in `locale`, or in the other locale when that is the only one. */
  variant(conceptId: string, locale: Locale): LessonVariant | undefined;
  questions(conceptId: string, locale: Locale): QuizQuestion[];
  /** Question in `locale` for a question group (reviews survive a language switch). */
  questionForGroup(questionGroupId: string, locale: Locale): QuizQuestion | undefined;
  sources(variant: LessonVariant): Source[];
  topicBySlug(slug: string, locale: Locale): Topic | undefined;
  clusterBySlug(slug: string, locale: Locale): Cluster | undefined;
  conceptsInCluster(clusterId: string): Concept[];
  clustersInTopic(topicId: string): Cluster[];
  conceptsInTopic(topicId: string): Concept[];
  readingSeconds(variant: LessonVariant): number;
  search(query: string, locale: Locale): Concept[];
}

/** Lowercase, accent-insensitive form used for search ("coração" matches "coracao"). */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function buildLibrary(raw: ContentLibrary, channel: ContentChannel): Library {
  const lib = selectContent(raw, channel);
  const topics = [...lib.topics].sort((a, b) => a.sortOrder - b.sortOrder);
  const topicsById = new Map(topics.map((t) => [t.id, t]));
  const clustersById = new Map(lib.clusters.map((c) => [c.id, c]));
  const conceptsById = new Map(lib.concepts.map((c) => [c.id, c]));
  const variants = new Map(lib.variants.map((v) => [`${v.conceptId}|${v.locale}`, v]));
  const questionsById = new Map(lib.questions.map((q) => [q.id, q]));
  const questionsByGroup = new Map(
    lib.questions.map((q) => [`${q.questionGroupId}|${q.locale}`, q]),
  );
  const sourcesById = new Map(lib.sources.map((s) => [s.id, s]));
  const order = (c: Concept) => {
    const cluster = clustersById.get(c.clusterId);
    return [
      topicsById.get(c.topicId)?.sortOrder ?? 0,
      cluster?.conceptIds.indexOf(c.id) ?? 0,
    ] as const;
  };
  const concepts = [...lib.concepts].sort((a, b) => {
    const [ta, ca] = order(a);
    const [tb, cb] = order(b);
    return ta - tb || ca - cb;
  });

  const variant = (conceptId: string, locale: Locale) =>
    variants.get(`${conceptId}|${locale}`) ??
    variants.get(`${conceptId}|${locale === 'pt-BR' ? 'en' : 'pt-BR'}`);

  const searchText = new Map<string, string>();
  const textFor = (c: Concept, locale: Locale) => {
    const key = `${c.id}|${locale}`;
    let value = searchText.get(key);
    if (value === undefined) {
      const v = variant(c.id, locale);
      const topic = topicsById.get(c.topicId);
      value = normalize([v?.title, v?.summary, v?.hook, topic?.name[locale], ...c.tags].join(' '));
      searchText.set(key, value);
    }
    return value;
  };

  return {
    channel,
    topics,
    clusters: lib.clusters,
    concepts,
    topic: (id) => topicsById.get(id),
    cluster: (id) => clustersById.get(id),
    concept: (id) => conceptsById.get(id),
    variant,
    questions: (conceptId, locale) => {
      const v = variant(conceptId, locale);
      return (v?.quizIds ?? [])
        .map((id) => questionsById.get(id))
        .filter((q): q is QuizQuestion => q !== undefined);
    },
    questionForGroup: (group, locale) =>
      questionsByGroup.get(`${group}|${locale}`) ??
      questionsByGroup.get(`${group}|${locale === 'pt-BR' ? 'en' : 'pt-BR'}`),
    sources: (v) =>
      v.sourceIds.map((id) => sourcesById.get(id)).filter((s): s is Source => s !== undefined),
    topicBySlug: (slug, locale) =>
      topics.find((t) => t.slug[locale] === slug || t.slug.en === slug || t.slug['pt-BR'] === slug),
    clusterBySlug: (slug, locale) =>
      lib.clusters.find(
        (c) => c.slug[locale] === slug || c.slug.en === slug || c.slug['pt-BR'] === slug,
      ),
    conceptsInCluster: (clusterId) =>
      (clustersById.get(clusterId)?.conceptIds ?? [])
        .map((id) => conceptsById.get(id))
        .filter((c): c is Concept => c !== undefined),
    clustersInTopic: (topicId) => lib.clusters.filter((c) => c.topicId === topicId),
    conceptsInTopic: (topicId) => concepts.filter((c) => c.topicId === topicId),
    readingSeconds: (v) =>
      readingTimeSeconds(v.cardBlocks.reduce((n, b) => n + countWords(b.text, v.locale), 0)),
    search: (query, locale) => {
      const terms = normalize(query).split(/\s+/).filter(Boolean);
      if (terms.length === 0) return [];
      return concepts.filter((c) => {
        const text = textFor(c, locale);
        return terms.every((t) => text.includes(t));
      });
    },
  };
}

const RawSchema = z.object({
  channel: z.enum(['production', 'preview', 'fixtures']),
  topics: z.array(TopicSchema),
  clusters: z.array(ClusterSchema),
  concepts: z.array(ConceptSchema),
  variants: z.array(LessonVariantSchema),
  questions: z.array(QuizQuestionSchema),
  sources: z.array(SourceSchema),
});

let cached: Promise<Library> | undefined;

/** Loads the content chunk once (it is precached by the service worker for offline use). */
export function loadLibrary(): Promise<Library> {
  cached ??= import('virtual:lumen-content').then((mod) => {
    const raw = RawSchema.parse(mod.default);
    return buildLibrary(raw, raw.channel);
  });
  return cached;
}
