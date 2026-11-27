const {test,expect}=require('@playwright/test');
const photos=require('../src/data/photographs.json');
const path=require('path');
test.use({channel:'chrome'});
const openLabel=p=>'Open'+(p.type==='video'?' video':'')+' '+p.title;
async function screenshot(page,name){if(process.env.PHOTO_QA_SCREENSHOTS)await page.screenshot({path:path.join(process.env.PHOTO_QA_SCREENSHOTS,name+'.jpg'),type:'jpeg',quality:88});}
async function start(page){await page.goto('/?motion=off#/works/photography');await expect(page.getByRole('heading',{name:'Photography',exact:true})).toBeVisible();}

for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:320,height:568}]){
 test.describe('Photo atlas at '+viewport.width+'px',()=>{
  test.use({viewport});
  test('real photographs form an explorable constellation, with all works reachable',async({page})=>{
   const errors=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
   await expect(page.getByRole('combobox')).toHaveCount(0);
   await expect(page.locator('.atlas-photo')).toHaveCount(photos.length);
   const first=page.getByRole('button',{name:openLabel(photos[0]),exact:true});
   await expect.poll(()=>first.locator('img').evaluate(im=>im.complete&&im.naturalWidth>0)).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   for(const b of await page.getByRole('navigation',{name:'Ways to explore'}).getByRole('button').all()){
    const box=await b.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(viewport.width+1);expect(box.y+box.height).toBeLessThanOrEqual(viewport.height+1);
   }
   await screenshot(page,'atlas-'+viewport.width);
   await first.click();const viewer=page.getByRole('dialog',{name:'Media viewer'});await expect(viewer).toBeVisible();await expect(viewer.locator('img')).toHaveAttribute('src',photos[0].full);
   await page.keyboard.press('ArrowRight');await expect(viewer.locator('img')).toHaveAttribute('src',photos[1].full);
   await page.keyboard.press('Escape');await expect(viewer).not.toBeVisible();await expect(first).toBeFocused();
   await page.getByRole('button',{name:'Open contact sheet',exact:true}).click();const sheet=page.getByRole('region',{name:'Contact sheet'});await expect(sheet.getByRole('button')).toHaveCount(photos.length);
   const last=sheet.getByRole('button',{name:openLabel(photos[photos.length-1]),exact:true});await last.click();await expect(viewer).toBeVisible();await expect(viewer.locator('img')).toHaveAttribute('src',photos[photos.length-1].full);await page.keyboard.press('Escape');await expect(last).toBeFocused();
   expect(errors).toEqual([]);
  });
  test('words, feelings, year islands and colors gather the matching photographs',async({page})=>{
   await start(page);await page.getByRole('button',{name:'Words',exact:true}).click();
   const subjectSet=[...new Set(photos.flatMap(p=>p.subjects))];const field=page.getByRole('group',{name:'Word cloud'});const seen=new Set(await field.locator('.atlas-word').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label'))));if(await page.getByRole('button',{name:'More words',exact:true}).count()){await page.getByRole('button',{name:'More words',exact:true}).click();for(const label of await field.locator('.atlas-word').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label'))))seen.add(label);await page.getByRole('button',{name:'More words',exact:true}).click();}expect(seen.size).toBe(subjectSet.length);
   const viewportBox=await page.getByRole('region',{name:'Photo constellation'}).boundingBox();
   for(const word of await page.getByRole('group',{name:'Word cloud'}).locator('.atlas-word').all()){
    const b=await word.boundingBox();expect(b.x).toBeGreaterThanOrEqual(viewportBox.x-1);expect(b.x+b.width).toBeLessThanOrEqual(viewportBox.x+viewportBox.width+1);expect(b.y+b.height).toBeLessThanOrEqual(viewportBox.y+viewportBox.height+1);
   }
   await screenshot(page,'wordcloud-'+viewport.width);
   await page.getByRole('button',{name:'Explore Water',exact:true}).click();await expect(page.locator('.atlas-photo')).toHaveCount(photos.filter(p=>p.subjects.includes('Water')).length);
   await page.getByRole('button',{name:'Words',exact:true}).click();await page.getByRole('button',{name:'Feelings',exact:true}).click();await page.getByRole('button',{name:'Explore Calm',exact:true}).click();await expect(page.locator('.atlas-photo')).toHaveCount(photos.filter(p=>p.vibes.includes('Calm')).length);
   await page.getByRole('button',{name:'Words',exact:true}).click();await page.getByRole('button',{name:'Themes',exact:true}).click();await page.getByRole('button',{name:'Explore Nature',exact:true}).click();await expect(page.locator('.atlas-photo')).toHaveCount(photos.filter(p=>p.category==='Nature').length);
   await page.getByRole('button',{name:'Words',exact:true}).click();await page.getByRole('button',{name:'Time',exact:true}).click();await page.getByRole('button',{name:'Explore Unrecorded',exact:true}).click();await expect(page.locator('.atlas-photo')).toHaveCount(photos.filter(p=>!p.timeOfDay).length);
   await page.getByRole('button',{name:'Years',exact:true}).click();await expect(page.getByRole('group',{name:'Year islands'}).getByRole('button')).toHaveCount(new Set(photos.map(p=>p.date.slice(0,4))).size);await screenshot(page,'years-'+viewport.width);
   await page.getByRole('button',{name:'Explore 2024',exact:true}).click();await expect(page.locator('.atlas-photo')).toHaveCount(photos.filter(p=>p.date.startsWith('2024')).length);
   const months=page.getByRole('navigation',{name:'Months in 2024'});await expect(months).toBeVisible();const firstMonth=[...new Set(photos.filter(p=>p.date.startsWith('2024')).map(p=>p.date.slice(0,7)))].sort()[0];await months.getByRole('button').first().click();await expect(page.locator('.atlas-photo')).toHaveCount(photos.filter(p=>p.date.startsWith(firstMonth)).length);
   await page.getByRole('button',{name:'Colors',exact:true}).click();await screenshot(page,'colors-'+viewport.width);await page.getByRole('button',{name:'Explore Blue',exact:true}).click();await expect(page.locator('.atlas-photo')).toHaveCount(photos.filter(p=>p.colors.includes('Blue')).length);
   await page.getByRole('button',{name:'All moments',exact:true}).click();await expect(page.locator('.atlas-photo')).toHaveCount(photos.length);
  });
 });
}

