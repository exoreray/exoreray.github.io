import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import copy from '../../data/siteCopy.json';
import { journeyScenes } from './journeyScenes';
import { cinematicCut, locateChapter } from './journeyTimeline';
import './journey-scroll.css';
import InterfaceIcon from './InterfaceIcon';
import ExternalLink from './ExternalLink';
import useJourneyAutoscroll from './useJourneyAutoscroll';
const JourneyFilmScene = lazy(() => import('./JourneyFilmScene'));
const chapters = copy.milestones.chapters;
class FilmBoundary extends Component {
  state = {failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure();}
  render(){return this.state.failed ? <p className="journey-film-loading" role="status">The 3D scene is unavailable. All chapters remain readable.</p> : this.props.children;}
}
export default function JourneyScroll({ active = true, motion = true, compact = false, dark = true }) {
  const root = useRef(null), stage = useRef(null), sections = useRef([]);
  const ranges = useRef([]), timeline = useRef({index:0,progress:0});
  const motionRef = useRef(motion); motionRef.current=motion;
  const lastCut=useRef(-1);
  const [selected, setSelected] = useState(0);
  const [inView, setInView] = useState(true);
  const [filmFailed, setFilmFailed] = useState(false);
  const [ready, setReady] = useState({}), [errors, setErrors] = useState({});
  const autoplay=useJourneyAutoscroll(root,{active,motion});
  const onReady = useCallback(index => setReady(previous => previous[index] ? previous : {...previous,[index]:true}), []);
  const onError = useCallback(index => setErrors(previous => ({...previous,[index]:true})), []);
  const onFilmFailure = useCallback(() => setFilmFailed(true), []);
  const onCameraProgress=useCallback(progress=>{
    const cut=cinematicCut(progress,motionRef.current);
    if(Math.abs(cut-lastCut.current)<.0001)return;
    lastCut.current=cut;
    root.current?.style.setProperty('--journey-cut',String(cut));
  },[]);
  useEffect(() => {
    let frame;
    const update = () => {
      const value = locateChapter(ranges.current, window.scrollY);
      timeline.current = value;
      setSelected(previous => previous === value.index ? previous : value.index);
      if (root.current) {
        root.current.dataset.chapter = String(value.index);
        root.current.style.setProperty('--journey-progress', String((value.index + value.progress) / chapters.length));
      }
    };
    const measure = () => {
      const origin = root.current.getBoundingClientRect().top + window.scrollY;
      ranges.current = sections.current.map((element, index) => {
        const rect = element.getBoundingClientRect();
        return {start:rect.height ? rect.top + window.scrollY : origin + index * window.innerHeight * 1.7,height:rect.height || window.innerHeight * 1.7};
      });
      update();
    };
    const schedule = () => {cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
    measure();
    const observer = window.ResizeObserver ? new ResizeObserver(measure) : null;
    sections.current.forEach(element => observer?.observe(element));
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',measure);
    return () => {cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',measure);};
  }, []);
  useEffect(() => {
    if (!window.IntersectionObserver || !stage.current) return;
    const observer = new IntersectionObserver(entries => setInView(entries[0].isIntersecting),{threshold:.05});
    observer.observe(stage.current);return () => observer.disconnect();
  }, []);
  return <section className="journey-scroll" id="journey-chapters" ref={root} aria-label="Journey chapters" data-chapter={selected} data-autoscroll={autoplay.state}>
    <button type="button" className="journey-autoplay" data-journey-autoplay aria-controls="journey-chapters"
      disabled={!motion} aria-pressed={autoplay.requested && motion}
      aria-label={!motion?'Enable Motion to use auto-scroll':autoplay.requested?'Pause auto-scroll':autoplay.state==='ended'?'Replay Journey':'Resume auto-scroll'}
      title={!motion?'Turn Motion on to enable auto-scroll':autoplay.requested?'Scroll or touch to pause':undefined}
      onClick={autoplay.toggle}>
      <InterfaceIcon name={autoplay.requested && motion?'pause':'play'}/>
      <span>{autoplay.state==='ended'?'Replay':autoplay.state==='waiting'?'Starting…':autoplay.state==='paused'?'Paused':'Auto-scroll'}</span>
    </button>
    <div className="journey-film-sticky" ref={stage} data-selected={selected} data-scene-ready={Boolean(ready[selected])}>
      <FilmBoundary onFailure={onFilmFailure}><Suspense fallback={<p className="journey-film-loading" role="status">Loading Journey…</p>}><JourneyFilmScene selected={selected} timeline={timeline} active={active && inView} motion={motion} dark={dark} compact={compact} onReady={onReady} onError={onError} onCameraProgress={onCameraProgress} /></Suspense></FilmBoundary>
      <div className="journey-cut-veil" aria-hidden="true" />
      {!filmFailed && !ready[selected] && !errors[selected] && <p className="journey-film-loading" role="status">Loading {journeyScenes[selected].label}…</p>}
      {!filmFailed && errors[selected] && <p className="journey-film-loading" role="status">This model could not load. Scroll to continue reading.</p>}
      <div className="journey-vertical-progress" aria-hidden="true"><span>{String(selected+1).padStart(2,'0')}</span><i/><span>{String(chapters.length).padStart(2,'0')}</span></div>
    </div>
    <div className="journey-film-heading"><h1 id="rain-page-title" tabIndex={-1}>{copy.milestones.header.title}</h1><p>{copy.milestones.header.tagline}</p></div>
    {chapters.map((chapter,index)=><article className="journey-film-chapter" key={chapter.id} ref={element=>{sections.current[index]=element;}} aria-labelledby={`journey-title-${chapter.id}`} data-chapter-index={index}>
      <div className="journey-film-intro"><div className="journey-film-caption"><p>{String(index+1).padStart(2,'0')} <span>/ {String(chapters.length).padStart(2,'0')}</span></p><h2 id={`journey-title-${chapter.id}`}>{chapter.title}</h2>{index===0 && <span className="journey-scroll-hint">{autoplay.requested && motion?'Scroll to take control':'Scroll to explore'}<InterfaceIcon name="arrow-down" /></span>}</div></div>
      <div className="journey-film-copy"><div className="rain-prose">{chapter.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div>{chapter.badges && <div className="rain-tags">{chapter.badges.map(badge=><span key={badge}>{badge}</span>)}</div>}{chapter.ctaUrl && <ExternalLink href={chapter.ctaUrl}>{chapter.ctaLabel}</ExternalLink>}</div>
    </article>)}
  </section>;
}
