// @vitest-environment node
import { randomBytes } from 'node:crypto';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BUDGETS, checkBudgets } from '../budgets';

/** A built client with one script of `jsBytes` random (incompressible) bytes. */
function client(jsBytes: number) {
  const dir = mkdtempSync(join(tmpdir(), 'lumen-budgets-'));
  mkdirSync(join(dir, 'assets'));
  writeFileSync(join(dir, 'assets', 'entry.js'), randomBytes(jsBytes));
  writeFileSync(join(dir, 'assets', 'app.css'), 'body{margin:0}');
  mkdirSync(join(dir, 'en/credits'), { recursive: true });
  writeFileSync(join(dir, 'en/credits/index.html'), '<!doctype html><h1>Credits</h1>');
  return dir;
}

describe('size budgets (§15, D28)', () => {
  it('reports each size against its budget', () => {
    const { problems, report } = checkBudgets(client(10_000), ['/en/credits/']);
    expect(problems).toEqual([]);
    expect(report).toHaveLength(4);
    expect(report[3]).toMatch(/^largest public page: 0\.\d KB of 15\.0 KB \(\/en\/credits\/\)$/);
  });

  it('fails a file over its budget', () => {
    const { problems } = checkBudgets(client(20_000), ['/en/credits/'], {
      ...BUDGETS,
      jsFile: 10 * 1024,
    });
    expect(problems).toEqual([expect.stringMatching(/^largest JavaScript file is 19\.\d KB/)]);
  });
});
