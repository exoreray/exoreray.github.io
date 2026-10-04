import React, { useRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import useJourneyAutoscroll, { AUTO_SCROLL_SPEED } from './useJourneyAutoscroll';

const scrollDescriptor=Object.getOwnPropertyDescriptor(window,'scrollY');
const heightDescriptor=Object.getOwnPropertyDescriptor(window,'innerHeight');
let frames,nextFrame,y,height,hidden;
beforeEach(()=>{
  jest.useFakeTimers();frames=new Map();nextFrame=0;y=0;height=9000;hidden=false;
  Object.defineProperty(window,'scrollY',{configurable:true,get:()=>y});
  Object.defineProperty(window,'innerHeight',{configurable:true,value:1000});
  jest.spyOn(document.documentElement,'scrollHeight','get').mockImplementation(()=>height);
  jest.spyOn(document,'hidden','get').mockImplementation(()=>hidden);
  jest.spyOn(window,'scrollTo').mockImplementation(({top})=>{y=Math.round(top);});
  jest.spyOn(window,'requestAnimationFrame').mockImplementation(callback=>{frames.set(++nextFrame,callback);return nextFrame;});
  jest.spyOn(window,'cancelAnimationFrame').mockImplementation(id=>frames.delete(id));
  jest.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(()=>({top:-y,height,width:1000,left:0,bottom:height-y,right:1000}));
});
afterEach(()=>{
  jest.restoreAllMocks();jest.useRealTimers();
  Object.defineProperty(window,'scrollY',scrollDescriptor);
  Object.defineProperty(window,'innerHeight',heightDescriptor);
});
function Harness({active=true,motion=true,ready=false}){
  const root=useRef();const auto=useJourneyAutoscroll(root,{active,motion});
  return <section ref={root} data-testid="surface" data-state={auto.state}>
    <button data-journey-autoplay onClick={auto.toggle}>Toggle autoplay</button>
    <span>{String(ready)}</span><p>Reading surface</p>
  </section>;
}
const elapsed=ms=>act(()=>jest.advanceTimersByTime(ms));
const paint=now=>act(()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback(now));});
const state=()=>screen.getByTestId('surface').dataset.state;

test.each([30,60,120])('starts after one second and travels at equal speed at %i Hz with rounded browser positions',rate=>{
  render(<Harness/>);elapsed(999);expect(frames.size).toBe(0);expect(y).toBe(0);
  elapsed(1);expect(state()).toBe('playing');paint(1000);
  for(let i=1;i<=rate*2;i++)paint(1000+i*1000/rate);
  expect(y).toBe(AUTO_SCROLL_SPEED*2);
});

test('reads the restored position at start and ready rerenders do not restart the delay',()=>{
  const view=render(<Harness/>);elapsed(500);y=431;
  view.rerender(<Harness ready/>);elapsed(500);expect(state()).toBe('playing');
  paint(1000);paint(1500);expect(y).toBe(455);
});

test.each(['wheel','pointerdown','touchstart','keydown'])('manual %s cancels pending playback without cancelling the native gesture',type=>{
  render(<Harness/>);
  const event=new Event(type,{bubbles:true,cancelable:true});
  if(type==='keydown')Object.defineProperty(event,'key',{value:'ArrowDown'});
  fireEvent(screen.getByText('Reading surface'),event);
  expect(event.defaultPrevented).toBe(false);expect(state()).toBe('paused');
  elapsed(3000);expect(frames.size).toBe(0);expect(y).toBe(0);
});

test('pause-button pointer capture does not toggle twice and resume begins at the current position',()=>{
  render(<Harness/>);elapsed(1000);paint(1000);paint(1100);
  const button=screen.getByRole('button');
  fireEvent.pointerDown(button);fireEvent.click(button);
  expect(state()).toBe('paused');expect(frames.size).toBe(0);
  y=600;fireEvent.pointerDown(button);fireEvent.click(button);
  expect(state()).toBe('playing');paint(5000);paint(5500);expect(y).toBe(624);
});

