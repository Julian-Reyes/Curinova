import { appendFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/*
 * §15 targets on a mid-range Android phone over slow 4G (D28): largest contentful paint
 * under 2.0 s for a public page and 2.5 s for the app, layout shift under 0.1, and the next
 * card responding within 100 ms. Throttling as Lighthouse's mobile preset: 150 ms round
 * trip, 1.6 Mbit/s down, 750 kbit/s up, CPU 4× slower.
 */

const TARGETS = { publicLcp: 2000, appLcp: 2500, cls: 0.1, nextCard: 100 };
const LESSON = '/pt/licao/seu-esqueleto-esta-vivo/';
/** Locally a miss fails; in CI the numbers are only reported (shared runners vary). */
const enforce = !process.env.CI;

async function throttle(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}

declare global {
  interface Window {
    __perf: { lcp: number; cls: number; events: number[] };
  }
}

/** Records LCP, layout shift and interaction times from the very start of every page. */
async function observe(page: Page) {
  await page.addInitScript(() => {
    const perf = { lcp: 0, cls: 0, events: [] as number[] };
    window.__perf = perf;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) perf.lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as (PerformanceEntry & {
        value: number;
        hadRecentInput: boolean;
      })[])
        if (!e.hadRecentInput) perf.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries())
        if (e.name.startsWith('key') || e.name.startsWith('pointer')) perf.events.push(e.duration);
    }).observe({ type: 'event', durationThreshold: 16, buffered: true } as PerformanceObserverInit);
  });
}

const results: { what: string; value: number; target: number; unit: string }[] = [];

function record(what: string, value: number, target: number, unit: string) {
  results.push({ what, value, target, unit });
  if (enforce)
    expect.soft(value, `${what} (target < ${String(target)} ${unit})`).toBeLessThan(target);
}

async function loadMetrics(page: Page) {
  // LCP settles once the page is idle; give late images a moment.
  await page.waitForLoadState('load');
  await page.waitForTimeout(2500);
  return page.evaluate(() => window.__perf);
}

test.beforeEach(async ({ page }) => {
  await observe(page);
});

test.afterAll(() => {
  const fmt = (v: number, unit: string) =>
    unit === 'ms' ? `${String(Math.round(v))} ms` : v.toFixed(3);
  const lines = results.map(
    (r) =>
      `| ${r.what} | ${fmt(r.value, r.unit)} | < ${fmt(r.target, r.unit)} | ${r.value < r.target ? '✅' : '❌'} |`,
  );
  const table = ['| Measure | Result | Target | |', '| --- | --- | --- | --- |', ...lines].join(
    '\n',
  );
  console.log(`\nTiming check (throttled mid-range Android, slow 4G)\n${table}\n`);
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Timing check (report only)\n\n${table}\n`);
});

test('public lesson page, first visit', async ({ page }) => {
  await throttle(page);
  await page.goto(LESSON);
  const m = await loadMetrics(page);
  record('Public page LCP', m.lcp, TARGETS.publicLcp, 'ms');
  record('Public page CLS', m.cls, TARGETS.cls, '');
});

test('app, first visit (welcome)', async ({ page }) => {
  await throttle(page);
  await page.goto('/');
  await page.waitForURL(/\/app\/welcome/);
  const m = await loadMetrics(page);
  record('App first visit LCP', m.lcp, TARGETS.appLcp, 'ms');
  record('App first visit CLS', m.cls, TARGETS.cls, '');
});

test('app, returning visit (Discover) and next card', async ({ page }) => {
  // Onboard at full speed; the service worker then holds the app and content.
  await page.goto('/');
  await page.getByRole('button', { name: 'Pular' }).click();
  await page.waitForURL(/\/app\/discover/);
  await expect(page.locator('.feed-scroller[data-ready]')).toBeAttached();
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true);
  await page.waitForTimeout(4000);

  await throttle(page);
  await page.reload();
  await expect(page.locator('.feed-scroller[data-ready]')).toBeAttached();
  const m = await loadMetrics(page);
  record('App returning visit LCP', m.lcp, TARGETS.appLcp, 'ms');
  record('App returning visit CLS', m.cls, TARGETS.cls, '');

  for (let i = 0; i < 3; i += 1) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1200);
  }
  // Interactions faster than 16 ms aren't reported, so no entries means under 16 ms.
  const events = await page.evaluate(() => window.__perf.events);
  record('Next card response', Math.max(16, ...events), TARGETS.nextCard, 'ms');
});
