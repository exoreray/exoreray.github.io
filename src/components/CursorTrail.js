import { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { readViewportHeight } from './rain-study/useViewportHeight';
import { advanceCursorFlow, createCursorFlow, endCursorFlow, moveCursorFlow, particleOpacity } from './cursorFlow';

const CursorTrail = ({ active = true }) => {
  const canvasRef=useRef(null);
  const flowRef=useRef(null);
  if(!flowRef.current?.particles)flowRef.current=createCursorFlow();
  const moveCount=useRef(0);
  const activeRef=useRef(active);activeRef.current=active;
  const engineRef=useRef(null);
  const {darkMode}=useContext(ThemeContext);

  useEffect(()=>{
    const canvas=canvasRef.current,ctx=canvas.getContext('2d');
    if(!ctx)return undefined;
    const flow=flowRef.current;
    let frame=0,previous=null,width=0,height=0;
    const touches=new Set();
    const sprite=document.createElement('canvas');sprite.width=64;sprite.height=64;
    const brush=sprite.getContext('2d');
    const halo=brush.createRadialGradient(32,32,0,32,32,32);
    halo.addColorStop(0,darkMode?'#fff6dfdd':'#785a2c99');
    halo.addColorStop(.12,darkMode?'#e7d4a978':'#a382474d');
    halo.addColorStop(.38,darkMode?'#ceb48120':'#b3986620');
    halo.addColorStop(1,'#c5a87500');
    brush.fillStyle=halo;brush.fillRect(0,0,64,64);
    const draw=now=>{
      frame=0;if(!activeRef.current)return;
      const delta=previous===null?0:Math.max(0,(now-previous)/1000);previous=now;
      const moving=advanceCursorFlow(flow,delta);
      ctx.clearRect(0,0,width,height);
      for(const particle of flow.particles){
        const opacity=particleOpacity(particle)*particle.brightness;
        const size=particle.size*11;
        ctx.globalAlpha=opacity*.75;
        ctx.drawImage(sprite,particle.x-size/2,particle.y-size/2,size,size);
        ctx.globalAlpha=opacity*.62;
        ctx.fillStyle=darkMode?'#ebd6ae':'#94703e';
        ctx.beginPath();ctx.arc(particle.x,particle.y,particle.size*.6,0,Math.PI*2);ctx.fill();
      }
      if(flow.cursorVisible && flow.positioned){
        const size=flow.interactive?7:13;
        ctx.globalAlpha=flow.interactive ? .18 : .38;
        ctx.drawImage(sprite,flow.x-size/2,flow.y-size/2,size,size);
        ctx.globalAlpha=flow.interactive ? .5 : .9;
        ctx.fillStyle=darkMode?'#fff5df':'#85622d';
        ctx.beginPath();ctx.arc(flow.x,flow.y,flow.interactive ? .8 : 1.55,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
      canvas.dataset.phase=moving?'flowing':flow.cursorVisible?'resting':'idle';
      canvas.dataset.particles=String(flow.particles.length);
      canvas.dataset.oldestParticleOpacity=flow.particles.length?particleOpacity(flow.particles[0]).toFixed(2):'0';
      if(moving)frame=requestAnimationFrame(draw);else previous=null;
    };
    const wake=()=>{if(activeRef.current && flow.positioned && !frame)frame=requestAnimationFrame(draw);};
    const stop=()=>{cancelAnimationFrame(frame);frame=0;previous=null;if(!activeRef.current){flow.particles.length=0;ctx.clearRect(0,0,width,height);}};
    const record=event=>{
      const touch=event.pointerType==='touch';
      if(touch && (touches.size>1 || event.isPrimary===false))return;
      flow.cursorVisible=!touch;
      flow.interactive=Boolean(event.target?.closest?.('a,button,input[type="range"],summary,[role="button"],nav,[role="navigation"]'));
      const bounds=canvas.getBoundingClientRect();
      moveCursorFlow(flow,event.clientX-bounds.left,event.clientY-bounds.top,activeRef.current);
      if(activeRef.current){canvas.dataset.moveCount=String(++moveCount.current);wake();}
    };
    const down=event=>{
      if(event.pointerType==='touch'){
        touches.add(event.pointerId);
        if(touches.size>1){endCursorFlow(flow);wake();return;}
        flow.continuous=false;
      }
      record(event);
    };
    const up=event=>{if(event.pointerType==='touch'){touches.delete(event.pointerId);endCursorFlow(flow);wake();}};
    const leave=event=>{if(event.relatedTarget==null){endCursorFlow(flow);wake();}};
    const blur=()=>{touches.clear();moveCursorFlow(flow,flow.x,flow.y,false);endCursorFlow(flow);wake();};
    const resize=()=>{
      const viewportHeight=readViewportHeight();if(viewportHeight===null)return;
      width=window.innerWidth;height=viewportHeight;
      const dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);wake();
    };
    engineRef.current={start:wake,stop};
    canvas.dataset.moveCount=String(moveCount.current);canvas.dataset.phase='idle';
    resize();
    const options={capture:true,passive:true};
    window.addEventListener('pointermove',record,options);window.addEventListener('pointerdown',down,options);
    window.addEventListener('pointerup',up,options);window.addEventListener('pointercancel',up,options);
    window.addEventListener('pointerout',leave,options);window.addEventListener('blur',blur);window.addEventListener('resize',resize);
    window.visualViewport?.addEventListener('resize',resize);
    return()=>{
      window.removeEventListener('pointermove',record,true);window.removeEventListener('pointerdown',down,true);
      window.removeEventListener('pointerup',up,true);window.removeEventListener('pointercancel',up,true);
      window.removeEventListener('pointerout',leave,true);window.removeEventListener('blur',blur);window.removeEventListener('resize',resize);
      window.visualViewport?.removeEventListener('resize',resize);
      stop();engineRef.current=null;
    };
  },[darkMode]);

  useEffect(()=>{if(active)engineRef.current?.start();else engineRef.current?.stop();return()=>engineRef.current?.stop();},[active,darkMode]);
  return <canvas ref={canvasRef} data-effect="original-cursor-trail" data-style="particle-trail" data-finish="deposited" data-active={active}
    aria-hidden="true" style={{height:'var(--rain-viewport-height, 100%)'}} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[10000]" />;
};
export default CursorTrail;
