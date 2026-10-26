import { describe, expect, it } from 'vitest';
import { completionThresholdMs } from './tracking';

describe('completion threshold (§10.4)', () => {
  it('needs at least 6 seconds, or 40% of the reading time for longer cards', () => {
    expect(completionThresholdMs(15)).toBe(6000);
    expect(completionThresholdMs(30)).toBe(12000);
  });
});
