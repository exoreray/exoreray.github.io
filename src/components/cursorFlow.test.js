import { advanceCursorFlow, createCursorFlow, endCursorFlow, MAX_PARTICLES, MAX_PARTICLE_LIFETIME, moveCursorFlow, particleOpacity } from './cursorFlow';

test('first contact deposits at the pointer without connecting to an old origin',()=>{
  const flow=createCursorFlow();moveCursorFlow(flow,250,330);
  expect(flow.particles).toHaveLength(1);
  expect(flow.particles[0]).toMatchObject({x:250,y:330});
});

test('particles remain where deposited and disappear within the shorter lifetime',()=>{
  const flow=createCursorFlow();moveCursorFlow(flow,100,200);moveCursorFlow(flow,240,200);
  const positions=flow.particles.map(({x,y})=>({x,y}));
  for(let i=0;i<30;i++)advanceCursorFlow(flow,1/60);
  expect(flow.particles.map(({x,y})=>({x,y}))).toEqual(positions);
  expect(particleOpacity(flow.particles[0])).toBeGreaterThan(.3);
  expect(flow.particles.every(p=>p.duration<=MAX_PARTICLE_LIFETIME)).toBe(true);
  for(let i=0;i<75;i++)advanceCursorFlow(flow,1/60);
  expect(flow.particles).toHaveLength(0);expect(advanceCursorFlow(flow,0)).toBe(false);
});

test('density and placement depend on distance instead of event polling rate',()=>{
  const run=step=>{const flow=createCursorFlow();moveCursorFlow(flow,100,100);for(let x=step;x<=140;x+=step)moveCursorFlow(flow,100+x,100);return flow.particles;};
  const a=run(2),b=run(14);
  expect(a).toEqual(b);expect(a).toHaveLength(21);
  expect(a.every(p=>Math.abs(p.y-100)<4)).toBe(true);
});

test('stopping and starting a separate touch leaves no particles between strokes',()=>{
  const flow=createCursorFlow();moveCursorFlow(flow,100,100);moveCursorFlow(flow,140,100);
  const count=flow.particles.length;
  endCursorFlow(flow);moveCursorFlow(flow,800,500);
  expect(flow.particles).toHaveLength(count+1);
  expect(flow.particles.at(-1)).toMatchObject({x:800,y:500});
  moveCursorFlow(flow,900,500,false);expect(flow.particles).toHaveLength(0);
});

test('rapid motion stays bounded and a stationary pointer emits nothing',()=>{
  const flow=createCursorFlow();moveCursorFlow(flow,20,30);
  for(let i=1;i<100;i++)moveCursorFlow(flow,i*300,30);
  expect(flow.particles.length).toBeLessThanOrEqual(MAX_PARTICLES);
  const count=flow.particles.length;moveCursorFlow(flow,flow.x,flow.y);
  expect(flow.particles).toHaveLength(count);
});

test('particle aging is consistent at 60 and 120 Hz',()=>{
  const run=rate=>{const flow=createCursorFlow();moveCursorFlow(flow,100,100);moveCursorFlow(flow,240,100);for(let i=0;i<rate/2;i++)advanceCursorFlow(flow,1/rate);return flow.particles;};
  const a=run(60),b=run(120);
  a.forEach((particle,i)=>{expect(particle.age).toBeCloseTo(b[i].age,8);expect(particleOpacity(particle)).toBeCloseTo(particleOpacity(b[i]),8);});
});
