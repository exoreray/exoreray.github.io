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
