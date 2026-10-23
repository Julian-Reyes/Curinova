import { describe, expect, it } from 'vitest';
import { countWords, readingTimeSeconds } from '../src/words';

describe('countWords', () => {
  it('counts accented Portuguese words as one word each', () => {
    expect(countWords('Não é só água: é coração, ação e emoção.', 'pt-BR')).toBe(9);
  });

  it('ignores punctuation and counts numbers', () => {
    expect(countWords('The Moon recedes 3.8 cm — every year!', 'en')).toBe(7);
  });
});

describe('readingTimeSeconds', () => {
  it('rounds up to 15-second steps with a 15-second minimum', () => {
    expect(readingTimeSeconds(10)).toBe(15);
    expect(readingTimeSeconds(100)).toBe(30);
    expect(readingTimeSeconds(150)).toBe(45);
  });
});
