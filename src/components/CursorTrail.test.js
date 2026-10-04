import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CursorTrail from './CursorTrail';
import { ThemeContext } from '../context/ThemeContext';

let frames,nextFrame;
beforeEach(()=>{
  frames=new Map();nextFrame=0;
  const context={};
  for(const method of ['clearRect','beginPath','arc','stroke','fill','fillRect','moveTo','lineTo','quadraticCurveTo','closePath','drawImage','setTransform'])context[method]=jest.fn();
  context.createRadialGradient=context.createLinearGradient=jest.fn(()=>({addColorStop:jest.fn()}));
  jest.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(context);
  jest.spyOn(window,'requestAnimationFrame').mockImplementation(callback=>{frames.set(++nextFrame,callback);return nextFrame;});
  jest.spyOn(window,'cancelAnimationFrame').mockImplementation(id=>frames.delete(id));
});
afterEach(()=>jest.restoreAllMocks());
function Surface({active=true}){
  return <ThemeContext.Provider value={{darkMode:true}}><CursorTrail active={active}/><button onPointerMove={e=>e.stopPropagation()}>Control</button></ThemeContext.Provider>;
}
function pointer(type,props={}){
  const event=new Event(type,{bubbles:true,cancelable:true});
  for(const [key,value] of Object.entries({clientX:120,clientY:200,pointerType:'mouse',pointerId:1,isPrimary:true,buttons:0,...props}))Object.defineProperty(event,key,{value});
  fireEvent(screen.getByRole('button'),event);return event;
}
function paint(now=16){act(()=>{const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback(now));});}

test('hover works globally without pressing and does not cancel native interaction',()=>{
  render(<Surface/>);
  pointer('pointermove');const event=pointer('pointermove',{clientX:250,clientY:250});paint();
  const canvas=document.querySelector('[data-effect="original-cursor-trail"]');
  expect(canvas).toHaveAttribute('data-move-count','2');
  expect(Number(canvas.dataset.particles)).toBeGreaterThan(0);
  expect(event.defaultPrevented).toBe(false);
});

test('Motion off creates no wake and resumes without replaying an old trail',()=>{
  const view=render(<Surface active={false}/>);
  pointer('pointermove');pointer('pointermove',{clientX:300});
  expect(frames.size).toBe(0);
  view.rerender(<Surface/>);paint();
  const canvas=document.querySelector('[data-effect="original-cursor-trail"]');
  expect(canvas).toHaveAttribute('data-move-count','0');
  expect(canvas).toHaveAttribute('data-particles','0');
});

test('a two-finger gesture stops trail emission and starts a fresh stroke afterwards',()=>{
  render(<Surface/>);
  pointer('pointerdown',{pointerType:'touch'});
  pointer('pointerdown',{pointerType:'touch',pointerId:2,isPrimary:false});
  const event=pointer('pointermove',{pointerType:'touch',clientX:280});
  const canvas=document.querySelector('[data-effect="original-cursor-trail"]');
  expect(canvas).toHaveAttribute('data-move-count','1');expect(event.defaultPrevented).toBe(false);
  pointer('pointerup',{pointerType:'touch',pointerId:2,isPrimary:false});
  pointer('pointermove',{pointerType:'touch',clientX:350});paint();
  expect(Number(canvas.dataset.particles)).toBeLessThanOrEqual(2);
});

test('the trail draws individual particles without any connecting stroke',()=>{
  render(<Surface/>);pointer('pointermove');pointer('pointermove',{clientX:260,clientY:250});paint();
  const canvas=document.querySelector('[data-effect="original-cursor-trail"]');
  const context=canvas.getContext('2d');
  expect(Number(canvas.dataset.particles)).toBeGreaterThan(5);
  expect(context.drawImage).toHaveBeenCalled();
  expect(context.stroke).not.toHaveBeenCalled();
  expect(context.lineTo).not.toHaveBeenCalled();
  expect(context.quadraticCurveTo).not.toHaveBeenCalled();
});

test('a delayed frame does not stretch particle lifetime on a slower device',()=>{
  render(<Surface/>);pointer('pointermove');pointer('pointermove',{clientX:260});paint(0);
  paint(1800);
  expect(document.querySelector('[data-effect="original-cursor-trail"]')).toHaveAttribute('data-particles','0');
  expect(frames.size).toBe(0);
});
