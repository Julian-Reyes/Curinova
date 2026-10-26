import { expect, test } from '@playwright/test';
import { activeCard, feedReady, onboard } from './helpers';

test.use({ locale: 'en' });

test('tapping a card opens Go deeper', async ({ page }) => {
  await onboard(page, 'en', { skip: true });
  await activeCard(page).locator('h2').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Go deeper', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Related ideas')).toBeVisible();
});

test('cards never scroll; long cards offer "Continue reading" with the full text', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'iphone-se', 'needs a short screen');
  await onboard(page, 'en', { skip: true });
  await page.goto('/app/trail/how-memory-works?start=concept_sleep_memory');
  await feedReady(page);
  const card = activeCard(page);
  const text = card.locator('.card-paragraphs');
  expect(await text.evaluate((el) => getComputedStyle(el).overflowY)).toBe('hidden');
  await expect(card.locator('.card-takeaway')).toBeInViewport({ ratio: 1 });
  await card.getByRole('button', { name: 'Continue reading' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText(/Poor sleep, on the other hand/)).toBeVisible();
});

test('a status banner never pushes the card under the navigation', async ({
  page,
  context,
}, info) => {
  test.skip(info.project.name === 'desktop', 'phone layout');
  await onboard(page, 'en', { skip: true });
  await context.setOffline(true);
  await expect(page.getByRole('status').filter({ hasText: "You're offline" })).toBeVisible();
  await page.waitForTimeout(300);
  const [cardBottom, navTop, pageScroll] = await page.evaluate(() => [
    document.querySelector('.feed-slide:not([aria-hidden]) article')!.getBoundingClientRect()
      .bottom,
    document.querySelector('nav')!.getBoundingClientRect().top,
    document.documentElement.scrollHeight - window.innerHeight,
  ]);
  expect(cardBottom).toBeLessThanOrEqual(navTop + 1);
  expect(pageScroll).toBeLessThanOrEqual(0);
  await context.setOffline(false);
});

test('progress is saved on plain http, where crypto.randomUUID is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    // Simulate an insecure context (phone opening the dev server over Wi-Fi).
    Object.defineProperty(Crypto.prototype, 'randomUUID', { value: undefined, configurable: true });
  });
  await onboard(page, 'en', { skip: true });
  await expect(page.getByText(/blocking storage/)).toHaveCount(0);
  await activeCard(page).getByRole('button', { name: 'Save' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Library' }).click();
  await expect(page.locator('main ul li')).toHaveCount(1);
});

test('"Remember more" invites a review in the feed when reviews are due (P7)', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-20T12:00:00') });
  await onboard(page, 'en', { purpose: 'Remember more' });
  await activeCard(page).getByRole('button', { name: 'Quiz', exact: true }).click();
  await page.getByRole('dialog').locator('ul button').first().click();
  await expect(page.getByRole('dialog').getByText(/That's right!|Not quite/)).toBeVisible();
  // Wait until the answer's review schedule is committed before reloading.
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            const req = indexedDB.open('lumen');
            req.onsuccess = () => {
              const count = req.result.transaction('reviews').objectStore('reviews').count();
              count.onsuccess = () => {
                resolve(count.result);
              };
            };
          }),
      ),
    )
    .toBe(1);
  await page.keyboard.press('Escape');
  await page.clock.setFixedTime(new Date('2026-10-22T12:00:00'));
  await page.reload();
  await feedReady(page);
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('heading', { name: 'Time to remember' })).toBeVisible();
  await expect(page.getByText(/1 question is waiting for you/)).toBeVisible();
});
