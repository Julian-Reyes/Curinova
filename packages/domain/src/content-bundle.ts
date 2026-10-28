import { z } from 'zod';
import { LOCALES, type Locale } from './locale';
import {
  ClusterSchema,
  ConceptSchema,
  LessonVariantSchema,
  MEDIA_SLOTS,
  QuizQuestionSchema,
  SourceSchema,
  TopicSchema,
  type Concept,
  type ContentLibrary,
} from './schemas/content';

/**
 * The static content bundle's file format (§5.7 content:build, D16), shared by the build
 * (tools/content-pipeline) and the app's loader. Small, separately cached files so a
 * change re-downloads only what changed:
 * - manifest.json, the only unhashed file, names the current files;
 * - index: topics, clusters and concepts, with image versions blanked;
 * - one file per topic and locale: its variants, quizzes and sources;
 * - media: each image's file hash, so swapping a picture changes only this file.
 */
export const CONTENT_DIR = '/content';
export const MANIFEST_FILE = 'manifest.json';

const fileName = z.string().regex(/^[a-z0-9_.-]+\.json$/i);

export const ContentManifestSchema = z.object({
  version: z.literal(1),
  channel: z.enum(['production', 'preview', 'fixtures']),
  index: fileName,
  media: fileName,
  topics: z.record(z.string(), z.partialRecord(z.enum(LOCALES), fileName)),
});
export type ContentManifest = z.infer<typeof ContentManifestSchema>;

/** Images in the index carry an empty hash; the media file fills it in. */
export const ContentIndexSchema = z.object({
  topics: z.array(z.unknown()),
  clusters: z.array(ClusterSchema),
  concepts: z.array(z.unknown()),
});
export interface ContentIndex {
  topics: ContentLibrary['topics'];
  clusters: ContentLibrary['clusters'];
  concepts: Concept[];
}

export const TopicFileSchema = z.object({
  variants: z.array(LessonVariantSchema),
  questions: z.array(QuizQuestionSchema),
  sources: z.array(SourceSchema),
});
export type TopicFile = z.infer<typeof TopicFileSchema>;

export const MediaFileSchema = z.object({
  concepts: z.record(z.string(), z.partialRecord(z.enum(MEDIA_SLOTS), z.string())),
  topics: z.record(z.string(), z.string()),
});
export type MediaFile = z.infer<typeof MediaFileSchema>;

type WithImages = { image?: { hash: string } };
type WithMedia = { media?: Partial<Record<(typeof MEDIA_SLOTS)[number], { hash: string }>> };

/** Moves image hashes out of topics and concepts (build side). */
export function splitMediaHashes(index: ContentIndex): { index: ContentIndex; media: MediaFile } {
  const media: MediaFile = { concepts: {}, topics: {} };
  const topics = index.topics.map((t) => {
    if (!t.image) return t;
    media.topics[t.id] = t.image.hash;
    return { ...t, image: { ...t.image, hash: '' } };
  });
  const concepts = index.concepts.map((c) => {
    if (!c.media) return c;
    const slots: MediaFile['concepts'][string] = {};
    const blanked: NonNullable<Concept['media']> = {};
    for (const slot of MEDIA_SLOTS) {
      const image = c.media[slot];
      if (!image) continue;
      slots[slot] = image.hash;
      blanked[slot] = { ...image, hash: '' };
    }
    media.concepts[c.id] = slots;
    return { ...c, media: blanked };
  });
  return { index: { ...index, topics, concepts }, media };
}

/** Puts image hashes back and checks the result against the content schemas (app side). */
export function restoreMediaHashes(
  index: { topics: unknown[]; clusters: ContentIndex['clusters']; concepts: unknown[] },
  media: MediaFile,
): ContentIndex {
  const topics = index.topics.map((raw) => {
    const t = raw as WithImages & { id: string };
    return TopicSchema.parse(
      t.image ? { ...t, image: { ...t.image, hash: media.topics[t.id] ?? '' } } : t,
    );
  });
  const concepts = index.concepts.map((raw) => {
    const c = raw as WithMedia & { id: string };
    if (!c.media) return ConceptSchema.parse(c);
    const slots = media.concepts[c.id] ?? {};
    const restored: Record<string, unknown> = {};
    for (const slot of MEDIA_SLOTS) {
      const image = c.media[slot];
      if (image) restored[slot] = { ...image, hash: slots[slot] ?? '' };
    }
    return ConceptSchema.parse({ ...c, media: restored });
  });
  return { topics, clusters: index.clusters, concepts };
}

/**
 * Topic files the app needs in `locale`: every topic's file in that locale, plus the
 * other locale's file for topics with lessons that exist only in the other locale.
 */
export function topicFilesFor(
  manifest: ContentManifest,
  index: ContentIndex,
  locale: Locale,
): string[] {
  const other: Locale = locale === 'pt-BR' ? 'en' : 'pt-BR';
  const needOther = new Set(
    index.concepts.filter((c) => !c.variants.includes(locale)).map((c) => c.topicId),
  );
  const names: string[] = [];
  for (const [topicId, byLocale] of Object.entries(manifest.topics)) {
    const own = byLocale[locale];
    if (own) names.push(own);
    const fallback = byLocale[other];
    if (fallback && (needOther.has(topicId) || !own)) names.push(fallback);
  }
  return names;
}
