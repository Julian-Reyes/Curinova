import { describe, expect, it } from 'vitest';
import { rankFeed, type FeedConcept, type FeedInput } from '../src/feed';

// 3 topics × 1 trail × 4 concepts.
const concepts: FeedConcept[] = ['space', 'brain', 'history'].flatMap((topicId) =>
  [1, 2, 3, 4].map((n) => ({
    conceptId: `concept_${topicId}_${n}`,
    topicId,
    clusterId: `cluster_${topicId}`,
    clusterOrder: n,
  })),
);

const base: FeedInput = {
  concepts,
  interests: [],
  mutedTopics: [],
  seen: new Set(),
  clusterEngagement: new Map(),
  clusterLinks: new Map(),
  seed: 42,
};
const topicOf = (id: string) => id.split('_')[1];
const ids = (input: Partial<FeedInput>) =>
  rankFeed({ ...base, ...input }).items.map((i) => i.conceptId);

describe('rankFeed (§6)', () => {
  it('cold start: the first cards are trail openers from different topics', () => {
    const first3 = ids({}).slice(0, 3);
    expect(first3.every((id) => id.endsWith('_1'))).toBe(true);
    expect(new Set(first3.map(topicOf)).size).toBe(3);
  });

  it('keeps every trail in order', () => {
    const order = ids({});
    for (const topic of ['space', 'brain', 'history']) {
      const positions = [1, 2, 3, 4].map((n) => order.indexOf(`concept_${topic}_${n}`));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }
  });

  it('never shows muted topics', () => {
    expect(ids({ mutedTopics: ['space'] }).some((id) => topicOf(id) === 'space')).toBe(false);
  });

  it('reports when every topic is muted', () => {
    expect(rankFeed({ ...base, mutedTopics: ['space', 'brain', 'history'] })).toMatchObject({
      items: [],
      allMuted: true,
    });
  });

  it('never puts three cards from the same topic in a row when there is an alternative', () => {
    const order = ids({ interests: ['space'] });
    for (let i = 2; i < order.length; i += 1) {
      const window = [order[i - 2], order[i - 1], order[i]].map((id) => topicOf(id!));
      const othersLeft = order.slice(i).some((id) => topicOf(id) !== window[2]);
      if (othersLeft) expect(new Set(window).size).toBeGreaterThan(1);
    }
  });

  it('favours interests but reserves about a quarter of positions for other topics', () => {
    const order = ids({ interests: ['space'], limit: 8 });
    const outside = order.filter((id) => topicOf(id) !== 'space').length;
    expect(order.filter((id) => topicOf(id) === 'space').length).toBeGreaterThanOrEqual(3);
    expect(outside).toBeGreaterThanOrEqual(2);
  });

  it('continues a trail the learner has started, and says so', () => {
    const result = rankFeed({ ...base, seen: new Set(['concept_brain_1']) });
    const brain2 = result.items.find((i) => i.conceptId === 'concept_brain_2');
    expect(brain2?.reason).toBe('trail');
    expect(result.items.findIndex((i) => i.conceptId === 'concept_brain_2')).toBeLessThan(2);
  });

  it('boosts trails linked from a trail the learner engaged with', () => {
    const result = ids({
      seen: new Set(['concept_space_1', 'concept_space_2', 'concept_space_3', 'concept_space_4']),
      clusterEngagement: new Map([['cluster_space', 3]]),
      clusterLinks: new Map([['cluster_space', ['cluster_history']]]),
    });
    expect(result[0]).toBe('concept_history_1');
  });

  it('labels interest matches and new topics', () => {
    const result = rankFeed({ ...base, interests: ['brain'] });
    const reasons = new Map(result.items.map((i) => [i.conceptId, i.reason]));
    expect(reasons.get('concept_brain_1')).toBe('interest');
    expect(reasons.get('concept_space_1')).toBe('new');
  });

  it('is deterministic per seed', () => {
    expect(ids({ seed: 7 })).toEqual(ids({ seed: 7 }));
  });

  it('flags catalog exhaustion instead of silently recycling', () => {
    const result = rankFeed({ ...base, seen: new Set(concepts.map((c) => c.conceptId)) });
    expect(result).toMatchObject({ items: [], exhausted: true, allMuted: false });
  });
});
