import React from 'react';
import { act, render } from '@testing-library/react';
import useViewportHeight, { readViewportHeight } from './useViewportHeight';

let viewport,frames,nextFrame,oldViewport,oldHeight;
beforeEach(()=>{
  jest.useFakeTimers();
  oldViewport=Object.getOwnPropertyDescriptor(window,'visualViewport');oldHeight=window.innerHeight;
  viewport=Object.assign(new EventTarget(),{height:700,scale:1});
  Object.defineProperty(window,'visualViewport',{configurable:true,value:viewport});
  window.innerHeight=900;
  frames=new Map();nextFrame=0;
  jest.spyOn(window,'requestAnimationFrame').mockImplementation(callback=>{frames.set(++nextFrame,callback);return nextFrame;});
  jest.spyOn(window,'cancelAnimationFrame').mockImplementation(id=>frames.delete(id));
});
afterEach(()=>{
  jest.restoreAllMocks();jest.useRealTimers();window.innerHeight=oldHeight;
  if(oldViewport)Object.defineProperty(window,'visualViewport',oldViewport);else delete window.visualViewport;
});
function Harness({root,isHome=false}){useViewportHeight(root,isHome);return <div/>;}
const height=()=>document.documentElement.style.getPropertyValue('--rain-viewport-height');
function flush(){act(()=>{const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback());});}

test('first layout uses visible height and remeasures after the initial browser layout settles',()=>{
  const view=render(<Harness/>);expect(height()).toBe('700px');
  viewport.height=812;flush();expect(height()).toBe('812px');
  viewport.height=820;flush();expect(height()).toBe('820px');
  view.unmount();expect(height()).toBe('');expect(frames.size).toBe(0);
});

test('address-bar changes and cached-page restoration update the height without a window resize',()=>{
  const view=render(<Harness/>);
  act(()=>{viewport.height=780;viewport.dispatchEvent(new Event('resize'));});
  expect(height()).toBe('780px');
  act(()=>{viewport.height=690;window.dispatchEvent(new Event('pageshow'));});
  expect(height()).toBe('690px');view.unmount();
});

test('pinch zoom does not shrink the page layout',()=>{
  const view=render(<Harness/>);
  act(()=>{viewport.height=350;viewport.scale=2;viewport.dispatchEvent(new Event('resize'));});
  flush();expect(height()).toBe('700px');
  act(()=>{viewport.height=760;viewport.scale=1;viewport.dispatchEvent(new Event('resize'));});
  expect(height()).toBe('760px');view.unmount();
});

test('desktop and incomplete viewport information have a valid fallback',()=>{
  expect(readViewportHeight({innerHeight:720})).toBe(720);
  expect(readViewportHeight({innerHeight:720,visualViewport:{height:0,scale:1}})).toBe(720);
  expect(readViewportHeight({innerHeight:0})).toBeNull();
});

test('visible viewport panning updates the top even when height does not change',()=>{
  const view=render(<Harness/>);
  act(()=>{viewport.offsetTop=96;viewport.dispatchEvent(new Event('scroll'));});
  expect(height()).toBe('700px');
  expect(document.documentElement.style.getPropertyValue('--rain-viewport-top')).toBe('96px');
  view.unmount();
  expect(document.documentElement.style.getPropertyValue('--rain-viewport-top')).toBe('');
});

test('a restored negative frame offset is corrected without accumulating drift',()=>{
  let browserPan=-84;
  const style=document.documentElement.style;
  const root={current:{getBoundingClientRect:()=>({
    top:(parseFloat(style.getPropertyValue('--rain-viewport-top')) || 0)+(parseFloat(style.getPropertyValue('--rain-home-top-correction')) || 0)+browserPan,
    width:390,height:700,
  })}};
  const view=render(<Harness root={root} isHome/>);
  expect(style.getPropertyValue('--rain-home-top-correction')).toBe('84px');
  flush();flush();
  expect(root.current.getBoundingClientRect().top).toBe(0);
  expect(style.getPropertyValue('--rain-home-top-correction')).toBe('84px');
  act(()=>{browserPan=0;window.dispatchEvent(new Event('pageshow'));});
  expect(style.getPropertyValue('--rain-home-top-correction')).toBe('0px');
  view.unmount();expect(style.getPropertyValue('--rain-home-top-correction')).toBe('');
});

test('a restored frame can recover from an offset larger than one visible screen',()=>{
  const style=document.documentElement.style;
  const root={current:{getBoundingClientRect:()=>({
    top:(parseFloat(style.getPropertyValue('--rain-home-top-correction')) || 0)-1250,
    width:390,height:700,
  })}};
  const view=render(<Harness root={root} isHome/>);
  expect(root.current.getBoundingClientRect().top).toBe(0);
  expect(style.getPropertyValue('--rain-home-top-correction')).toBe('1250px');
  flush();flush();expect(root.current.getBoundingClientRect().top).toBe(0);
  view.unmount();
});

test('repeated stale frame bounds cannot accumulate an ever larger correction',()=>{
  const style=document.documentElement.style;
  const root={current:{getBoundingClientRect:()=>({top:-200,width:390,height:700})}};
  const view=render(<Harness root={root} isHome/>);
  expect(style.getPropertyValue('--rain-home-top-correction')).toBe('200px');
  flush();flush();
  expect(style.getPropertyValue('--rain-home-top-correction')).toBe('200px');
  view.unmount();
});

test('browser handoff layout settling after the initial frames replaces stale height and offset',()=>{
  let browserPan=-200;
  const style=document.documentElement.style;
  const root={current:{getBoundingClientRect:()=>({
    top:(parseFloat(style.getPropertyValue('--rain-viewport-top')) || 0)+(parseFloat(style.getPropertyValue('--rain-home-top-correction')) || 0)+browserPan,
    width:390,height:viewport.height,
  })}};
  const view=render(<Harness root={root} isHome/>);
  flush();flush();
  viewport.height=812;browserPan=0;
  act(()=>jest.advanceTimersByTime(350));
  expect(height()).toBe('812px');
  expect(root.current.getBoundingClientRect().top).toBe(0);
  view.unmount();expect(frames.size).toBe(0);expect(jest.getTimerCount()).toBe(0);
});

test('returning browser focus remeasures even when document visibility did not change',()=>{
  const view=render(<Harness/>);flush();flush();
  viewport.height=812;
  act(()=>window.dispatchEvent(new Event('focus')));
  expect(height()).toBe('812px');
  view.unmount();expect(frames.size).toBe(0);expect(jest.getTimerCount()).toBe(0);
});
