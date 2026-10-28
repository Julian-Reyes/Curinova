import { z } from 'zod';
import {
  CLUSTER_ID_PATTERN,
  CONCEPT_ID_PATTERN,
  QUESTION_GROUP_ID_PATTERN,
  QUESTION_ID_PATTERN,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
  SOURCE_ID_PATTERN,
  TOPIC_ID_PATTERN,
  VARIANT_ID_PATTERN,
} from '../ids';
import { LOCALES } from '../locale';

const text = z.string().trim().min(1, 'must not be empty');
const isoDateTime = z.iso.datetime({ offset: true });

export const LocaleSchema = z.enum(LOCALES);

/** Text authored in both locales. */
export const LocalizedTextSchema = z.strictObject({ 'pt-BR': text, en: text });
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

/** Text that may exist in one locale only (for single-locale drafts). */
export const PartialLocalizedTextSchema = z
  .strictObject({ 'pt-BR': text.optional(), en: text.optional() })
  .refine((v) => v['pt-BR'] !== undefined || v.en !== undefined, 'needs at least one locale');

export const SlugSchema = z
  .string()
  .max(SLUG_MAX_LENGTH, `must be at most ${SLUG_MAX_LENGTH} characters`)
  .regex(SLUG_PATTERN, 'must be lowercase ASCII kebab-case (a-z, 0-9, hyphens; no accents)');
export const LocalizedSlugSchema = z.strictObject({ 'pt-BR': SlugSchema, en: SlugSchema });

const id = (pattern: RegExp, example: string) =>
  z.string().regex(pattern, `must match the ID format, e.g. "${example}"`);

export const TopicIdSchema = id(TOPIC_ID_PATTERN, 'space');
export const ConceptIdSchema = id(CONCEPT_ID_PATTERN, 'concept_moon_tidal_locking');
export const ClusterIdSchema = id(CLUSTER_ID_PATTERN, 'cluster_moon_shapes_earth');
export const SourceIdSchema = id(SOURCE_ID_PATTERN, 'src_nasa_moon');
export const VariantIdSchema = id(VARIANT_ID_PATTERN, 'lesson_moon_tidal_locking__pt-BR');
export const QuestionIdSchema = id(QUESTION_ID_PATTERN, 'q_moon_tidal_locking_1__pt-BR');
export const QuestionGroupIdSchema = id(QUESTION_GROUP_ID_PATTERN, 'qg_moon_tidal_locking_1');

const fixtureFlag = { fixture: z.literal(true).optional() };

/** Image slots a lesson can have (D15/P10): the Discover card, Go Deeper and Review. */
export const MEDIA_SLOTS = ['discover', 'deeper', 'review'] as const;
export const MediaSlotSchema = z.enum(MEDIA_SLOTS);
export type MediaSlot = z.infer<typeof MediaSlotSchema>;

const isoDate = z.iso.date();

/**
 * Where an image came from (D15/P11). Every shipped image has a recorded origin.
 * - generated: AI-generated artwork. Never credited on screen; the record stays here.
 * - licensed: a third-party image used under its license; credited minimally ("Photo: creator, platform").
 * - owned: made by or for the project.
 * - unknown: written by the media script for a new image; the validator rejects it until filled in.
 */
export const ImageOriginSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('generated'),
    tool: text,
    createdBy: text,
    createdAt: isoDate,
  }),
  z.strictObject({
    kind: z.literal('licensed'),
    creator: text,
    platform: text.optional(),
    license: text,
    sourceUrl: z.url({ protocol: /^https$/, error: 'must be an https:// URL' }),
  }),
  z.strictObject({ kind: z.literal('owned'), creator: text }),
  z.strictObject({ kind: z.literal('unknown') }),
]);
export type ImageOrigin = z.infer<typeof ImageOriginSchema>;

/**
 * A processed lesson image, served from /media/<lesson>/<slot>.webp (plus a 2/3-size
 * "-sm" file). Width and height are the full file's, written by the media script.
 */
