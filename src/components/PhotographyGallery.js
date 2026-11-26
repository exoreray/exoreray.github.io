import { useEffect, useRef, useState } from 'react';
import photographs from '../data/photographs.json';
import './PhotographyGallery.css';

const isVideo = photo => photo.type === 'video' && Boolean(photo.videoSrc);
const openLabel = photo => `Open${isVideo(photo) ? ' video' : ''} ${photo.title || photo.alt}`;

function PhotoViewer({ photos, initialIndex, onClose }) {
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
          <figcaption><span>{photo.title || photo.alt}</span><span>{index + 1} / {photos.length}</span></figcaption>
        </figure>
        <nav aria-label="Browse collection">
          <button onClick={() => move(-1)} disabled={photos.length < 2}>Previous</button>
          {photo.sourceUrl && <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">View on Instagram</a>}
          <button onClick={() => move(1)} disabled={photos.length < 2}>Next</button>
        </nav>
      </div>
    </dialog>
  );
}

export default function PhotographyGallery({ photos = photographs }) {
  const [category, setCategory] = useState('All');
  const [mediaType, setMediaType] = useState('All media');
  const [selected, setSelected] = useState(null);
  const categories = ['All', ...new Set(photos.map(photo => photo.category).filter(Boolean))];
  const visible = photos.filter(photo => (category === 'All' || photo.category === category) &&
    (mediaType === 'All media' || (mediaType === 'Videos' ? isVideo(photo) : !isVideo(photo))));
  const videoCount = visible.filter(isVideo).length;
  const countLabel = mediaType === 'Videos' || (videoCount === visible.length && videoCount) ? (visible.length === 1 ? 'video' : 'videos') :
    videoCount ? 'works' : (visible.length === 1 ? 'photograph' : 'photographs');
  const featured = visible[0];

  return (
    <section className="photography" aria-labelledby="rain-page-title">
      <div className="photography__intro">
        <h1 id="rain-page-title" tabIndex={-1}>Photography</h1>
        <p>Photographs and short films from the moments I want to keep.</p>
        <a href="https://www.instagram.com/exoreray/" target="_blank" rel="noopener noreferrer">@exoreray</a>
      </div>
      {!photos.length ? <p className="photography__empty">The collection is being prepared.</p> : <>
        {categories.length > 2 && <nav className="photography__filters" aria-label="Photography categories">{categories.map(item =>
          <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
        )}</nav>}
        {photos.some(isVideo) && <nav className="photography__filters photography__media-filters" aria-label="Media type">
          {['All media', 'Photographs', 'Videos'].map(type => <button key={type} aria-pressed={mediaType === type} onClick={() => setMediaType(type)}>{type}</button>)}
        </nav>}
        <p className="photography__count" aria-live="polite">{visible.length} {countLabel}</p>
        {!visible.length && <p>No {mediaType === 'Videos' ? 'videos' : 'photographs'} in this category.</p>}
        <div className="photography__collection">
          {featured && <button className="photography__featured" onClick={() => setSelected(0)} aria-label={openLabel(featured)}>
            <span className="photography__image"><img src={featured.src} alt={featured.alt} width={featured.width} height={featured.height} fetchpriority="high" />
              {isVideo(featured) && <span className="photography__video-badge">Video</span>}</span>
            {featured.title && <span>{featured.title}</span>}
          </button>}
          <div className="photography__grid">{visible.slice(1).map((photo, i) =>
            <button key={photo.id} className="photography__photo" onClick={() => setSelected(i + 1)} aria-label={openLabel(photo)}>
              <span className="photography__image"><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
                {isVideo(photo) && <span className="photography__video-badge">Video</span>}</span>
              {photo.title && <span>{photo.title}</span>}
            </button>
          )}</div>
        </div>
      </>}
      {selected !== null && <PhotoViewer photos={visible} initialIndex={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
