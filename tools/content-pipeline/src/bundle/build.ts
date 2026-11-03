import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import {
  ClusterSchema,
  ConceptSchema,
  LOCALES,
  LessonVariantSchema,
  MANIFEST_FILE,
  QuizQuestionSchema,
  SourceSchema,
  TopicsFileSchema,
  selectContent,
  splitMediaHashes,
  type ContentChannel,
  type ContentLibrary,
  type ContentManifest,
  type Locale,
  type TopicFile,
} from '@lumen/domain';
import { z } from 'zod';
import type { ContentTree } from '../validate/tree';

export interface BuildResult {
  manifest: ContentManifest;
  /** File name → contents (JSON text), including manifest.json. */
  files: Map<string, string>;
  /** Compressed bytes a first visit downloads per locale: manifest, index, media, topics. */
  firstVisitGzip: Record<Locale, number>;
}

const hash8 = (text: string) => createHash('sha256').update(text).digest('hex').slice(0, 8);
const gzipSize = (text: string) => gzipSync(text).length;

/** Parses validated content trees into a library. */
export function libraryFromTrees(trees: ContentTree[]): ContentLibrary {
  const bucket = (re: RegExp) =>
    trees.flatMap((t) => t.files.filter((f) => re.test(f.path)).map((f) => f.data));
  return {
    topics: bucket(/\/topics\.json$/).flatMap((d) => TopicsFileSchema.parse(d)),
    clusters: bucket(/\/clusters\/[^/]+\.json$/).map((d) => ClusterSchema.parse(d)),
    concepts: bucket(/\/lessons\/[^/]+\/concept\.json$/).map((d) => ConceptSchema.parse(d)),
    variants: bucket(/\/lessons\/[^/]+\/variant\.[^.]+\.json$/).map((d) =>
      LessonVariantSchema.parse(d),
    ),
    questions: bucket(/\/lessons\/[^/]+\/quiz\.[^.]+\.json$/).flatMap((d) =>
      z.array(QuizQuestionSchema).parse(d),
    ),
    sources: bucket(/\/sources\/[^/]+\.json$/).map((d) => SourceSchema.parse(d)),
  };
}

/**
 * The versioned static content bundle (§5.7 content:build, D16): file names carry a hash
 * of their contents, so unchanged files keep their names and stay cached.
 */
export function buildContent(raw: ContentLibrary, channel: ContentChannel): BuildResult {
  const lib = selectContent(raw, channel);
  const files = new Map<string, string>();
  const add = (base: string, value: unknown) => {
    const text = JSON.stringify(value);
    const name = `${base}.${hash8(text)}.json`;
    files.set(name, text);
    return name;
  };

  const { index, media } = splitMediaHashes({
    topics: lib.topics,
    clusters: lib.clusters,
    concepts: lib.concepts,
  });
  const indexName = add('index', index);
  const mediaName = add('media', media);

  const topicOf = new Map(lib.concepts.map((c) => [c.id, c.topicId]));
  const sourcesById = new Map(lib.sources.map((s) => [s.id, s]));
  const questionsById = new Map(lib.questions.map((q) => [q.id, q]));
  const topics: ContentManifest['topics'] = {};
  for (const topic of lib.topics) {
    for (const locale of LOCALES) {
      const variants = lib.variants.filter(
        (v) => v.locale === locale && topicOf.get(v.conceptId) === topic.id,
      );
      if (variants.length === 0) continue;
      const file: TopicFile = {
        variants,
        questions: variants
          .flatMap((v) => v.quizIds)
          .map((id) => questionsById.get(id))
          .filter((q) => q !== undefined),
        sources: [...new Set(variants.flatMap((v) => v.sourceIds))]
          .map((id) => sourcesById.get(id))
          .filter((s) => s !== undefined),
      };
      (topics[topic.id] ??= {})[locale] = add(`${topic.id}.${locale}`, file);
    }
  }

  const manifest: ContentManifest = {
    version: 1,
    channel,
    index: indexName,
    media: mediaName,
    topics,
  };
  const manifestText = JSON.stringify(manifest);
  files.set(MANIFEST_FILE, manifestText);

  const size = (name: string | undefined) => (name ? gzipSize(files.get(name) ?? '') : 0);
  const firstVisitGzip = Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      gzipSize(manifestText) +
        size(indexName) +
        size(mediaName) +
        Object.values(topics).reduce((n, byLocale) => n + size(byLocale[locale]), 0),
    ]),
  ) as Record<Locale, number>;

  return { manifest, files, firstVisitGzip };
}
