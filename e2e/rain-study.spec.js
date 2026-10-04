// The production entry point is RainStudy. These tests intentionally use the
// bare URL rather than the legacy ?view=original switch.
const { test, expect } = require('@playwright/test');
const { siteCopy, openRainSite, expectNoHorizontalOverflow, scrollToY } = require('./helpers');

const ROUTES = [
  { path: '/', title: siteCopy.landingPage.fullName },
  { path: '/milestones', title: siteCopy.milestones.header.title },
  { path: '/works', title: siteCopy.works.headerLabel },
  { path: '/works/projects', title: siteCopy.projectsSection.header.title },
  { path: '/works/music', title: siteCopy.musicShowcase.title },
  { path: '/works/philosophy', title: siteCopy.philosophySection.title },
  { path: '/works/skills', title: siteCopy.skillsSection.headerLabel },
  { path: '/design', title: siteCopy.designSection.headerLabel },
];
const homeNavigation = page => page.getByRole('navigation', { name: 'Explore Ray’s work' });
const categories = page => page.getByRole('navigation', { name: 'Works categories' });
const breadcrumb = page => page.getByRole('navigation', { name: 'Page navigation' });

async function expectHome(page) {
  await expect(page.locator('#rain-page-title')).toHaveText(siteCopy.landingPage.fullName);
  await expect(homeNavigation(page)).toBeVisible();
}

async function expectWithinViewport(locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  const viewport = await locator.page().evaluate(() => ({ width: innerWidth, height: innerHeight }));
  expect(box.x, 'left edge').toBeGreaterThanOrEqual(-1);
  expect(box.y, 'top edge').toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width, 'right edge').toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + box.height, 'bottom edge').toBeLessThanOrEqual(viewport.height + 1);
}

