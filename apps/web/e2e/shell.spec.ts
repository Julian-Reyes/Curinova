import { expect, test } from '@playwright/test';

const SHOTS = 'e2e/__screenshots__';

for (const locale of ['pt-BR', 'en'] as const) {
  test.describe(`shell (${locale})`, () => {
    test.use({ locale });

    test('renders in the browser language without horizontal overflow', async ({ page }, info) => {
      await page.goto('/');
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(heading).toContainText(locale === 'pt-BR' ? 'A base do' : 'foundation is ready');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      await page.screenshot({ path: `${SHOTS}/m1-${info.project.name}-${locale}-light.png` });
      await page.getByText(locale === 'pt-BR' ? 'Escuro' : 'Dark').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await page.screenshot({ path: `${SHOTS}/m1-${info.project.name}-${locale}-dark.png` });
    });
  });
}

test('tabs are visibly unavailable, not dead links', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation');
  await expect(nav.locator('[aria-disabled="true"]')).toHaveCount(5);
  await expect(nav.getByRole('link')).toHaveCount(0);
});

test('language and theme choices persist across reloads', async ({ page }) => {
  await page.goto('/');
  await page.getByText('English').click();
  await page.getByText('Escuro').or(page.getByText('Dark')).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('is installable as a PWA', async ({ page, browserName }, info) => {
  test.skip(
    browserName !== 'chromium' || info.project.name !== 'desktop',
    'installability is reported by Chromium desktop',
  );
  await page.goto('/');
  await page.waitForFunction(
    async () => (await navigator.serviceWorker.getRegistration()) !== undefined,
  );
  const cdp = await page.context().newCDPSession(page);
  const { installabilityErrors } = (await cdp.send('Page.getInstallabilityErrors')) as {
    installabilityErrors: { errorId: string }[];
  };
  // Playwright contexts are incognito-like, where Chrome never offers install. Every
  // other check (manifest, icons, service worker, HTTPS/localhost) must pass.
  expect(installabilityErrors.filter((e) => e.errorId !== 'in-incognito')).toEqual([]);
});
