import type { ReviewState } from './schemas/user';

/*
 * Spaced-review schedule (§3.4) as pure functions, so it can later be swapped for FSRS.
 *
 * - First answer (from a lesson quiz), right or wrong: due the next calendar day.
 * - Each correct review while due: 3, 7, 14, 30, then 60 days.
 * - A wrong answer resets the streak and schedules a retry the next day.
 * - Answering again before the item is due is practice: a correct answer changes
 *   nothing, a wrong one still schedules tomorrow's retry.
 *
 * "Next day" means the next calendar day in the learner's time zone, and "due" is
 * decided by comparing calendar dates, so changing time zone never counts a day twice.
 */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60] as const;
/** Correct delayed reviews in a row (1 → 3 → 7 days) before a concept counts as mastered. */
export const MASTERY_STREAK = 3;
/** A recall counts as "delayed" when it happens at least this many days after first learning (§1). */
export const DELAYED_RECALL_DAYS = 3;

const DAY_MS = 86_400_000;

/** Calendar date ("2026-10-23") of an instant in a time zone. */
export function localDate(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

export function isDue(state: Pick<ReviewState, 'dueAt'>, now: Date, timeZone: string): boolean {
  return localDate(new Date(state.dueAt), timeZone) <= localDate(now, timeZone);
}

function intervalForStreak(streak: number): number {
  const index = Math.min(streak, REVIEW_INTERVALS_DAYS.length - 1);
  return REVIEW_INTERVALS_DAYS[index] ?? 1;
}

export interface ReviewAnswer {
  conceptId: string;
  questionGroupId: string;
  correct: boolean;
  now: Date;
  timeZone: string;
}

export function scheduleReview(
  previous: ReviewState | undefined,
  answer: ReviewAnswer,
): ReviewState {
  const nowIso = answer.now.toISOString();
  const due = (days: number) => new Date(answer.now.getTime() + days * DAY_MS).toISOString();

  if (previous === undefined) {
    return {
      conceptId: answer.conceptId,
      questionGroupId: answer.questionGroupId,
      dueAt: due(1),
      intervalDays: 1,
      correctStreak: 0,
      firstLearnedAt: nowIso,
      lastReviewedAt: nowIso,
      lastResult: answer.correct ? 'correct' : 'incorrect',
    };
  }

  if (!answer.correct) {
    return {
      ...previous,
      dueAt: due(1),
      intervalDays: 1,
      correctStreak: 0,
      lastReviewedAt: nowIso,
      lastResult: 'incorrect',
    };
  }

  if (!isDue(previous, answer.now, answer.timeZone)) {
    return { ...previous, lastReviewedAt: nowIso, lastResult: 'correct' };
  }

  const correctStreak = previous.correctStreak + 1;
  const intervalDays = intervalForStreak(correctStreak);
  return {
    ...previous,
    dueAt: due(intervalDays),
    intervalDays,
    correctStreak,
    lastReviewedAt: nowIso,
    lastResult: 'correct',
  };
}

export function isMastered(state: Pick<ReviewState, 'correctStreak'>): boolean {
  return state.correctStreak >= MASTERY_STREAK;
}

/** Whole calendar days between two instants in a time zone. */
export function daysBetween(from: Date, to: Date, timeZone: string): number {
  const a = Date.parse(`${localDate(from, timeZone)}T00:00:00Z`);
  const b = Date.parse(`${localDate(to, timeZone)}T00:00:00Z`);
  return Math.round((b - a) / DAY_MS);
}
