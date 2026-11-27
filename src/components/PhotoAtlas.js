import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isVideo, dateLabel } from './photographyLibrary';
import { atlasWords, cloudLayout, COLOR_INK, fitCamera, layoutBounds, matchesFocus, openPhotoLabel, packWords, wordPages, zoomCamera } from './photoAtlasLayout';
import './PhotoAtlas.css';

const MODES=[['wander','Wander'],['words','Words'],['years','Years'],['colors','Colors']];
const FACETS=[['subjects','Subjects'],['vibes','Feelings'],['category','Themes'],['timeOfDay','Time']];
const DEFAULT_VIEW={mode:'wander',focus:null,media:'all',wordFacet:'subjects'};
const MONTH_FORMAT=new Intl.DateTimeFormat('en',{month:'short',timeZone:'UTC'});
const DEFAULT_SEEDS=[['subjects','Water','water',-250,180],['vibes','Calm','calm',285,-155],['subjects','People','people',45,360]];

const AtlasPhoto=memo(function AtlasPhoto({node,onOpen,onHover,onKeyboardFocus,dimmed}){
  const p=node.photo;
  return <button className="atlas-photo" aria-label={openPhotoLabel(p)} tabIndex={dimmed?-1:0} style={{left:node.x,top:node.y,width:node.width,height:node.height,'--rotation':node.rotation+'deg'}}
    onClick={()=>onOpen(p.id)} onMouseEnter={()=>onHover(p)} onMouseLeave={()=>onHover(null)}
    onFocus={e=>{onHover(p);let keyboard=true;try{keyboard=e.currentTarget.matches(':focus-visible');}catch{}if(keyboard)onKeyboardFocus(node);}} onBlur={()=>onHover(null)}>
    <img src={p.atlasSrc || p.src} alt={p.alt} width={p.atlasWidth || p.width} height={p.atlasHeight || p.height} draggable="false" loading="lazy" decoding="async" />
    {isVideo(p) && <span className="atlas-photo__film" aria-hidden="true">▶</span>}
  </button>;
});

function WordField({words,size,kind,onChoose,onHover}) {
  const visual=kind==='year' || kind==='colors';
  const [page,setPage]=useState(0);
  const pages=useMemo(()=>wordPages(words,size),[words,size]);
  const currentPage=page%pages.length,shownWords=pages[currentPage];
  const fieldSize=useMemo(()=>({...size,height:size.height-(pages.length>1?50:0)}),[size,pages.length]);
  const packed=useMemo(()=>packWords(shownWords,fieldSize,visual),[shownWords,fieldSize,visual]);
  return <div className={'atlas-words atlas-words--'+kind} role="group" aria-label={kind==='year'?'Year islands':kind==='colors'?'Color cloud':'Word cloud'}>
    {packed.map(word=><button key={word.value} className={'atlas-word'+(visual?' atlas-word--visual':'')} aria-label={'Explore '+word.value} onClick={()=>onChoose(word)} onMouseEnter={()=>onHover(word.photos[0])} onMouseLeave={()=>onHover(null)} onFocus={()=>onHover(word.photos[0])} onBlur={()=>onHover(null)}
      style={{left:word.x,top:word.y,fontSize:word.font,'--word-color':COLOR_INK[word.value] || 'currentColor'}}>
      <span className="atlas-word__pictures" aria-hidden="true">{word.photos.slice(0,kind==='year'?3:1).map((p,i)=><img key={p.id} src={p.atlasSrc || p.src} alt="" draggable="false" style={{'--peek':i}} />)}</span>
      <span className="atlas-word__text">{word.label}</span><small>{word.photos.length} moments</small>
    </button>)}
    {pages.length>1&&<div className="atlas-word-pages"><button onClick={()=>setPage(current=>current+1)}>More words</button><span>{currentPage+1} / {pages.length}</span></div>}
  </div>;
}

