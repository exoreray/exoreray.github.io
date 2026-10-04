const { expect } = require('@playwright/test');
const siteCopy = require('../src/data/siteCopy.json');

// Animations on the site run up to ~1.4s (0.8s duration + up to 0.6s delay).
const SETTLE_MS = 1500;

// Load the home page and start collecting uncaught page errors. Specs assert
// `errors` is empty at the end so a crash anywhere fails the test.
async function openSite(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  // The preserved original portfolio now lives behind an explicit view switch.
  await page.goto('/?view=original');
  await expect(page.getByText(siteCopy.landingPage.fullName)).toBeVisible();
  return errors;
}

// A clickable card (home sections, Works categories) identified by its heading.
function card(page, title) {
  return page.locator('a', { has: page.getByRole('heading', { name: title, exact: true }) });
}

// Click one of the home page cards (Journey / Works / Awards).
async function openSection(page, title) {
  const target = card(page, title);
  await target.scrollIntoViewIfNeeded();
  await target.click();
  await page.waitForTimeout(SETTLE_MS);
}

async function scrollToY(page, y) {
  await page.evaluate((top) => {
    if (window.lenis) window.lenis.scrollTo(top, { immediate: true });
    else window.scrollTo(0, top);
  }, y);
}

// Scroll through the whole page, letting scroll-triggered animations finish
// at each stop, and call `check` at every stop.
async function scrollThrough(page, check, settleMs = SETTLE_MS) {
  const { height, vh } = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    vh: window.innerHeight,
  }));
  const step = Math.max(200, Math.floor(vh * 0.8));
  for (let y = 0; y < height; y += step) {
    await scrollToY(page, y);
    await page.waitForTimeout(settleMs);
    await check(y);
  }
  await scrollToY(page, 0);
}

// Visible content that sticks out past the left/right edge of the viewport.
// Elements still fading in (effective opacity < 0.95) are skipped: those are
// mid slide-in animation, not broken layout.
async function findHorizontalOverflow(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const effectiveOpacity = (el) => {
      let o = 1;
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
        o *= parseFloat(cs.opacity);
      }
      return o;
    };
    const offenders = [];
    for (const el of document.querySelectorAll('h1,h2,h3,h4,p,a,button,img,li,span')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.bottom < 0 || r.top > window.innerHeight) continue; // off-screen vertically
      if (r.right <= vw + 1 && r.left >= -1) continue;
      if (effectiveOpacity(el) < 0.95) continue;
      const text = (el.innerText || el.getAttribute('alt') || el.tagName).trim().replace(/\s+/g, ' ');
      offenders.push(`<${el.tagName.toLowerCase()}> "${text.slice(0, 50)}" spans x=${Math.round(r.left)}..${Math.round(r.right)} (viewport ${vw})`);
    }
    return offenders;
  });
}

// Scroll through the page and fail if anything overflows horizontally or the
// page itself becomes horizontally scrollable.
async function expectNoHorizontalOverflow(page, settleMs = SETTLE_MS) {
  const found = new Set();
  await scrollThrough(page, async () => {
    for (const o of await findHorizontalOverflow(page)) found.add(o);
  }, settleMs);
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, 'page should not scroll horizontally').toBeLessThanOrEqual(clientWidth);
  expect([...found], 'content sticking out of the viewport').toEqual([]);
}

// Default production UI. Keep this separate so a passing original-view test
// cannot accidentally stand in for coverage of the public home page.
async function openRainSite(page, path = '/', query = '') {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto(`/${query ? `?${query}` : ''}#${path}`);
  await expect(page.locator('.rain-study')).toBeVisible();
  await expect(page.locator('#rain-page-title')).toBeVisible();
  return errors;
}

module.exports = {
  openRainSite,
  siteCopy,
  SETTLE_MS,
  card,
  openSite,
  openSection,
  scrollToY,
  scrollThrough,
  findHorizontalOverflow,
  expectNoHorizontalOverflow,
};
