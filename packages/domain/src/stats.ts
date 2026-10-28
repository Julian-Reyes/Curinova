import { DELAYED_RECALL_DAYS, daysBetween, isDue, isMastered } from './review';
import type { Bookmark, ProgressEvent, ReviewState } from './schemas/user';

/*
 * Progress statistics (§3.6), computed from the append-only event log plus current
 * review states. Nothing here is invented: every number is a count of real events,
 * and accuracy always comes with its sample size.
 */

export interface Accuracy {
  correct: number;
  total: number;
}

export interface TopicActivity {
  topicId: string;
  explored: number;
  completed: number;
}

export interface ProgressStats {
  explored: number;
  completed: number;
  saved: number;
  /** First attempt at a lesson quiz question. */
  immediate: Accuracy;
  /** Review answers given ≥ 3 days after the concept was first learned. */
  delayed: Accuracy;
  dueNow: number;
  /** Concepts with at least one correct delayed recall (north-star numerator, §1). */
  recalledConcepts: number;
  mastered: number;
  trailsCompleted: number;
  topics: TopicActivity[];
  /** Distinct calendar days with any learning activity in the last 7 days (incl. today). */
  activeDaysThisWeek: number;
  /** The last 7 days, oldest first, as YYYY-MM-DD in the learner's time zone. */
  week: { date: string; active: boolean }[];
}

export interface StatsInput {
  events: readonly ProgressEvent[];
  reviews: readonly ReviewState[];
  bookmarks: readonly Bookmark[];
  /** conceptId → topicId */
  conceptTopics: ReadonlyMap<string, string>;
  /** clusterId → its conceptIds */
  clusters: ReadonlyMap<string, readonly string[]>;
  now: Date;
  timeZone: string;
}

const LEARNING_EVENTS = new Set<ProgressEvent['type']>([
  'lesson_opened',
  'lesson_completed',
  'quiz_answered',
  'review_answered',
]);

export function computeStats(input: StatsInput): ProgressStats {
  const { events, now, timeZone } = input;
  const opened = new Set<string>();
  const completed = new Set<string>();
  const immediate: Accuracy = { correct: 0, total: 0 };
  const delayed: Accuracy = { correct: 0, total: 0 };
  const recalled = new Set<string>();
  const firstLearned = new Map<string, Date>();
  const activeDays = new Set<string>();

  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  for (const e of sorted) {
    const at = new Date(e.occurredAt);
    if (LEARNING_EVENTS.has(e.type) && daysBetween(at, now, timeZone) < 7) {
      activeDays.add(new Intl.DateTimeFormat('en-CA', { timeZone }).format(at));
    }
    if (e.type === 'lesson_opened') opened.add(e.conceptId);
    if (e.type === 'lesson_completed') completed.add(e.conceptId);
    if (e.type === 'quiz_answered' && e.response && e.questionGroupId) {
      if (!firstLearned.has(e.questionGroupId)) firstLearned.set(e.questionGroupId, at);
      if (e.response.attempt === 1) {
        immediate.total += 1;
        if (e.response.correct) immediate.correct += 1;
      }
    }
    if (e.type === 'review_answered' && e.response && e.questionGroupId) {
      const learned = firstLearned.get(e.questionGroupId);
      if (learned && daysBetween(learned, at, timeZone) >= DELAYED_RECALL_DAYS) {
        delayed.total += 1;
        if (e.response.correct) {
          delayed.correct += 1;
          recalled.add(e.conceptId);
        }
      }
    }
  }

  const masteredConcepts = new Set(
    input.reviews.filter((r) => isMastered(r)).map((r) => r.conceptId),
  );
  const trailsCompleted = [...input.clusters.values()].filter(
    (ids) => ids.length > 0 && ids.every((id) => completed.has(id)),
  ).length;

  const topicMap = new Map<string, TopicActivity>();
  for (const conceptId of opened) {
    const topicId = input.conceptTopics.get(conceptId);
    if (topicId === undefined) continue;
    const t = topicMap.get(topicId) ?? { topicId, explored: 0, completed: 0 };
    t.explored += 1;
    if (completed.has(conceptId)) t.completed += 1;
    topicMap.set(topicId, t);
  }

  return {
    explored: opened.size,
    completed: completed.size,
    saved: input.bookmarks.filter((b) => b.saved).length,
    immediate,
    delayed,
    dueNow: input.reviews.filter((r) => isDue(r, now, timeZone)).length,
    recalledConcepts: recalled.size,
    mastered: masteredConcepts.size,
    trailsCompleted,
    topics: [...topicMap.values()].sort((a, b) => b.explored - a.explored),
    activeDaysThisWeek: activeDays.size,
    week: Array.from({ length: 7 }, (_, i) => {
      const date = new Intl.DateTimeFormat('en-CA', { timeZone }).format(
        new Date(now.getTime() - (6 - i) * 86_400_000),
      );
      return { date, active: activeDays.has(date) };
    }),
  };
}