export const LessonImageSchema = z.strictObject({
  width: z.int().positive(),
  height: z.int().positive(),
  /** Alt text per locale; the validator requires one for every locale the concept has. */
  alt: z.strictObject({ 'pt-BR': text.optional(), en: text.optional() }),
  origin: ImageOriginSchema,
  /** Who checked the image for scientific or historical accuracy (M3 review). */
  accuracyReviewedBy: z.string().nullable(),
  addedAt: isoDate,
  /** First 8 hex digits of the full file's SHA-256: versions the URL, so a replaced image is never served stale from the offline cache. */
  hash: z.string().regex(/^[0-9a-f]{8}$/, 'must be 8 lowercase hex digits'),
});
export type LessonImage = z.infer<typeof LessonImageSchema>;

export const LessonMediaSchema = z.strictObject({
  discover: LessonImageSchema.optional(),
  deeper: LessonImageSchema.optional(),
  review: LessonImageSchema.optional(),
});
export type LessonMedia = z.infer<typeof LessonMediaSchema>;

/** Keys of the original SVG icons/illustrations shipped with the app. */
export const TopicIconSchema = z.enum(['body', 'brain', 'space', 'flask', 'scroll', 'fixture']);

export const TopicSchema = z.strictObject({
  id: TopicIdSchema,
  slug: LocalizedSlugSchema,
  name: LocalizedTextSchema,
  description: LocalizedTextSchema,
  icon: TopicIconSchema,
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'must be a #RRGGBB hex color'),
  sortOrder: z.int().nonnegative(),
  /** Explore tile and topic page picture (D15), served from /media/topics/<id>.webp. */
  image: LessonImageSchema.optional(),
  ...fixtureFlag,
});
export type Topic = z.infer<typeof TopicSchema>;

export const ClusterSchema = z.strictObject({
  id: ClusterIdSchema,
  topicId: TopicIdSchema,
  slug: LocalizedSlugSchema,
  title: LocalizedTextSchema,
  hook: LocalizedTextSchema,
  conceptIds: z.array(ConceptIdSchema).min(1, 'a trail needs at least one concept'),
  links: z.array(z.strictObject({ clusterId: ClusterIdSchema, reason: LocalizedTextSchema })),
  ...fixtureFlag,
});
export type Cluster = z.infer<typeof ClusterSchema>;

export const RelatedTypeSchema = z.enum(['next', 'related', 'background', 'contrast']);

export const ConceptSchema = z.strictObject({
  id: ConceptIdSchema,
  topicId: TopicIdSchema,
  clusterId: ClusterIdSchema,
  clusterOrder: z.int().positive(),
  tags: z.array(z.string().regex(/^[a-z0-9-]+$/, 'tags are lowercase ASCII kebab-case')),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  related: z.array(
    z.strictObject({
      conceptId: ConceptIdSchema,
      type: RelatedTypeSchema,
      reason: PartialLocalizedTextSchema,
    }),
  ),
  variants: z.array(LocaleSchema).min(1, 'a concept needs at least one locale variant'),
  /** Lesson images (D15/P10). Language-independent; the variant's illustration is the fallback. */
  media: LessonMediaSchema.optional(),
  ...fixtureFlag,
});
export type Concept = z.infer<typeof ConceptSchema>;

export const CardBlockSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('paragraph'), text }),
  z.strictObject({ type: z.literal('takeaway'), text }),
]);
export type CardBlock = z.infer<typeof CardBlockSchema>;

export const DeepDiveBlockSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('paragraph'), text }),
  z.strictObject({ type: z.literal('heading'), text }),
]);
export type DeepDiveBlock = z.infer<typeof DeepDiveBlockSchema>;

export const HeroMediaSchema = z.discriminatedUnion('type', [
  /** Original SVG illustration bundled with the app, referenced by key. */
  z.strictObject({
    type: z.literal('illustration'),
    illustrationId: z.string().regex(/^[a-z0-9-]+$/),
    alt: text,
    license: z.literal('original'),
  }),
  /** Third-party image: creator, license and source are required (§5.6). */
  z.strictObject({
    type: z.literal('image'),
    url: z.string().min(1),
    alt: text,
    license: text,
    creator: text,
    sourceUrl: z.url(),
    attribution: text,
    shareAlike: z.boolean(),
  }),
]);
export type HeroMedia = z.infer<typeof HeroMediaSchema>;

export const ClaimSupportSchema = z.strictObject({
  sourceId: SourceIdSchema,
  excerpt: text,
  locator: z.string().optional(),
});