test.describe('RainStudy navigation and controls', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('default home has source hero copy and all destinations', async ({ page }) => {
    const errors = await openRainSite(page);
    await expectHome(page);
    await expect(page.getByText(siteCopy.landingPage.subtitle, { exact: true })).toBeVisible();
    await expect(page.getByText(siteCopy.landingPage.descriptionLines[0], { exact: true })).toBeVisible();
    for (const section of siteCopy.mainSections.items) {
      await expect(homeNavigation(page).locator(`a[href='#/${section.id}']`)).toContainText(section.title);
    }
    expect(errors).toEqual([]);
  });

  for (const section of siteCopy.mainSections.items) {
    test(`${section.title} opens, browser Back/Forward work, and Home returns`, async ({ page }) => {
      const errors = await openRainSite(page, '/', 'motion=off');
      await homeNavigation(page).locator(`a[href='#/${section.id}']`).click();
      await expect(page).toHaveURL(new RegExp(`#/${section.id}$`));
      await expect(page.locator('#rain-page-title')).toHaveText(section.title);
      await expect(page.locator('#rain-page-title')).toBeFocused();
      await page.goBack();
      await expectHome(page);
      await page.goForward();
      await expect(page.locator('#rain-page-title')).toHaveText(section.title);
      await breadcrumb(page).locator('a[href="#/"]').click();
      await expectHome(page);
      expect(errors).toEqual([]);
    });
  }

  for (const category of siteCopy.works.categories) {
    test(`Works › ${category.title} has parent and home navigation`, async ({ page }) => {
      const errors = await openRainSite(page, '/works', 'motion=off');
      await categories(page).locator(`a[href='#/works/${category.id}']`).click();
      const route = ROUTES.find(route => route.path === `/works/${category.id}`);
      await expect(page.locator('#rain-page-title')).toHaveText(route.title);
      await expect(breadcrumb(page).locator('a[href="#/works"]')).toBeVisible();
      await breadcrumb(page).locator('a[href="#/works"]').click();
      await expect(categories(page)).toBeVisible();
      await page.getByRole('link', { name: 'Ray Xi home', exact: true }).click();
      await expectHome(page);
      expect(errors).toEqual([]);
    });
  }

  test('every deep route survives reload and has a working home link', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ROUTES.slice(1)) {
      await page.goto(`/?motion=off#${route.path}`);
      await expect(page.locator('#rain-page-title')).toHaveText(route.title);
      await page.reload();
      await expect(page.locator('#rain-page-title')).toHaveText(route.title);
      await expect(page).toHaveTitle(`Ray Xi — ${route.title}`);
      await page.getByRole('link', { name: 'Ray Xi home', exact: true }).click();
      await expectHome(page);
    }
    expect(errors).toEqual([]);
  });

  test('theme switches and remains selected after reload', async ({ page }) => {
    const errors = await openRainSite(page);
    const root = page.locator('.rain-study');
    const initiallyDark = await root.evaluate(el => el.classList.contains('rain-dark'));
    await page.getByRole('button', { name: initiallyDark ? 'Switch to light theme' : 'Switch to dark theme' }).click();
    await expect(root).toHaveClass(initiallyDark ? /\brain-light\b/ : /\brain-dark\b/);
    await page.reload();
    await expect(root).toHaveClass(initiallyDark ? /\brain-light\b/ : /\brain-dark\b/);
    await expect(page.locator('html')).toHaveClass(initiallyDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);
    expect(errors).toEqual([]);
  });

  test('motion toggle pauses and resumes, including with reduced-motion preferences', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = await openRainSite(page);
    // This design intentionally starts live motion on; the explicit control is
    // the user's persistent choice while navigating within the page.
    await expect(page.getByRole('button', { name: 'Pause live motion' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Pause live motion' }).click();
    await expect(page.locator('.rain-study')).toHaveClass(/\brain-still\b/);
    await expect(page.getByRole('button', { name: 'Enable live motion' })).toHaveAttribute('aria-pressed', 'false');
    await homeNavigation(page).locator('a[href="#/works"]').click();
    await expect(page.locator('.rain-study')).toHaveClass(/\brain-still\b/);
    await page.getByRole('button', { name: 'Enable live motion' }).click();
    await expect(page.locator('.rain-study')).toHaveClass(/\brain-moving\b/);
    expect(errors).toEqual([]);
  });

  test('projects, skills, and award filters reveal their source content', async ({ page }) => {
    const errors = await openRainSite(page, '/works/projects', 'motion=off');
    for (const project of siteCopy.projectsSection.items) {
      const button = page.getByRole('navigation', { name: 'Choose a project' }).getByRole('button', { name: `${project.name} ${project.tag}` });
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.rain-project-detail h2')).toHaveText(project.name);
      await expect(page.getByRole('link', { name: `Visit ${project.name}` })).toHaveAttribute('href', project.link);
    }
    await page.getByRole('navigation', { name: 'All pages' }).getByRole('link', { name: 'Ability', exact: true }).click();
    await page.getByRole('button', { name: 'Technical Skills', exact: true }).click();
    const skill = page.locator('details').filter({ has: page.locator('summary', { hasText: 'TypeScript' }) });
    await skill.locator('summary').click();
    await expect(skill).toHaveAttribute('open', '');
    await expect(skill.locator('.rain-skill-details')).toBeVisible();
    await page.getByRole('navigation', { name: 'All pages' }).getByRole('link', { name: 'Awards', exact: true }).click();
    for (const [label, type] of [['All', null], ['Design', 'design'], ['Recognition', 'recognition']]) {
      const button = page.getByRole('navigation', { name: 'Award categories' }).getByRole('button', { name: label, exact: true });
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.rain-awards-grid > a')).toHaveCount(siteCopy.designSection.items.filter(item => !type || item.type === type).length);
    }
    expect(errors).toEqual([]);
  });

  test('music controls adjust volume and disclose playback failure', async ({ page }) => {
    // Exercise a real user gesture with a deterministic media failure, avoiding
    // dependencies on an external audio service or browser autoplay policy.
    await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new Error('Simulated unavailable track')); });
    const errors = await openRainSite(page, '/works/music', 'motion=off');
    const volume = page.getByRole('slider', { name: 'Volume', exact: true });
    await volume.focus();
    await volume.press('End');
    await expect(volume).toHaveAttribute('aria-valuetext', '100 percent');
    await volume.press('ArrowLeft');
    await expect(volume).toHaveAttribute('aria-valuetext', '99 percent');
    await page.getByRole('button', { name: 'Play Broken', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Music player' }).getByRole('alert')).toContainText('Playback could not start');
    await expect(page.getByRole('button', { name: 'Play Broken', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pause Broken', exact: true })).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('Journey keeps all chapters readable and pauses automatic scrolling on input', async ({ page }) => {
    const errors = await openRainSite(page, '/milestones');
    const journey = page.getByRole('region', { name: 'Journey chapters' });
    await expect(journey).toHaveAttribute('data-autoscroll', 'playing');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(10);
    await page.keyboard.press('ArrowDown');
    await expect(journey).toHaveAttribute('data-autoscroll', 'paused');
    for (const chapter of siteCopy.milestones.chapters) {
      const article = page.getByRole('article', { name: chapter.title, exact: true });
      await expect(article).toHaveCount(1);
      for (const paragraph of chapter.paragraphs) await expect(article.getByText(paragraph, { exact: true })).toHaveCount(1);
    }
    const lastChapter = page.getByRole('article', { name: siteCopy.milestones.chapters.at(-1).title, exact: true });
    await lastChapter.getByRole('heading').scrollIntoViewIfNeeded();
    await expect(lastChapter.getByRole('heading')).toBeInViewport();
    await expect(journey).toHaveAttribute('data-chapter', String(siteCopy.milestones.chapters.length - 1));
    await page.getByRole('button', { name: 'Pause live motion' }).click();
    await expect(page.getByRole('button', { name: 'Enable Motion to use auto-scroll' })).toBeDisabled();
    expect(errors).toEqual([]);
  });
});

const VIEWPORTS = [
  { name: 'small phone', width: 320, height: 568, mobile: true },
  { name: 'phone', width: 390, height: 844, mobile: true },
  { name: 'phone landscape', width: 844, height: 390, mobile: true },
  { name: 'short desktop', width: 1280, height: 600, mobile: false },
];
for (const viewport of VIEWPORTS) {
  test.describe(`RainStudy ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.mobile, hasTouch: viewport.mobile });

    test('home content and controls fit without overlap or scrolling', async ({ page }) => {
      const errors = await openRainSite(page, '/', 'motion=off');
      const hero = page.locator('.rain-hero-copy');
      const nav = homeNavigation(page);
      for (const element of [hero, nav, page.locator('.rain-header')]) await expectWithinViewport(element);
      const heroBox = await hero.boundingBox();
      const navBox = await nav.boundingBox();
      const headerBox = await page.locator('.rain-header').boundingBox();
      expect(heroBox.y, 'hero clears header').toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 1);
      expect(heroBox.y + heroBox.height, 'hero clears destinations').toBeLessThanOrEqual(navBox.y + 1);
      for (const control of await page.locator('.rain-header button, .rain-destinations a').all()) await expectWithinViewport(control);
      await page.mouse.wheel(0, 400);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await expectNoHorizontalOverflow(page, 220);
      expect(errors).toEqual([]);
    });

    for (const route of ROUTES.slice(1)) {
      test(`${route.title}: reading and navigation stay inside the screen`, async ({ page }) => {
        const errors = await openRainSite(page, route.path, 'motion=off');
        await expect(page.locator('#rain-page-title')).toHaveText(route.title);
        // RainStudy has no per-section entry animation; 220ms lets the route's
        // 180ms fade settle while checking every viewport-sized reading segment.
        await expectNoHorizontalOverflow(page, 220);
        await scrollToY(page, 0);
        await expectWithinViewport(page.getByRole('link', { name: 'Ray Xi home', exact: true }));
        await page.getByRole('link', { name: 'Ray Xi home', exact: true }).click();
        await expectHome(page);
        expect(errors).toEqual([]);
      });
    }
  });
}
