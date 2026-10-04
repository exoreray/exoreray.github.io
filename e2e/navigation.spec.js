// Core features: the home page renders, every section and sub-page can be
// opened and left again, and the global controls (theme, music) work.
const { test, expect } = require('@playwright/test');
const { siteCopy, SETTLE_MS, card, openSite, openSection } = require('./helpers');

test.use({ viewport: { width: 1280, height: 800 } });

const back = (page, destination = '/') => page.getByRole('navigation', { name: 'Page navigation' }).locator(`a[href='#${destination}']`);

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
  test(`Original "${section.title}" opens and Back returns home`, async ({ page }) => {
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
  test(`Original Works › "${category.title}" opens and has a way back`, async ({ page }) => {
    const errors = await openSite(page);
    await openSection(page, 'Works');

    await card(page, category.title).click();
    await page.waitForTimeout(SETTLE_MS);

    // Routed sub-pages must retain a way to return to the Works categories.
    await expect(page).toHaveURL(new RegExp(`#\\/works\\/${category.id}$`));
    await expect(back(page, '/works'), 'sub-page needs a parent navigation link').toBeVisible();
    await back(page, '/works').click();
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

for (const category of siteCopy.works.categories) {
  test(`Original direct link to ${category.title} survives reload and returns home`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/?view=original#/works/${category.id}`);
    await expect(back(page, '/works')).toBeVisible();
    await page.reload();
    await expect(back(page, '/works')).toBeVisible();
    await back(page).click();
    await expect(page).toHaveURL(/\?view=original#\/$/);
    await expect(card(page, 'Works')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
