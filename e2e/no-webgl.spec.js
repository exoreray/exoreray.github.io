// Visitors whose browser has no WebGL must still get a working page, not a
// blank screen. The default config launches Chromium with WebGL disabled.
const { test, expect } = require('@playwright/test');
const { siteCopy, openSite, openSection } = require('./helpers');

test.use({ viewport: { width: 1280, height: 800 } });

test('without WebGL the home page and Journey still render', async ({ page }) => {
  const errors = await openSite(page);
  expect(await page.evaluate(() => !!document.createElement('canvas').getContext('webgl'))).toBe(false);
  await expect(page.getByText(siteCopy.landingPage.subtitle)).toBeVisible();

  await openSection(page, 'Journey');
  await expect(page.getByRole('heading', { name: siteCopy.milestones.chapters[0].title, exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('without WebGL the default home and every Journey chapter remain readable', async ({ page }) => {
  const { openRainSite } = require('./helpers');
  const errors = await openRainSite(page, '/', 'motion=off');
  expect(await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  })).toBe(false);
  await expect(page.locator('#rain-page-title')).toHaveText(siteCopy.landingPage.fullName);
  await page.getByRole('navigation', { name: 'Explore Ray’s work' }).locator('a[href="#/milestones"]').click();
  await expect(page.locator('#rain-page-title')).toHaveText(siteCopy.milestones.header.title);
  await expect(page.getByRole('status', { name: '' }).filter({ hasText: 'The 3D scene is unavailable.' })).toHaveCount(1);
  await expect(page.getByRole('status').filter({ hasText: /^Loading / })).toHaveCount(0);
  for (const chapter of siteCopy.milestones.chapters) {
    const article = page.getByRole('article', { name: chapter.title, exact: true });
    await article.getByRole('heading').scrollIntoViewIfNeeded();
    await expect(article.getByRole('heading')).toBeInViewport();
    await expect(article.getByText(chapter.paragraphs[0], { exact: true })).toBeVisible();
  }
  await page.getByRole('link', { name: 'Ray Xi home', exact: true }).click();
  await expect(page.locator('#rain-page-title')).toHaveText(siteCopy.landingPage.fullName);
  expect(errors).toEqual([]);
});
