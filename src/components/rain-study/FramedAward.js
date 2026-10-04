import { useEffect, useRef } from 'react';

export default function FramedAward({ award, index, active, onSelect }) {
  const ref=useRef();
  const frame=useRef(0);
  const bounds=useRef();
  useEffect(()=>{
    const element=ref.current;
    if(!window.IntersectionObserver)return undefined;
    const observer=new IntersectionObserver(([entry])=>{element.dataset.visible=String(entry.isIntersecting);},{threshold:.08});
    observer.observe(element);
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
  const reset=()=>{
    cancelAnimationFrame(frame.current);
    ref.current.style.setProperty('--frame-rx','0deg');ref.current.style.setProperty('--frame-ry','0deg');
    ref.current.style.setProperty('--shine-x','35%');ref.current.style.setProperty('--shine-y','20%');
  };
  const move=event=>{
    if(!active || event.pointerType==='touch' || !bounds.current)return;
    const x=Math.max(0,Math.min(1,(event.clientX-bounds.current.left)/bounds.current.width));
    const y=Math.max(0,Math.min(1,(event.clientY-bounds.current.top)/bounds.current.height));
    cancelAnimationFrame(frame.current);
    frame.current=requestAnimationFrame(()=>{
      const style=ref.current.style;
      style.setProperty('--frame-rx',`${(y-.5)*-5}deg`);style.setProperty('--frame-ry',`${(x-.5)*7}deg`);
      style.setProperty('--shine-x',`${x*100}%`);style.setProperty('--shine-y',`${y*100}%`);
    });
  };
  return <a ref={ref} className="rain-award-exhibit" href={award.link} target="_blank" rel="noopener noreferrer" data-visible="true" data-motion={active} style={{'--award-accent':award.color,'--glint-delay':`${index*-1.3}s`}} onPointerEnter={()=>{bounds.current=ref.current.getBoundingClientRect();onSelect();}} onPointerMove={move} onPointerLeave={reset} onFocus={onSelect} onBlur={reset}>
    <div className="rain-award-frame">
      <div className="rain-frame-rebate"><div className="rain-frame-mat"><div className="rain-frame-art"><img src={award.image} alt={award.title} loading="lazy" width="320" height="340" /></div></div></div>
      <span className="rain-frame-glass" aria-hidden="true" />
      <span className="rain-frame-sheen" aria-hidden="true" />
      <span className="rain-frame-corners" aria-hidden="true"><i/><i/><i/><i/></span>
      <span className="rain-frame-spark spark-one" aria-hidden="true"/><span className="rain-frame-spark spark-two" aria-hidden="true"/>
    </div>
    <div className="rain-award-caption"><small>{award.year}{award.award!==award.year && <span>{award.award}</span>}</small><h2>{award.title}</h2><p>{award.category}</p></div>
    <span className="rain-sr-only">Opens a new tab</span>
  </a>;
}
