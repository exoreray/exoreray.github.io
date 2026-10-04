import { useCallback, useEffect, useRef, useState } from 'react';

export const AUTO_SCROLL_DELAY = 1000;
export const AUTO_SCROLL_SPEED = 48;
const scrollKeys=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End',' ','Escape','Tab','Enter']);
const maximumScroll=()=>Math.max(0,(document.scrollingElement || document.documentElement).scrollHeight-window.innerHeight);

export default function useJourneyAutoscroll(root,{active,motion}) {
  const [requested,setRequested]=useState(true);
  const [delayDone,setDelayDone]=useState(false);
  const [ended,setEnded]=useState(false);
  const [visible,setVisible]=useState(()=>!document.hidden);
  const [restoreRevision,setRestoreRevision]=useState(0);
  const intent=useRef(true),frame=useRef(null),timer=useRef(null);

  const pause=useCallback(()=>{
    intent.current=false;setRequested(false);
    cancelAnimationFrame(frame.current);frame.current=null;
    clearTimeout(timer.current);timer.current=null;
  },[]);
  const resume=useCallback(()=>{
    if(window.scrollY>=maximumScroll()-1 && maximumScroll()>0){
      const start=Math.max(0,(root.current?.getBoundingClientRect().top || 0)+window.scrollY);
      window.scrollTo({top:start,behavior:'instant'});
    }
    intent.current=true;setRequested(true);setEnded(false);setDelayDone(true);
  },[root]);
  const toggle=useCallback(()=>{if(intent.current)pause();else resume();},[pause,resume]);

  useEffect(()=>{
    const takeover=event=>{
      const control=event.target?.closest?.('[data-journey-autoplay],.rain-motion');
      if(control && (event.type==='pointerdown' || event.type==='touchstart' || (event.type==='keydown' && (event.key===' ' || event.key==='Enter'))))return;
      if(event.type==='keydown' && !scrollKeys.has(event.key))return;
      pause();
    };
    const suspend=()=>{
      setVisible(false);
      cancelAnimationFrame(frame.current);frame.current=null;
      clearTimeout(timer.current);timer.current=null;
    };
    const visibility=()=>{
      const shown=!document.hidden;
      if(shown)setVisible(true);else suspend();
      return shown;
    };
    const restore=()=>{
      // A hidden RAF can stop without a visibilitychange. Restart with a fresh
      // timestamp even when the saved visible boolean was already true.
      if(visibility())setRestoreRevision(value=>value+1);
    };
    const restoreEvents=['pageshow','focus','load'];
    const options={capture:true,passive:true};
    window.addEventListener('wheel',takeover,options);
    window.addEventListener('pointerdown',takeover,options);
    window.addEventListener('touchstart',takeover,options);
    window.addEventListener('keydown',takeover,true);
    document.addEventListener('visibilitychange',restore);
    restoreEvents.forEach(event=>window.addEventListener(event,restore));
    window.addEventListener('pagehide',suspend);
    visibility();
    return()=>{
      window.removeEventListener('wheel',takeover,true);
      window.removeEventListener('pointerdown',takeover,true);
      window.removeEventListener('touchstart',takeover,true);
      window.removeEventListener('keydown',takeover,true);
      document.removeEventListener('visibilitychange',restore);
      restoreEvents.forEach(event=>window.removeEventListener(event,restore));
      window.removeEventListener('pagehide',suspend);
      cancelAnimationFrame(frame.current);clearTimeout(timer.current);
    };
  },[pause]);

  useEffect(()=>{
    if(!requested || delayDone || !active || !motion || !visible)return undefined;
    timer.current=setTimeout(()=>{timer.current=null;setDelayDone(true);},AUTO_SCROLL_DELAY);
    return()=>{clearTimeout(timer.current);timer.current=null;};
  },[requested,delayDone,active,motion,visible]);

  useEffect(()=>{
    if(!requested || !delayDone || !active || !motion || !visible)return undefined;
    // Keep fractional travel independently of browser-rounded scrollY.
    // Seed here, after route/deep-link restoration, and re-seed on every resume.
    let position=window.scrollY,lastCommand=position,previous=null,cancelled=false;
    const resize=()=>{position=window.scrollY;lastCommand=position;previous=null;};
    const tick=now=>{
      frame.current=null;
      if(cancelled || !intent.current || document.hidden)return;
      const maximum=maximumScroll();
      if(Math.abs(window.scrollY-lastCommand)>2)position=window.scrollY;
      if(previous!==null)position+=AUTO_SCROLL_SPEED*Math.max(0,now-previous)/1000;
      previous=now;position=Math.min(position,maximum);
      if(position!==lastCommand){window.scrollTo({top:position,behavior:'instant'});lastCommand=position;}
      if(position>=maximum){intent.current=false;setRequested(false);setEnded(true);return;}
      frame.current=requestAnimationFrame(tick);
    };
    frame.current=requestAnimationFrame(tick);
    window.addEventListener('resize',resize,{passive:true});
    return()=>{cancelled=true;cancelAnimationFrame(frame.current);frame.current=null;window.removeEventListener('resize',resize);};
  },[requested,delayDone,active,motion,visible,restoreRevision]);

  const running=requested && delayDone && active && motion && visible;
  const state=!motion?'disabled':ended?'ended':!requested?'paused':!delayDone?'waiting':running?'playing':'suspended';
  return {requested,running,state,toggle,pause,resume};
}
