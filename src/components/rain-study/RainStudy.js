import { Component, Suspense, lazy, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import AtmosphericRain from './AtmosphericRain';
import { rainRoutes } from './rainRoutes';
import { MusicProvider, MusicControls } from './RainMusic';
import { Heading, HomePage, WorksPage, JourneyPage, ProjectsPage, MusicPage, ThoughtsPage, SkillsPage, AwardsPage } from './RainPages';
import './rain-study.css';
import useHomeGesture from './useHomeGesture';
import useViewportHeight from './useViewportHeight';
import InterfaceIcon from './InterfaceIcon';
import CursorTrail from '../CursorTrail';
import RippleEffect from '../RippleEffect';
const LivingSculpture = lazy(() => import('./LivingSculpture'));
class SculptureBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}
const pageComponents = { works:WorksPage, journey:JourneyPage, projects:ProjectsPage, music:MusicPage, thoughts:ThoughtsPage, skills:SkillsPage, awards:AwardsPage };
export default function RainStudy() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const location = useLocation(); const navigationType = useNavigationType();
  const page = rainRoutes.find(route => route.path === location.pathname);
  const [motion, setMotion] = useState(() => new URLSearchParams(window.location.search).get('motion') !== 'off');
  const [visible, setVisible] = useState(() => !document.hidden);
  const [inHero, setInHero] = useState(true);
  const [hovered, setHovered] = useState(-1);
  const [selections, setSelections] = useState({});
  const [compact, setCompact] = useState(() => window.innerWidth < 700);
  const interaction = useRef({ x:0,y:0,clientX:0,clientY:0,pulse:0,scroll:0,down:false,dragActive:false });
  const root = useRef(null);
  const analysis = useRef({ context:null,analyser:null,data:null,playing:false });
  const positions = useRef(new Map()); const currentEntry = useRef(location.key);
  const firstNavigation = useRef(true);
  const restoredY = useRef(0);
  useLayoutEffect(() => {
    restoredY.current = navigationType === 'POP' ? positions.current.get(location.key) || 0 : 0;
    currentEntry.current = location.key;
  }, [location.key, navigationType]);
  useLayoutEffect(() => {
    document.documentElement.classList.add('rain-mode');
    const updateVisibility = () => setVisible(!document.hidden);
    const suspend = () => setVisible(false);
    const restoreEvents = ['pageshow','focus','load'];
    const updateScroll = () => { interaction.current.scroll = Math.min(window.scrollY / window.innerHeight, 1); positions.current.set(currentEntry.current,window.scrollY); setInHero(window.scrollY < window.innerHeight * .95); };
    const resize = () => {setCompact(window.innerWidth < 700);updateScroll();};
    document.addEventListener('visibilitychange',updateVisibility); window.addEventListener('scroll',updateScroll,{passive:true}); window.addEventListener('resize',resize);
    restoreEvents.forEach(event => window.addEventListener(event,updateVisibility));
    window.addEventListener('pagehide',suspend);
    // A native WebView may present or restore the document without issuing a
    // visibilitychange event. Reconcile now, before the next animation frame.
    updateVisibility();
    const oldRestoration = window.history.scrollRestoration; window.history.scrollRestoration = 'manual';
    return () => {document.documentElement.classList.remove('rain-mode');document.removeEventListener('visibilitychange',updateVisibility);window.removeEventListener('scroll',updateScroll);window.removeEventListener('resize',resize);restoreEvents.forEach(event => window.removeEventListener(event,updateVisibility));window.removeEventListener('pagehide',suspend);window.history.scrollRestoration=oldRestoration;};
  }, []);
  const homeGesture = useHomeGesture(root, page?.kind === 'home', interaction);
  useViewportHeight(root,page?.kind==='home');
  useEffect(() => {
    currentEntry.current = location.key; setHovered(-1);
    document.title = `Ray Xi — ${page?.kind === 'home' ? 'Architect of Digital Dreams' : page?.title || 'Portfolio'}`;
    let y = page?.kind === 'home' ? 0 : restoredY.current;
    const frame = requestAnimationFrame(() => {
      if(firstNavigation.current && page?.kind==='journey'){
        const chapter=new URLSearchParams(window.location.search).get('chapter');
        const article=chapter && document.getElementById('journey-title-'+chapter)?.closest('article');
        // Scroll positions are rounded to device pixels; land inside the intended chapter.
        if(article)y=Math.ceil(article.getBoundingClientRect().top+window.scrollY);
      }
      window.scrollTo({top:y,behavior:'instant'}); interaction.current.scroll = Math.min(y / window.innerHeight,1);setInHero(y < window.innerHeight * .95);
      if (!firstNavigation.current) document.getElementById('rain-page-title')?.focus({preventScroll:true});
      firstNavigation.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [location.key, navigationType, page?.title, page?.kind]);
  if (!page) return <Navigate to="/" replace />;
  const selected = selections[page.kind] || 0;
  const select = value => setSelections(previous => ({...previous,[page.kind]:value}));
  const active = motion && visible;
  const Page = pageComponents[page.kind];
  return <MusicProvider analysis={analysis}><div className={`rain-study rain-page-${page.kind} ${darkMode?'rain-dark':'rain-light'} ${motion?'rain-moving':'rain-still'}`} ref={root} {...homeGesture}>
    <svg className="rain-logo-filter" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter id="rain-logo-remove-bg" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="logo-luminance" />
          <feComponentTransfer in="logo-luminance" result="logo-alpha">
            <feFuncA type="linear" slope="10" intercept="-0.75" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="logo-alpha" operator="in" />
        </filter>
      </defs>
    </svg>
    <AtmosphericRain active={active} dark={darkMode} compact={compact} />
    <CursorTrail active={active} />
    <RippleEffect active={active} />
    <div className="rain-atmosphere" aria-hidden="true" />
    <SculptureBoundary><Suspense fallback={null}><LivingSculpture interaction={interaction} active={active && inHero && page.kind !== 'journey'} suspended={page.kind === 'journey'} hovered={hovered} dark={darkMode} shape={page.shape} selected={selected} compact={compact} analysis={analysis} /></Suspense></SculptureBoundary>
    <a className="rain-skip" href="#rain-page-title" onClick={e=>{e.preventDefault();document.getElementById('rain-page-title')?.focus();}}>Skip to content</a>
    <header className="rain-header"><Link className="rain-signature" to="/" aria-label="Ray Xi home"><img src="/rx-icon.png" alt="Ray Xi" width="110" height="110" /></Link>
      {page.kind!=='home' && <nav className="rain-breadcrumbs" aria-label="Page navigation"><Link to="/">Home</Link>{page.path.startsWith('/works/') && <Link to="/works">Works</Link>}<span aria-current="page">{page.title}</span></nav>}
      <div className="rain-header-controls"><button onClick={()=>setMotion(value=>!value)} aria-label={motion?'Pause live motion':'Enable live motion'} aria-pressed={motion} className="rain-motion"><span className="rain-motion-indicator" /><span>{motion?'Motion on':'Motion off'}</span></button><MusicControls compact /><button onClick={toggleDarkMode} className="rain-theme" aria-label={darkMode?'Switch to light theme':'Switch to dark theme'}><InterfaceIcon name={darkMode?'sun':'moon'} /></button></div>
    </header>
    <main className="rain-page-content" key={page.path}>{page.kind==='home'?<HomePage setHovered={setHovered}/>:<>{page.kind !== 'journey' && <Heading page={page}/>}<Page selected={selected} select={select} setHovered={setHovered} active={active} motion={motion} compact={compact} dark={darkMode}/></>}</main>
    {page.kind!=='home' && <footer className="rain-page-footer"><nav aria-label="All pages">{rainRoutes.map(route=><NavLink key={route.path} to={route.path} end>{route.kind==='home'?'Home':route.title}</NavLink>)}</nav></footer>}
  </div></MusicProvider>;
}
