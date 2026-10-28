import { expect, test } from '@playwright/test';
import { activeCard, feedReady, onboard } from './helpers';

test.use({ locale: 'en' });

test('tapping a card opens Go deeper', async ({ page }) => {
  await onboard(page, 'en', { skip: true });
  await activeCard(page).locator('h2').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'The big picture' })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Key takeaways' })).toBeAttached();
  await expect(dialog.getByRole('heading', { name: 'Related concepts' })).toBeAttached();
});

test('the Discover card shows its title, card text and Dive in in full (D15)', async ({ page }) => {
  await onboard(page, 'en', { skip: true });
  // The longest card texts, in a trail (its header is taller than Discover's).
  for (const id of ['concept_spacing_effect', 'concept_pombal_directorate']) {
    const slug =
      id === 'concept_spacing_effect'
        ? 'how-memory-works'
        : 'how-portuguese-became-brazils-language';
    await page.goto(`/app/trail/${slug}?start=${id}`);
    await feedReady(page);
    const card = activeCard(page);
    for (const part of ['.stage-chip', 'h2', '.stage-text'])
      await expect(card.locator(part)).toBeInViewport({ ratio: 1 });
    await expect(card.getByRole('button', { name: /^Dive in/ })).toBeInViewport({ ratio: 1 });
    // The text never runs under the action rail.
    const [textRight, railLeft] = await card.evaluate((el) => [
      el.querySelector('.stage-text')!.getBoundingClientRect().right,
      el.querySelector('.stage-rail')!.getBoundingClientRect().left,
    ]);
    expect(textRight).toBeLessThanOrEqual(railLeft);
  }
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

test('offline, cards show their cached image or their diagram, never a broken image (P15)', async ({
  page,
  context,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'service worker behaviour; one project is enough');
  await onboard(page, 'en', { skip: true });
  // The service worker controls the page from the next load; that load caches images.
  await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active !== null);
  await page.reload();
  await feedReady(page);
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true);
  await page.waitForTimeout(1000);
  await context.setOffline(true);
  await page.reload();
  await feedReady(page);
  await expect
    .poll(() =>
      activeCard(page).evaluate((el) => {
        const img = el.querySelector<HTMLImageElement>('img.stage-art');
        if (img) return img.complete && img.naturalWidth > 0 ? 'image' : 'loading';
        return el.querySelector('.stage-plate') ? 'diagram' : 'nothing';
      }),
    )
    .toMatch(/^(image|diagram)$/);
  await context.setOffline(false);
});
