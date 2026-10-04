import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import RainStudy from './RainStudy';

jest.mock('./JourneyFilmScene', () => {
  const React = require('react');
  return {__esModule:true,default:function MockJourneyFilmScene(props){React.useEffect(()=>props.onReady(props.selected),[props.selected,props.onReady]);return <canvas data-testid="journey-film-scene"/>;}};
});

jest.mock('../ImprovedLetterRain', () => ({paused}) => <><canvas data-testid="rain" data-active={String(!paused)} /><canvas data-testid="rain-impact" data-active={String(!paused)} /></>);
jest.mock('../CursorTrail', () => ({active}) => <canvas data-testid="original-cursor" data-active={String(active)} />);
jest.mock('../RippleEffect', () => ({active}) => <svg data-testid="original-click-ripple" data-active={String(active)} />);
jest.mock('./LivingSculpture', () => ({ __esModule: true, default: props => <canvas data-testid="sculpture" data-active={String(props.active)} data-shape={props.shape} /> }));

beforeEach(() => {
  window.scrollTo = jest.fn();
  window.matchMedia = jest.fn(() => ({matches:false,addEventListener:jest.fn(),removeEventListener:jest.fn()}));
  jest.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(function(){this.dispatchEvent(new Event('pause'));});
});
afterEach(() => {jest.restoreAllMocks();window.history.replaceState({},'','/');});
function mount(path='/') {
  return render(<MemoryRouter initialEntries={[path]}><ThemeContext.Provider value={{darkMode:true,toggleDarkMode:jest.fn()}}><RainStudy /></ThemeContext.Provider></MemoryRouter>);
}
function navigate(name) { fireEvent.click(within(screen.getByRole('navigation',{name:'All pages'})).getByRole('link',{name,exact:true})); }

test('a direct chapter link lands after its fractional pixel boundary',async()=>{
  window.history.replaceState({},'','/?chapter=apple');
  jest.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function(){
    return {top:this.tagName==='ARTICLE' && this.querySelector('#journey-title-apple') ? 8338.734375 : 0,height:1660,width:390,left:0,right:390,bottom:1660};
  });
  mount('/milestones');
  await waitFor(()=>expect(window.scrollTo).toHaveBeenCalledWith({top:8339,behavior:'instant'}));
});

test('all routes keep the same sculpture and audio elements while retaining source content',async()=>{
  mount();
  const sculpture=await screen.findByTestId('sculpture');
  const audio=document.querySelector('audio');
  expect(screen.getByRole('img',{name:'Ray Xi'})).toHaveAttribute('src','/rx-icon.png');
  expect(screen.queryByText(/Move gently/i)).not.toBeInTheDocument();
  expect(document.querySelector('.rain-water')).toBeNull();
  const cursor=screen.getByTestId('original-cursor');
  const ripple=screen.getByTestId('original-click-ripple');
  const rain=screen.getByTestId('rain');
  const impacts=screen.getByTestId('rain-impact');
  expect(document.querySelector('.rain-pointer-wake')).toBeNull();
  fireEvent.click(screen.getByRole('link',{name:'Works Thought & creation.'}));
  expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Works');
  const cases=[['Journey','Journey'],['Projects','Projects'],['Music Gallery','Music Gallery'],['Thoughts','Thoughts'],['Ability','Ability'],['Awards','Awards']];
  for(const [link,heading] of cases){
    navigate(link);
    expect(screen.getByRole('heading',{level:1})).toHaveTextContent(heading);
    if(link === 'Journey') await screen.findByTestId('journey-film-scene');
    if(link === 'Music Gallery')expect(document.querySelector('.rain-oscilloscope')).toBeNull();
    expect(screen.getByTestId('sculpture')).toBe(sculpture);
    expect(document.querySelector('audio')).toBe(audio);
    expect(screen.getByTestId('original-cursor')).toBe(cursor);
    expect(screen.getByTestId('original-click-ripple')).toBe(ripple);
    expect(screen.getByTestId('rain')).toBe(rain);
    expect(screen.getByTestId('rain-impact')).toBe(impacts);
  }
});

test('chapter, project, skill and award controls reveal their original content',async()=>{
  mount('/milestones'); await screen.findByTestId('sculpture'); await screen.findByTestId('journey-film-scene');
  expect(screen.getByRole('heading',{name:'Racing at the Edge'})).toBeInTheDocument();
  expect(screen.getByRole('link',{name:/VIEW F1 PROJECT/})).toHaveAttribute('href','https://eecs106b-banana-radiation.github.io/');
  navigate('Projects');
  fireEvent.click(screen.getByRole('button',{name:'FlowGPT PRODUCT'}));
  expect(screen.getByRole('link',{name:/Visit FlowGPT/})).toHaveAttribute('href','https://flowgpt.com/');
  navigate('Ability');
  fireEvent.click(screen.getByRole('button',{name:'Technical Skills'}));
  expect(screen.getByText('TypeScript')).toBeInTheDocument();
  expect(screen.getByText('iOS Development')).toBeInTheDocument();
  navigate('Awards');
  expect(document.querySelectorAll('.rain-awards-grid > a')).toHaveLength(8);
  expect(document.querySelectorAll('.rain-award-frame')).toHaveLength(8);
  expect(screen.getByRole('link',{name:/iF Design Award/})).toHaveAttribute('href','https://ifdesign.com/en/winner-ranking/project/livia/711833');
  fireEvent.click(screen.getByRole('button',{name:'Design',exact:true}));
  expect(document.querySelectorAll('.rain-awards-grid > a')).toHaveLength(6);
  fireEvent.click(screen.getByRole('button',{name:'Recognition',exact:true}));
  expect(document.querySelectorAll('.rain-awards-grid > a')).toHaveLength(2);
});

