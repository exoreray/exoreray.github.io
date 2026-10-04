// Camera position, point of attention, lens, and a restrained bank angle.
// Every track is authored around its scene's normalized geometry.
const key = (at, position, target, fov = 36, roll = 0, options={}) => ({ at, position, target, fov, roll, near:.1, framing:1, ...options });
const flight = (at, position, target, fov=58, near=.02) => key(at,position,target,fov,0,{near,framing:0,constrained:true});
const belfryY = 66.1 * 4.8 / 93.5736;
const arch = point => [Math.cos(-.15)*point[0]+Math.sin(-.15)*point[2],point[1],-Math.sin(-.15)*point[0]+Math.cos(-.15)*point[2]];
export const cinematicShots = [
  // Wangjing: skyline and plaza, then a low pass through the real inter-tower lane.
  [key(0,[9,6,12],[-.8,1.2,.15],46),key(.055,[5.8,4.5,9],[-.8,1.3,.2],46),
    flight(.13,[-1.44,.9596,3.6],[-2.6,1.7596,.24],54,.03),
    flight(.20,[-1.3,.4396,2.3],[-1.86,.9596,.86]),
    flight(.27,[-1.24,.3196,1.14],[-1.64,.5596,-.70]),
    flight(.34,[-1.46,.3996,-.06],[0,.7996,-.26]),
    flight(.42,[-1.36,.5796,-1.08],[1.22,1.5996,-.26]),
    flight(.51,[-.96,1.1196,-2.06],[-1.88,1.8396,-.38],54),
    key(.68,[-5.8,5.5,-7],[-1.2,1.6,.1],48),key(.84,[-7.4,6.2,-9.4],[-.8,1.4,0],44)],
  // Architecture: enter the high arch, travel beneath the ribs, emerge at the low end.
  [key(0,[5,2.9,7.2],[0,.2,0],40),
    flight(.14,arch([3.8,-.25,.15]),arch([.6,-.35,0]),56,.025),
    flight(.23,arch([2,-.4,0]),arch([-.6,-.45,0]),60,.012),
    flight(.32,arch([.35,-.55,0]),arch([-2,-.75,0]),60,.012),
    flight(.43,arch([-1.3,-.92,0]),arch([-3.5,-.9,0]),58,.008),
    flight(.52,arch([-3.2,-1.02,0]),arch([-5,-.8,0]),54,.008),
    key(.68,[-4.5,2.8,5.5],[0,0,0],44),key(.84,[-.8,2.4,9.4],[0,0,0],38)],
  // Berkeley: ascend to the clock, pass through the open central belfry, then reveal campus.
  [key(0,[4.8,3.2,10.5],[0,2.2,0],44),key(.075,[2.4,2.4,5.4],[0,2.2,0],48),
    flight(.14,[.7,3.1,2.4],[0,belfryY,0],54,.025),
    flight(.19,[0,belfryY,1.4],[0,belfryY,-1.3],58,.008),
    flight(.25,[0,belfryY,.42],[0,belfryY,-1.3],62,.003),
    flight(.31,[0,belfryY,0],[0,2.4,-2.6],62,.003),
    flight(.38,[0,belfryY,-.56],[0,2.0,-3.3],60,.006),
    flight(.49,[1.2,4.3,-2.1],[0,belfryY,0],50,.025),
    key(.66,[3.1,5.4,-6],[0,2.25,0],44),key(.84,[-3.5,3.8,9.8],[0,2.2,0],40)],
  // F1: establish the real circuit, track the moving car, then release above the course.
  [key(0,[8,6.5,11],[0,-.1,0],44),key(.13,[4.6,2.5,6.5],[0,-.08,0],40),key(.28,[1.7,.62,2.5],[0,0,0],32),key(.44,[-1.7,.68,3.1],[0,0,0],34),key(.58,[-2.6,4.8,5.8],[0,-.08,0],40),key(.74,[-7,7,11],[0,-.1,0],44),key(.84,[2.4,8,13],[0,-.1,0],44)],
  // FlowGPT: trace the rising stream from its source to its widening crown.
  [key(0,[3.4,1,10.6],[0,-.5,0],40),key(.10,[1.7,-.4,5.9],[0,-1.1,0],34),key(.23,[-2.9,1.1,5.2],[0,.45,0],32),key(.37,[-2.4,4.2,6.7],[0,1.15,0],37),key(.84,[1,2.1,10.8],[0,0,0],39)],
  // Apple Park: retain the campus opening, skim the roof, fly into the courtyard and climb out.
  [key(0,[7,5.4,9.6],[0,-.08,0],40),key(.14,[5.8,4.8,9.1],[0,-.06,0],40),
    flight(.24,[1.5,1.5,4.2],[0,.15,0],50,.035),
    flight(.33,[.2,.5,2.55],[0,.04,-.8],58,.02),
    flight(.43,[0,.22,.6],[-.15,-.10,-1.1],58,.012),
    flight(.54,[-.3,.6,-1.8],[.3,.2,-3.2],54,.025),
    key(.68,[-3.4,3.3,-5.3],[0,-.05,0],46),key(.84,[-4.2,4.1,7.1],[0,-.08,0],39)],
  // Community: foreground nodes give real parallax as the camera travels around the hub.
  [key(0,[3.4,2.8,10.9],[0,0,0],40),key(.10,[2.1,1,5.6],[.3,.1,0],34),key(.23,[-3.7,.2,4.7],[-.3,.2,0],32),key(.37,[-2.2,4.8,7.5],[0,.3,0],37),key(.84,[1.6,2.9,10.5],[0,0,0],39)],
  // Livia: a slow intimate push, gentle arc, and an unhurried wide closing shot.
  [key(0,[2.4,1.3,10.2],[0,0,0],38),key(.10,[.5,.3,5.8],[0,-.1,0],31),key(.24,[-1.1,.6,5.4],[0,0,0],29),key(.38,[.8,1.4,7.5],[0,.15,0],34),key(.84,[0,.8,10],[0,0,0],38)],
];

