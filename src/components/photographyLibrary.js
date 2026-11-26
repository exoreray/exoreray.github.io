export const isVideo = photo => photo.type === 'video' && Boolean(photo.videoSrc);
export const dateLabel = photo => photo.date ? new Intl.DateTimeFormat('en', { year:'numeric', month:'short', day:'numeric', timeZone:'UTC' }).format(new Date(`${photo.date}T12:00:00Z`)) : 'Date not recorded';
export const uniqueValues = (photos, key) => [...new Set(photos.flatMap(p => key === 'year' ? (p.date ? [p.date.slice(0,4)] : []) : p[key] || []))].sort();
export const emptyFilters = { category:'All', mediaType:'All media', year:'All', subject:'All', color:'All', vibe:'All', time:'All', from:'', to:'' };

export function filterLibrary(photos, filters, sort = 'Curated') {
  const f={...emptyFilters,...filters};
  return photos.filter(p => (f.category === 'All' || p.category === f.category) &&
    (f.mediaType === 'All media' || (f.mediaType === 'Videos' ? isVideo(p) : !isVideo(p))) &&
    (f.year === 'All' || (f.year === 'Undated' ? !p.date : p.date?.startsWith(f.year))) &&
    (f.subject === 'All' || p.subjects?.includes(f.subject)) &&
    (f.color === 'All' || p.colors?.includes(f.color)) &&
    (f.vibe === 'All' || p.vibes?.includes(f.vibe)) &&
    (f.time === 'All' || (f.time === 'Unrecorded' ? !p.timeOfDay : p.timeOfDay === f.time)) &&
    (!f.from || (p.date && p.date >= f.from)) && (!f.to || (p.date && p.date <= f.to)))
    .map((p,index)=>({p,index})).sort((a,b)=>{
      if(sort==='Curated')return a.index-b.index;
      if(!a.p.date || !b.p.date)return Number(!a.p.date)-Number(!b.p.date) || a.index-b.index;
      const order=a.p.date.localeCompare(b.p.date) || (a.p.sharedAt && b.p.sharedAt ? a.p.sharedAt.localeCompare(b.p.sharedAt) : 0);
      return (sort==='Newest' ? -order : order) || a.index-b.index;
    }).map(x=>x.p);
}

export function groupLibrary(photos, by, sort = 'Curated') {
  if(by==='None')return [{key:'all',label:'All works',photos}];
  const groups=new Map();
  for(const photo of photos){
    let key,label;
    if(['Year','Month','Date'].includes(by)){
      key=photo.date ? photo.date.slice(0,by==='Year'?4:by==='Month'?7:10) : 'undated';
      label=key==='undated' ? 'Date not recorded' : by==='Year' ? key : by==='Date' ? dateLabel(photo) : new Intl.DateTimeFormat('en',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${key}-15T12:00:00Z`));
    } else if(by==='Time') {
      key=photo.timeOfDay || 'Time not recorded';label=key;
    } else {
      const field={Topic:'category',Subject:'subjects',Color:'colors',Vibe:'vibes'}[by];
      const value=photo[field];key=Array.isArray(value)?value[0]:value;key=key||'Unclassified';label=key;
    }
    if(!groups.has(key))groups.set(key,{key,label,photos:[]});groups.get(key).photos.push(photo);
  }
  const result=[...groups.values()];
  if(['Year','Month','Date'].includes(by))result.sort((a,b)=>a.key==='undated'?1:b.key==='undated'?-1:sort==='Oldest'?a.key.localeCompare(b.key):b.key.localeCompare(a.key));
  else if(by==='Time') {const order=['Morning','Afternoon','Evening','Night','Time not recorded'];result.sort((a,b)=>order.indexOf(a.key)-order.indexOf(b.key));}
  else result.sort((a,b)=>a.label.localeCompare(b.label));
  return result;
}
