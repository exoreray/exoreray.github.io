export const WATER_SIZE = 64;
export const WATER_SPAN = 8;
export const WATER_LIMIT = .22;
export const WATER_RADIUS = .8;
const STEP = 1 / 120;
const CELL = WATER_SPAN / (WATER_SIZE - 1);
const PROPAGATION = 1.65 ** 2 / (CELL * CELL);

export function createWaterSurface() {
  const count=WATER_SIZE*WATER_SIZE;
  const state={height:new Float32Array(count),velocity:new Float32Array(count),pixels:new Uint8Array(count*4),
    damping:new Float32Array(count),brushX:new Float32Array(WATER_SIZE),brushY:new Float32Array(WATER_SIZE),
    distanceX:new Float32Array(WATER_SIZE),distanceY:new Float32Array(WATER_SIZE),
    positioned:false,x:0,y:0,pressure:0,accumulator:0,peak:0};
  for(let y=0;y<WATER_SIZE;y++)for(let x=0;x<WATER_SIZE;x++){
    const i=y*WATER_SIZE+x,edge=Math.min(x,y,WATER_SIZE-1-x,WATER_SIZE-1-y);
    state.damping[i]=Math.exp(-STEP*(1.15+Math.max(0,8-edge)*.8));
    state.pixels[i*4]=128;state.pixels[i*4+3]=255;
  }
  return state;
}

export function resetWaterSurface(state) {
  state.height.fill(0);state.velocity.fill(0);
  state.positioned=false;state.pressure=0;state.accumulator=0;state.peak=0;
  for(let i=0;i<state.height.length;i++){state.pixels[i*4]=128;state.pixels[i*4+1]=0;}
}

// A shared water surface carries disturbances away from the pointer.
// Continuous pressure replaces separate, overlapping pulse animations.
export function advanceWaterSurface(state,x,y,engaged,delta) {
  if(engaged && !state.positioned){state.x=x;state.y=y;state.positioned=true;state.pressure=0;}
  if(!engaged)state.positioned=false;
  state.accumulator+=Math.max(0,Math.min(delta,.05));
  while(state.accumulator+1e-9>=STEP){
    let speed=0;
    if(engaged){
      const follow=1-Math.exp(-STEP/.07);
      const dx=(x-state.x)*follow,dy=(y-state.y)*follow;
      state.x+=dx;state.y+=dy;speed=Math.hypot(dx,dy)/STEP;
    }
    const target=engaged?Math.min(1,speed/2.2):0;
    state.pressure+=(target-state.pressure)*(1-Math.exp(-STEP/(target>state.pressure ? .13 : .25)));
    for(let n=0;n<WATER_SIZE;n++){
      const world=n*CELL-WATER_SPAN/2;
      state.distanceX[n]=((world-state.x)/WATER_RADIUS)**2;
      state.distanceY[n]=((world-state.y)/WATER_RADIUS)**2;
      state.brushX[n]=Math.exp(-state.distanceX[n]);
      state.brushY[n]=Math.exp(-state.distanceY[n]);
    }
    const {height,velocity}=state;
    for(let row=1;row<WATER_SIZE-1;row++)for(let col=1;col<WATER_SIZE-1;col++){
      const i=row*WATER_SIZE+col;
      const laplacian=height[i-1]+height[i+1]+height[i-WATER_SIZE]+height[i+WATER_SIZE]-4*height[i];
      // The surrounding crest balances the central dip, moving water instead of shrinking the whole form.
      const shoulder=1-state.distanceX[col]-state.distanceY[row];
      const pressure=-2.8*state.pressure*shoulder*state.brushX[col]*state.brushY[row];
      velocity[i]=(velocity[i]+(PROPAGATION*laplacian-.6*height[i]+pressure)*STEP)*state.damping[i];
    }
    for(let i=0;i<height.length;i++){
      const next=height[i]+velocity[i]*STEP;
      height[i]=Math.max(-WATER_LIMIT,Math.min(WATER_LIMIT,next));
      if(Math.abs(next)>WATER_LIMIT)velocity[i]=0;
    }
    state.accumulator-=STEP;
  }
  state.peak=0;
  for(let i=0;i<state.height.length;i++){
    state.peak=Math.max(state.peak,Math.abs(state.height[i]));
    // Two byte channels retain smooth subpixel motion at the 4.5x display gain.
    const encoded=Math.round(32768+state.height[i]/WATER_LIMIT*32767);
    state.pixels[i*4]=encoded>>8;
    state.pixels[i*4+1]=encoded&255;
  }
  return state;
}
