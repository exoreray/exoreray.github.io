import { useLayoutEffect } from 'react';

export function readViewportHeight(view=window) {
  const viewport=view.visualViewport;
  // Pinch zoom changes the visible area, not the page's layout height.
  if(viewport && Math.abs((viewport.scale || 1)-1)>.01)return null;
  const height=viewport?.height>0?viewport.height:view.innerHeight;
  return Number.isFinite(height) && height>0?Math.round(height):null;
}

export default function useViewportHeight(root,isHome=false) {
  useLayoutEffect(()=>{
    const html=document.documentElement;
    const previous=html.style.getPropertyValue('--rain-viewport-height');
    const previousTop=html.style.getPropertyValue('--rain-viewport-top');
    const previousCorrection=html.style.getPropertyValue('--rain-home-top-correction');
    const viewport=window.visualViewport;
    let frame=0,disposed=false,rechecks=[];
    const measure=()=>{
      const height=readViewportHeight();
      if(height===null)return;
      if(html.style.getPropertyValue('--rain-viewport-height')!==`${height}px`)
        html.style.setProperty('--rain-viewport-height',`${height}px`);
      const top=Math.max(0,viewport?.offsetTop || 0);
      if(html.style.getPropertyValue('--rain-viewport-top')!==`${top}px`)
        html.style.setProperty('--rain-viewport-top',`${top}px`);
      // Restored WebView offsets can outlive the browser's first layout frames.
      // Measure without our prior adjustment so repeated bounds never compound it.
      if(isHome && root?.current){
        const applied=html.style.getPropertyValue('--rain-home-top-correction');
        if(applied && parseFloat(applied)!==0)
          html.style.setProperty('--rain-home-top-correction','0px');
        const bounds=root.current.getBoundingClientRect();
        if(bounds.height>0 && bounds.width>0 && Number.isFinite(bounds.top)){
          const next=top-bounds.top;
          const value=`${Math.abs(next)>.5?next:0}px`;
          if(html.style.getPropertyValue('--rain-home-top-correction')!==value)
            html.style.setProperty('--rain-home-top-correction',value);
        }else if(applied)html.style.setProperty('--rain-home-top-correction',applied);
        else html.style.removeProperty('--rain-home-top-correction');
      }
    };
    const settle=()=>{
      if(disposed)return;
      measure();cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        measure();frame=requestAnimationFrame(()=>{frame=0;measure();});
      });
    };
    const restore=()=>{
      if(disposed)return;
      rechecks.forEach(clearTimeout);
      settle();
      // Browser handoff chrome can finish resizing after pageshow/focus has fired.
      rechecks=[100,300,750,1500].map(delay=>setTimeout(settle,delay));
    };
    const visible=()=>{if(!document.hidden)restore();};
    restore();
    window.addEventListener('resize',settle);
    window.addEventListener('orientationchange',restore);
    window.addEventListener('pageshow',restore);
    window.addEventListener('load',restore);
    window.addEventListener('focus',restore);
    viewport?.addEventListener('resize',settle);
    viewport?.addEventListener('scroll',settle);
    if(isHome)window.addEventListener('scroll',settle,{passive:true});
    document.addEventListener('visibilitychange',visible);
    return()=>{
      disposed=true;cancelAnimationFrame(frame);
      rechecks.forEach(clearTimeout);
      window.removeEventListener('resize',settle);
      window.removeEventListener('orientationchange',restore);
      window.removeEventListener('pageshow',restore);
      window.removeEventListener('load',restore);
      window.removeEventListener('focus',restore);
      viewport?.removeEventListener('resize',settle);
      viewport?.removeEventListener('scroll',settle);
      if(isHome)window.removeEventListener('scroll',settle);
      document.removeEventListener('visibilitychange',visible);
      if(previous)html.style.setProperty('--rain-viewport-height',previous);
      else html.style.removeProperty('--rain-viewport-height');
      if(previousTop)html.style.setProperty('--rain-viewport-top',previousTop);
      else html.style.removeProperty('--rain-viewport-top');
      if(previousCorrection)html.style.setProperty('--rain-home-top-correction',previousCorrection);
      else html.style.removeProperty('--rain-home-top-correction');
    };
  },[root,isHome]);
}
