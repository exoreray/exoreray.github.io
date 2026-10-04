// Real software WebGL ensures these checks cannot pass on a 2D rain canvas.
const { test, expect } = require('@playwright/test');
const { openSite, openRainSite } = require('./helpers');

test.use({
  viewport: { width: 1280, height: 800 },
  launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
});

async function expectWebGLContext(canvas) {
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box.width).toBeGreaterThan(100);
  expect(box.height).toBeGreaterThan(100);
  expect(await canvas.evaluate(element => {
    const gl = element.getContext('webgl2') || element.getContext('webgl');
    return !!gl && !gl.isContextLost() && gl.drawingBufferWidth > 100 && gl.drawingBufferHeight > 100;
  }), 'the selected scene must own a live WebGL context').toBe(true);
}

test('original home creates its 3D scene', async ({ page }) => {
  const errors = await openSite(page);
  // The original hero contains its own Canvas; global 2D rain lives outside it.
  const canvas = page.locator('.App .h-screen').first().locator('canvas');
  await expectWebGLContext(canvas);
  expect(errors).toEqual([]);
});

test('default home renders its 3D sculpture and retains it across routes', async ({ page }) => {
  const errors = await openRainSite(page);
  const canvas = page.locator('.living-sculpture canvas');
  await expect(canvas).toHaveAttribute('data-deformation', 'water-surface');
  await expectWebGLContext(canvas);
  await canvas.evaluate(element => { element.dataset.e2eIdentity = 'original-scene'; });
  await page.getByRole('navigation', { name: 'Explore Ray’s work' }).locator('a[href="#/works"]').click();
  await expect(canvas).toHaveAttribute('data-deformation', 'ambient');
  await expect(canvas).toHaveAttribute('data-e2e-identity', 'original-scene');
  await expectWebGLContext(canvas);
  expect(errors).toEqual([]);
});

test('Journey loads a real 3D model and remains navigable', async ({ page }) => {
  const errors = await openRainSite(page, '/milestones', 'motion=off');
  await expect(page.locator('.journey-film-sticky')).toHaveAttribute('data-scene-ready', 'true', { timeout: 45_000 });
  await expectWebGLContext(page.locator('.journey-film-canvas canvas'));
  await page.getByRole('link', { name: 'Ray Xi home', exact: true }).click();
  await expect(page.locator('#rain-page-title')).toHaveText('Ray Xi');
  expect(errors).toEqual([]);
});
