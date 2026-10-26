import { describe, expect, it } from 'vitest';
import { BRAND, brandNamePattern, RETIRED_BRAND_NAMES } from '@lumen/domain';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

/*
 * Build gate (§0.7, §16): every UI key must exist in both locales, with the same
 * {{variables}}, and no empty strings. Plural forms (_one/_other) are compared by
 * base key, and each locale must provide at least _one and _other.
 */
type Tree = { [key: string]: string | Tree };
const NAMES = [BRAND.name, ...RETIRED_BRAND_NAMES].map(brandNamePattern);
const PLURAL = /_(zero|one|two|few|many|other)$/;

function flatten(tree: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out.set(path, value);
    else for (const [k, v] of flatten(value, path)) out.set(k, v);
  }
  return out;
}

const variables = (s: string) => [...s.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)].map((m) => m[1]).sort();
const locales = { 'pt-BR': flatten(ptBR), en: flatten(en) };

function baseKeys(map: Map<string, string>): Set<string> {
  return new Set([...map.keys()].map((k) => k.replace(PLURAL, '')));
}

describe('i18n completeness', () => {
  for (const [name, map] of Object.entries(locales)) {
    const other = name === 'en' ? locales['pt-BR'] : locales.en;
    it(`${name} has every key the other locale has`, () => {
      const missing = [...baseKeys(other)].filter((k) => !baseKeys(map).has(k));
      expect(missing, `missing in ${name}`).toEqual([]);
    });

    it(`${name} has no empty strings`, () => {
      expect([...map].filter(([, v]) => v.trim() === '').map(([k]) => k)).toEqual([]);
    });

    it(`${name} plural keys provide _one and _other`, () => {
      const plurals = new Set(
        [...map.keys()].filter((k) => PLURAL.test(k)).map((k) => k.replace(PLURAL, '')),
      );
      const incomplete = [...plurals].filter((k) => !map.has(`${k}_one`) || !map.has(`${k}_other`));
      expect(incomplete).toEqual([]);
    });
  }

  it('uses the same {{variables}} in both locales', () => {
    const mismatched: string[] = [];
    for (const [key, value] of locales['pt-BR']) {
      const enValue = locales.en.get(key) ?? locales.en.get(key.replace(PLURAL, '_other'));
      if (enValue !== undefined && variables(value).join() !== variables(enValue).join())
        mismatched.push(key);
    }
    expect(mismatched).toEqual([]);
  });

  it('never hard-codes the display name, current or retired (use {{appName}})', () => {
    const offenders = [...locales['pt-BR'], ...locales.en]
      .filter(([, v]) => NAMES.some((pattern) => pattern.test(v)))
      .map(([k]) => k);
    expect(offenders).toEqual([]);
  });
});
