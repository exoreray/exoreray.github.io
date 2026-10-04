import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MusicControls, MusicProvider } from './RainMusic';

let contexts;
let resumeGate;
class TestAudioContext {
  constructor(){
    contexts.push(this);this.currentTime=4;this.state='suspended';this.destination={};
    const param={value:1,cancelScheduledValues:jest.fn(),cancelAndHoldAtTime:jest.fn()};
    param.setValueAtTime=jest.fn(value=>{param.value=value;});
    param.linearRampToValueAtTime=jest.fn(value=>{param.value=value;});
    this.gainNode={gain:param,connect:jest.fn()};
    this.source={connect:jest.fn()};
    this.analyser={frequencyBinCount:1024,connect:jest.fn()};
    this.createMediaElementSource=jest.fn(()=>this.source);
    this.createGain=jest.fn(()=>this.gainNode);
    this.createAnalyser=jest.fn(()=>this.analyser);
    this.resume=jest.fn(async()=>{if(resumeGate)await resumeGate;this.state='running';});
    this.close=jest.fn(async()=>{this.state='closed';});
  }
}
beforeEach(()=>{
  contexts=[];resumeGate=null;
  window.AudioContext=TestAudioContext;
  jest.spyOn(HTMLMediaElement.prototype,'play').mockImplementation(async function(){Object.defineProperty(this,'paused',{configurable:true,value:false});this.dispatchEvent(new Event('play'));});
  jest.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(function(){Object.defineProperty(this,'paused',{configurable:true,value:true});this.dispatchEvent(new Event('pause'));});
  // Model the browser restriction: writes to media.volume have no effect.
  jest.spyOn(HTMLMediaElement.prototype,'volume','get').mockReturnValue(1);
  jest.spyOn(HTMLMediaElement.prototype,'volume','set').mockImplementation(()=>{});
});
afterEach(()=>{delete window.AudioContext;jest.restoreAllMocks();});
function mount(){
  const analysis={current:{context:null,playing:false}};
  render(<MusicProvider analysis={analysis}><MusicControls /></MusicProvider>);
  return analysis;
}

test('slider changes real output even when the media volume property is ignored',async()=>{
  const analysis=mount();
  fireEvent.input(screen.getByRole('slider',{name:'Volume'}),{target:{value:'0'}});
  fireEvent.click(screen.getByRole('button',{name:'Play Broken'}));
  await screen.findByRole('button',{name:'Pause Broken'});
  const context=contexts[0];
  expect(document.querySelector('audio').volume).toBe(1);
  expect(context.gainNode.gain.value).toBe(0);
  expect(screen.getByRole('slider',{name:'Volume'})).toHaveAttribute('aria-valuetext','0 percent');
  fireEvent.input(screen.getByRole('slider',{name:'Volume'}),{target:{value:'.25'}});
  expect(context.gainNode.gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(.25,4.015);
  expect(analysis.current.volume).toBe(.25);
  expect(context.source.connect.mock.calls).toEqual([[context.gainNode]]);
  expect(context.gainNode.connect.mock.calls).toEqual([[context.analyser]]);
  expect(context.analyser.connect.mock.calls).toEqual([[context.destination]]);
});

test('volume moved while playback is starting does not revert to the old setting',async()=>{
  let release;resumeGate=new Promise(resolve=>{release=resolve;});
  mount();
  fireEvent.click(screen.getByRole('button',{name:'Play Broken'}));
  fireEvent.input(screen.getByRole('slider',{name:'Volume'}),{target:{value:'.12'}});
  await act(async()=>{release();});
  await screen.findByRole('button',{name:'Pause Broken'});
  expect(contexts[0].gainNode.gain.value).toBe(.12);
  expect(screen.getByRole('slider',{name:'Volume'})).toHaveValue('0.12');
});

test('pause and resume retain volume without creating a bypass or duplicate source',async()=>{
  mount();
  fireEvent.click(screen.getByRole('button',{name:'Play Broken'}));
  await screen.findByRole('button',{name:'Pause Broken'});
  fireEvent.input(screen.getByRole('slider',{name:'Volume'}),{target:{value:'.4'}});
  fireEvent.click(screen.getByRole('button',{name:'Pause Broken'}));
  fireEvent.click(screen.getByRole('button',{name:'Play Broken'}));
  await screen.findByRole('button',{name:'Pause Broken'});
  expect(contexts).toHaveLength(1);
  expect(contexts[0].createMediaElementSource).toHaveBeenCalledTimes(1);
  expect(contexts[0].gainNode.gain.value).toBe(.4);
  fireEvent.input(screen.getByRole('slider',{name:'Volume'}),{target:{value:'0'}});
  expect(contexts[0].gainNode.gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0,4.015);
});
