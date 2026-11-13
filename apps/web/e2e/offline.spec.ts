import { expect, test, type Page } from '@playwright/test';
import { activeCard, feedReady, onboard } from './helpers';

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
  const discover = (await cachedUrls(page, 'lumen-media')).filter((u) => u.includes('/discover'));
  expect(discover.length).toBeLessThanOrEqual(3);
});

/** Onboards, then waits until the service worker controls the page and has saved the content. */
async function onboardAndSave(page: Page) {
  await onboard(page, 'en', { skip: true });
  await expect
    .poll(async () => (await cachedUrls(page, 'lumen-content')).length, { timeout: 20_000 })
    .toBeGreaterThan(2);
}

test('offline, a saved lesson and its quiz work, and the progress stays (§16 E2E 6)', async ({
  page,
  context,
}) => {
  await onboardAndSave(page);
  await context.setOffline(true);
  await page.reload();
  await feedReady(page);
  await expect(page.getByRole('status').filter({ hasText: "You're offline" })).toBeVisible();

  const title = await activeCard(page).locator('h2').innerText();
  await activeCard(page).getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('status').getByText('Saved to Library')).toBeVisible();
  await activeCard(page).getByRole('button', { name: 'Quiz', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Question 1 of 2')).toBeVisible();
  for (let i = 0; i < 2; i += 1) {
    await dialog.locator('ul button').first().click();
    await dialog.getByRole('button', { name: i === 0 ? 'Next question' : 'See result' }).click();
  }
  await expect(dialog.getByText(/You got \d of 2/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Done' }).click();

  await context.setOffline(false);
  await page.reload();
  await page.getByRole('navigation').getByRole('link', { name: 'Library' }).click();
  await expect(page.locator('main ul li').filter({ hasText: title })).toHaveCount(1);
  await page.getByRole('navigation').getByRole('link', { name: 'You' }).click();
  await expect(page.getByText(/of 2 answers/)).toBeVisible();
});

test('offline, a public page says so and links to the app', async ({ page, context }) => {
  await onboardAndSave(page);
  await context.setOffline(true);
  await page.goto('/en/credits/');
  await expect(page.getByRole('heading', { name: 'You’re offline' })).toBeVisible();
  await page.getByRole('link', { name: 'Open the app' }).click();
  await feedReady(page);
  await context.setOffline(false);
});

test('offline with no saved lessons, the app explains and retries when back online', async ({
  page,
  context,
}) => {
  await onboardAndSave(page);
  // As if the browser had cleared the saved lessons.
  await page.evaluate(async () => {
    await caches.delete('lumen-content');
    await caches.delete('lumen-content-manifest');
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'You’re offline' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await context.setOffline(false);
  await feedReady(page);
});

test('switching language offline keeps the loaded lessons until back online', async ({
  page,
  context,
}) => {
  await onboardAndSave(page);
  await page.getByRole('navigation').getByRole('link', { name: 'You' }).click();
  await page.getByRole('link', { name: 'Settings' }).click();
  await context.setOffline(true);
  await page.getByText('Português', { exact: true }).click();
  const banner = page.getByRole('status').filter({ hasText: 'As lições mudam de idioma' });
  await expect(banner).toBeVisible();
  await context.setOffline(false);
  await expect(banner).toBeHidden();
  await page.getByRole('navigation').getByRole('link', { name: 'Descobrir' }).click();
  await feedReady(page);
  await expect(activeCard(page).getByRole('button', { name: 'Salvar' })).toBeVisible();
});
