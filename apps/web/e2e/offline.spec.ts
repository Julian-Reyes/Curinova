import { expect, test, type Page } from '@playwright/test';
import { feedReady, onboard } from './helpers';

/*
 * Offline use (§12, D28). Service-worker behaviour is the same on every viewport, so these
 * run on the desktop project only.
 */
test.use({ locale: 'en' });

test.beforeEach(({ browserName }, info) => {
  test.skip(
    browserName !== 'chromium' || info.project.name !== 'desktop',
    'service worker behaviour; one project is enough',
  );
});

/** Cached URLs (path and query) in one of the app's service-worker caches. */
function cachedUrls(page: Page, cacheName: string) {
  return page.evaluate(async (name) => {
    const cache = await caches.open(name);
    return (await cache.keys()).map((r) => {
      const url = new URL(r.url);
      return url.pathname + url.search;
    });
  }, cacheName);
}

test('a first visit saves the content and the starter pack, then the app opens offline', async ({
  page,
  context,
}) => {
  await onboard(page, 'en', { skip: true });
  const pack = await page.evaluate(async () => {
    const manifest = (await (await fetch('/content/manifest.json')).json()) as {
      starterPack?: Record<string, string[]>;
    };
    return manifest.starterPack?.en ?? [];
  });
  expect(pack.length).toBeGreaterThan(10);

  // No reload: the service worker takes over the first visit and the saver runs a few
  // seconds in, one photo at a time.
  await expect
    .poll(
      async () => {
        const urls = await cachedUrls(page, 'lumen-media');
        return pack.filter(
          (id) => !urls.some((u) => u.startsWith(`/media/${id.replace(/^concept_/, '')}/discover`)),
        ).length;
      },
      { timeout: 30_000 },
    )
    .toBe(0);
  const content = await cachedUrls(page, 'lumen-content');
  expect(content.some((u) => /^\/content\/index\.[0-9a-f]{8}\.json$/.test(u))).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await feedReady(page);
  await context.setOffline(false);
});

test('with the switch off, no starter pack photos are saved', async ({ page }) => {
  await onboard(page, 'en', { skip: true });
  await page.goto('/app/settings');
  const toggle = page.getByRole('switch', { name: 'Download lessons for offline use' });
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  // Start from an empty photo cache: the pack may have started before the switch went off.
  await page.evaluate(() => caches.delete('lumen-media'));
  await page.goto('/app/discover');
  await feedReady(page);
  await page.waitForTimeout(5000);
  // Only the photos of cards actually shown (the first one or two) are cached.
  const discover = (await cachedUrls(page, 'lumen-media')).filter((u) =>
    u.includes('/discover'),
  );
  expect(discover.length).toBeLessThanOrEqual(3);
});
