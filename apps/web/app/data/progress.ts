import {
  PROGRESS_EVENT_SCHEMA_VERSION,
  ProgressEventSchema,
  UserPreferencesSchema,
  scheduleReview,
  type Locale,
  type ProgressEvent,
  type ProgressEventType,
  type ReviewState,
  type UserPreferences,
} from '@lumen/domain';
import { db, type LumenDB } from './db';

/*
 * The P0 ProgressRepository (§9.7) over IndexedDB. Everything is keyed by
 * conceptId / questionGroupId, so switching language keeps all progress.
 * Events are append-only (for offline use and future sync, §10.4).
 */

export function defaultPreferences(locale: Locale): UserPreferences {
  return {
    locale,
    showOtherLocale: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    interests: [],
    mutedTopics: [],
    sessionGoal: 5,
    theme: 'system',
    reducedMotion: 'system',
    audioSpeed: 1,
    remindersOptIn: false,
    reviewOptIn: true,
    analyticsOptOut: false,
    onboardedAt: null,
  };
}

export class ProgressStore {
  constructor(private readonly database: LumenDB = db) {}

  async loadPreferences(fallback: UserPreferences): Promise<UserPreferences> {
    const row = await this.database.settings.get('prefs');
    if (row === undefined) return fallback;
    const parsed = UserPreferencesSchema.safeParse({ ...fallback, ...(row.value as object) });
    return parsed.success ? parsed.data : fallback;
  }

  async savePreferences(prefs: UserPreferences): Promise<void> {
    await this.database.settings.put({ key: 'prefs', value: UserPreferencesSchema.parse(prefs) });
  }

  /** A random per-install identifier. Never sent anywhere in guest mode. */
  async deviceId(): Promise<string> {
    const row = await this.database.settings.get('deviceId');
    if (typeof row?.value === 'string') return row.value;
    const id = crypto.randomUUID();
    await this.database.settings.put({ key: 'deviceId', value: id });
    return id;
  }

  async record(
    type: ProgressEventType,
    conceptId: string,
    locale: Locale,
    extra: Pick<ProgressEvent, 'questionGroupId' | 'response'> = {},
    now = new Date(),
  ): Promise<ProgressEvent> {
    const event = ProgressEventSchema.parse({
      eventId: crypto.randomUUID(),
      deviceId: await this.deviceId(),
      type,
      conceptId,
      locale,
      ...extra,
      occurredAt: now.toISOString(),
      schemaVersion: PROGRESS_EVENT_SCHEMA_VERSION,
    });
    await this.database.events.add(event);
    return event;
  }

  async setBookmark(
    conceptId: string,
    saved: boolean,
    locale: Locale,
    now = new Date(),
  ): Promise<void> {
    await this.database.transaction(
      'rw',
      this.database.bookmarks,
      this.database.events,
      this.database.settings,
      async () => {
        await this.database.bookmarks.put({
          userIdOrLocalId: await this.deviceId(),
          conceptId,
          saved,
          updatedAt: now.toISOString(),
        });
        await this.record('bookmark_changed', conceptId, locale, {}, now);
      },
    );
  }

  /**
   * Records an answer and updates the review schedule. Lesson quizzes ("quiz")
   * enter the queue only when the learner opted into reviews; review answers
   * ("review") always update it.
   */
  async answer(input: {
    mode: 'quiz' | 'review';
    conceptId: string;
    questionGroupId: string;
    questionId: string;
    selectedOptionId: string;
    correct: boolean;
    attempt: number;
    locale: Locale;
    timeZone: string;
    reviewOptIn: boolean;
    now?: Date;
  }): Promise<ReviewState | undefined> {
    const now = input.now ?? new Date();
    return this.database.transaction(
      'rw',
      this.database.events,
      this.database.reviews,
      this.database.settings,
      async () => {
        await this.record(
          input.mode === 'quiz' ? 'quiz_answered' : 'review_answered',
          input.conceptId,
          input.locale,
          {
            questionGroupId: input.questionGroupId,
            response: {
              questionId: input.questionId,
              selectedOptionId: input.selectedOptionId,
              correct: input.correct,
              attempt: input.attempt,
            },
          },
          now,
        );
        if (input.mode === 'quiz' && (!input.reviewOptIn || input.attempt > 1)) return undefined;
        const key: [string, string] = [input.conceptId, input.questionGroupId];
        const previous = await this.database.reviews.get(key);
        const next = scheduleReview(previous, {
          conceptId: input.conceptId,
          questionGroupId: input.questionGroupId,
          correct: input.correct,
          now,
          timeZone: input.timeZone,
        });
        await this.database.reviews.put(next);
        return next;
      },
    );
  }

  /** Erases every piece of guest data on this device (Settings → Delete my data). */
  async clearAll(): Promise<void> {
    await this.database.transaction(
      'rw',
      [
        this.database.settings,
        this.database.events,
        this.database.bookmarks,
        this.database.reviews,
        this.database.sessions,
      ],
      async () => {
        await Promise.all([
          this.database.settings.clear(),
          this.database.events.clear(),
          this.database.bookmarks.clear(),
          this.database.reviews.clear(),
          this.database.sessions.clear(),
        ]);
      },
    );
  }
}

export const progress = new ProgressStore();
