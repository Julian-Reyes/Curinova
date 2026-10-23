import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * The display name is a placeholder (§0.1). It may only appear in brand.ts and in
 * the documents that explain the rename. Everything else must read BRAND or use
 * {{appName}}. See docs/DECISIONS.md → "Renaming the product".
 */
const ROOT = join(import.meta.dirname, '../../..');
const ALLOWED = new Set([
  'packages/domain/src/brand.ts',
  'docs/SPEC.md',
  'docs/DECISIONS.md',
  'WALKTHROUGH.md',
]);
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
const NAME = /curio\s?feed/i;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (TEXT.test(name) && name !== 'pnpm-lock.yaml') out.push(full);
  }
  return out;
}

describe('placeholder name guard', () => {
  it('the display name appears only in brand.ts and the rename docs', () => {
    const offenders = walk(ROOT)
      .map((f) => relative(ROOT, f))
      .filter((f) => !ALLOWED.has(f) && !f.endsWith('rename-guard.test.ts'))
      .filter((f) => NAME.test(readFileSync(join(ROOT, f), 'utf8')));
    expect(offenders).toEqual([]);
  });
});
