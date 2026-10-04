const STEP = 1 / 120;
export const MAX_DRAG = .58;

export function createViscousDrag() {
  return { positioned:false, fastX:0,fastY:0,anchorX:0,anchorY:0,centerX:0,centerY:0,x:0,y:0,accumulator:0 };
}

// Two relaxing material positions create drag without a spring or a periodic impulse.
export function advanceViscousDrag(state,x,y,engaged,delta) {
  if(engaged && !state.positioned){
    state.fastX=state.anchorX=x;state.fastY=state.anchorY=y;
    if(Math.hypot(state.x,state.y)<.01){state.centerX=x;state.centerY=y;}
    state.positioned=true;
  }
  if(!engaged)state.positioned=false;
  state.accumulator+=Math.max(0,Math.min(delta,.05));
  while(state.accumulator+1e-9>=STEP){
    let targetX=0,targetY=0;
    if(engaged){
      const follow=1-Math.exp(-STEP/.08),relax=1-Math.exp(-STEP/.6);
      state.fastX+=(x-state.fastX)*follow;state.fastY+=(y-state.fastY)*follow;
      state.anchorX+=(state.fastX-state.anchorX)*relax;state.anchorY+=(state.fastY-state.anchorY)*relax;
      targetX=(state.fastX-state.anchorX)*.85;targetY=(state.fastY-state.anchorY)*.85;
      const length=Math.hypot(targetX,targetY);
      const limit=length>0?MAX_DRAG*Math.tanh(length/MAX_DRAG)/length:1;
      targetX*=limit;targetY*=limit;
      const centerFollow=1-Math.exp(-STEP/.28);
      state.centerX+=(state.anchorX-state.centerX)*centerFollow;
      state.centerY+=(state.anchorY-state.centerY)*centerFollow;
    }
    const soften=1-Math.exp(-STEP/(engaged ? .18 : .7));
    state.x+=(targetX-state.x)*soften;state.y+=(targetY-state.y)*soften;
    state.accumulator-=STEP;
  }
  return state;
}
