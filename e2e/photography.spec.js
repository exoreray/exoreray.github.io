const { test, expect } = require('@playwright/test');
const photos = require('../src/data/photographs.json');

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test.describe(`Photography at ${viewport.width}px`, () => {
    test.use({ viewport });
    test('real images load, filters work, and the native viewer is keyboard accessible', async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('/?motion=off#/works/photography');
      await expect(page.getByRole('heading', { name: 'Photography', exact: true })).toBeVisible();
      const first = page.getByRole('button', { name: `Open ${photos[0].title}`, exact: true });
      const image = first.locator('img');
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate(im => im.complete && im.naturalWidth > 0)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (process.env.PHOTO_QA_SCREENSHOTS) {
        await page.screenshot({ path: require('path').join(process.env.PHOTO_QA_SCREENSHOTS, `gallery-${viewport.width}.jpg`), type: 'jpeg', quality: 85 });
      }
      await first.click();
      const viewer = page.getByRole('dialog', { name: 'Photograph viewer' });
      await expect(viewer).toBeVisible();
      await expect(viewer.locator('img')).toHaveAttribute('src', photos[0].full);
      await expect.poll(() => viewer.locator('img').evaluate(im => im.complete && im.naturalWidth > 0)).toBe(true);
      await page.keyboard.press('ArrowRight');
      await expect(viewer.locator('img')).toHaveAttribute('src', photos[1].full);
      await page.keyboard.press('Escape');
      await expect(viewer).not.toBeVisible();
      await expect(first).toBeFocused();
      await page.getByRole('button', { name: 'Portraits', exact: true }).click();
      await expect(page.locator('.photography__count')).toHaveText(`${photos.filter(p => p.category === 'Portraits').length} photographs`);
      await expect(page.locator('.photography__collection button')).toHaveCount(photos.filter(p => p.category === 'Portraits').length);
      expect(errors).toEqual([]);
    });
  });
}

test('the collection is discoverable from Works in both site layouts', async ({ page }) => {
  for (const prefix of ['/?motion=off', '/?view=original']) {
    await page.goto(`${prefix}#/works`);
    await page.getByRole('link', { name: /Photography/ }).first().click();
    await expect(page.getByRole('heading', { name: 'Photography', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Page navigation' }).getByRole('link', { name: /Works/i })).toBeVisible();
  }
});
