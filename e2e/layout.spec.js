// Screen-size checks: every page at every common viewport, including phones
// held sideways, must keep its content on screen and inside its own section.
const { test, expect } = require('@playwright/test');
const { siteCopy, SETTLE_MS, card, openSite, openSection, scrollToY, expectNoHorizontalOverflow } = require('./helpers');

const VIEWPORTS = [
  { name: 'small phone', width: 320, height: 568, mobile: true },
  { name: 'phone', width: 390, height: 844, mobile: true },
  { name: 'phone landscape', width: 844, height: 390, mobile: true },
  { name: 'tablet', width: 768, height: 1024, mobile: true },
  { name: 'laptop', width: 1280, height: 800, mobile: false },
  { name: 'desktop', width: 1920, height: 1080, mobile: false },
];

// How to reach each page from the home page.
const PAGES = [
  { name: 'Home', open: async () => {} },
  { name: 'Journey', open: (page) => openSection(page, 'Journey') },
  { name: 'Works', open: (page) => openSection(page, 'Works') },
  { name: 'Awards', open: (page) => openSection(page, 'Awards') },
  ...siteCopy.works.categories.map((category) => ({
    name: `Works › ${category.title}`,
    open: async (page) => {
      await openSection(page, 'Works');
      await card(page, category.title).click();
      await page.waitForTimeout(SETTLE_MS);
    },
  })),
];

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name} ${vp.width}×${vp.height}`, () => {
    test.use({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });

    for (const target of PAGES) {
      test(`${target.name}: nothing overflows the screen`, async ({ page }) => {
        const errors = await openSite(page);
        await target.open(page);
        await expectNoHorizontalOverflow(page);
        expect(errors).toEqual([]);
      });
    }

    test('Journey: every chapter fits inside its own section', async ({ page }) => {
      await openSite(page);
      await openSection(page, 'Journey');

      for (const chapter of siteCopy.milestones.chapters) {
        const section = page.locator(`section#${chapter.id}`);
        const top = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
        await scrollToY(page, top);
        await page.waitForTimeout(SETTLE_MS);

        const box = await section.evaluate((el) => {
          const content = el.firstElementChild.firstElementChild;
          const kids = [...content.children].map((k) => k.getBoundingClientRect());
          const s = el.getBoundingClientRect();
          return {
            sectionTop: s.top,
            sectionBottom: s.bottom,
            contentTop: Math.min(...kids.map((k) => k.top)),
            contentBottom: Math.max(...kids.map((k) => k.bottom)),
          };
        });
        // Content spilling out gets cut off / hidden under the next chapter.
        expect(box.contentTop, `"${chapter.title}" top is cut off`).toBeGreaterThanOrEqual(box.sectionTop - 1);
        expect(box.contentBottom, `"${chapter.title}" bottom is cut off`).toBeLessThanOrEqual(box.sectionBottom + 1);
      }
    });
  });
}
