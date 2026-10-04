import { useCallback, useLayoutEffect, useRef } from 'react';

const isControl = target => Boolean(target?.closest?.('a,button,input,select,textarea,[role="button"]'));

export default function useHomeGesture(root, enabled, interaction) {
  const touches=useRef(new Set());
  const captured=useRef(new Set());
  const resetInteraction=useCallback(()=>{
    const input=interaction.current;
    input.down=false;input.dragActive=false;input.x=0;input.y=0;
    touches.current.clear();
    const pointers=[...captured.current];captured.current.clear();
    const element=root.current;
    for(const id of pointers){
      // The browser may already have discarded capture while hiding the page.
      try { if(element?.hasPointerCapture?.(id))element.releasePointerCapture(id); } catch { /* The pointer has ended. */ }
    }
  },[root,interaction]);
  useLayoutEffect(() => {
    if (!enabled || !root.current) return;
    const element = root.current;
    const resetScroll=()=>{
      if((window.visualViewport?.scale || 1)>1.01)return;
      window.scrollTo({top:0,left:0,behavior:'instant'});
      element.scrollTop=0;
    };
    resetInteraction();resetScroll();
    document.documentElement.classList.add('rain-home-locked');
    // Safari needs both the CSS gesture contract and a non-passive guard.
    // Two-finger gestures are left to the browser for accessibility zoom.
    const preventPan = event => {
      if (event.touches.length === 1 && event.cancelable) event.preventDefault();
    };
    element.addEventListener('touchmove', preventPan, { passive: false });
    window.addEventListener('pageshow',resetScroll);
    window.addEventListener('load',resetScroll);
    window.addEventListener('blur',resetInteraction);
    window.addEventListener('pagehide',resetInteraction);
    return () => {
      document.documentElement.classList.remove('rain-home-locked');
      element.removeEventListener('touchmove', preventPan);
      window.removeEventListener('pageshow',resetScroll);
      window.removeEventListener('load',resetScroll);
      window.removeEventListener('blur',resetInteraction);
      window.removeEventListener('pagehide',resetInteraction);
      resetInteraction();
    };
  }, [enabled, root, resetInteraction]);

  const record = event => {
    const input = interaction.current;
    const bounds=enabled?root.current?.getBoundingClientRect():null;
    input.x = (event.clientX-(bounds?.left || 0)) / (bounds?.width || window.innerWidth) * 2 - 1;
    input.y = 1 - (event.clientY-(bounds?.top || 0)) / (bounds?.height || window.innerHeight) * 2;
    input.clientX = event.clientX;
    input.clientY = event.clientY;
    input.dragActive = enabled && !isControl(event.target) && event.isPrimary!==false && touches.current.size<2 &&
      (event.pointerType === 'mouse' || input.down);
  };
  const release = event => {
    touches.current.delete(event.pointerId);
    captured.current.delete(event.pointerId);
    interaction.current.down = false;
    if(event.pointerType!=='mouse' || event.type==='pointercancel') interaction.current.dragActive=false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return {
    onPointerMove: event => record(event),
    onPointerDown: event => {
      if(event.pointerType==='touch'){
        touches.current.add(event.pointerId);
        if(touches.current.size>1){interaction.current.down=false;interaction.current.dragActive=false;return;}
      }
      if (isControl(event.target) || event.isPrimary===false || (event.button!=null && event.button!==0)) return;
      interaction.current.down = enabled;
      if(!enabled)interaction.current.pulse++;
      record(event);
      if (enabled && event.currentTarget.setPointerCapture){
        event.currentTarget.setPointerCapture(event.pointerId);captured.current.add(event.pointerId);
      }
    },
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture: event => {
      const interrupted=interaction.current.down || touches.current.has(event.pointerId) || captured.current.has(event.pointerId);
      captured.current.delete(event.pointerId);
      if(interrupted)resetInteraction();
    },
    onPointerLeave: () => {
      if (!interaction.current.down) { interaction.current.x = 0; interaction.current.y = 0; interaction.current.dragActive=false; }
    },
  };
}
