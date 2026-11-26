import { useEffect, useRef, useState } from 'react';
import photographs from '../data/photographs.json';
import './PhotographyGallery.css';

function PhotoViewer({ photos, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const dialog = useRef(null);
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

  const move = delta => setIndex(current => (current + delta + photos.length) % photos.length);
  return (
    <dialog
      className="photo-viewer"
      ref={dialog}
      aria-label="Photograph viewer"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      }}
    >
      <div className="photo-viewer__content">
        <button className="photo-viewer__close" onClick={onClose}>Close</button>
        <figure>
          <img src={photo.full || photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
          <figcaption><span>{photo.title || photo.alt}</span><span>{index + 1} / {photos.length}</span></figcaption>
        </figure>
        <nav aria-label="Browse photographs">
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
  const [selected, setSelected] = useState(null);
  const categories = ['All', ...new Set(photos.map(photo => photo.category).filter(Boolean))];
  const visible = category === 'All' ? photos : photos.filter(photo => photo.category === category);
  const featured = visible[0];

  return (
    <section className="photography" aria-labelledby="rain-page-title">
      <div className="photography__intro">
        <h1 id="rain-page-title" tabIndex={-1}>Photography</h1>
        <p>Places, light, and the moments I want to keep.</p>
        <a href="https://www.instagram.com/exoreray/" target="_blank" rel="noopener noreferrer">@exoreray</a>
      </div>
      {!photos.length ? <p className="photography__empty">The collection is being prepared.</p> : <>
        {categories.length > 2 && <nav className="photography__filters" aria-label="Photography categories">{categories.map(item =>
          <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
        )}</nav>}
        <p className="photography__count" aria-live="polite">{visible.length} {visible.length === 1 ? 'photograph' : 'photographs'}</p>
        <div className="photography__collection">
          {featured && <button className="photography__featured" onClick={() => setSelected(0)} aria-label={`Open ${featured.title || featured.alt}`}>
            <img src={featured.src} alt={featured.alt} width={featured.width} height={featured.height} fetchpriority="high" />
            {featured.title && <span>{featured.title}</span>}
          </button>}
          <div className="photography__grid">{visible.slice(1).map((photo, i) =>
            <button key={photo.id} className="photography__photo" onClick={() => setSelected(i + 1)} aria-label={`Open ${photo.title || photo.alt}`}>
              <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
              {photo.title && <span>{photo.title}</span>}
            </button>
          )}</div>
        </div>
      </>}
      {selected !== null && <PhotoViewer photos={visible} initialIndex={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
