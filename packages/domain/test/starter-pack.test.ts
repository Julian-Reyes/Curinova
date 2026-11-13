import { describe, expect, it } from 'vitest';
import type { Cluster, Concept, Topic } from '../src/schemas/content';
import { starterPack } from '../src/starter-pack';

// Two topics; each has a first trail of three lessons and a second trail.
const topics = [
  { id: 'brain', sortOrder: 2 },
  { id: 'space', sortOrder: 1 },
] as unknown as Topic[];
const clusters = [
  { id: 'cluster_space_a', topicId: 'space', conceptIds: ['s1', 's2', 's3'] },
  { id: 'cluster_space_b', topicId: 'space', conceptIds: ['s9'] },
  { id: 'cluster_brain_a', topicId: 'brain', conceptIds: ['b1', 'b2', 'b3'] },
] as unknown as Cluster[];
const photo = { discover: { width: 1080, height: 1920 } };
const concept = (id: string, extra: Partial<Concept> = {}) =>
  ({ id, variants: ['pt-BR', 'en'], media: photo, ...extra }) as unknown as Concept;
const concepts = ['s1', 's2', 's3', 's9', 'b1', 'b2', 'b3'].map((id) => concept(id));
const content = { topics, clusters, concepts };
const KB = 1000;

describe('starterPack (§12, D28)', () => {
  it('takes the first trail of each topic in turn, in topic order', () => {
    expect(starterPack(content, 'pt-BR', () => 100 * KB).conceptIds).toEqual([
      's1',
      'b1',
      's2',
      'b2',
      's3',
      'b3',
    ]);
  });

  it('stops before the photo that would pass the budget', () => {
    const pack = starterPack(content, 'en', () => 100 * KB, 350 * KB);
    expect(pack).toEqual({ conceptIds: ['s1', 'b1', 's2'], bytes: 300 * KB });
  });

  it('skips lessons without a Discover photo or a variant in the language', () => {
    const others = [
      concept('s1', { media: {} }),
      concept('b1', { variants: ['en'] }),
      ...concepts.filter((c) => c.id !== 's1' && c.id !== 'b1'),
    ];
    const pack = starterPack({ ...content, concepts: others }, 'pt-BR', (id) =>
      id === 's2' ? undefined : 100 * KB,
    );
    expect(pack.conceptIds).toEqual(['s3', 'b2', 'b3']);
  });
});
