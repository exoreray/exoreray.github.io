import React, { useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import useHomeGesture from './useHomeGesture';

function pointer(target,type,props={}){
  const event=new Event(type,{bubbles:true,cancelable:true});
  for(const [key,value] of Object.entries({clientX:140,clientY:230,pointerType:'mouse',button:0,pointerId:1,...props}))Object.defineProperty(event,key,{value});
  fireEvent(target,event);
}
function Harness({enabled=true,interaction}){
  const root=useRef();
  const handlers=useHomeGesture(root,enabled,interaction);
  return <div ref={root} {...handlers}><p>Surface</p><button>Navigation</button></div>;
}
const input=()=>({current:{pulse:0,down:false,dragActive:false}});
beforeEach(()=>jest.spyOn(window,'scrollTo').mockImplementation(()=>{}));
afterEach(()=>jest.restoreAllMocks());

test('home hover tracks continuous drag without generating click pulses',()=>{
  const interaction=input();const view=render(<Harness interaction={interaction}/>);
  const surface=screen.getByText('Surface');
  pointer(surface,'pointermove');
  expect(interaction.current.dragActive).toBe(true);
  pointer(surface,'pointermove',{clientX:400});
  expect(interaction.current.clientX).toBe(400);
  pointer(surface,'pointerdown');
  expect(interaction.current.pulse).toBe(0);
  pointer(surface,'pointerup');
  expect(interaction.current.down).toBe(false);
  view.unmount();expect(interaction.current.dragActive).toBe(false);
});

test('controls and other pages do not drag the home sculpture',()=>{
  const interaction=input();const view=render(<Harness interaction={interaction}/>);
  pointer(screen.getByRole('button'),'pointermove');
  expect(interaction.current.dragActive).toBe(false);
  view.rerender(<Harness enabled={false} interaction={interaction}/>);
  pointer(screen.getByText('Surface'),'pointermove');
  expect(interaction.current.dragActive).toBe(false);
});

test('touch drag releases and a two-finger gesture cannot keep pulling',()=>{
  const interaction=input();render(<Harness interaction={interaction}/>);
  const surface=screen.getByText('Surface');
  pointer(surface,'pointerdown',{pointerType:'touch'});
  expect(interaction.current.dragActive).toBe(true);
  pointer(surface,'pointerdown',{pointerType:'touch',pointerId:2,isPrimary:false});
  pointer(surface,'pointermove',{pointerType:'touch'});
  expect(interaction.current.dragActive).toBe(false);
  pointer(surface,'pointerup',{pointerType:'touch',pointerId:2});
  pointer(surface,'pointerup',{pointerType:'touch'});
  expect(interaction.current.down).toBe(false);
});

test.each(['blur','pagehide'])('an interrupted pinch clears on %s so the next primary touch can drag',eventName=>{
  const interaction=input();render(<Harness interaction={interaction}/>);
  const surface=screen.getByText('Surface');
  pointer(surface,'pointerdown',{pointerType:'touch',pointerId:1,isPrimary:true});
  pointer(surface,'pointerdown',{pointerType:'touch',pointerId:2,isPrimary:false});
  expect(interaction.current.dragActive).toBe(false);
  fireEvent(window,new Event(eventName));
  expect(interaction.current.down).toBe(false);
  expect(interaction.current.dragActive).toBe(false);
  // The old WebView never delivered pointerup/cancel for either old finger.
  pointer(surface,'pointerdown',{pointerType:'touch',pointerId:3,isPrimary:true});
  expect(interaction.current.down).toBe(true);
  expect(interaction.current.dragActive).toBe(true);
  pointer(surface,'pointerup',{pointerType:'touch',pointerId:3});
  expect(interaction.current.dragActive).toBe(false);
});

test('unexpected capture loss clears a pinch while normal mouse release keeps hover responsive',()=>{
  const interaction=input();render(<Harness interaction={interaction}/>);
  const surface=screen.getByText('Surface');
  pointer(surface,'pointerdown',{pointerType:'touch',pointerId:1,isPrimary:true});
  pointer(surface,'pointerdown',{pointerType:'touch',pointerId:2,isPrimary:false});
  pointer(surface,'lostpointercapture',{pointerType:'touch',pointerId:1});
  pointer(surface,'pointerdown',{pointerType:'touch',pointerId:3,isPrimary:true});
  expect(interaction.current.dragActive).toBe(true);
  pointer(surface,'pointerup',{pointerType:'touch',pointerId:3});
  pointer(surface,'pointermove');
  pointer(surface,'pointerdown');
  pointer(surface,'pointerup');
  pointer(surface,'lostpointercapture');
  expect(interaction.current.down).toBe(false);
  expect(interaction.current.dragActive).toBe(true);
});

test('home clears restored scrolling before locking and rechecks on page restoration',()=>{
  const lockStates=[];
  window.scrollTo.mockImplementation(()=>lockStates.push(document.documentElement.classList.contains('rain-home-locked')));
  const view=render(<Harness interaction={input()}/>);
  expect(lockStates[0]).toBe(false);
  expect(window.scrollTo).toHaveBeenCalledWith({top:0,left:0,behavior:'instant'});
  window.dispatchEvent(new Event('pageshow'));
  expect(window.scrollTo).toHaveBeenCalledTimes(2);
  view.unmount();window.dispatchEvent(new Event('pageshow'));
  expect(window.scrollTo).toHaveBeenCalledTimes(2);
});
