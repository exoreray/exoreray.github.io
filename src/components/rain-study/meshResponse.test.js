import { createMeshResponse, softenMeshSignal, updateMeshResponse } from './meshResponse';

test('visual filtering removes fine alternating noise while retaining broad amplitude',()=>{
  const source=Float32Array.from({length:128},(_,i)=>i%2?1:-1);
  const original=source.slice(),filtered=new Float32Array(128);
  softenMeshSignal(source,filtered);
  expect(Math.max(...filtered.slice(16,-16).map(Math.abs))).toBeLessThan(.04);
  expect(source).toEqual(original);
  source.fill(.25);softenMeshSignal(source,filtered);
  expect([...filtered].every(x=>x===.25)).toBe(true);
});

test('a sharp beat builds over several frames and stays within the geometry limits',()=>{
  const response=createMeshResponse(8),signal=new Float32Array(16).fill(1);
  updateMeshResponse(response,signal,0,1,1,1/60);
  const first=response.wave[0];
  expect(first).toBeGreaterThan(0);expect(first).toBeLessThan(.2);
  for(let i=0;i<12;i++)updateMeshResponse(response,signal,0,1,5,1/60);
  expect(response.wave[0]).toBeGreaterThan(first);
  expect(response.wave[0]).toBeLessThan(.6);
  expect(response.energy).toBeLessThanOrEqual(.85);
});

test('response has the same timing on 60Hz and 120Hz displays',()=>{
  const signal=new Float32Array(16).fill(.3);
  const run=fps=>{
    const state=createMeshResponse(8);
    for(let i=0;i<fps*.3;i++)updateMeshResponse(state,signal,0,.1,1,1/fps);
    return state;
  };
  const a=run(60),b=run(120);
  expect(a.wave[0]).toBeCloseTo(b.wave[0],5);
  expect(a.energy).toBeCloseTo(b.energy,5);
});

test('pause or mute settles smoothly without snapping or leaving residual energy',()=>{
  const response=createMeshResponse(8),signal=new Float32Array(16).fill(.5);
  for(let i=0;i<60;i++)updateMeshResponse(response,signal,0,.2,1,1/60);
  const energy=response.energy,wave=response.wave[0];
  updateMeshResponse(response,null,0,0,1,1/60);
  expect(response.energy).toBeLessThan(energy);expect(response.energy).toBeGreaterThan(energy*.8);
  expect(response.wave[0]).toBeLessThan(wave);expect(response.wave[0]).toBeGreaterThan(0);
  for(let i=0;i<180;i++)updateMeshResponse(response,null,0,0,1,1/60);
  expect(response.energy).toBe(0);expect(response.wave[0]).toBe(0);
});
