import { describe, expect, it } from 'vitest';
import { otherLocale, resolveLocale } from '../src/locale';

describe('resolveLocale (§3.1)', () => {
  it.each([
    [['pt-BR'], 'pt-BR'],
    [['pt-PT', 'en'], 'pt-BR'],
    [['pt'], 'pt-BR'],
    [['PT-br'], 'pt-BR'],
    [['en-US', 'pt-BR'], 'en'],
    [['es-AR'], 'en'],
    [['fr'], 'en'],
  ])('%j → %s', (langs, expected) => {
    expect(resolveLocale(langs)).toBe(expected);
  });

  it('falls back to pt-BR when the browser reports nothing', () => {
    expect(resolveLocale([])).toBe('pt-BR');
    expect(resolveLocale(undefined)).toBe('pt-BR');
  });

  it('switches between the two locales', () => {
    expect(otherLocale('pt-BR')).toBe('en');
    expect(otherLocale('en')).toBe('pt-BR');
  });
});
