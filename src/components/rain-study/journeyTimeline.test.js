import { locateChapter, chapterPose, cameraShot, cameraFrame, fitCameraPosition, framedCameraPosition, framedCameraFov, advanceFilmTimeline } from './journeyTimeline';

test('native scroll positions select chapter boundaries in both directions',()=>{
  const ranges=[{start:0,height:1400},{start:1400,height:1800},{start:3200,height:1500}];
  expect(locateChapter(ranges,700)).toEqual({index:0,progress:.5});
  expect(locateChapter(ranges,1400)).toEqual({index:1,progress:0});
  expect(locateChapter(ranges,1399).index).toBe(0);
  expect(locateChapter(ranges,5000)).toEqual({index:2,progress:1});
});

test('scrolling directs camera, model orientation and vertical scene transitions',()=>{
  expect(cameraShot(0,.1)).not.toEqual(cameraShot(0,.7));
  expect(chapterPose(.1).rotation).toBe(chapterPose(.7).rotation);
  expect(cameraFrame(0,.1).target).not.toEqual(cameraFrame(0,.7).target);
  expect(chapterPose(.7,true).visible).toBe(false);
  expect(chapterPose(.95,true).visible).toBe(true);
  expect(chapterPose(1).visible).toBe(false);
  expect(chapterPose(1,true).y).toBeCloseTo(chapterPose(0).y);
});

test('reduced motion retains static framing while the document remains scrollable',()=>{
  expect(cameraShot(0,.1,false)).toEqual(cameraShot(0,.7,false));
  expect(chapterPose(.9,false,false)).toEqual(chapterPose(.1,false,false));
  expect(chapterPose(.9,true,false).visible).toBe(false);
});


test('every scene has a meaningful cinematic push with safe lenses and finite camera paths',()=>{
  for(let index=0;index<8;index++){
    const closeAt={0:.27,1:.32,2:.31,5:.43};
    const wide=cameraFrame(index,0), close=cameraFrame(index,closeAt[index]??.17);
    const distance=frame=>Math.hypot(...frame.position.map((x,axis)=>x-frame.target[axis]));
    expect(distance(close)).toBeLessThan(distance(wide)*.8);
    for(let step=0;step<=100;step++){
      const frame=cameraFrame(index,step/100);
      expect([...frame.position,...frame.target,frame.fov,frame.roll].every(Number.isFinite)).toBe(true);
      expect(distance(frame)).toBeGreaterThan(.25);
      expect(frame.fov).toBeGreaterThanOrEqual(27);
      expect(frame.fov).toBeLessThanOrEqual(64);
      expect(frame.near).toBeGreaterThanOrEqual(.0029);
      expect(frame.near).toBeLessThanOrEqual(.101);
    }
  }
});

test('Apple establishes the landscape before descending and keeps that view with reduced motion',()=>{
  const wide=cameraFrame(5,0), establish=cameraFrame(5,.14), close=cameraFrame(5,.43);
  const distance=frame=>Math.hypot(...frame.position.map((value,axis)=>value-frame.target[axis]));
  expect(distance(establish)).toBeGreaterThan(distance(wide)*.86);
  expect(distance(close)).toBeLessThan(distance(establish)*.5);
  expect(wide.position[1]).toBeGreaterThan(5);
  expect(cameraFrame(5,.7,false)).toEqual(wide);
});

test('the belfry flight remains centered inside the verified opening on both screen shapes',()=>{
  for(let i=0;i<=100;i++){
    const progress=.25+i/100*.13;
    const frame=cameraFrame(2,progress);
    expect(frame.position[0]).toBe(0);
    expect(frame.position[1]).toBeCloseTo(66.1*4.8/93.5736,8);
    expect(frame.framing).toBe(0);
    for(const aspect of [.65,2.3])expect(framedCameraPosition(2,progress,frame,aspect)).toEqual(frame.position);
  }
  expect(cameraFrame(2,.25).position[2]).toBeGreaterThan(.3);
  expect(cameraFrame(2,.38).position[2]).toBeLessThan(-.3);
});

test('fast scrubbing stays on the authored route rather than drawing a shortcut through geometry',()=>{
  const displayed={index:2,progress:.18},target={index:2,progress:.38};
  let previous=displayed.progress;
  for(let i=0;i<120;i++){
    advanceFilmTimeline(displayed,target,true,1/120);
    expect(displayed.progress).toBeGreaterThanOrEqual(previous);
    expect(displayed.progress).toBeLessThanOrEqual(target.progress);
    expect(cameraFrame(2,displayed.progress).position[0]).toBe(0);
    previous=displayed.progress;
  }
  advanceFilmTimeline(displayed,{index:0,progress:.15},true,1/60);
  expect(displayed).toEqual({index:0,progress:.15});
});

test('responsive camera framing stays continuous at chapter boundaries',()=>{
  for(const aspect of [.65,2.3])for(let index=0;index<7;index++){
    const outgoing=framedCameraPosition(index,1,cameraFrame(index,1),aspect);
    const incoming=framedCameraPosition(index+1,0,cameraFrame(index+1,0),aspect);
    outgoing.forEach((value,axis)=>expect(value).toBeCloseTo(incoming[axis],8));
  }
});

test('portrait flythroughs gain peripheral vision without moving out of the passage',()=>{
  const wide=cameraFrame(2,0),inside=cameraFrame(2,.31);
  expect(framedCameraFov(wide,.65)).toBe(wide.fov);
  expect(framedCameraFov(inside,.65)).toBeGreaterThan(inside.fov);
  expect(framedCameraFov(inside,.65)).toBeLessThanOrEqual(82);
  expect(framedCameraPosition(2,.31,inside,.65)).toEqual(inside.position);
});

test('mobile Apple framing preserves the aerial angle while widening the view',()=>{
  const wide=cameraFrame(5,0), fitted=fitCameraPosition(wide,1.5,true);
  fitted.forEach((value,axis)=>expect(value-wide.target[axis]).toBeCloseTo((wide.position[axis]-wide.target[axis])*1.5));
});

test('cinematic camera position, focus and lens are continuous at chapter cuts',()=>{
  for(let index=0;index<7;index++){
    const outgoing=cameraFrame(index,1), incoming=cameraFrame(index+1,0);
    outgoing.position.forEach((value,axis)=>expect(value).toBeCloseTo(incoming.position[axis],8));
    outgoing.target.forEach((value,axis)=>expect(value).toBeCloseTo(incoming.target[axis],8));
    expect(outgoing.fov).toBeCloseTo(incoming.fov,8);
  }
});
