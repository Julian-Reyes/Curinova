import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BRAND, brandNamePattern, RETIRED_BRAND_NAMES } from '../src/brand';

/*
 * The display name is a placeholder (§0.1). It may only appear in brand.ts and in
 * the documents that explain the rename. Everything else must read BRAND or use
 * {{appName}}. Retired names may only survive in the rename history and the
 * original spec. See docs/DECISIONS.md → "Renaming the product".
 */
const ROOT = join(import.meta.dirname, '../../..');
const BRAND_FILE = 'packages/domain/src/brand.ts';
const ALLOWED_CURRENT = new Set([BRAND_FILE, 'docs/DECISIONS.md', 'WALKTHROUGH.md', 'README.md']);
const ALLOWED_RETIRED = new Set([BRAND_FILE, 'docs/DECISIONS.md', 'docs/SPEC.md']);
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'build',
  'dist',
  '.react-router',
  'coverage',
  'test-results',
  'playwright-report',
  '__screenshots__',
]);
const TEXT = /\.(ts|tsx|js|mjs|json|md|css|html|yml|yaml|svg|webmanifest|txt)$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (TEXT.test(name) && name !== 'pnpm-lock.yaml') out.push(full);
  }
  return out;
}

function filesMatching(pattern: RegExp, allowed: ReadonlySet<string>): string[] {
  return walk(ROOT)
    .map((f) => relative(ROOT, f))
    .filter((f) => !allowed.has(f) && !f.endsWith('rename-guard.test.ts'))
    .filter((f) => pattern.test(readFileSync(join(ROOT, f), 'utf8')));
}

describe('placeholder name guard', () => {
  it('the display name appears only in brand.ts and the rename docs', () => {
    expect(filesMatching(brandNamePattern(BRAND.name), ALLOWED_CURRENT)).toEqual([]);
  });

  it.each(RETIRED_BRAND_NAMES)('the retired name "%s" is gone everywhere else', (name) => {
    expect(filesMatching(brandNamePattern(name), ALLOWED_RETIRED)).toEqual([]);
  });

  it('matches names split into words', () => {
    expect(brandNamePattern('CurioFeed').test('the Curio Feed app')).toBe(true);
    expect(brandNamePattern('Curinova').test('CURINOVA')).toBe(true);
  });
});
