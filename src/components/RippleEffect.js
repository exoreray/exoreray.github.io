import { useEffect, useRef, useContext, useId } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { createClickPalette, createClickPulse, updateClickPulse, removeClickPulse } from './clickPulse';

const MAX_PULSES=6;

const RippleEffect=({active=true})=>{
  const svgRef=useRef(null),engineRef=useRef(null),clickCount=useRef(0);
  const activeRef=useRef(active);activeRef.current=active;
  const {darkMode}=useContext(ThemeContext);
  const darkRef=useRef(darkMode);darkRef.current=darkMode;
  const id=useId().replace(/:/g,'');

  useEffect(()=>{
    const svg=svgRef.current;
    const palette=createClickPalette(svg,`click-${id}`,darkRef.current);
    let pulses=[],frame=0,previous=null;
    const sync=()=>{
      svg.dataset.clickCount=String(clickCount.current);
      svg.dataset.pulseCount=String(pulses.length);
      svg.dataset.phase=pulses.some(pulse=>pulse.age>=.06 && pulse.age<=.35)?'expanding':pulses.length?'fading':'idle';
      svg.style.visibility=pulses.length?'visible':'hidden';
    };
    const draw=now=>{
      frame=0;if(!activeRef.current)return;
      const delta=previous===null?0:Math.min(Math.max(0,(now-previous)/1000),.05);previous=now;
      pulses=pulses.filter(pulse=>updateClickPulse(pulse,delta));sync();
      if(pulses.length)frame=requestAnimationFrame(draw);else previous=null;
    };
    const wake=()=>{if(activeRef.current && pulses.length && !frame)frame=requestAnimationFrame(draw);};
    const clear=()=>{
      cancelAnimationFrame(frame);frame=0;previous=null;
      pulses.forEach(removeClickPulse);pulses=[];sync();
    };
    const click=event=>{
      if(!activeRef.current)return;
      let x=event.clientX,y=event.clientY;
      if(event.detail===0 && x===0 && y===0 && event.target?.getBoundingClientRect){
        const bounds=event.target.getBoundingClientRect();x=bounds.left+bounds.width/2;y=bounds.top+bounds.height/2;
      }
      const bounds=svg.getBoundingClientRect();x-=bounds.left;y-=bounds.top;
      clickCount.current++;
      if(pulses.length===MAX_PULSES)removeClickPulse(pulses.shift());
      pulses.push(createClickPulse(svg,palette,x,y,window.innerWidth<700?80:106));sync();wake();
    };
    engineRef.current={start:wake,stop:clear,setTheme:palette.update};sync();
    window.addEventListener('click',click,true);
    return()=>{window.removeEventListener('click',click,true);clear();svg.replaceChildren();engineRef.current=null;};
  },[id]);

  useEffect(()=>{engineRef.current?.setTheme(darkMode);},[darkMode]);
  useEffect(()=>{if(active)engineRef.current?.start();else engineRef.current?.stop();return()=>engineRef.current?.stop();},[active]);
  return <svg ref={svgRef} data-effect="original-click-ripple" data-style="premium" data-renderer="svg" data-finish="svg-lifecycle"
    data-active={active} aria-hidden="true" focusable="false"
    className="fixed top-0 left-0 w-full h-full pointer-events-none z-[10000]"
    style={{height:'var(--rain-viewport-height, 100%)',overflow:'hidden',visibility:'hidden'}} />;
};
export default RippleEffect;