test('audio failure does not claim playback started',async()=>{
  jest.spyOn(HTMLMediaElement.prototype,'play').mockRejectedValue(new Error('blocked'));
  mount('/works/music');await screen.findByTestId('sculpture');
  fireEvent.click(screen.getByRole('button',{name:'Play Broken'}));
  expect(await screen.findAllByRole('alert')).toHaveLength(2);
  expect(screen.getByRole('button',{name:'Play Broken'})).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Pause Broken'})).not.toBeInTheDocument();
});

test('motion defaults on even with reduced-motion preferences, and can still be paused',async()=>{
  window.matchMedia.mockImplementation(() => ({matches:true,addEventListener:jest.fn(),removeEventListener:jest.fn()}));
  mount();const sculpture=await screen.findByTestId('sculpture');
  expect(sculpture).toHaveAttribute('data-active','true');
  fireEvent.click(screen.getByRole('button',{name:'Pause live motion'}));
  expect(sculpture).toHaveAttribute('data-active','false');
  expect(screen.getByTestId('rain')).toBeInTheDocument();
  for(const id of ['rain','rain-impact','original-cursor','original-click-ripple'])expect(screen.getByTestId(id)).toHaveAttribute('data-active','false');
  fireEvent.click(screen.getByRole('button',{name:'Enable live motion'}));
  expect(sculpture).toHaveAttribute('data-active','true');
  for(const id of ['rain','rain-impact','original-cursor','original-click-ripple'])expect(screen.getByTestId(id)).toHaveAttribute('data-active','true');
});

test('a hidden WebView resumes on lifecycle events without requiring visibilitychange or changing Motion preference',async()=>{
  let hidden=true;
  jest.spyOn(document,'hidden','get').mockImplementation(()=>hidden);
  mount();const sculpture=await screen.findByTestId('sculpture');
  expect(sculpture).toHaveAttribute('data-active','false');
  expect(screen.getByRole('button',{name:'Pause live motion'})).toHaveAttribute('aria-pressed','true');
  hidden=false;
  fireEvent(window,new Event('pageshow'));
  expect(sculpture).toHaveAttribute('data-active','true');
  for(const restore of ['focus','load']){
    // pagehide may precede the browser updating document.hidden.
    fireEvent(window,new Event('pagehide'));
    expect(sculpture).toHaveAttribute('data-active','false');
    fireEvent(window,new Event(restore));
    expect(sculpture).toHaveAttribute('data-active','true');
  }
  fireEvent.click(screen.getByRole('button',{name:'Pause live motion'}));
  fireEvent(window,new Event('pagehide'));
  fireEvent(window,new Event('pageshow'));
  expect(screen.getByRole('button',{name:'Enable live motion'})).toHaveAttribute('aria-pressed','false');
  for(const id of ['sculpture','rain','rain-impact','original-cursor','original-click-ripple'])expect(screen.getByTestId(id)).toHaveAttribute('data-active','false');
});

test('visibility is resampled after listeners attach if presentation changed during mount',async()=>{
  jest.spyOn(document,'hidden','get').mockReturnValueOnce(true).mockReturnValue(false);
  mount();
  expect(await screen.findByTestId('sculpture')).toHaveAttribute('data-active','true');
});


test('Journey is a vertical document with all eight original chapters and no model controls',async()=>{
  mount('/milestones');await screen.findByTestId('journey-film-scene');
  expect(screen.getAllByRole('article')).toHaveLength(8);
  expect(screen.getByRole('heading',{name:'Origins in Wangjing'})).toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'The Heart'})).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Rotate model'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Play journey'})).not.toBeInTheDocument();
  expect(document.querySelector('.journey-filmstrip')).toBeNull();
  expect(document.documentElement).not.toHaveClass('rain-home-locked');
});

test('home consumes one-finger movement, preserves pinch, and releases scrolling on navigation',async()=>{
  mount();await screen.findByTestId('sculpture');
  expect(document.documentElement).toHaveClass('rain-home-locked');
  const oneFinger = new Event('touchmove',{bubbles:true,cancelable:true});
  Object.defineProperty(oneFinger,'touches',{value:[{clientX:120,clientY:220}]});
  screen.getByRole('heading',{name:'Ray Xi'}).dispatchEvent(oneFinger);
  expect(oneFinger.defaultPrevented).toBe(true);
  const pinch = new Event('touchmove',{bubbles:true,cancelable:true});
  Object.defineProperty(pinch,'touches',{value:[{},{}]});
  screen.getByRole('heading',{name:'Ray Xi'}).dispatchEvent(pinch);
  expect(pinch.defaultPrevented).toBe(false);
  fireEvent.click(screen.getByRole('link',{name:'Journey Chapters of growth, transformation, and discovery.'}));
  await screen.findByTestId('journey-film-scene');
  expect(document.documentElement).not.toHaveClass('rain-home-locked');
  const reading = new Event('touchmove',{bubbles:true,cancelable:true});
  Object.defineProperty(reading,'touches',{value:[{}]});
  screen.getByRole('heading',{name:'Journey',exact:true}).dispatchEvent(reading);
  expect(reading.defaultPrevented).toBe(false);
});
