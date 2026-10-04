// With WebGL on, the 3D scenes must render. (Every other spec runs with WebGL
// off, see playwright.config.js, and no-webgl.spec.js covers that case.)
const { test, expect } = require('@playwright/test');
const { openSite } = require('./helpers');

test.use({
  viewport: { width: 1280, height: 800 },
  // Software WebGL, so this also works on machines without a GPU.
  launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
});

test('home page renders its 3D scene', async ({ page }) => {
  const errors = await openSite(page);
  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box.width).toBeGreaterThan(100);
  expect(box.height).toBeGreaterThan(100);
  expect(errors).toEqual([]);
});
