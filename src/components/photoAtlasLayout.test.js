import photographs from '../data/photographs.json';
import {cloudLayout,layoutBounds,fitCamera,zoomCamera,atlasWords,packWords,wordPages,matchesFocus} from './photoAtlasLayout';
test('the entire collection has a deterministic finite position, with intact image proportions',()=>{
 const layout=cloudLayout(photographs);expect(layout).toEqual(cloudLayout(photographs));expect(new Set(layout.map(n=>n.photo.id)).size).toBe(photographs.length);
 for(const n of layout){for(const key of ['x','y','width','height','rotation'])expect(Number.isFinite(n[key])).toBe(true);expect(n.width).toBeGreaterThan(0);expect(n.height).toBeGreaterThan(0);}
});
test('every term stays reachable with readable, non-overlapping touch targets',()=>{
 for(const kind of ['subjects','vibes','category','year','colors','timeOfDay'])for(const size of [{width:288,height:302},{width:358,height:500},{width:1400,height:650}]){
  const words=atlasWords(photographs,kind),pages=wordPages(words,size);expect(pages.flat().map(w=>w.value).sort()).toEqual(words.map(w=>w.value).sort());
  for(const page of pages){const field={...size,height:size.height-(pages.length>1?50:0)},placed=packWords(page,field,kind==='year'||kind==='colors');expect(placed).toHaveLength(page.length);
   for(let i=0;i<placed.length;i++){const a=placed[i];expect(a.font).toBeGreaterThanOrEqual(18);expect(a.x-a.w/2).toBeGreaterThanOrEqual(0);expect(a.x+a.w/2).toBeLessThanOrEqual(field.width);expect(a.y+a.h/2).toBeLessThanOrEqual(field.height);
    for(const b of placed.slice(i+1))expect(Math.abs(a.x-b.x)>=(a.w+b.w)/2 || Math.abs(a.y-b.y)>=(a.h+b.h)/2).toBe(true);
   }
  }
 }
});
test('camera fit includes the entire constellation and zoom preserves its pointed position',()=>{
 const bounds=layoutBounds(cloudLayout(photographs)),size={width:1000,height:600},camera=fitCamera(bounds,size,30);
 expect(camera.x+bounds.minX*camera.scale).toBeGreaterThanOrEqual(29);expect(camera.x+bounds.maxX*camera.scale).toBeLessThanOrEqual(971);
 const point={x:200,y:150},world={x:(point.x-camera.x)/camera.scale,y:(point.y-camera.y)/camera.scale},next=zoomCamera(camera,1.5,point);
 expect(next.x+world.x*next.scale).toBeCloseTo(point.x);expect(next.y+world.y*next.scale).toBeCloseTo(point.y);
});
test('word and year explorations select actual work metadata, preserving unknown hours',()=>{
 const p={date:'2024-03-24',subjects:['Water'],colors:['Blue'],vibes:['Calm']};
 expect(matchesFocus(p,{kind:'year',value:'2024'})).toBe(true);expect(matchesFocus(p,{kind:'date',value:'2024-03-25'})).toBe(false);expect(matchesFocus(p,{kind:'colors',value:'Blue'})).toBe(true);expect(matchesFocus(p,{kind:'timeOfDay',value:'Unrecorded'})).toBe(true);
});

test('prints form a dense, cohesive collage rather than an outward scattered field',()=>{
 const nodes=cloudLayout(photographs),b=layoutBounds(nodes),area=nodes.reduce((total,n)=>total+n.width*n.height,0);
 expect(area/((b.maxX-b.minX)*(b.maxY-b.minY))).toBeGreaterThan(.55);
 expect(nodes[0].x).toBe(0);expect(nodes[0].y).toBe(0);
 for(const n of nodes)expect(n.width/n.height).toBeCloseTo((n.photo.atlasWidth || n.photo.width)/(n.photo.atlasHeight || n.photo.height),6);
 const size={width:358,height:500},camera=fitCamera(b,size,28);
 expect(camera.x+b.minX*camera.scale).toBeGreaterThanOrEqual(27);expect(camera.x+b.maxX*camera.scale).toBeLessThanOrEqual(331);
});
