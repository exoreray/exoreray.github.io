import { useEffect, useRef, useState } from 'react';
import photographs from '../data/photographs.json';
import './PhotographyGallery.css';

import { isVideo, dateLabel, uniqueValues, emptyFilters, filterLibrary, groupLibrary } from './photographyLibrary';
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
          <figcaption><span>{photo.title || photo.alt}<small>{dateLabel(photo)}{photo.sharedTime ? ` · ${photo.sharedTime} Pacific` : ''}{photo.date ? " · Shared on Instagram" : ""}</small>{photo.subjects && <small>{[...photo.subjects,...(photo.vibes || []),...(photo.colors || [])].join(' · ')}</small>}{photo.sourceNote && <small>{photo.sourceNote}</small>}</span><span>{index + 1} / {photos.length}</span></figcaption>
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

function GalleryTile({photo, featured, onOpen}) {
  return <button className={featured ? 'photography__featured' : 'photography__photo'} onClick={onOpen} aria-label={openLabel(photo)}>
    <span className="photography__image"><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading={featured ? 'eager' : 'lazy'} decoding="async" />
      {isVideo(photo) && <span className="photography__video-badge">Video</span>}</span>
    <span className="photography__caption"><span>{photo.title || photo.alt}</span>{photo.date && <time dateTime={photo.date}>{dateLabel(photo)}</time>}</span>
  </button>;
}

export default function PhotographyGallery({ photos = photographs }) {
  const [filters,setFilters]=useState(emptyFilters);
  const [groupBy,setGroupBy]=useState('None');
  const [sort,setSort]=useState('Curated');
  const [selected,setSelected]=useState(null);
  const setFilter=(key,value)=>setFilters(current=>({...current,[key]:value}));
  const categories=['All',...new Set(photos.map(p=>p.category).filter(Boolean))];
  const filtered=filterLibrary(photos,filters,sort);
  const groups=groupLibrary(filtered,groupBy,sort);
  const visible=groups.flatMap(group=>group.photos);
  const videoCount=visible.filter(isVideo).length;
  const countLabel=filters.mediaType==='Videos' || (videoCount===visible.length && videoCount) ? (visible.length===1?'video':'videos') : videoCount?'works':visible.length===1?'photograph':'photographs';
  const active=Object.entries(filters).filter(([key,value])=>value!==emptyFilters[key]).length;
  const years=uniqueValues(photos,'year').reverse();
  const reset=()=>{setFilters(emptyFilters);setGroupBy('None');setSort('Curated');};
  const select=(label,value,onChange,options)=> <label className="photography__field"><span>{label}</span><select aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{options.map(option=><option key={option} value={option}>{option}</option>)}</select></label>;

  return <section className="photography" aria-labelledby="rain-page-title">
    <div className="photography__intro">
      <p className="photography__eyebrow">The visual archive{years.length ? ` · ${years[years.length-1]}—${years[0]}` : ''}</p>
      <h1 id="rain-page-title" tabIndex={-1}>Photography</h1>
      <p>Places, people, and the moments in between.</p>
      <a href="https://www.instagram.com/exoreray/" target="_blank" rel="noopener noreferrer">@exoreray</a>
    </div>
    {!photos.length ? <p className="photography__empty">The collection is being prepared.</p> : <>
      <div className="photography__explore">
        <div className="photography__explore-heading"><span>Find a different way in.</span>{(active>0 || groupBy!=='None' || sort!=='Curated') && <button onClick={reset}>Reset view</button>}</div>
        {categories.length>2 && <nav className="photography__filters" aria-label="Photography categories">{categories.map(item=><button key={item} aria-pressed={filters.category===item} onClick={()=>setFilter('category',item)}>{item}</button>)}</nav>}
        <div className="photography__facets">
          {select('Year',filters.year,value=>setFilter('year',value),['All',...years,...(photos.some(p=>!p.date)?['Undated']:[])])}
          {select('Subject',filters.subject,value=>setFilter('subject',value),['All',...uniqueValues(photos,'subjects')])}
          {select('Color',filters.color,value=>setFilter('color',value),['All',...uniqueValues(photos,'colors')])}
          {select('Vibe',filters.vibe,value=>setFilter('vibe',value),['All',...uniqueValues(photos,'vibes')])}
          {select('Group by',groupBy,setGroupBy,['None','Year','Month','Date','Time','Topic','Subject','Color','Vibe'])}
          {select('Sort',sort,setSort,['Curated','Newest','Oldest'])}
        </div>
        <div className="photography__toolbar">
          {photos.some(isVideo) && <nav className="photography__filters photography__media-filters" aria-label="Media type">{['All media','Photographs','Videos'].map(type=><button key={type} aria-pressed={filters.mediaType===type} onClick={()=>setFilter('mediaType',type)}>{type}</button>)}</nav>}
          <details className="photography__dates"><summary>Date &amp; time{filters.from || filters.to || filters.time!=='All' ? ' · active' : ''}</summary><div>
            <label>From<input aria-label="From date" type="date" value={filters.from} onChange={e=>setFilter('from',e.target.value)} /></label>
            <label>To<input aria-label="To date" type="date" value={filters.to} onChange={e=>setFilter('to',e.target.value)} /></label>
            {select('Time shared',filters.time,value=>setFilter('time',value),['All','Morning','Afternoon','Evening','Night','Unrecorded'])}
            <p>Shared dates and times · Pacific time. Story dates have no time recorded.</p>
          </div></details>
        </div>
      </div>
      <div className="photography__results"><p className="photography__count" aria-live="polite">{visible.length} {countLabel}</p><span>{active>0 ? `${active} ${active===1?'filter':'filters'} applied` : 'The complete collection'}</span></div>
      {!visible.length && <div className="photography__no-results"><p>No works match this combination.</p><button onClick={reset}>Clear filters</button></div>}
      <div className="photography__collection">{groups.map(group=><section key={group.key} className="photography__group" aria-label={groupBy==='None' ? 'All works' : `${groupBy}: ${group.label}`}>
        {groupBy!=='None' && <div className="photography__group-heading"><h2>{group.label}</h2><span>{group.photos.length} {group.photos.length===1?'work':'works'}</span></div>}
        {groupBy==='None' && group.photos[0] && <GalleryTile photo={group.photos[0]} featured onOpen={()=>setSelected(0)} />}
        <div className="photography__grid">{(groupBy==='None'?group.photos.slice(1):group.photos).map(photo=><GalleryTile key={photo.id} photo={photo} onOpen={()=>setSelected(visible.indexOf(photo))} />)}</div>
      </section>)}</div>
    </>}
    {selected!==null && <PhotoViewer photos={visible} initialIndex={selected} onClose={()=>setSelected(null)} />}
  </section>;
}
