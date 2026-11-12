import { expect, test } from '@playwright/test';

/*
 * §16 E2E scenario 7: a prerendered lesson page is readable with JavaScript off, and with
 * JavaScript it leads into the app (through onboarding for a first-time visitor).
 */

const LESSON_PT = '/pt/licao/seu-esqueleto-esta-vivo/';
const LESSON_EN = '/en/lesson/is-your-skeleton-alive/';

test('a prerendered lesson page is readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(LESSON_PT);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Seu esqueleto está vivo?');
  await expect(page.locator('.pub-p').first()).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    new RegExp(`^https://[^/]+${LESSON_PT}$`),
  );
  // The other language is one plain link away.
  await page.getByRole('link', { name: 'Read in English' }).click();
  await expect(page).toHaveURL(LESSON_EN);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Is your skeleton alive?');
  await context.close();
});

test('with JavaScript, "Continue in the app" opens the lesson in its trail', async ({ page }) => {
  await page.goto(LESSON_EN);
  await page.getByRole('link', { name: 'Continue in the app' }).click();
  // A first-time visitor goes through the (skippable) welcome, in the page's language,
  // then on to the lesson.
  await page.waitForURL(/\/app\/welcome\?next=/);
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.waitForURL(/\/app\/trail\/the-body-that-renews-itself\?start=concept_bone_remodeling/);
  await expect(
    page.getByRole('heading', { name: 'Is your skeleton alive?' }).first(),
  ).toBeVisible();
});
