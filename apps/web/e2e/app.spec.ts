import { expect, test } from '@playwright/test';
import { activeCard, feedReady, noHorizontalOverflow, onboard, SHOTS } from './helpers';

test.describe('guest learner in Portuguese (§16 E2E 1)', () => {
  test.use({ locale: 'pt-BR' });

  test('gets a Portuguese UI, picks interests, reads a card, passes a quiz, and keeps stats after reload', async ({
    page,
  }) => {
    await onboard(page, 'pt-BR', { interests: ['Espaço', 'História'] });
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible();
    await expect(activeCard(page).locator('.card-meta')).toContainText(
      /Porque você escolheu|Algo novo/,
    );

    await activeCard(page).getByRole('button', { name: 'Quiz', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Pergunta 1 de 2')).toBeVisible();
    // Answer every question; feedback is shown and announced.
    for (let i = 0; i < 2; i += 1) {
      await dialog.locator('ul button').first().click();
      await expect(dialog.getByText(/Isso mesmo!|Não foi dessa vez/)).toBeVisible();
      await dialog
        .getByRole('button', { name: i === 0 ? 'Próxima pergunta' : 'Ver resultado' })
        .click();
    }
    await expect(dialog.getByText(/Você acertou \d de 2/)).toBeVisible();
    await expect(dialog.getByText(/voltam amanhã na aba Revisar/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Concluir' }).click();

    await page.reload();
    await page.getByRole('navigation').getByRole('link', { name: 'Você' }).click();
    // Reloading starts a new session with an unseen card, so at least 1 (usually 2).
    await expect
      .poll(async () =>
        Number(
          await page
            .getByText('Ideias exploradas')
            .locator('..')
            .locator('span')
            .first()
            .innerText(),
        ),
      )
      .toBeGreaterThanOrEqual(1);
    await expect(page.getByText(/de 2 respostas/)).toBeVisible();
    await page
      .getByRole('link', { name: /Revisar/ })
      .first()
      .click();
    await expect(page.getByText('Aprendidas recentemente')).toBeVisible();
  });
});

test('switching to English keeps saved lessons and review states (§16 E2E 2)', async ({ page }) => {
  await onboard(page, 'pt-BR', { skip: true });
  const titlePt = await activeCard(page).locator('h2').innerText();
  await activeCard(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('status').getByText('Salva na Biblioteca')).toBeVisible();
  await activeCard(page).getByRole('button', { name: 'Quiz', exact: true }).click();
  await page.getByRole('dialog').locator('ul button').first().click();
  await page.keyboard.press('Escape');

  await page.getByRole('navigation').getByRole('link', { name: 'Você' }).click();
  await page.getByRole('link', { name: 'Configurações' }).click();
  await page.getByText('English', { exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');

  await page.getByRole('navigation').getByRole('link', { name: 'Library' }).click();
  const saved = page.locator('main ul li');
  await expect(saved).toHaveCount(1);
  await expect(saved.first()).not.toContainText(titlePt); // same concept, now its English variant
  await page.getByRole('navigation').getByRole('link', { name: 'Review' }).click();
  await expect(page.getByText('Recently learned')).toBeVisible();
});

test.describe('English learner', () => {
  test.use({ locale: 'en' });

  test('a saved lesson is still in Library after a restart (§16 E2E 3)', async ({
    page,
    context,
  }) => {
    await onboard(page, 'en', { skip: true });
    const title = await activeCard(page).locator('h2').innerText();
    await activeCard(page).getByRole('button', { name: 'Save' }).click();
    await expect(activeCard(page).getByRole('button', { name: 'Saved' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const fresh = await context.newPage();
    await page.close();
    await fresh.goto('/app/library');
    await expect(fresh.getByRole('link', { name: new RegExp(title.slice(0, 20)) })).toBeVisible();
  });

  test('the session soft-stops after the goal and continues for free (§16 E2E 4)', async ({
    page,
  }) => {
    await onboard(page, 'en', { skip: true }); // default goal: 5
    for (let i = 1; i < 5; i += 1) {
      await expect(activeCard(page)).toContainText(`${i}/5`);
      await page.keyboard.press('ArrowDown');
    }
    await expect(activeCard(page)).toContainText('5/5');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('heading', { name: 'Nice work!' })).toBeVisible();
    await expect(page.getByText(/You explored 5 ideas/)).toBeVisible();
    await page.getByRole('button', { name: 'Keep exploring' }).click();
    await expect(activeCard(page)).toBeVisible();
    await expect(activeCard(page).locator('h2')).not.toBeEmpty();
  });

  test('following a trail and exiting returns to the same feed position (§16 E2E 5)', async ({
    page,
  }) => {
    await onboard(page, 'en', { skip: true });
    await page.keyboard.press('ArrowDown');
    await expect(activeCard(page)).toContainText('2/5');
    const feedTitle = await activeCard(page).locator('h2').innerText();
    await activeCard(page)
      .getByRole('button', { name: /Next in trail/ })
      .click();
    await page.waitForURL(/\/app\/trail\//);
    await expect(page.getByRole('link', { name: 'Exit trail' })).toBeVisible();
    const first = await activeCard(page).locator('h2').innerText();
    await activeCard(page)
      .getByRole('button', { name: /Next in trail/ })
      .click();
    await expect(activeCard(page).locator('h2')).not.toHaveText(first);
    await page.getByRole('link', { name: 'Exit trail' }).click();
    await page.waitForURL(/\/app\/discover/);
    await feedReady(page);
    await expect(activeCard(page)).toContainText('2/5');
    await expect(activeCard(page).locator('h2')).toHaveText(feedTitle);
  });

  test('arrow keys move the feed, but not while typing or with a dialog open (§16 E2E 9)', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'desktop', 'keyboard navigation is a desktop concern');
    await onboard(page, 'en', { skip: true });
    await activeCard(page).getByRole('button', { name: 'Go deeper' }).click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(activeCard(page)).toContainText('1/5');
    await page.keyboard.press('ArrowDown');
    await expect(activeCard(page)).toContainText('2/5');
    await page.getByRole('navigation').getByRole('link', { name: 'Explore' }).click();
    await page.getByRole('searchbox').fill('moon');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('searchbox')).toHaveValue('moon');
    await expect(page.getByText(/\d+ results?/)).toBeVisible();
  });
});

for (const locale of ['pt-BR', 'en'] as const) {
  test.describe(`layout (${locale}) (§16 E2E 8)`, () => {
    test.use({ locale });
    test('every tab fits without horizontal overflow; screenshots for review', async ({
      page,
    }, info) => {
      await onboard(page, locale, { skip: true });
      const name = `${info.project.name}-${locale}`;
      await noHorizontalOverflow(page);
      await page.screenshot({ path: `${SHOTS}/m2-${name}-discover.png` });
      for (const tab of ['explore', 'review', 'library', 'you', 'settings']) {
        await page.goto(`/app/${tab}`);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await noHorizontalOverflow(page);
        await page.screenshot({ path: `${SHOTS}/m2-${name}-${tab}.png`, fullPage: true });
      }
      // No nav label is truncated (§8: never truncate pt-BR labels).
      const truncated = await page
        .locator('nav a span')
        .evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).length);
      expect(truncated).toBe(0);
    });
  });
}

test('is installable as a PWA', async ({ page, browserName }, info) => {
  test.skip(
    browserName !== 'chromium' || info.project.name !== 'desktop',
    'installability is reported by Chromium desktop',
  );
  await page.goto('/');
  await page.waitForURL(/\/app\/welcome/);
  await page.waitForFunction(
    async () => (await navigator.serviceWorker.getRegistration()) !== undefined,
  );
  const cdp = await page.context().newCDPSession(page);
  const { installabilityErrors } = (await cdp.send('Page.getInstallabilityErrors')) as {
    installabilityErrors: { errorId: string }[];
  };
  // Playwright contexts are incognito-like; every other check must pass.
  expect(installabilityErrors.filter((e) => e.errorId !== 'in-incognito')).toEqual([]);
});
