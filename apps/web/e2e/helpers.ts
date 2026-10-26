import { expect, type Page } from '@playwright/test';

export const SHOTS = 'e2e/__screenshots__';

const L = {
  'pt-BR': {
    start: 'Começar a explorar',
    next: 'Continuar',
    surprise: 'Me surpreenda',
    finish: 'Começar',
    skip: 'Pular',
  },
  en: {
    start: 'Start exploring',
    next: 'Continue',
    surprise: 'Surprise me',
    finish: "Let's go",
    skip: 'Skip',
  },
} as const;

/** Runs onboarding. `interests` are topic names in the UI language. */
export async function onboard(
  page: Page,
  locale: 'pt-BR' | 'en',
  options: { interests?: string[]; goal?: string; skip?: boolean } = {},
) {
  const l = L[locale];
  await page.goto('/');
  await page.waitForURL(/\/app\/welcome/);
  if (options.skip === true) {
    await page.getByRole('button', { name: l.skip }).click();
  } else {
    await page.getByRole('button', { name: l.start }).click();
    for (const name of options.interests ?? [])
      await page.getByRole('button', { name, exact: true }).click();
    await page
      .getByRole('button', { name: (options.interests ?? []).length > 0 ? l.next : l.surprise })
      .click();
    if (options.goal !== undefined)
      await page.getByRole('radio', { name: options.goal, exact: true }).check({ force: true });
    await page.getByRole('button', { name: l.next }).click();
    await page.getByRole('button', { name: l.finish, exact: true }).click();
  }
  await page.waitForURL(/\/app\/discover/);
  await feedReady(page);
}

/** Waits until the feed's swipe and keyboard handlers are attached. */
export async function feedReady(page: Page) {
  await expect(page.locator('.feed-scroller[data-ready]')).toBeAttached();
  await expect(activeCard(page)).toBeVisible();
}

/** The lesson card currently in view. */
export function activeCard(page: Page) {
  return page.locator('.feed-slide:not([aria-hidden]) article');
}

export async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}
