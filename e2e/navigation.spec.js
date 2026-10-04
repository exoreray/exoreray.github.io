// Core features: the home page renders, every section and sub-page can be
// opened and left again, and the global controls (theme, music) work.
const { test, expect } = require('@playwright/test');
const { siteCopy, SETTLE_MS, card, openSite, openSection } = require('./helpers');

test.use({ viewport: { width: 1280, height: 800 } });

const back = (page) => page.getByRole('button', { name: 'Back', exact: true });

test('home page shows the hero and all section cards', async ({ page }) => {
  const errors = await openSite(page);
  const { landingPage, mainSections } = siteCopy;

  await expect(page.getByText(landingPage.subtitle)).toBeVisible();
  for (const section of mainSections.items) {
    await expect(card(page, section.title)).toBeVisible();
  }
  expect(errors).toEqual([]);
});

for (const section of siteCopy.mainSections.items) {
  test(`"${section.title}" opens and Back returns home`, async ({ page }) => {
    const errors = await openSite(page);
    await openSection(page, section.title);

    await expect(back(page)).toBeVisible();
    await back(page).click();
    await page.waitForTimeout(SETTLE_MS);
    await expect(card(page, section.title)).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('Journey shows every chapter, numbered in order', async ({ page }) => {
  const errors = await openSite(page);
  await openSection(page, 'Journey');

  const chapters = siteCopy.milestones.chapters;
  chapters.forEach((chapter, i) => {
    expect(chapter.number, `chapter "${chapter.title}"`).toBe(`Chapter ${i + 1}`);
  });
  for (const chapter of chapters) {
    await expect(page.locator(`section#${chapter.id}`)).toHaveCount(1);
    await expect(page.getByRole('heading', { name: chapter.title, exact: true })).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

for (const category of siteCopy.works.categories) {
  test(`Works › "${category.title}" opens and has a way back`, async ({ page }) => {
    const errors = await openSite(page);
    await openSection(page, 'Works');

    await card(page, category.title).click();
    await page.waitForTimeout(SETTLE_MS);

    // Without a Back button the visitor is stuck on this page.
    await expect(back(page), 'sub-page needs a Back button').toBeVisible();
    await back(page).click();
    await page.waitForTimeout(SETTLE_MS);
    await expect(card(page, category.title)).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('theme toggle switches dark mode and remembers it', async ({ page }) => {
  await openSite(page);
  const html = page.locator('html');
  const wasDark = await html.evaluate((el) => el.classList.contains('dark'));

  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(html).toHaveClass(wasDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);

  await page.reload();
  await expect(page.getByText(siteCopy.landingPage.fullName)).toBeVisible();
  await expect(html).toHaveClass(wasDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);
});

test('music player opens and closes', async ({ page }) => {
  await openSite(page);
  await page.getByRole('button', { name: 'Music player' }).click();
  await expect(page.getByText(siteCopy.globalMusicPlayer.playlistLabel)).toBeVisible();

  await page.getByRole('button', { name: 'Close music player' }).click();
  await expect(page.getByText(siteCopy.globalMusicPlayer.playlistLabel)).toBeHidden();
});
