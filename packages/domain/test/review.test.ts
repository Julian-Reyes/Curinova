import { describe, expect, it } from 'vitest';
import {
  daysBetween,
  isDue,
  isMastered,
  localDate,
  scheduleReview,
  type ReviewAnswer,
} from '../src/review';
import type { ReviewState } from '../src/schemas/user';

const TZ = 'America/Sao_Paulo';
const ids = { conceptId: 'concept_tides', questionGroupId: 'qg_tides_1' };
const answer = (iso: string, correct: boolean, timeZone = TZ): ReviewAnswer => ({
  ...ids,
  correct,
  now: new Date(iso),
  timeZone,
});

function run(steps: [iso: string, correct: boolean][]): ReviewState {
  let state: ReviewState | undefined;
  for (const [iso, correct] of steps) state = scheduleReview(state, answer(iso, correct));
  return state!;
}

describe('scheduleReview (§3.4)', () => {
  it('a first answer is due the next day and records when it was learned', () => {
    const s = scheduleReview(undefined, answer('2026-10-23T15:00:00Z', true));
    expect(s).toMatchObject({
      intervalDays: 1,
      correctStreak: 0,
      dueAt: '2026-10-24T15:00:00.000Z',
      firstLearnedAt: '2026-10-23T15:00:00.000Z',
    });
  });

  it('walks 1 → 3 → 7 → 14 → 30 → 60 days on consecutive correct reviews', () => {
    const intervals: number[] = [];
    let s = scheduleReview(undefined, answer('2026-01-01T12:00:00Z', true));
    intervals.push(s.intervalDays);
    for (let i = 0; i < 6; i += 1) {
      s = scheduleReview(s, { ...ids, correct: true, now: new Date(s.dueAt), timeZone: TZ });
      intervals.push(s.intervalDays);
    }
    expect(intervals).toEqual([1, 3, 7, 14, 30, 60, 60]);
  });

  it('a wrong answer resets the streak and retries the next day', () => {
    const s = run([
      ['2026-01-01T12:00:00Z', true],
      ['2026-01-02T12:00:00Z', true],
      ['2026-01-05T12:00:00Z', false],
    ]);
    expect(s).toMatchObject({
      correctStreak: 0,
      intervalDays: 1,
      dueAt: '2026-01-06T12:00:00.000Z',
      lastResult: 'incorrect',
    });
    expect(s.firstLearnedAt).toBe('2026-01-01T12:00:00.000Z');
  });

  it('answering correctly before the due date is practice and changes nothing', () => {
    const first = scheduleReview(undefined, answer('2026-01-01T12:00:00Z', true));
    const early = scheduleReview(first, answer('2026-01-01T18:00:00Z', true));
    expect(early.dueAt).toBe(first.dueAt);
    expect(early.correctStreak).toBe(0);
  });

  it('mastery needs three correct delayed reviews', () => {
    const s = run([
      ['2026-01-01T12:00:00Z', true],
      ['2026-01-02T12:00:00Z', true],
      ['2026-01-05T12:00:00Z', true],
    ]);
    expect(isMastered(s)).toBe(false);
    expect(isMastered(scheduleReview(s, answer('2026-01-12T12:00:00Z', true)))).toBe(true);
  });
});

describe('day boundaries and time zones', () => {
  it('"next day" is the next calendar day: learned at 23:50 is due after local midnight', () => {
    const s = scheduleReview(undefined, answer('2026-10-24T02:50:00Z', true)); // 23:50, Oct 23 in São Paulo
    expect(isDue(s, new Date('2026-10-24T02:55:00Z'), TZ)).toBe(false); // 23:55, still Oct 23
    expect(isDue(s, new Date('2026-10-24T03:05:00Z'), TZ)).toBe(true); // 00:05, Oct 24
  });

  it('uses calendar dates, so an item is due all day on its due date', () => {
    const s = scheduleReview(undefined, answer('2026-10-23T20:00:00Z', true)); // 17:00 local
    expect(isDue(s, new Date('2026-10-24T03:30:00Z'), TZ)).toBe(true); // 00:30 next local day
  });

  it('travelling across time zones does not count a day twice', () => {
    const s = scheduleReview(undefined, answer('2026-10-23T12:00:00Z', true));
    // Same instant seen from Tokyo (already Oct 24 there) and São Paulo (still Oct 23).
    const now = new Date('2026-10-23T16:00:00Z');
    expect(localDate(now, 'Asia/Tokyo')).toBe('2026-10-24');
    expect(isDue(s, now, 'Asia/Tokyo')).toBe(true);
    expect(isDue(s, now, TZ)).toBe(false);
    // Moving the item forward never double-advances the streak: a second early answer is practice.
    const reviewed = scheduleReview(s, { ...ids, correct: true, now, timeZone: 'Asia/Tokyo' });
    const again = scheduleReview(reviewed, { ...ids, correct: true, now, timeZone: TZ });
    expect(again.correctStreak).toBe(1);
  });

  it('counts whole calendar days between two instants', () => {
    expect(
      daysBetween(new Date('2026-10-23T23:00:00-03:00'), new Date('2026-10-26T01:00:00-03:00'), TZ),
    ).toBe(3);
  });
});
