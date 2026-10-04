import { createContext, useContext, useEffect, useRef, useState } from 'react';
import copy from '../../data/siteCopy.json';
import InterfaceIcon from './InterfaceIcon';
import ExternalLink from './ExternalLink';
import { createAudioOutput, setOutputVolume } from './audioOutput';
const MusicContext = createContext(null);
export const useRainMusic = () => useContext(MusicContext);
export function MusicProvider({ children, analysis }) {
  const audio = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(.7);
  const volumeRef = useRef(.7);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const track = copy.musicShowcase.tracks[0];
  useEffect(() => { const state = analysis.current; return () => { state.context?.close().catch(() => {}); }; }, [analysis]);
  const toggle = async () => {
    const player = audio.current;
    if (!player || pending.current) return;
    if (!player.paused) { player.pause(); return; }
    pending.current = true; setError('');
    try {
      if (!analysis.current.context && (window.AudioContext || window.webkitAudioContext)) {
        const Context = window.AudioContext || window.webkitAudioContext;
        Object.assign(analysis.current,createAudioOutput(player,Context,volumeRef.current));
      }
      await analysis.current.context?.resume();
      setOutputVolume(analysis.current,player,volumeRef.current,true);
      await player.play();
    } catch { setError('Playback could not start. Try again or listen on SoundCloud.'); }
    finally { pending.current = false; }
  };
  const seek = value => { if (audio.current && duration) {audio.current.currentTime = value;setTime(value);} };
  const adjustVolume = value => {
    if(!Number.isFinite(value))return;
    const next=Math.max(0,Math.min(1,value));
    if(next===volumeRef.current)return;
    volumeRef.current=next;setVolume(next);
    setOutputVolume(analysis.current,audio.current,next);
  };
  const value = { track, playing, time, duration, volume, error, toggle, seek, adjustVolume };
  return <MusicContext.Provider value={value}>{children}<audio ref={audio} src={track.url} preload="none" onPlay={() => {setPlaying(true); analysis.current.playing = true;}} onPause={() => {setPlaying(false); analysis.current.playing = false;}} onEnded={() => {setPlaying(false); analysis.current.playing = false;}} onLoadedMetadata={e => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)} onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onError={() => {setPlaying(false); analysis.current.playing = false; setError('This track could not load. You can listen on SoundCloud.');}} /></MusicContext.Provider>;
}
function formatTime(value) { const t = Number.isFinite(value) ? Math.floor(value) : 0; return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; }
export function MusicControls({ compact = false }) {
  const music = useRainMusic();
  const adjustVolume = event => music.adjustVolume(Number(event.currentTarget.value));
  if (compact) return <div className="rain-mini-music"><button aria-label={music.playing ? 'Pause music' : 'Play music'} onClick={music.toggle} className={music.playing ? 'is-playing' : ''}><InterfaceIcon name={music.playing ? 'pause' : 'music'} /></button>{music.error && <p role="alert">{music.error}</p>}</div>;
  return <section className="rain-player" aria-label="Music player"><div className="rain-track"><span className="rain-record-etch" aria-hidden="true" /><div><h2>{music.track.title}</h2><p>{music.track.artist} <span>{music.track.genre}</span></p></div><button className="rain-play" onClick={music.toggle} aria-label={music.playing ? 'Pause Broken' : 'Play Broken'}><InterfaceIcon name={music.playing ? 'pause' : 'play'} /></button></div><label className="rain-seek"><span className="rain-sr-only">Playback position</span><input type="range" min="0" max={music.duration || 1} step=".1" value={music.time} disabled={!music.duration} onChange={e => music.seek(Number(e.target.value))} /></label><div className="rain-track-times"><span>{formatTime(music.time)}</span><span>{formatTime(music.duration)}</span></div><div className="rain-player-bottom"><ExternalLink href={music.track.soundcloudUrl} className="rain-music-link">{music.track.soundcloudLabel}</ExternalLink><label><span>Volume <output aria-hidden="true">{Math.round(music.volume*100)}%</output></span><input aria-label="Volume" aria-valuetext={`${Math.round(music.volume*100)} percent`} type="range" min="0" max="1" step=".01" value={music.volume} onInput={adjustVolume} onChange={adjustVolume} /></label></div>{music.error && <p role="alert" className="rain-audio-error">{music.error}</p>}</section>;
}
