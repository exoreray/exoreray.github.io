import { advanceViscousDrag, createViscousDrag, MAX_DRAG } from './viscousDrag';

test('first contact has no impulse; motion pulls material in its own direction',()=>{
  const s=createViscousDrag();advanceViscousDrag(s,-2,0,true,1/60);
  expect(s.x).toBe(0);expect(s.y).toBe(0);
  for(let i=1;i<=60;i++)advanceViscousDrag(s,-2+i/30,0,true,1/60);
  expect(s.x).toBeGreaterThan(.1);expect(s.y).toBe(0);
  expect(s.x).toBeLessThan(MAX_DRAG);
});

test('release relaxes monotonically without reversing or bouncing',()=>{
  const s=createViscousDrag();advanceViscousDrag(s,0,0,true,1/60);
  for(let i=0;i<40;i++)advanceViscousDrag(s,2,0,true,1/60);
  for(let i=0;i<300;i++){
    const previous=s.x;advanceViscousDrag(s,2,0,false,1/60);
    expect(s.x).toBeGreaterThanOrEqual(0);expect(s.x).toBeLessThanOrEqual(previous);
  }
  expect(s.x).toBeLessThan(.001);
});

test('a held pointer settles without periodic peaks',()=>{
  const s=createViscousDrag();advanceViscousDrag(s,0,0,true,1/60);
  let previous=0,hasStartedFalling=false;
  for(let i=0;i<360;i++){
    advanceViscousDrag(s,2,0,true,1/60);
    if(s.x<previous)hasStartedFalling=true;
    if(hasStartedFalling)expect(s.x).toBeLessThanOrEqual(previous);
    expect(s.x).toBeGreaterThanOrEqual(0);previous=s.x;
  }
  expect(s.x).toBeLessThan(.001);
});

test('drag is bounded under abrupt reversals and matches 60/120 Hz timing',()=>{
  const run=rate=>{
    const s=createViscousDrag();advanceViscousDrag(s,0,0,true,0);
    for(let i=0;i<rate*2;i++){
      advanceViscousDrag(s,i<rate?50:-50,30,true,1/rate);
      expect(Math.hypot(s.x,s.y)).toBeLessThanOrEqual(MAX_DRAG);
    }
    return s;
  };
  const a=run(60),b=run(120);
  expect(a.x).toBeCloseTo(b.x,6);expect(a.y).toBeCloseTo(b.y,6);
});
