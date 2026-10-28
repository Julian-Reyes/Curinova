import { describe, expect, it } from 'vitest';
import { seededShuffle } from '../src/random';
import type { ProgressEvent, ReviewState } from '../src/schemas/user';
import { computeStats } from '../src/stats';

const TZ = 'America/Sao_Paulo';
let n = 0;
function ev(
  type: ProgressEvent['type'],
  conceptId: string,
  at: string,
  extra: Partial<ProgressEvent> = {},
): ProgressEvent {
  n += 1;
  return {
    eventId: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
    deviceId: 'd',
    type,
    conceptId,
    locale: 'pt-BR',
    occurredAt: at,
    schemaVersion: 1,
    ...extra,
  };
}
const quiz = (
  conceptId: string,
  group: string,
  at: string,
  correct: boolean,
  attempt = 1,
  type: 'quiz_answered' | 'review_answered' = 'quiz_answered',
) =>
  ev(type, conceptId, at, {
    questionGroupId: group,
    response: { questionId: `q_${group.slice(3)}__pt-BR`, selectedOptionId: 'a', correct, attempt },
  });

describe('computeStats (§3.6)', () => {
  const events = [
    ev('lesson_opened', 'concept_a', '2026-10-01T12:00:00Z'),
    ev('lesson_completed', 'concept_a', '2026-10-01T12:01:00Z'),
    quiz('concept_a', 'qg_a_1', '2026-10-01T12:02:00Z', true),
    quiz('concept_a', 'qg_a_2', '2026-10-01T12:03:00Z', false),
    quiz('concept_a', 'qg_a_2', '2026-10-01T12:04:00Z', true, 2),
    ev('lesson_opened', 'concept_b', '2026-10-02T12:00:00Z', { locale: 'en' }),
    // Review 1 day later: not delayed. Review 5 days later: delayed.
    quiz('concept_a', 'qg_a_1', '2026-10-02T12:00:00Z', true, 1, 'review_answered'),
    quiz('concept_a', 'qg_a_1', '2026-10-06T12:00:00Z', true, 1, 'review_answered'),
    quiz('concept_a', 'qg_a_2', '2026-10-06T12:00:00Z', false, 1, 'review_answered'),
  ];
  const review: ReviewState = {
    conceptId: 'concept_a',
    questionGroupId: 'qg_a_2',
    dueAt: '2026-10-07T12:00:00Z',
    intervalDays: 1,
    correctStreak: 0,
    firstLearnedAt: '2026-10-01T12:03:00Z',
    lastReviewedAt: '2026-10-06T12:00:00Z',
    lastResult: 'incorrect',
  };
  const stats = computeStats({
    events,
    reviews: [review],
    bookmarks: [
      {
        userIdOrLocalId: 'l',
        conceptId: 'concept_b',
        saved: true,
        updatedAt: '2026-10-02T12:00:00Z',
      },
    ],
    conceptTopics: new Map([
      ['concept_a', 'space'],
      ['concept_b', 'brain'],
    ]),
    clusters: new Map([['cluster_x', ['concept_a']]]),
    now: new Date('2026-10-07T15:00:00Z'),
    timeZone: TZ,
  });

  it('counts explored, completed and saved concepts across locales', () => {
    expect(stats).toMatchObject({ explored: 2, completed: 1, saved: 1, trailsCompleted: 1 });
  });

  it('separates immediate (first attempt) from delayed (≥3 days) accuracy', () => {
    expect(stats.immediate).toEqual({ correct: 1, total: 2 });
    expect(stats.delayed).toEqual({ correct: 1, total: 2 });
    expect(stats.recalledConcepts).toBe(1);
  });

  it('counts due reviews and topic activity', () => {
    expect(stats.dueNow).toBe(1);
    expect(stats.topics).toEqual([
      { topicId: 'space', explored: 1, completed: 1 },
      { topicId: 'brain', explored: 1, completed: 0 },
    ]);
  });

  it('counts active days in the last week only', () => {
    // Today is Oct 7, so the window is Oct 1–7: active on Oct 1, 2 and 6.
    expect(stats.activeDaysThisWeek).toBe(3);
    expect(stats.week).toHaveLength(7);
    expect(stats.week.filter((d) => d.active)).toHaveLength(3);
    expect(stats.week.at(-1)?.date).toBe('2026-10-07');
  });
});

describe('seededShuffle', () => {
  it('is deterministic and keeps every item', () => {
    const a = seededShuffle(['a', 'b', 'c', 'd'], 99);
    expect(a).toEqual(seededShuffle(['a', 'b', 'c', 'd'], 99));
    expect([...a].sort()).toEqual(['a', 'b', 'c', 'd']);
  });
});