test('scrolling over the pause control still gives control to the reader',()=>{
  render(<Harness/>);elapsed(1000);paint(1000);
  fireEvent.wheel(screen.getByRole('button'));
  expect(state()).toBe('paused');expect(frames.size).toBe(0);
});

test('hidden tabs and Motion off suspend without catch-up or overriding manual pause',()=>{
  const view=render(<Harness/>);elapsed(1000);paint(1000);paint(1500);expect(y).toBe(24);
  hidden=true;fireEvent(document,new Event('visibilitychange'));expect(frames.size).toBe(0);
  elapsed(10000);hidden=false;fireEvent(document,new Event('visibilitychange'));
  paint(12000);paint(12500);expect(y).toBe(48);
  view.rerender(<Harness motion={false}/>);expect(frames.size).toBe(0);
  view.rerender(<Harness/>);paint(20000);paint(20500);expect(y).toBe(72);
  fireEvent.wheel(window);view.rerender(<Harness active={false}/>);view.rerender(<Harness/>);
  elapsed(2000);expect(state()).toBe('paused');expect(frames.size).toBe(0);
});

test.each(['pageshow','focus','load'])('%s restores a hidden WebView without visibilitychange and preserves manual pause',restore=>{
  hidden=true;render(<Harness/>);elapsed(5000);expect(frames.size).toBe(0);
  hidden=false;fireEvent(window,new Event(restore));
  elapsed(999);expect(frames.size).toBe(0);
  elapsed(1);paint(6000);paint(6500);expect(y).toBe(24);
  fireEvent(window,new Event('pagehide'));
  expect(frames.size).toBe(0);expect(state()).toBe('suspended');
  elapsed(10000);y=620;
  fireEvent(window,new Event(restore));paint(20000);
  expect(y).toBe(620);
  paint(20500);expect(y).toBe(644);
  fireEvent.wheel(window);fireEvent(window,new Event('pagehide'));
  fireEvent(window,new Event(restore));elapsed(5000);
  expect(state()).toBe('paused');expect(frames.size).toBe(0);expect(y).toBe(644);
});

test('restoration restarts a RAF stopped by document.hidden even if the visible state never changed',()=>{
  render(<Harness/>);elapsed(1000);paint(1000);paint(1500);expect(y).toBe(24);
  hidden=true;paint(1600);
  expect(frames.size).toBe(0);
  hidden=false;fireEvent(window,new Event('pageshow'));
  expect(frames.size).toBe(1);
  paint(20000);expect(y).toBe(24);
  paint(20500);expect(y).toBe(48);
});

test('focus and load preserve a pending one-second delay',()=>{
  render(<Harness/>);elapsed(700);
  fireEvent(window,new Event('focus'));fireEvent(window,new Event('load'));
  elapsed(299);expect(frames.size).toBe(0);
  elapsed(1);expect(frames.size).toBe(1);
});

test('pagehide cancels an unfinished delay and restoration begins a fresh visible second',()=>{
  render(<Harness/>);elapsed(700);
  fireEvent(window,new Event('pagehide'));
  elapsed(10000);expect(frames.size).toBe(0);expect(y).toBe(0);
  fireEvent(window,new Event('pageshow'));
  elapsed(999);expect(frames.size).toBe(0);
  elapsed(1);expect(frames.size).toBe(1);
});

test('reaching the reachable page end stops the loop and replay starts from Journey',()=>{
  height=1050;render(<Harness/>);elapsed(1000);paint(1000);paint(2500);
  expect(y).toBe(50);expect(state()).toBe('ended');expect(frames.size).toBe(0);
  fireEvent.click(screen.getByRole('button'));expect(y).toBe(0);expect(state()).toBe('playing');
});

test('leaving the route cancels its timer and animation frame',()=>{
  const {unmount:leaveBeforePlayback}=render(<Harness/>);leaveBeforePlayback();elapsed(2000);expect(frames.size).toBe(0);
  const {unmount:leaveDuringPlayback}=render(<Harness/>);elapsed(1000);paint(1000);leaveDuringPlayback();
  expect(frames.size).toBe(0);elapsed(2000);expect(window.scrollTo).not.toHaveBeenCalled();
});
