import type { ProgressEvent } from '@lumen/domain';
import { describe, expect, it } from 'vitest';
import { ANALYTICS_EVENTS, analyticsAllowed, analyticsSink, toAnalyticsEvent } from './analytics';

const base: ProgressEvent = {
  eventId: '0b9a0b8e-1c55-4c62-9a3a-7f4f6a1f2b3c',
  deviceId: 'device-secret',
  type: 'quiz_answered',
  conceptId: 'concept_tides',
  locale: 'pt-BR',
  questionGroupId: 'qg_tides_1',
  response: { questionId: 'q_tides_1__pt-BR', selectedOptionId: 'a', correct: true, attempt: 1 },
  occurredAt: '2026-11-12T10:00:00.000Z',
  schemaVersion: 1,
};
const topicOf = (id: string) => (id === 'concept_tides' ? 'space' : undefined);

describe('analytics (D26)', () => {
  it('sends nothing while no provider is connected', () => {
    expect(analyticsSink).toBeNull();
  });

  it('keeps only allowlisted properties: no IDs, times or free text', () => {
    expect(toAnalyticsEvent(base, topicOf)).toEqual({
      name: 'quiz_answered',
      props: {
        lesson: 'concept_tides',
        topic: 'space',
        locale: 'pt-BR',
        question: 'qg_tides_1',
        correct: true,
      },
    });
    expect(JSON.stringify(toAnalyticsEvent(base, topicOf))).not.toMatch(
      /device-secret|0b9a0b8e|2026-11-12|selectedOptionId/,
    );
  });

  it('drops events that are not on the allowlist', () => {
    expect(ANALYTICS_EVENTS).not.toContain('bookmark_changed');
    expect(toAnalyticsEvent({ ...base, type: 'bookmark_changed' }, topicOf)).toBeNull();
    expect(toAnalyticsEvent({ ...base, type: 'topic_preference_changed' }, topicOf)).toBeNull();
  });

  it('respects the opt-out, Do Not Track and Global Privacy Control', () => {
    expect(analyticsAllowed({ analyticsOptOut: false }, {})).toBe(true);
    expect(analyticsAllowed({ analyticsOptOut: true }, {})).toBe(false);
    expect(analyticsAllowed({ analyticsOptOut: false }, { doNotTrack: '1' })).toBe(false);
    expect(analyticsAllowed({ analyticsOptOut: false }, { globalPrivacyControl: true })).toBe(
      false,
    );
  });
});
