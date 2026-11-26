const { test, expect } = require('@playwright/test');
const photos = require('../src/data/photographs.json');
// Exercise original H.264/HE-AAC media using Chrome's production codecs.
test.use({ channel: 'chrome' });

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
      const viewer = page.getByRole('dialog', { name: 'Media viewer' });
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

for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
  test.describe(`Native Story video at ${viewport.width}px`, () => {
    test.use({viewport});
    test('a real clip loads, plays, seeks and closes without losing photo navigation', async ({page}) => {
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto('/?motion=off#/works/photography');
      await page.getByRole('button',{name:'Videos',exact:true}).click();
      const clips=photos.filter(p=>p.type==='video');
      await expect(page.locator('.photography__count')).toHaveText(`${clips.length} videos`);
      const first=page.getByRole('button',{name:`Open video ${clips[0].title}`,exact:true});
      await first.click();
      const viewer=page.getByRole('dialog',{name:'Media viewer'});const video=viewer.locator('video');
      await expect(video).toBeVisible();
      await expect(video).toHaveAttribute('src',clips[0].videoSrc);
      await expect.poll(()=>video.evaluate(v=>v.readyState>=1&&v.videoWidth>0&&v.duration>0)).toBe(true);
      const media=await video.evaluate(v=>({width:v.videoWidth,height:v.videoHeight,duration:v.duration}));
      expect(media.width).toBeGreaterThanOrEqual(300);expect(media.duration).toBeGreaterThan(1);
      await video.evaluate(v=>{v.muted=true;return v.play();});
      await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThan(.1);
      await video.evaluate(v=>{v.pause();v.currentTime=Math.min(1,v.duration/2);});
      await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThanOrEqual(.9);
      if(process.env.PHOTO_QA_SCREENSHOTS)await page.screenshot({path:require('path').join(process.env.PHOTO_QA_SCREENSHOTS,`video-${viewport.width}.jpg`),type:'jpeg',quality:85});
      await viewer.getByRole('button',{name:'Close',exact:true}).click();
      await expect(viewer).not.toBeVisible();await expect(first).toBeFocused();
      await page.getByRole('button',{name:'Photographs',exact:true}).click();
      await expect(page.locator('.photography__collection button')).toHaveCount(photos.filter(p=>p.type!=='video').length);
      expect(errors).toEqual([]);
    });
  });
}
