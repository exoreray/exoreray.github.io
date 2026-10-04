import { cinematicShots, sampleCinematicTrack } from './cinematicShots';
export const clamp = value => Math.max(0, Math.min(1, value));
export const smooth = (start, end, value) => { const x = clamp((value - start) / (end - start)); return x * x * (3 - 2 * x); };

export function locateChapter(ranges, scrollY) {
  if (!ranges.length) return { index: 0, progress: 0 };
  let index = 0;
  for (let i = 1; i < ranges.length; i++) {
    if (scrollY < ranges[i].start) break;
    index = i;
  }
  return { index, progress: clamp((scrollY - ranges[index].start) / Math.max(1, ranges[index].height)) };
}

// The camera moves around the original model; the model no longer spins on a turntable.
// A soft cinematic cut replaces the former elevator transition between chapters.
export function chapterPose(progress, incoming = false, motion = true) {
  return {y:0,scale:1,rotation:0,visible:incoming ? motion && progress >= .92 : !motion || progress < .92};
}
export const cinematicCut = (progress, motion = true) => motion ? Math.sin(smooth(.84,1,progress)*Math.PI)*.72 : 0;

export function cameraFrame(index, progress, motion = true) {
  if (!motion) return [0,1,2,3,5].includes(index) ? sampleCinematicTrack(index,0) : {position:[0,1.6,10.5],target:[0,0,0],fov:38,roll:0,near:.1,framing:1};
  const frame = sampleCinematicTrack(index, progress);
  const next = cinematicShots[Math.min(index + 1, cinematicShots.length - 1)][0];
  const blend = smooth(.84,1,progress);
  return {
    position:frame.position.map((value,axis)=>value+(next.position[axis]-value)*blend),
    target:frame.target.map((value,axis)=>value+(next.target[axis]-value)*blend),
    fov:frame.fov+(next.fov-frame.fov)*blend,
    roll:frame.roll*(1-blend),
    near:frame.near+(next.near-frame.near)*blend,
    framing:frame.framing+(next.framing-frame.framing)*blend,
  };
}
export function cameraShot(index, progress, motion = true) { return cameraFrame(index,progress,motion).position; }

export function fitCameraPosition(frame,automaticFit,preserveAngle=false) {
  const fit=1+(automaticFit-1)*(frame.framing??1);
  if(fit===1)return frame.position.slice();
  return preserveAngle ? frame.position.map((value,axis)=>frame.target[axis]+(value-frame.target[axis])*fit)
    : [frame.position[0],frame.position[1],frame.position[2]*fit];
}

export function framedCameraPosition(index,progress,frame,aspect) {
  const forScene=scene=>{
    const architecture=scene===1;
    const racing=scene===3;
    const rawFit=Math.min(architecture?2.1:racing?1.8:1.5,Math.max(1,(architecture?1.15:racing?1.04:.84)/aspect));
    const distance=Math.hypot(...frame.position.map((value,axis)=>value-frame.target[axis]));
    const detail=clamp((11-distance)/7);
    const fit=1+(rawFit-1)*(1-detail*(architecture ? .35 : .55));
    return fitCameraPosition(frame,fit,[0,1,2,3,5].includes(scene));
  };
  const from=forScene(index),to=forScene(Math.min(index+1,7));
  const blend=smooth(.84,1,progress);
  return from.map((value,axis)=>value+(to[axis]-value)*blend);
}

export function framedCameraFov(frame,aspect) {
  return Math.min(82,frame.fov+(1-(frame.framing??1))*Math.max(0,1-aspect)*40);
}

// Follow the authored path in time; smoothing XYZ independently cuts corners through walls.
export function advanceFilmTimeline(displayed,target,motion,delta) {
  if(displayed.index!==target.index || !motion){displayed.index=target.index;displayed.progress=target.progress;}
  else {
    displayed.progress+=(target.progress-displayed.progress)*(1-Math.exp(-12*Math.min(delta,.05)));
    if(Math.abs(displayed.progress-target.progress)<.00001)displayed.progress=target.progress;
  }
  return displayed;
}
