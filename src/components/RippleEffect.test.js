import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RippleEffect from './RippleEffect';
import { ThemeContext } from '../context/ThemeContext';

let frames,nextFrame;
beforeEach(()=>{
  frames=new Map();nextFrame=0;
  jest.spyOn(window,'requestAnimationFrame').mockImplementation(callback=>{frames.set(++nextFrame,callback);return nextFrame;});
  jest.spyOn(window,'cancelAnimationFrame').mockImplementation(id=>frames.delete(id));
});
afterEach(()=>jest.restoreAllMocks());
function Surface({active=true}){
  return <ThemeContext.Provider value={{darkMode:true}}><RippleEffect active={active}/><button onClick={event=>event.stopPropagation()}>Page control</button></ThemeContext.Provider>;
}
function paint(now=16){act(()=>{const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback(now));});}

test('global ripple receives page-control clicks even when their bubbling is stopped',()=>{
  render(<Surface/>);
  fireEvent.click(screen.getByRole('button'),{clientX:32,clientY:48});
  paint();
  expect(document.querySelector('[data-effect="original-click-ripple"]')).toHaveAttribute('data-click-count','1');
  expect(document.querySelector('[data-click-pulse]')).toHaveAttribute('transform','translate(32 48)');
  expect(document.querySelector('[data-effect="original-click-ripple"]')).toHaveAttribute('data-renderer','svg');
});

test('global capture respects Motion off and resumes on the same canvas',()=>{
  const view=render(<Surface active={false}/>);
  const canvas=document.querySelector('[data-effect="original-click-ripple"]');
  fireEvent.click(screen.getByRole('button'));
  expect(canvas).toHaveAttribute('data-click-count','0');
  view.rerender(<Surface active/>);
  fireEvent.click(screen.getByRole('button'),{clientX:60,clientY:80});paint();
  expect(document.querySelector('[data-effect="original-click-ripple"]')).toBe(canvas);
  expect(canvas).toHaveAttribute('data-click-count','1');
});

test('rapid clicking stays bounded and the renderer sleeps after the feedback fades',()=>{
  render(<Surface/>);
  expect(frames.size).toBe(0);
  for(let i=0;i<20;i++)fireEvent.click(screen.getByRole('button'),{clientX:50+i,clientY:100});
  const canvas=document.querySelector('[data-effect="original-click-ripple"]');
  expect(canvas).toHaveAttribute('data-pulse-count','6');
  for(let i=1;i<=70;i++)paint(i*1000/60);
  expect(canvas).toHaveAttribute('data-pulse-count','0');
  expect(canvas).toHaveAttribute('data-phase','idle');
  expect(frames.size).toBe(0);
});

test('the feedback duration is consistent across 60Hz and 120Hz refresh rates',()=>{
  for(const rate of [60,120]){
    const view=render(<Surface/>);
    fireEvent.click(screen.getByRole('button'),{clientX:70,clientY:90});
    const canvas=document.querySelector('[data-effect="original-click-ripple"]');
    for(let i=1;i<=rate/2;i++)paint(i*1000/rate);
    expect(canvas).toHaveAttribute('data-pulse-count','1');
    for(let i=rate/2+1;i<=rate+3;i++)paint(i*1000/rate);
    expect(canvas).toHaveAttribute('data-pulse-count','0');
    view.unmount();
  }
});

test('the final frame detaches every visible shape and never paints a cleared canvas',()=>{
  const canvas=jest.spyOn(HTMLCanvasElement.prototype,'getContext');
  render(<Surface/>);
  fireEvent.click(screen.getByRole('button'),{clientX:70,clientY:90});paint(0);
  const pulse=document.querySelector('[data-click-pulse]');
  const ring=pulse.querySelector('g');
  let previous=1;
  for(let i=1;i<=55;i++){
    paint(i*1000/60);
    const opacity=Number(ring.getAttribute('opacity'));
    if(i>4)expect(opacity).toBeLessThanOrEqual(previous);
    previous=opacity;
  }
  expect(pulse).toBeInTheDocument();
  paint(1000);
  expect(pulse).not.toBeInTheDocument();
  expect(pulse).toHaveAttribute('opacity','0');
  expect(document.querySelector('[data-click-pulse]')).toBeNull();
  expect(document.querySelector('[data-effect="original-click-ripple"]')).toHaveStyle({visibility:'hidden'});
  expect(frames.size).toBe(0);expect(canvas).not.toHaveBeenCalled();
  paint(2000);expect(document.querySelector('[data-click-pulse]')).toBeNull();
});

test('pause clears an in-flight pulse so it cannot flash again on resume',()=>{
  const view=render(<Surface/>);
  fireEvent.click(screen.getByRole('button'));paint(0);paint(100);
  expect(document.querySelector('[data-click-pulse]')).toBeInTheDocument();
  view.rerender(<Surface active={false}/>);
  expect(document.querySelector('[data-click-pulse]')).toBeNull();expect(frames.size).toBe(0);
  view.rerender(<Surface/>);paint(2000);
  expect(document.querySelector('[data-click-pulse]')).toBeNull();
});

test('click positions remain aligned when the viewport frame has an offset',()=>{
  render(<Surface/>);
  const svg=document.querySelector('[data-effect="original-click-ripple"]');
  jest.spyOn(svg,'getBoundingClientRect').mockReturnValue({left:10,top:84,width:390,height:700});
  fireEvent.click(screen.getByRole('button'),{clientX:100,clientY:200});paint(0);
  expect(svg.querySelector('[data-click-pulse]')).toHaveAttribute('transform','translate(90 116)');
});