export default function PhotoAtlas({photos=[],view=DEFAULT_VIEW,setView,onOpen,motion=true}) {
  const [size,setSize]=useState({width:1000,height:650});
  const [hovered,setHovered]=useState(null);
  const [zoom,setZoom]=useState(80);
  const viewport=useRef(null),world=useRef(null),navigation=useRef(null),camera=useRef({x:500,y:325,scale:.8});
  const pointers=useRef(new Map()),gesture=useRef(null),suppressClick=useRef(false),raf=useRef(null),release=useRef(null);
  const v={...DEFAULT_VIEW,...view};
  const activePhotos=useMemo(()=>{const selected=photos.filter(p=>(v.media!=='films' || isVideo(p)) && matchesFocus(p,v.focus));if(v.focus?.kind==='colors')selected.sort((a,b)=>(b.colorCoverage?.[v.focus.value] || 0)-(a.colorCoverage?.[v.focus.value] || 0));return selected;},[photos,v.media,v.focus]);
  const nodes=useMemo(()=>cloudLayout(activePhotos),[activePhotos]);
  const bounds=useMemo(()=>layoutBounds(nodes),[nodes]);
  const kind=v.mode==='years'?'year':v.mode==='colors'?'colors':v.wordFacet;
  const wordPhotos=useMemo(()=>photos.filter(p=>v.media!=='films' || isVideo(p)),[photos,v.media]);
  const words=useMemo(()=>atlasWords(wordPhotos,kind),[wordPhotos,kind]);
  const showWords=['words','years','colors'].includes(v.mode);
  const count=activePhotos.length;
  const years=useMemo(()=>[...new Set(photos.map(p=>p.date?.slice(0,4)).filter(Boolean))].sort(),[photos]);

  const paint=useCallback(next=>{
    camera.current=next;
    if(raf.current!==null)cancelAnimationFrame(raf.current);
    raf.current=requestAnimationFrame(()=>{if(world.current){world.current.style.transform='translate3d('+next.x+'px,'+next.y+'px,0) scale('+next.scale+')';world.current.style.setProperty('--scene-scale',next.scale);if(viewport.current){viewport.current.scrollLeft=0;viewport.current.scrollTop=0;}}raf.current=null;});
  },[]);
  const settle=useCallback(()=>{setZoom(Math.round(camera.current.scale*100));},[]);
  const resetCamera=useCallback((fit=false)=>{
    if(!viewport.current)return;
    const next=fit || (v.focus && nodes.length<=(size.width<600?6:24)) ? fitCamera(bounds,size,size.width<600?32:65) : {x:size.width/2,y:size.height/2,scale:size.width<600?Math.max(.42,Math.min(.65,(size.width-40)/640)):.9};
    viewport.current.dataset.interacting='false';paint(next);settle();
  },[bounds,size,v.focus,nodes.length,paint,settle]);
  const centerPhoto=useCallback(node=>{
    const c=camera.current,x=c.x+node.x*c.scale,y=c.y+node.y*c.scale;
    if(x<40 || x>size.width-40 || y<40 || y>size.height-40){paint({...c,x:size.width/2-node.x*c.scale,y:size.height/2-node.y*c.scale});settle();}
  },[paint,settle,size]);
  const openPhoto=useCallback(id=>{const index=activePhotos.findIndex(p=>p.id===id);if(index>=0)onOpen(activePhotos,index);},[activePhotos,onOpen]);
  const changeMode=mode=>{setHovered(null);setView(current=>({...DEFAULT_VIEW,...current,mode,focus:null}));};
  const chooseWord=word=>{setHovered(null);setView(current=>({...DEFAULT_VIEW,...current,mode:'wander',focus:{kind:word.kind,value:word.value,label:word.label}}));};
  const allMoments=()=>{setHovered(null);setView({...DEFAULT_VIEW});};

  useEffect(()=>{
    const el=viewport.current;if(!el)return;
    const measure=()=>{const r=el.getBoundingClientRect();if(r.width&&r.height)setSize(old=>old.width===r.width&&old.height===r.height?old:{width:r.width,height:r.height});};
    measure();const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(measure):null;observer?.observe(el);window.addEventListener('resize',measure);
    return()=>{observer?.disconnect();window.removeEventListener('resize',measure);};
  },[]);
  useEffect(()=>{if(v.mode!=='sheet')resetCamera();},[resetCamera,v.mode]);
  useEffect(()=>{
    const el=viewport.current;if(!el || v.mode!=='wander')return;
    const wheel=e=>{e.preventDefault();e.stopPropagation();const rect=el.getBoundingClientRect();el.dataset.interacting='true';paint(zoomCamera(camera.current,Math.exp(-e.deltaY*.0017),{x:e.clientX-rect.left,y:e.clientY-rect.top}));settle();};
    el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);
  },[paint,settle,v.mode]);
  useEffect(()=>()=>{if(raf.current!==null)cancelAnimationFrame(raf.current);if(release.current!==null)cancelAnimationFrame(release.current);},[]);

  const pointerDown=e=>{
    if(v.mode!=='wander' || (e.pointerType==='mouse' && e.button!==0) || e.target.closest('[data-no-pan]'))return;
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.current.size===1)gesture.current={x:e.clientX,y:e.clientY,camera:{...camera.current},moved:false};
    else if(pointers.current.size===2){const [a,b]=[...pointers.current.values()];gesture.current={camera:{...camera.current},distance:Math.hypot(a.x-b.x,a.y-b.y),mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},pinch:true,moved:true};viewport.current.setPointerCapture?.(e.pointerId);}
  };
  const pointerMove=e=>{
    if(!pointers.current.has(e.pointerId) || !gesture.current)return;
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const g=gesture.current;
    if(g.pinch && pointers.current.size===2){const [a,b]=[...pointers.current.values()],rect=viewport.current.getBoundingClientRect();paint(zoomCamera(g.camera,Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,g.distance),{x:g.mid.x-rect.left,y:g.mid.y-rect.top}));viewport.current.dataset.interacting='true';return;}
    if(g.pinch)return;
    const dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(!g.moved && Math.hypot(dx,dy)<5)return;
    g.moved=true;viewport.current.dataset.interacting='true';viewport.current.setPointerCapture?.(e.pointerId);paint({...g.camera,x:g.camera.x+dx,y:g.camera.y+dy});
  };
  const pointerUp=e=>{
    if(!pointers.current.has(e.pointerId))return;
    const moved=gesture.current?.moved;pointers.current.delete(e.pointerId);
    if(viewport.current.hasPointerCapture?.(e.pointerId))viewport.current.releasePointerCapture(e.pointerId);
    if(moved){suppressClick.current=true;release.current=requestAnimationFrame(()=>{suppressClick.current=false;release.current=null;});}
    if(!pointers.current.size)gesture.current=null;settle();
  };
  const keyboard=e=>{
    if(e.target!==e.currentTarget || v.mode!=='wander')return;
    const c=camera.current,steps={ArrowLeft:[90,0],ArrowRight:[-90,0],ArrowUp:[0,90],ArrowDown:[0,-90]};
    if(steps[e.key]){e.preventDefault();const [x,y]=steps[e.key];paint({...c,x:c.x+x,y:c.y+y});settle();}
    if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0')resetCamera();else{paint(zoomCamera(c,e.key==='-'?.8:1.25,{x:size.width/2,y:size.height/2}));settle();}}
  };
  const zoomBy=factor=>{paint(zoomCamera(camera.current,factor,{x:size.width/2,y:size.height/2}));settle();};
  const months=v.focus?.kind==='year'?[...new Set(activePhotos.map(p=>p.date?.slice(0,7)).filter(Boolean))].sort():[];
  const helper=v.mode==='wander'?'Drag to wander. Scroll or pinch to get closer.':v.mode==='years'?'Follow a year.':v.mode==='colors'?'Follow a color.':v.mode==='sheet'?'Every photograph, every film.':'Follow a word.';

  return <section className="photo-atlas" aria-labelledby="rain-page-title" data-mode={v.mode} data-motion={motion===false?'off':'on'}>
    <header className="photo-atlas__heading"><div><h1 id="rain-page-title" tabIndex={-1}>Photography</h1><p>{v.focus?<><span className="photo-atlas__focus">{v.focus.label}</span><button onClick={allMoments}>All moments</button></>:<a href="https://www.instagram.com/exoreray/" target="_blank" rel="noopener noreferrer">@exoreray</a>}</p></div><span className="photo-atlas__span">{years[0]}{years.length>1?' — '+years[years.length-1]:''}</span><button className="atlas-jump" onClick={()=>navigation.current?.querySelector('button')?.focus()}>Jump to exploration controls</button></header>
    {!photos.length?<p className="photo-atlas__empty">The collection is being prepared.</p>:<>
      <div className="photo-atlas__viewport" ref={viewport} role="region" aria-label="Photo constellation" tabIndex={0} data-lenis-prevent="true" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onKeyDown={keyboard}
        onClickCapture={e=>{if(suppressClick.current){e.preventDefault();e.stopPropagation();suppressClick.current=false;}}}>
        {v.mode==='sheet'?<div className="atlas-sheet" role="region" aria-label="Contact sheet" data-lenis-prevent="true">{activePhotos.map(p=><button key={p.id} onClick={()=>openPhoto(p.id)} aria-label={openPhotoLabel(p)}><img src={p.atlasSrc || p.src} alt={p.alt} loading="lazy" width={p.atlasWidth || p.width} height={p.atlasHeight || p.height}/><span>{p.title}{isVideo(p)?' · Film':''}</span></button>)}</div>:<>
          <div className="photo-atlas__world" ref={world} aria-hidden={showWords || undefined} data-dimmed={showWords?'true':'false'}>
            {nodes.map(node=><AtlasPhoto key={node.photo.id} node={node} onOpen={openPhoto} onHover={setHovered} onKeyboardFocus={centerPhoto} dimmed={showWords}/>)}
            {v.mode==='wander'&&!v.focus&&v.media!=='films'&&DEFAULT_SEEDS.map(([k,value,label,x,y])=>wordPhotos.some(p=>matchesFocus(p,{kind:k,value}))?<button data-no-pan="true" key={value} className="atlas-seed" aria-label={'Explore '+value} style={{left:x,top:y}} onClick={()=>chooseWord({kind:k,value,label})}>{label}</button>:null)}
          </div>
          {showWords&&<WordField key={kind+'-'+v.media} words={words} size={size} kind={kind} onChoose={chooseWord} onHover={setHovered}/>}
          {v.mode==='words'&&<nav className="atlas-facets" aria-label="Word families">{FACETS.map(([facet,label])=><button key={facet} aria-pressed={v.wordFacet===facet} onClick={()=>setView(current=>({...current,wordFacet:facet}))}>{label}</button>)}</nav>}
          {v.mode==='wander'&&<div className="atlas-camera" data-no-pan="true"><button onClick={()=>zoomBy(1.25)} aria-label="Zoom in">+</button><span aria-hidden="true">{zoom}%</span><button onClick={()=>zoomBy(.8)} aria-label="Zoom out">−</button><button onClick={()=>resetCamera(true)} aria-label="Fit all photographs">⊞</button></div>}
          {months.length>1&&<nav className="atlas-months" data-no-pan="true" aria-label={'Months in '+v.focus.value}>{months.map(month=><button key={month} onClick={()=>chooseWord({kind:'month',value:month,label:MONTH_FORMAT.format(new Date(month+'-15T12:00:00Z'))+' '+month.slice(0,4)})}>{MONTH_FORMAT.format(new Date(month+'-15T12:00:00Z'))}</button>)}</nav>}
        </>}
      </div>
      <footer className="photo-atlas__dock"><div className="atlas-caption" aria-live="polite"><span>{hovered?hovered.title:helper}</span><small>{hovered?dateLabel(hovered):count+' moments'}</small></div><nav ref={navigation} aria-label="Ways to explore">{MODES.map(([mode,label])=><button key={mode} aria-pressed={v.mode===mode} onClick={()=>changeMode(mode)}>{label}</button>)}</nav><div className="atlas-utilities"><button aria-label="Explore films" aria-pressed={v.media==='films'} onClick={()=>setView(current=>({...DEFAULT_VIEW,...current,media:current.media==='films'?'all':'films',focus:null,mode:'wander'}))}>Films</button><button aria-label="Open contact sheet" aria-pressed={v.mode==='sheet'} onClick={()=>changeMode(v.mode==='sheet'?'wander':'sheet')}><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">{[0,1,2,3,4,5,6,7,8].map(i=><rect key={i} x={i%3*6+1} y={Math.floor(i/3)*6+1} width="3" height="3" fill="currentColor"/>)}</svg></button></div></footer>
    </>}
  </section>;
}
