// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '../../..');
const workflow = readFileSync(join(ROOT, '.github/workflows/ci.yml'), 'utf8');
const installed = (
  JSON.parse(
    readFileSync(join(ROOT, 'apps/web/node_modules/@playwright/test/package.json'), 'utf8'),
  ) as {
    version: string;
  }
).version;

describe('CI workflow', () => {
  it('runs E2E in the Playwright image that matches the installed Playwright', () => {
    const tag = /mcr\.microsoft\.com\/playwright:v([\d.]+)-/.exec(workflow)?.[1];
    expect(tag, 'Playwright image tag in ci.yml').toBe(installed);
  });

  it('only deploys from main, after every check passes', () => {
    const deploy = workflow.slice(workflow.indexOf('\n  deploy:'));
    expect(deploy).toContain("if: github.event_name == 'push' && github.ref == 'refs/heads/main'");
    expect(deploy).toContain('needs: [verify, e2e-smoke]');
    expect(deploy).toContain('404.html');
  });

  it('puts a time limit on every job', () => {
    const jobsSection = workflow.slice(workflow.indexOf('\njobs:'));
    const jobs = jobsSection.match(/^ {2}[a-z0-9-]+:\n/gm) ?? [];
    const limits = jobsSection.match(/timeout-minutes: \d+/g) ?? [];
    expect(jobs.length).toBe(3);
    expect(limits.length).toBe(jobs.length);
  });
});
