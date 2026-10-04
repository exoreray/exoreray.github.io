import { advanceWaterSurface, createWaterSurface, resetWaterSurface, WATER_LIMIT, WATER_SIZE, WATER_SPAN } from './waterSurface';

const sample=(water,x,y)=>{
  const col=Math.round((x/WATER_SPAN+.5)*(WATER_SIZE-1));
  const row=Math.round((y/WATER_SPAN+.5)*(WATER_SIZE-1));
  return water.height[row*WATER_SIZE+col];
};
const stroke=()=>{
  const water=createWaterSurface();advanceWaterSurface(water,0,0,true,0);
  for(let i=0;i<30;i++)advanceWaterSurface(water,.8,0,true,1/120);
  return water;
};

test('first contact and a stationary pointer do not keep creating waves',()=>{
  const water=createWaterSurface();
  for(let i=0;i<120;i++)advanceWaterSurface(water,1,1,true,1/60);
  expect(water.peak).toBe(0);
  expect(water.pixels[0]).toBe(128);
});

test('a disturbance travels beyond the pointer after release, then dissipates',()=>{
  const water=stroke();
  const before=Math.abs(sample(water,2.2,0));
  let travelledPeak=before;
  for(let i=0;i<90;i++){
    advanceWaterSurface(water,.8,0,false,1/120);
    travelledPeak=Math.max(travelledPeak,Math.abs(sample(water,2.2,0)));
  }
  expect(travelledPeak).toBeGreaterThan(before+.0001);
  expect(water.peak).toBeGreaterThan(.001);
  for(let i=0;i<1440;i++)advanceWaterSurface(water,.8,0,false,1/120);
  expect(water.peak).toBeLessThan(.002);
});

test('fast repeated movement remains finite and within the surface amplitude limit',()=>{
  const water=createWaterSurface();
  for(let i=0;i<720;i++){
    advanceWaterSurface(water,Math.sin(i*.13)*3,Math.cos(i*.09)*2,true,1/120);
    expect(Number.isFinite(water.peak)).toBe(true);
    expect(water.peak).toBeLessThanOrEqual(WATER_LIMIT+.000001);
  }
  expect(water.peak).toBeGreaterThan(.01);
});

test('60 Hz and 120 Hz displays use the same wave propagation',()=>{
  const run=rate=>{
    const water=createWaterSurface();advanceWaterSurface(water,0,0,true,0);
    for(let i=0;i<rate;i++)advanceWaterSurface(water,.8,0,true,1/rate);
    return water;
  };
  const a=run(60),b=run(120);
  expect(a.height).toEqual(b.height);
});

test('packed height preserves fine motion and interpolates smoothly across byte boundaries',()=>{
  const water=createWaterSurface(),values=[-.22,-.0011,0,.0004,.0011,.22];
  values.forEach((value,i)=>{water.height[i]=value;});
  advanceWaterSurface(water,0,0,false,0);
  const decode=(r,g)=>(r*256+g-32768)/32767*WATER_LIMIT;
  values.forEach((value,i)=>expect(Math.abs(decode(water.pixels[i*4],water.pixels[i*4+1])-value)).toBeLessThan(.000004));
  const a=3*4,b=4*4,t=.4;
  const interpolated=decode(water.pixels[a]*(1-t)+water.pixels[b]*t,water.pixels[a+1]*(1-t)+water.pixels[b+1]*t);
  expect(Math.abs(interpolated-(values[3]*(1-t)+values[4]*t))).toBeLessThan(.000004);
});

test('leaving the home scene clears residual water before the next visit',()=>{
  const water=stroke();expect(water.peak).toBeGreaterThan(0);
  resetWaterSurface(water);
  expect(water.height.every(value=>value===0)).toBe(true);
  expect(water.velocity.every(value=>value===0)).toBe(true);
  expect(water.peak).toBe(0);expect(water.pressure).toBe(0);expect(water.positioned).toBe(false);
  for(let i=0;i<water.height.length;i++){expect(water.pixels[i*4]).toBe(128);expect(water.pixels[i*4+1]).toBe(0);}
  advanceWaterSurface(water,3,2,true,1/60);expect(water.peak).toBe(0);
});

test('a broad stroke raises a surrounding shoulder instead of removing surface volume',()=>{
  const water=createWaterSurface();water.pressure=1;
  advanceWaterSurface(water,0,0,false,1/120);
  expect(sample(water,0,0)).toBeLessThan(0);
  expect(sample(water,1.1,0)).toBeGreaterThan(0);
  const net=water.height.reduce((sum,value)=>sum+value,0);
  const total=water.height.reduce((sum,value)=>sum+Math.abs(value),0);
  expect(Math.abs(net)/total).toBeLessThan(.01);
});

test('sustained circular stirring avoids clipped flat patches',()=>{
  const water=createWaterSurface();let largest=0;
  for(let i=0;i<1440;i++){
    const t=i/120;
    advanceWaterSurface(water,Math.cos(t*2)*1.1,Math.sin(t*2)*1.1,true,1/120);
    largest=Math.max(largest,water.peak);
  }
  expect(largest).toBeGreaterThan(.05);
  expect(largest).toBeLessThan(WATER_LIMIT-.001);
});
