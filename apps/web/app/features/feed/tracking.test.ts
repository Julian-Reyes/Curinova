import { describe, expect, it } from 'vitest';
import { DEEPER_READ_SHARE } from './LessonSheets';
import { COMPLETE_MIN_MS } from './tracking';

describe('completion rule (§10.4, D15)', () => {
  it('counts 6 seconds on the card, or 40% of the reading time in Go Deeper', () => {
    expect(COMPLETE_MIN_MS).toBe(6000);
    expect(DEEPER_READ_SHARE).toBe(0.4);
  });
});
