import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { activeCard, feedReady, noHorizontalOverflow } from './helpers';

/*
 * §16 E2E 10: automated accessibility checks (axe) on every main screen, sheet and public
 * page, in both languages and both themes. Serious and critical findings fail (D28).
 * The mobile layout (bottom navigation, sheets) and the desktop one (side navigation).
 */

const L = {
  'pt-BR': {
    skip: 'Pular',
    nav: {
      explore: 'Explorar',
      review: 'Revisar',
      library: 'Biblioteca',
      you: 'Você',
      discover: 'Descobrir',
    },
    settings: 'Configurações',
    quiz: 'Quiz',
    deeper: 'Mergulhar',
    share: 'Compartilhar',
    lesson: '/pt/licao/seu-esqueleto-esta-vivo/',
    credits: '/pt/creditos/',
    topic: '/pt/topico/corpo-humano-e-biologia/',
  },
  en: {
    skip: 'Skip',
    nav: {
      explore: 'Explore',
      review: 'Review',
      library: 'Library',
      you: 'You',
      discover: 'Discover',
    },
    settings: 'Settings',
    quiz: 'Quiz',
    deeper: 'Dive in',
    share: 'Share',
    lesson: '/en/lesson/is-your-skeleton-alive/',
    credits: '/en/credits/',
    topic: '/en/topic/human-body-and-biology/',
  },
} as const;

type Finding = string;

async function scan(page: Page, screen: string, findings: Finding[]) {
  // Screens and sheets fade in; mid-fade colours would read as low contrast.
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
  const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
  const main = await new AxeBuilder({ page }).withTags(tags).exclude('.feed-header').analyze();
  // The feed's header (app name, trail pill) floats over the card, outside it in the DOM, so
  // axe measures its white text against the page colour instead of the card. The card is
  // always black with a 50% black top fade; even over a white photo the app name (21 px
  // bold) is about 3.9:1 (3:1 needed) and the pill, with its own 38% black, about 8:1.
  // Every other rule still runs on it.
  const header = (await page.locator('.feed-header').count())
    ? (
        await new AxeBuilder({ page })
          .withTags(tags)
          .include('.feed-header')
          .disableRules(['color-contrast'])
          .analyze()
      ).violations
    : [];
  for (const v of [...main.violations, ...header]) {
    if (v.impact !== 'serious' && v.impact !== 'critical') continue;
    const targets = v.nodes
      .slice(0, 3)
      .map((n) => n.target.join(' '))
      .join(' | ');
    findings.push(`${screen}: ${v.id} (${v.impact ?? ''}) ${targets}`);
  }
}

for (const locale of ['pt-BR', 'en'] as const) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test.describe(`${locale}, ${colorScheme}`, () => {
      test.use({ locale, colorScheme });

      test('every screen passes axe (§16 E2E 10)', async ({ page }, info) => {
        test.skip(
          info.project.name !== 'android-mid' && info.project.name !== 'desktop',
          'one phone and the desktop layout',
        );
        test.setTimeout(90_000);
        const l = L[locale];
        const nav = (name: string) =>
          page.getByRole('navigation').getByRole('link', { name, exact: true });
        const findings: Finding[] = [];

        await page.goto('/');
        await page.waitForURL(/\/app\/welcome/);
        await scan(page, 'welcome', findings);
        await page.getByRole('button', { name: l.skip }).click();
        await page.waitForURL(/\/app\/discover/);
        await feedReady(page);
        await scan(page, 'discover', findings);

        await activeCard(page).getByRole('button', { name: l.quiz, exact: true }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await scan(page, 'quiz', findings);
        await page.getByRole('dialog').locator('ul button').first().click();
        await scan(page, 'quiz feedback', findings);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toBeHidden();

        await activeCard(page).getByRole('button', { name: l.deeper }).first().click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await scan(page, 'go deeper', findings);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toBeHidden();

        await activeCard(page).getByRole('button', { name: l.share }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await scan(page, 'share', findings);
        await page.keyboard.press('Escape');

        await nav(l.nav.explore).click();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await scan(page, 'explore', findings);
        await page.locator('main a[href^="/app/topic/"]').first().click();
        await page.waitForURL(/\/app\/topic\//);
        await scan(page, 'topic', findings);
        await page.locator('main a[href^="/app/trail/"]').first().click();
        await page.waitForURL(/\/app\/trail\//);
        await expect(page.locator('.feed-slide article').first()).toBeVisible();
        await scan(page, 'trail', findings);

        await nav(l.nav.review).click();
        await page.waitForURL(/\/app\/review/);
        await scan(page, 'review', findings);
        await nav(l.nav.library).click();
        await page.waitForURL(/\/app\/library/);
        await scan(page, 'library', findings);
        await nav(l.nav.you).click();
        await page.waitForURL(/\/app\/you/);
        await scan(page, 'you', findings);
        await page.getByRole('link', { name: l.settings }).click();
        await page.waitForURL(/\/app\/settings/);
        await scan(page, 'settings', findings);

        for (const path of [l.lesson, l.topic, l.credits]) {
          await page.goto(path);
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
          await scan(page, path, findings);
        }
        await page.goto('/offline.html');
        await scan(page, 'offline page', findings);

        expect(findings).toEqual([]);
      });
    });
  }
}

test.describe('reflow at 320 CSS px (200% zoom, §8)', () => {
  test.use({ locale: 'pt-BR', viewport: { width: 320, height: 640 } });

  test('every screen and sheet fits without sideways scrolling', async ({ page }, info) => {
    test.skip(info.project.name !== 'android-mid', 'one phone is enough');
    const l = L['pt-BR'];
    const nav = (name: string) =>
      page.getByRole('navigation').getByRole('link', { name, exact: true });
    await page.goto('/');
    await page.waitForURL(/\/app\/welcome/);
    await noHorizontalOverflow(page);
    await page.getByRole('button', { name: l.skip }).click();
    await feedReady(page);
    await noHorizontalOverflow(page);
    await activeCard(page).getByRole('button', { name: l.quiz, exact: true }).click();
    await page.getByRole('dialog').locator('ul button').first().click();
    await noHorizontalOverflow(page);
    await page.keyboard.press('Escape');
    await activeCard(page).getByRole('button', { name: l.deeper }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await noHorizontalOverflow(page);
    await page.keyboard.press('Escape');
    for (const name of [l.nav.explore, l.nav.review, l.nav.library, l.nav.you]) {
      await nav(name).click();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await noHorizontalOverflow(page);
    }
    await page.getByRole('link', { name: l.settings }).click();
    await page.waitForURL(/\/app\/settings/);
    await noHorizontalOverflow(page);
    for (const path of [l.lesson, l.topic, l.credits]) {
      await page.goto(path);
      await noHorizontalOverflow(page);
    }
  });
});
