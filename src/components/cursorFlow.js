const SPACING=7;
export const MAX_PARTICLES=220;
export const MAX_PARTICLE_LIFETIME=1.6;

export function particleOpacity(particle) {
  const t=Math.max(0,Math.min(1,(particle.age-.06)/(particle.duration-.06)));
  return 1-t*t*(3-2*t);
}

export function createCursorFlow() {
  return {particles:[],x:0,y:0,positioned:false,continuous:false,cursorVisible:false,interactive:false,seed:0,remainder:0};
}

function deposit(flow,x,y,nx=0,ny=0) {
  const phase=++flow.seed*2.399963;
  const offset=Math.sin(phase)*3.8;
  flow.particles.push({
    x:x+nx*offset,y:y+ny*offset,age:0,
    duration:1.2+(Math.sin(phase*1.7)+1)*.2,
    size:.65+(Math.cos(phase)+1)*.45,
    brightness:.55+(Math.sin(phase*2.3)+1)*.225,
  });
}

export function moveCursorFlow(flow,x,y,emit=true) {
  const dx=x-flow.x,dy=y-flow.y,distance=Math.hypot(dx,dy);
  if(!emit){flow.particles.length=0;flow.remainder=0;}
  else if(!flow.positioned || !flow.continuous){flow.remainder=0;deposit(flow,x,y);}
  else if(distance>0){
    // Deposit by travelled distance, with small placement variation but no outward velocity.
    const amount=Math.floor((flow.remainder+distance)/SPACING);
    const count=Math.min(36,amount),first=SPACING-flow.remainder;
    for(let i=0;i<count;i++){
      const t=amount>36?(i+.5)/count:(first+i*SPACING)/distance;
      deposit(flow,flow.x+dx*t,flow.y+dy*t,-dy/distance,dx/distance);
    }
    flow.remainder=(flow.remainder+distance)%SPACING;
  }
  if(flow.particles.length>MAX_PARTICLES)flow.particles.splice(0,flow.particles.length-MAX_PARTICLES);
  flow.x=x;flow.y=y;flow.positioned=true;flow.continuous=true;
}

export function endCursorFlow(flow) {
  flow.cursorVisible=false;flow.continuous=false;
}

export function advanceCursorFlow(flow,delta) {
  const dt=Math.max(delta,0);
  // Particles stay at their deposited coordinates; only their opacity ages.
  for(const particle of flow.particles)particle.age+=dt;
  flow.particles=flow.particles.filter(particle=>particle.age<particle.duration);
  return flow.particles.length>0;
}
