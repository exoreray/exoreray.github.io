import { isVideo } from './photographyLibrary';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
export const COLOR_INK = { Blue:'#598da8', Green:'#6b927c', Red:'#b87070', Orange:'#be9064', Yellow:'#b5a266', Pink:'#b9819d', Purple:'#9585ab', Brown:'#9e8871', Black:'#75828c', Gray:'#8b989e', Monochrome:'#929b9e' };
const hash = value => [...value].reduce((h,c)=>Math.imul(h ^ c.charCodeAt(0),16777619)>>>0,2166136261);
export const openPhotoLabel = p => 'Open' + (isVideo(p) ? ' video' : '') + ' ' + (p.title || p.alt);

export function cloudLayout(photos) {
  return photos.map((photo,index)=>{
    const seed=hash(photo.id), angle=index*GOLDEN_ANGLE+(seed%17)/85;
    const radius=index<3 ? 0 : (photos.length<=24?160:260)+Math.sqrt(index-2)*(photos.length<=24?85:114);
    const hero=[[-175,-65],[210,115],[75,-245]][index];
    const width=index<3 ? [265,245,160][index] : 108+seed%65;
    const ratio=(photo.atlasHeight || photo.height || 100)/(photo.atlasWidth || photo.width || 100);
    const height=Math.min(width*ratio,index<3?250:204);
    return {photo,x:hero?hero[0]:Math.cos(angle)*radius*1.12,y:hero?hero[1]:Math.sin(angle)*radius*.85,width:Math.max(76,height/ratio),height,rotation:((seed%25)-12)/5};
  });
}

export function layoutBounds(nodes) {
  if(!nodes.length)return {minX:-200,maxX:200,minY:-160,maxY:160};
  return {minX:Math.min(...nodes.map(n=>n.x-n.width/2)),maxX:Math.max(...nodes.map(n=>n.x+n.width/2)),minY:Math.min(...nodes.map(n=>n.y-n.height/2)),maxY:Math.max(...nodes.map(n=>n.y+n.height/2))};
}

export function fitCamera(bounds,size,padding=50) {
  const scale=Math.max(.12,Math.min(1.2,(size.width-padding*2)/(bounds.maxX-bounds.minX),(size.height-padding*2)/(bounds.maxY-bounds.minY)));
  return {scale,x:size.width/2-(bounds.minX+bounds.maxX)/2*scale,y:size.height/2-(bounds.minY+bounds.maxY)/2*scale};
}
export function zoomCamera(camera,factor,point) {
  const scale=Math.max(.12,Math.min(2.4,camera.scale*factor)),ratio=scale/camera.scale;
  return {scale,x:point.x-(point.x-camera.x)*ratio,y:point.y-(point.y-camera.y)*ratio};
}

export function matchesFocus(photo,focus) {
  if(!focus)return true;
  if(focus.kind==='year')return photo.date?.startsWith(focus.value);
  if(focus.kind==='month')return photo.date?.startsWith(focus.value);
  if(focus.kind==='date')return photo.date===focus.value;
  if(focus.kind==='timeOfDay')return focus.value==='Unrecorded' ? !photo.timeOfDay : photo.timeOfDay===focus.value;
  const value=photo[focus.kind];return Array.isArray(value)?value.includes(focus.value):value===focus.value;
}

export function atlasWords(photos,kind) {
  const groups=new Map();
  for(const photo of photos){
    let values=kind==='year' ? [photo.date?.slice(0,4) || 'Undated'] : kind==='timeOfDay' ? [photo.timeOfDay || 'Unrecorded'] : Array.isArray(photo[kind]) ? photo[kind] : [photo[kind]];
    for(const value of values.filter(Boolean)){
      if(!groups.has(value))groups.set(value,{value,kind,label:value==='Unrecorded'?'hour unrecorded':value.toLowerCase(),photos:[]});
      groups.get(value).photos.push(photo);
    }
  }
  const result=[...groups.values()];
  if(kind==='colors')for(const group of result)group.photos.sort((a,b)=>(b.colorCoverage?.[group.value] || 0)-(a.colorCoverage?.[group.value] || 0));
  return result.sort((a,b)=>kind==='year' ? b.value.localeCompare(a.value) : b.photos.length-a.photos.length);
}

export function wordPages(words,size) {
  const count=size.width<600&&size.height<370&&words.length>12?8:Math.max(1,words.length);
  return Array.from({length:Math.max(1,Math.ceil(words.length/count))},(_,i)=>words.slice(i*count,(i+1)*count));
}

export function packWords(words,size,visual=false) {
  const width=Math.max(240,size.width),height=Math.max(200,size.height),max=Math.max(1,...words.map(w=>w.photos.length));
  const gap=width<600?5:12;
  for(let attempt=0;attempt<14;attempt++){
    const placed=[],factor=Math.pow(.88,attempt);
    for(let index=0;index<words.length;index++){
      const word=words[index],font=Math.max(18,((width<600?23:29)+Math.sqrt(word.photos.length/max)*(width<600?25:48))*factor);
      const w=Math.max(visual?75:44,word.label.length*font*.46+18),h=Math.max(44,font*1.15+12+(visual?18:0));
      let found;
      for(let step=0;step<2400;step++){
        const angle=step*.31+index*.7,radius=Math.sqrt(step)*7.4;
        const x=width/2+Math.cos(angle)*radius*(width/height),y=height/2+Math.sin(angle)*radius;
        if(x-w/2<18 || x+w/2>width-18 || y-h/2<48 || y+h/2>height-18)continue;
        if(placed.some(p=>Math.abs(x-p.x)<(w+p.w)/2+gap && Math.abs(y-p.y)<(h+p.h)/2+gap))continue;
        found={...word,x,y,w,h,font};break;
      }
      if(!found)break;placed.push(found);
    }
    if(placed.length===words.length)return placed;
  }
  // Compact screens keep every term reachable at a readable size.
  const rows=[],items=words.map(word=>({...word,font:18,w:Math.max(visual?75:44,word.label.length*18*.46+18),h:44})).sort((a,b)=>b.w-a.w);
  for(const item of items){let row=rows.find(r=>r.width+6+item.w<=width-36);if(!row){row={width:0,items:[]};rows.push(row);}row.width+=item.w+(row.items.length?6:0);row.items.push(item);}
  const startY=48+Math.max(0,(height-66-rows.length*44-(rows.length-1)*6)/2);
  return rows.flatMap((row,index)=>{let x=(width-row.width)/2;return row.items.map(item=>{const result={...item,x:x+item.w/2,y:startY+22+index*50};x+=item.w+6;return result;});});
}
