import { release } from 'node:os';
import { defineConfig, devices } from '@playwright/test';

/*
 * The timing check (§15, D28): `pnpm perf` measures load and response times on a throttled
 * mid-range Android phone against the production preview (`pnpm build` first). Locally it
 * fails over a target; in CI it only reports, because shared runners' timings vary.
 * Chromium only: the throttling uses the Chrome DevTools Protocol.
 */
const oldMac = process.platform === 'darwin' && Number(release().split('.')[0]) < 23;

export default defineConfig({
  testDir: 'speed',
  outputDir: 'test-results/speed',
  workers: 1,
  reporter: 'list',
  timeout: 120_000,
  use: {
    ...devices['Galaxy S9+'],
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 2.625,
    baseURL: 'http://localhost:4273',
    locale: 'pt-BR',
    ...(oldMac ? { channel: 'chrome' as const } : {}),
  },
  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:4273',
    reuseExistingServer: !process.env.CI,
  },
});
