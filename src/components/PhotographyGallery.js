import { useEffect, useRef, useState } from 'react';
import photographs from '../data/photographs.json';
import './PhotographyGallery.css';

import { isVideo, dateLabel } from './photographyLibrary';
import PhotoAtlas from './PhotoAtlas';

export function PhotoViewer({ photos, initialIndex, onClose, onExploreDate }) {
  const [index, setIndex] = useState(initialIndex);
  const dialog = useRef(null);
  const video = useRef(null);
  const photo = photos[index];

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.lenis?.stop();
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      window.lenis?.start();
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    const player = video.current;
    return () => {
      if (player) { player.pause(); player.removeAttribute('src'); player.load(); }
    };
  }, [photo.id]);

  const move = delta => setIndex(current => (current + delta + photos.length) % photos.length);
  return (
    <dialog
      className="photo-viewer"
      ref={dialog}
      aria-label="Media viewer"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={event => {
        if (event.target.tagName === 'VIDEO') return;
        if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      }}
    >
      <div className="photo-viewer__content">
        <button className="photo-viewer__close" onClick={onClose}>Close</button>
        <figure>
          {isVideo(photo) ? <video key={photo.id} ref={video} src={photo.videoSrc} poster={photo.full || photo.src} controls playsInline preload="metadata" aria-label={photo.title || photo.alt} /> :
            <img src={photo.full || photo.src} alt={photo.alt} width={photo.width} height={photo.height} />}
          <figcaption><span>{photo.title || photo.alt}<small>{onExploreDate && photo.date ? <button className="photo-viewer__date" onClick={()=>onExploreDate(photo.date)} aria-label={'Explore date '+dateLabel(photo)}>{dateLabel(photo)}</button> : dateLabel(photo)}{photo.sharedTime ? ` · ${photo.sharedTime} Pacific` : ''}{photo.date ? " · Shared on Instagram" : ""}</small>{photo.subjects && <small>{[...photo.subjects,...(photo.vibes || []),...(photo.colors || [])].join(' · ')}</small>}{photo.sourceNote && <small>{photo.sourceNote}</small>}</span><span>{index + 1} / {photos.length}</span></figcaption>
        </figure>
        {photo.date && onExploreDate && <button className="photo-viewer__date" onClick={()=>onExploreDate(photo.date)}>More from this day</button>}
        <nav aria-label="Browse collection">
          <button onClick={() => move(-1)} disabled={photos.length < 2}>Previous</button>
          {photo.sourceUrl && <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">View on Instagram</a>}
          <button onClick={() => move(1)} disabled={photos.length < 2}>Next</button>
        </nav>
      </div>
    </dialog>
  );
}

export default function PhotographyGallery({photos=photographs,motion=true}) {
  const [view,setView]=useState({mode:'wander',focus:null,wordKind:'subjects',media:'all'});
  const [selected,setSelected]=useState(null);
  return <>
    <PhotoAtlas photos={photos} view={view} setView={setView} motion={motion} onOpen={(collection,index)=>setSelected({photos:collection,index})} />
    {selected && <PhotoViewer photos={selected.photos} initialIndex={selected.index} onClose={()=>setSelected(null)} onExploreDate={date=>{setSelected(null);setView(current=>({...current,mode:'wander',focus:{kind:'date',value:date,label:dateLabel({date})},media:'all'}));}} />}
  </>;
}