// Time-aware Hermite interpolation keeps velocity continuous at internal keys.
// A moderate tangent tension avoids angular stops without camera overshoot.
function interpolate(frames, segment, t, read, constrained=false) {
  const a = frames[segment], b = frames[segment + 1];
  const previous = frames[Math.max(0, segment - 1)], next = frames[Math.min(frames.length - 1, segment + 2)];
  const duration = b.at - a.at;
  const start = read(a), end = read(b);
  const secant=(end-start)/duration;
  const monotone=(left,right,dl,dr)=>{
    if(left*right<=0)return 0;
    const w1=2*dr+dl,w2=dr+2*dl;
    return (w1+w2)/(w1/left+w2/right);
  };
  const slopeA = constrained ? (segment===0 ? .7*secant : monotone((start-read(previous))/(a.at-previous.at),secant,a.at-previous.at,duration))
    : .7 * (read(b) - read(previous)) / (b.at - previous.at);
  const slopeB = constrained ? (segment===frames.length-2 ? .7*secant : monotone(secant,(read(next)-end)/(next.at-b.at),duration,next.at-b.at))
    : .7 * (read(next) - read(a)) / (next.at - a.at);
  const t2 = t * t, t3 = t2 * t;
  return (2*t3-3*t2+1)*start + (t3-2*t2+t)*duration*slopeA + (-2*t3+3*t2)*end + (t3-t2)*duration*slopeB;
}
export function sampleCinematicTrack(index, progress) {
  const frames = cinematicShots[index];
  const constrained=frames.some(frame=>frame.constrained);
  const p = Math.max(0, Math.min(.84, progress));
  let segment = 0;
  while (segment < frames.length - 2 && p > frames[segment + 1].at) segment++;
  const t = (p - frames[segment].at) / (frames[segment + 1].at - frames[segment].at);
  return {
    position: [0,1,2].map(axis => interpolate(frames,segment,t,frame=>frame.position[axis],constrained)),
    target: [0,1,2].map(axis => interpolate(frames,segment,t,frame=>frame.target[axis],constrained)),
    fov: Math.max(27,Math.min(64,interpolate(frames,segment,t,frame=>frame.fov,constrained))),
    roll: Math.max(-.025,Math.min(.025,interpolate(frames,segment,t,frame=>frame.roll))),
    near:interpolate(frames,segment,t,frame=>frame.near,true),
    framing:interpolate(frames,segment,t,frame=>frame.framing,true),
  };
}
