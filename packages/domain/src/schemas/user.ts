import { z } from 'zod';
import {
  ConceptIdSchema,
  LocaleSchema,
  QuestionGroupIdSchema,
  QuestionIdSchema,
  TopicIdSchema,
} from './content';

/*
 * Learner-side entities (§10.3). Progress, bookmarks and reviews are keyed by
 * conceptId / questionGroupId, never by a locale variant, so switching language
 * keeps everything. The ID schemas enforce that: a variant ID such as
 * "lesson_x__pt-BR" is rejected where a conceptId is expected.
 */

const isoDateTime = z.iso.datetime({ offset: true });

export const SESSION_GOALS = [3, 5, 10, 'unlimited'] as const;
export const SessionGoalSchema = z.union([
  z.literal(3),
  z.literal(5),
  z.literal(10),
  z.literal('unlimited'),
]);
export type SessionGoal = z.infer<typeof SessionGoalSchema>;

export const AUDIO_SPEEDS = [0.75, 1, 1.25, 1.5] as const;
export const AudioSpeedSchema = z.union([
  z.literal(0.75),
  z.literal(1),
  z.literal(1.25),
  z.literal(1.5),
]);

export const ThemeSchema = z.enum(['system', 'light', 'dark']);
export type Theme = z.infer<typeof ThemeSchema>;

/** Onboarding purpose (§3.1). Not in §10.3; added as approved deviation D5. */
export const PurposeSchema = z.enum(['explore', 'deep', 'remember']);
export type Purpose = z.infer<typeof PurposeSchema>;

export const UserPreferencesSchema = z.strictObject({
  locale: LocaleSchema,
  showOtherLocale: z.boolean(),
  timezone: z.string().min(1),
  interests: z.array(TopicIdSchema),
  mutedTopics: z.array(TopicIdSchema),
  sessionGoal: SessionGoalSchema,
  theme: ThemeSchema,
  reducedMotion: z.enum(['system', 'reduce']),
  audioSpeed: AudioSpeedSchema,
  voiceURI: z.string().optional(),
  remindersOptIn: z.boolean(),
  reviewOptIn: z.boolean(),
  analyticsOptOut: z.boolean(),
  purpose: PurposeSchema.optional(),
  /** When onboarding was finished or skipped; null until then. */
  onboardedAt: isoDateTime.nullable(),
});
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export const PROGRESS_EVENT_TYPES = [
  'lesson_opened',
  'lesson_completed',
  'quiz_answered',
  'review_answered',
  'bookmark_changed',
  'trail_started',
  'trail_step',
  'deep_dive_opened',
  'share_clicked',
  'language_switched',
  'topic_preference_changed',
  'session_finished',
] as const;
export const ProgressEventTypeSchema = z.enum(PROGRESS_EVENT_TYPES);
export type ProgressEventType = z.infer<typeof ProgressEventTypeSchema>;

export const PROGRESS_EVENT_SCHEMA_VERSION = 1;

export const QuizResponseSchema = z.strictObject({
  questionId: QuestionIdSchema,
  selectedOptionId: z.string(),
  correct: z.boolean(),
  attempt: z.int().positive(),
});

export const ProgressEventSchema = z.strictObject({
  eventId: z.uuid(),
  userId: z.string().optional(),
  deviceId: z.string().min(1),
  type: ProgressEventTypeSchema,
  conceptId: ConceptIdSchema,
  /** Locale the learner saw. Informational only: nothing is keyed by it. */
  locale: LocaleSchema,
  questionGroupId: QuestionGroupIdSchema.optional(),
  response: QuizResponseSchema.optional(),
  occurredAt: isoDateTime,
  schemaVersion: z.literal(PROGRESS_EVENT_SCHEMA_VERSION),
});
export type ProgressEvent = z.infer<typeof ProgressEventSchema>;

export const BookmarkSchema = z.strictObject({
  userIdOrLocalId: z.string().min(1),
  conceptId: ConceptIdSchema,
  saved: z.boolean(),
  updatedAt: isoDateTime,
});
export type Bookmark = z.infer<typeof BookmarkSchema>;

export const ReviewStateSchema = z.strictObject({
  conceptId: ConceptIdSchema,
  questionGroupId: QuestionGroupIdSchema,
  dueAt: isoDateTime,
  intervalDays: z.int().positive(),
  correctStreak: z.int().nonnegative(),
  /** When the learner first answered this question group (start of "learned"). */
  firstLearnedAt: isoDateTime,
  lastReviewedAt: isoDateTime,
  lastResult: z.enum(['correct', 'incorrect']),
});
export type ReviewState = z.infer<typeof ReviewStateSchema>;

export const SessionSchema = z.strictObject({
  sessionId: z.uuid(),
  startedAt: isoDateTime,
  goal: SessionGoalSchema,
  completedConceptIds: z.array(ConceptIdSchema),
  endedAt: isoDateTime.optional(),
});
export type Session = z.infer<typeof SessionSchema>;