test('dragging photos pans without opening them, and zoom remains under user control',async({page})=>{
 await start(page);const first=page.getByRole('button',{name:openLabel(photos[0]),exact:true});const box=await first.boundingBox();const world=page.locator('.photo-atlas__world');const before=await world.getAttribute('style');
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+170,box.y+box.height/2+65,{steps:12});await page.mouse.up();
 await expect(page.getByRole('dialog')).toHaveCount(0);await expect.poll(()=>world.getAttribute('style')).not.toBe(before);
 const z=Number.parseInt(await page.locator('.atlas-camera span').innerText());await page.mouse.wheel(0,-220);await expect.poll(async()=>Number.parseInt(await page.locator('.atlas-camera span').innerText())).toBeGreaterThan(z);
 await page.getByRole('button',{name:'Fit all photographs',exact:true}).click();const viewport=page.getByRole('region',{name:'Photo constellation'});await viewport.focus();const old=await world.getAttribute('style');await page.keyboard.press('ArrowRight');await expect.poll(()=>world.getAttribute('style')).not.toBe(old);
});

for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 test.describe('Native films at '+viewport.width,()=>{
  test.use({viewport});
  test('films play, seek, close and remain discoverable in the constellation',async({page})=>{
   await start(page);await page.getByRole('button',{name:'Explore films',exact:true}).click();const clips=photos.filter(p=>p.type==='video');await expect(page.locator('.atlas-photo')).toHaveCount(clips.length);
   const first=page.getByRole('button',{name:openLabel(clips[0]),exact:true});await first.click();const dialog=page.getByRole('dialog',{name:'Media viewer'}),video=dialog.locator('video');await expect(video).toBeVisible();
   await expect.poll(()=>video.evaluate(v=>v.readyState>=1&&v.videoWidth>0&&v.duration>0)).toBe(true);
   await video.evaluate(v=>{v.muted=true;return v.play();});await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThan(.1);
   await video.evaluate(v=>{v.pause();v.currentTime=Math.min(1,v.duration/2);});await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThanOrEqual(.9);await screenshot(page,'film-'+viewport.width);
   await dialog.getByRole('button',{name:'Close',exact:true}).click();await expect(dialog).not.toBeVisible();await expect(first).toBeFocused();
  });
 });
}

test('a photograph date gathers its day, and both site layouts retain the gallery route',async({page})=>{
 await start(page);await page.getByRole('button',{name:openLabel(photos[0]),exact:true}).click();const dialog=page.getByRole('dialog',{name:'Media viewer'});await dialog.getByRole('button',{name:/Explore date/}).click();await expect(dialog).not.toBeVisible();await expect(page.locator('.atlas-photo')).toHaveCount(photos.filter(p=>p.date===photos[0].date).length);
 for(const prefix of ['/?motion=off','/?view=original']){await page.goto(prefix+'#/works');await page.getByRole('link',{name:/Photography/}).first().click();await expect(page.getByRole('heading',{name:'Photography',exact:true})).toBeVisible();await expect(page.getByRole('navigation',{name:'Page navigation'}).getByRole('link',{name:/Works/i})).toBeVisible();}
});

test.describe('Touch exploration',()=>{
 test.use({viewport:{width:390,height:844},hasTouch:true});
 test('a two-finger pinch zooms the photographs without opening a viewer',async({page})=>{
  await start(page);const scene=page.getByRole('region',{name:'Photo constellation'}),box=await scene.boundingBox();const readZoom=async()=>parseInt(await page.locator('.atlas-camera > span').innerText());const before=await readZoom();
  const client=await page.context().newCDPSession(page);const y=box.y+box.height/2,x=box.x+box.width/2;
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-45,y,id:1},{x:x+45,y,id:2}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-80,y,id:1},{x:x+80,y,id:2}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect.poll(readZoom).toBeGreaterThan(before);await expect(page.getByRole('dialog')).toHaveCount(0);await client.detach();
 });
});
