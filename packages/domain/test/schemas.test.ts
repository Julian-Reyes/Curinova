import { describe, expect, it } from 'vitest';
import {
  BookmarkSchema,
  ProgressEventSchema,
  ReviewStateSchema,
  UserPreferencesSchema,
  type ProgressEvent,
} from '../src/schemas/user';

const event: ProgressEvent = {
  eventId: '3f0e1a52-5b1c-4a63-9d3e-1f2a3b4c5d6e',
  deviceId: 'device-1',
  type: 'quiz_answered',
  conceptId: 'concept_moon_tidal_locking',
  locale: 'pt-BR',
  questionGroupId: 'qg_moon_tidal_locking_1',
  response: {
    questionId: 'q_moon_tidal_locking_1__pt-BR',
    selectedOptionId: 'a',
    correct: true,
    attempt: 1,
  },
  occurredAt: '2026-10-23T12:00:00Z',
  schemaVersion: 1,
};

describe('progress is keyed by concept, never by locale variant (§10)', () => {
  it('accepts a progress event keyed by conceptId', () => {
    expect(ProgressEventSchema.parse(event)).toEqual(event);
  });

  it('rejects a variant ID where a conceptId is expected', () => {
    expect(
      ProgressEventSchema.safeParse({ ...event, conceptId: 'lesson_moon_tidal_locking__pt-BR' })
        .success,
    ).toBe(false);
    expect(
      BookmarkSchema.safeParse({
        userIdOrLocalId: 'l',
        conceptId: 'lesson_x__en',
        saved: true,
        updatedAt: '2026-10-23T00:00:00Z',
      }).success,
    ).toBe(false);
  });

  it('rejects a question ID where a questionGroupId is expected', () => {
    const state = {
      conceptId: 'concept_moon_tidal_locking',
      questionGroupId: 'q_moon_tidal_locking_1__pt-BR',
      dueAt: '2026-10-24T00:00:00Z',
      intervalDays: 1,
      correctStreak: 0,
      firstLearnedAt: '2026-10-23T00:00:00Z',
      lastReviewedAt: '2026-10-23T00:00:00Z',
      lastResult: 'correct',
    };
    expect(ReviewStateSchema.safeParse(state).success).toBe(false);
    expect(
      ReviewStateSchema.safeParse({ ...state, questionGroupId: 'qg_moon_tidal_locking_1' }).success,
    ).toBe(true);
  });

  it('rejects events without a schema version', () => {
    const { schemaVersion: _omit, ...rest } = event;
    expect(ProgressEventSchema.safeParse(rest).success).toBe(false);
  });
});

describe('UserPreferences', () => {
  it('only allows the documented session goals and audio speeds', () => {
    const prefs = {
      locale: 'en',
      showOtherLocale: false,
      timezone: 'America/Sao_Paulo',
      interests: ['space'],
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
    expect(UserPreferencesSchema.safeParse(prefs).success).toBe(true);
    expect(UserPreferencesSchema.safeParse({ ...prefs, sessionGoal: 7 }).success).toBe(false);
    expect(UserPreferencesSchema.safeParse({ ...prefs, audioSpeed: 2 }).success).toBe(false);
  });
});
