import {filterLibrary,groupLibrary,dateLabel} from './photographyLibrary';
const photos=[
 {id:'older',date:'2019-01-21',category:'Nature',subjects:['Water'],colors:['Blue'],vibes:['Calm']},
 {id:'newer',date:'2026-11-22',category:'Nature',subjects:['Animals'],colors:['Brown'],vibes:['Calm']},
 {id:'clip',date:'2024-03-24',category:'Nature',subjects:['Water'],colors:['Blue','Green'],vibes:['Cinematic'],type:'video',videoSrc:'/clip.mp4'},
 {id:'undated',category:'Places',subjects:['Architecture'],colors:['Gray'],vibes:['Minimal']},
];
test('facets intersect and reset without losing works',()=>{
 expect(filterLibrary(photos,{subject:'Water',color:'Blue'}).map(p=>p.id)).toEqual(['older','clip']);
 expect(filterLibrary(photos,{subject:'Water',vibe:'Calm'}).map(p=>p.id)).toEqual(['older']);
 expect(filterLibrary(photos,{year:'2024',mediaType:'Videos'}).map(p=>p.id)).toEqual(['clip']);
 expect(filterLibrary(photos,{color:'Pink'})).toHaveLength(0);
 expect(filterLibrary(photos,{})).toHaveLength(4);
});
test('date ranges and chronological sort keep unknown dates distinct',()=>{
 expect(filterLibrary(photos,{from:'2024-01-01',to:'2025-12-31'}).map(p=>p.id)).toEqual(['clip']);
 expect(filterLibrary(photos,{},'Newest').map(p=>p.id)).toEqual(['newer','clip','older','undated']);
 expect(filterLibrary(photos,{},'Oldest').map(p=>p.id)).toEqual(['older','clip','newer','undated']);
 expect(filterLibrary(photos,{year:'Undated'}).map(p=>p.id)).toEqual(['undated']);
 expect(dateLabel(photos[0])).toBe('Jan 21, 2019');
 expect(dateLabel(photos[3])).toBe('Date not recorded');
 expect(filterLibrary([{id:'latePost',date:'2026-10-06',sharedAt:'2026-10-07T05:46:05Z'},{id:'nextDayStory',date:'2026-10-07'}],{},'Newest').map(p=>p.id)).toEqual(['nextDayStory','latePost']);
});
test('grouping includes every work once, with unknown dates last and stable within-group order',()=>{
 for(const by of ['Year','Month','Date','Time','Topic','Subject','Color','Vibe']){
  const groups=groupLibrary(photos,by);const ids=groups.flatMap(g=>g.photos.map(p=>p.id));
  expect(new Set(ids).size).toBe(4);expect(ids).toHaveLength(4);
 }
 expect(groupLibrary(photos,'Year').map(g=>g.key)).toEqual(['2026','2024','2019','undated']);
 expect(groupLibrary(photos,'Year','Oldest').map(g=>g.key)).toEqual(['2019','2024','2026','undated']);
 expect(groupLibrary(photos,'Subject').find(g=>g.key==='Water').photos.map(p=>p.id)).toEqual(['older','clip']);
});

test('posting-time groups preserve unavailable story times',()=>{
 const timed=[{...photos[0],timeOfDay:'Evening'},photos[1],{...photos[2],timeOfDay:'Morning'}];
 expect(filterLibrary(timed,{time:'Evening'}).map(p=>p.id)).toEqual(['older']);
 expect(filterLibrary(timed,{time:'Unrecorded'}).map(p=>p.id)).toEqual(['newer']);
 expect(groupLibrary(timed,'Time').map(g=>g.key)).toEqual(['Morning','Evening','Time not recorded']);
});