export const ClaimSchema = z.strictObject({
  id: z.string().regex(/^c[0-9]+$/, 'claim IDs look like "c1", "c2"'),
  text,
  highStakes: z.boolean(),
  support: z.array(ClaimSupportSchema),
  autoVerdict: z.enum(['pending', 'supported', 'partial', 'unsupported']),
  humanVerdict: z.enum(['pending', 'approved', 'edited', 'rejected']),
});
export type Claim = z.infer<typeof ClaimSchema>;

/**
 * Content licenses. "pending" is allowed only on drafts until the founder decides §5.6.
 * "fixture" is allowed only on fixtures.
 */
export const CONTENT_LICENSES = [
  'CC-BY-SA-4.0',
  'CC-BY-4.0',
  'all-rights-reserved',
  'pending',
  'fixture',
] as const;
export const ContentLicenseSchema = z.enum(CONTENT_LICENSES);

export const GenerationSchema = z.strictObject({
  model: text,
  promptVersion: text,
  runId: text,
});

export const ReviewStatusSchema = z.enum(['draft', 'in_review', 'reviewed', 'rejected']);
export const PublicationStatusSchema = z.enum(['draft', 'published', 'unpublished']);

export const LessonVariantSchema = z.strictObject({
  id: VariantIdSchema,
  conceptId: ConceptIdSchema,
  locale: LocaleSchema,
  slug: SlugSchema,
  title: text,
  hook: text,
  summary: text,
  /** Short text under the title on the Discover card (D15/P8); falls back to `summary`. */
  cardText: text.optional(),
  cardBlocks: z.array(CardBlockSchema).min(1),
  deepDiveBlocks: z.array(DeepDiveBlockSchema),
  heroMedia: HeroMediaSchema,
  claims: z.array(ClaimSchema),
  sourceIds: z.array(SourceIdSchema),
  quizIds: z.array(QuestionIdSchema),
  contentLicense: ContentLicenseSchema,
  generation: GenerationSchema.nullable(),
  reviewStatus: ReviewStatusSchema,
  publicationStatus: PublicationStatusSchema,
  reviewedBy: z.string().nullable(),
  reviewedAt: isoDateTime.nullable(),
  reviewAfter: isoDateTime.nullable(),
  publishedAt: isoDateTime.nullable(),
  updatedAt: isoDateTime,
  ...fixtureFlag,
});
export type LessonVariant = z.infer<typeof LessonVariantSchema>;

export const SourceSchema = z.strictObject({
  id: SourceIdSchema,
  title: text,
  publisher: text,
  url: z.url({ protocol: /^https$/, error: 'must be an https:// URL' }),
  language: z
    .string()
    .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, 'must be a language tag like "pt-BR" or "en"'),
  type: z.enum(['primary', 'reference', 'news']),
  license: z.string().optional(),
  accessedAt: isoDateTime,
  snapshotHash: z.string().regex(/^sha256:[0-9a-f]{64}$/, 'must look like "sha256:<64 hex chars>"'),
  ...fixtureFlag,
});
export type Source = z.infer<typeof SourceSchema>;

export const QuizOptionSchema = z.strictObject({
  id: z.string().regex(/^[a-z]$/, 'option IDs are single lowercase letters: "a", "b", "c", "d"'),
  text,
});

export const QuizQuestionSchema = z.strictObject({
  id: QuestionIdSchema,
  questionGroupId: QuestionGroupIdSchema,
  conceptId: ConceptIdSchema,
  locale: LocaleSchema,
  prompt: text,
  options: z.array(QuizOptionSchema).min(3, 'needs 3–4 options').max(4, 'needs 3–4 options'),
  correctOptionId: z.string(),
  explanation: text,
  /** Why the most common wrong answer is wrong, where relevant (§3.3). */
  misconception: text.optional(),
  claimIds: z.array(z.string()),
  status: z.enum(['draft', 'reviewed', 'retired']),
  ...fixtureFlag,
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizFileSchema = z.array(QuizQuestionSchema);
export const TopicsFileSchema = z.array(TopicSchema);

/** Everything loaded from a content directory, already schema-checked. */
export interface ContentLibrary {
  topics: Topic[];
  clusters: Cluster[];
  concepts: Concept[];
  variants: LessonVariant[];
  questions: QuizQuestion[];
  sources: Source[];
}
