import { release } from 'node:os';
import { defineConfig, devices, type Project } from '@playwright/test';

/*
 * Playwright's bundled browsers do not support macOS 13. There, run every project
 * in the locally installed Google Chrome (channel "chrome") and skip WebKit.
 * CI (Linux) uses the bundled Chromium and real WebKit for the iPhone projects.
 */
const oldMac = process.platform === 'darwin' && Number(release().split('.')[0]) < 23;
const chromium = oldMac ? { channel: 'chrome' as const } : {};

const iphone = (name: string, width: number, height: number): Project[] => {
  const base = {
    viewport: { width, height },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  };
  return oldMac
    ? [
        {
          name,
          use: { ...devices['iPhone 13'], ...base, ...chromium, defaultBrowserType: 'chromium' },
        },
      ]
    : [{ name, use: { ...devices['iPhone 13'], ...base } }];
};

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'pt-BR',
    trace: 'retain-on-failure',
  },
  projects: [
    ...iphone('iphone-13', 390, 844),
    ...iphone('iphone-se', 375, 667),
    {
      name: 'android-mid',
      use: {
        ...devices['Galaxy S9+'],
        viewport: { width: 360, height: 800 },
        deviceScaleFactor: 2.625,
        ...chromium,
      },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 }, ...chromium },
    },
  ],
  webServer: {
    command: 'pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
