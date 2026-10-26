import { seededRandom } from './random';
import type { Purpose } from './schemas/user';

/*
 * Transparent, cluster-aware feed ranking (§6). No ML and no network: a pure
 * function of the catalog, the learner's choices and what they've seen.
 *
 * Each step considers only the *next unseen* concept of every trail, so trails are
 * always read in order. Candidates are scored with the §6 weights, and two hard
 * rules apply: never three cards in a row from the same topic (when there is an
 * alternative), and roughly one card in four from outside the learner's interests.
 */

export interface FeedConcept {
  conceptId: string;
  topicId: string;
  clusterId: string;
  clusterOrder: number;
  /** 0–1 editorial quality signal; defaults to 0.5. */
  quality?: number;
}

export type FeedReason = 'interest' | 'trail' | 'new';

export interface FeedItem {
  conceptId: string;
  reason: FeedReason;
}

export interface FeedInput {
  concepts: readonly FeedConcept[];
  interests: readonly string[];
  mutedTopics: readonly string[];
  /** Concepts the learner has already opened. */
  seen: ReadonlySet<string>;
  /** Engagement per cluster (completions, correct answers, saves). */
  clusterEngagement: ReadonlyMap<string, number>;
  /** Cluster → clusters it links to (§5.3). */
  clusterLinks: ReadonlyMap<string, readonly string[]>;
  /** Per-session seed, so the order never jumps mid-session. */
  seed: number;
  /** The learner's onboarding purpose (P7); selects a weight profile. */
  purpose?: Purpose | undefined;
  /** Cap the number of items returned. Defaults to every eligible concept. */
  limit?: number;
}

export interface FeedResult {
  items: FeedItem[];
  /** True when every non-muted concept has been seen (catalog exhausted, §6). */
  exhausted: boolean;
  /** True when every topic is muted, so nothing can be shown. */
  allMuted: boolean;
}

export interface FeedWeights {
  interestMatch: number;
  trailContinuation: number;
  /** Trails the learner had already started before this session ("previously encountered"). */
  encounteredTrail: number;
  clusterAdjacency: number;
  topicVariety: number;
  editorialQuality: number;
  novelty: number;
  sameTopicAsPreviousTwo: number;
}

/** §6 illustrative weights; used when no purpose was chosen. */
export const FEED_WEIGHTS: FeedWeights = {
  interestMatch: 3.0,
  trailContinuation: 2.5,
  encounteredTrail: 0,
  clusterAdjacency: 1.5,
  topicVariety: 2.0,
  editorialQuality: 1.0,
  novelty: 1.0,
  sameTopicAsPreviousTwo: -2.0,
};

/**
 * Purpose profiles (P7, founder decision 2026-10-26). The §6 hard rules (trail order,
 * no three same-topic cards in a row, ~25% exploration slots) apply to every profile.
 * - explore: new, surprising topics and diversity across subjects.
 * - deep: connected lessons, trails and progression through a topic.
 * - remember: previously encountered material (review prompts and quizzes are added by the app).
 */
export const PURPOSE_WEIGHTS: Record<Purpose, FeedWeights> = {
  explore: {
    ...FEED_WEIGHTS,
    interestMatch: 1.5,
    trailContinuation: 1.0,
    topicVariety: 4.0,
    novelty: 2.0,
    clusterAdjacency: 0.5,
  },
  deep: {
    ...FEED_WEIGHTS,
    trailContinuation: 6.0,
    clusterAdjacency: 3.0,
    topicVariety: 0.5,
    novelty: 0.5,
  },
  remember: { ...FEED_WEIGHTS, trailContinuation: 3.0, encounteredTrail: 3.0, novelty: 0.5 },
};

export function weightsFor(purpose: Purpose | undefined): FeedWeights {
  return purpose === undefined ? FEED_WEIGHTS : PURPOSE_WEIGHTS[purpose];
}

/** Every Nth position goes to the best card outside the learner's interests (≈25%). */
export const EXPLORATION_EVERY = 4;

export function rankFeed(input: FeedInput): FeedResult {
  const muted = new Set(input.mutedTopics);
  const interests = new Set(input.interests);
  const pool = input.concepts.filter((c) => !muted.has(c.topicId));
  if (pool.length === 0)
    return { items: [], exhausted: input.concepts.length > 0, allMuted: input.concepts.length > 0 };

  const unseen = pool.filter((c) => !input.seen.has(c.conceptId));
  const random = seededRandom(input.seed);
  const jitter = new Map(unseen.map((c) => [c.conceptId, random()]));

  // Queue per cluster, in trail order.
  const queues = new Map<string, FeedConcept[]>();
  for (const c of [...unseen].sort((a, b) => a.clusterOrder - b.clusterOrder)) {
    queues.set(c.clusterId, [...(queues.get(c.clusterId) ?? []), c]);
  }
  const W = weightsFor(input.purpose);
  const encountered = new Set(
    pool.filter((c) => input.seen.has(c.conceptId)).map((c) => c.clusterId),
  );
  const started = new Set(encountered);
  const engaged = new Set([...input.clusterEngagement].filter(([, n]) => n > 0).map(([id]) => id));
  const adjacent = new Set([...engaged].flatMap((id) => input.clusterLinks.get(id) ?? []));

  const items: FeedItem[] = [];
  const recentTopics: string[] = [];
  const limit = input.limit ?? unseen.length;

  while (items.length < limit) {
    const heads = [...queues.values()]
      .map((q) => q[0])
      .filter((c): c is FeedConcept => c !== undefined);
    if (heads.length === 0) break;

    const lastTwo = recentTopics.slice(-2);
    const threeInARow = (c: FeedConcept) =>
      lastTwo.length === 2 && lastTwo.every((t) => t === c.topicId);
    let candidates = heads.some((c) => !threeInARow(c))
      ? heads.filter((c) => !threeInARow(c))
      : heads;

    const exploreSlot = interests.size > 0 && (items.length + 1) % EXPLORATION_EVERY === 0;
    if (exploreSlot && candidates.some((c) => !interests.has(c.topicId))) {
      candidates = candidates.filter((c) => !interests.has(c.topicId));
    }

    const score = (c: FeedConcept) => {
      const continuing = started.has(c.clusterId);
      return (
        W.interestMatch * (interests.has(c.topicId) ? 1 : 0) +
        W.trailContinuation * (continuing ? 1 : 0) +
        W.encounteredTrail * (encountered.has(c.clusterId) ? 1 : 0) +
        W.clusterAdjacency * (adjacent.has(c.clusterId) ? 1 : 0) +
        W.topicVariety * (recentTopics.includes(c.topicId) ? 0 : 1) +
        W.editorialQuality * (c.quality ?? 0.5) +
        W.novelty * (jitter.get(c.conceptId) ?? 0) +
        W.sameTopicAsPreviousTwo * (lastTwo.includes(c.topicId) ? 1 : 0)
      );
    };

    const best = candidates.reduce((a, b) => (score(b) > score(a) ? b : a));
    const reason: FeedReason = started.has(best.clusterId)
      ? 'trail'
      : interests.has(best.topicId)
        ? 'interest'
        : 'new';
    items.push({ conceptId: best.conceptId, reason });
    recentTopics.push(best.topicId);
    started.add(best.clusterId);
    queues.get(best.clusterId)?.shift();
  }

  return { items, exhausted: unseen.length === 0, allMuted: false };
}
