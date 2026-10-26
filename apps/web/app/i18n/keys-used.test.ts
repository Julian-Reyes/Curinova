// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import ptBR from './locales/pt-BR.json';

/* Every literal t('key') in the app must exist (with plural forms where needed). */
type Tree = { [key: string]: string | Tree };
function keys(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([k, v]) =>
    typeof v === 'string' ? [`${prefix}${k}`] : keys(v, `${prefix}${k}.`),
  );
}
const available = new Set(keys(ptBR).map((k) => k.replace(/_(zero|one|other)$/, '')));

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory()
      ? files(full)
      : /\.tsx?$/.test(name) && !name.includes('.test.')
        ? [full]
        : [];
  });
}

describe('i18n keys used in code', () => {
  it('all exist in the locale files', () => {
    const missing: string[] = [];
    for (const file of files(join(import.meta.dirname, '..'))) {
      for (const m of readFileSync(file, 'utf8').matchAll(/\bt\(\s*'([a-zA-Z0-9_.-]+)'/g)) {
        const key = m[1] ?? '';
        if (!available.has(key)) missing.push(`${key} (${file.split('/app/')[1] ?? file})`);
      }
    }
    expect(missing).toEqual([]);
  });
});
