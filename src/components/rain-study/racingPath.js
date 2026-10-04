export const RACING_CAR_SIZE = .9;
export const RACING_TRACK_Y = -.22;
export const RACING_TRACK_WIDTH = 1.08;
export const RACING_LAP_SECONDS = 12;
export const RACING_CAR_CENTER_Y = RACING_TRACK_Y + .101 + .006;

// A flowing closed road circuit: a long lower straight, a broad outer turn,
// a technical rising infield section and a rounded return. +Z is the car nose.
export const racingControlPoints = [
  [-3, -2.65], [.1, -2.70], [2.5, -3.15], [4.6, -1.8], [4.45, .55],
  [2.85, 1.5], [1.25, 1.70], [0, 2.8], [-2.6, 3.1], [-4.5, 1.55], [-4.7, -.8],
];
const wrap = value => ((value % 1) + 1) % 1;
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = (lo, hi, value) => { const t = clamp((value - lo) / (hi - lo)); return t * t * (3 - 2 * t); };

function splinePoint(phase) {
  const count = racingControlPoints.length, p = wrap(phase) * count;
  const index = Math.floor(p), t = p - index;
  const a = racingControlPoints[(index - 1 + count) % count], b = racingControlPoints[index];
  const c = racingControlPoints[(index + 1) % count], d = racingControlPoints[(index + 2) % count];
  const read = axis => {
    // A periodic cubic B-spline has continuous curvature at its joins. That
    // keeps the following camera from receiving sudden steering-rate changes.
    const t2 = t * t, t3 = t2 * t, inverse = 1 - t;
    return [(inverse ** 3 * a[axis] + (3 * t3 - 6 * t2 + 4) * b[axis]
      + (-3 * t3 + 3 * t2 + 3 * t + 1) * c[axis] + t3 * d[axis]) / 6,
    (-3 * inverse * inverse * a[axis] + (9 * t2 - 12 * t) * b[axis]
      + (-9 * t2 + 6 * t + 3) * c[axis] + 3 * t2 * d[axis]) / 6];
  };
  const x = read(0), z = read(1), length = Math.hypot(x[1], z[1]);
  return { x: x[0], z: z[0], dx: x[1] / length, dz: z[1] / length };
}

// Distance parameterization keeps the car's road speed independent of spline
// control-point spacing. The lookup is built once and shared with the road.
const ARC_STEPS = 2048;
const arcLengths = new Float64Array(ARC_STEPS + 1);
let previous = splinePoint(0);
for (let i = 1; i <= ARC_STEPS; i++) {
  const point = splinePoint(i / ARC_STEPS);
  arcLengths[i] = arcLengths[i - 1] + Math.hypot(point.x - previous.x, point.z - previous.z);
  previous = point;
}
export const RACING_TRACK_LENGTH = arcLengths[ARC_STEPS];

export function sampleRacingPath(phase) {
  const distance = wrap(phase) * RACING_TRACK_LENGTH;
  let lo = 0, hi = ARC_STEPS;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (arcLengths[mid] < distance) lo = mid; else hi = mid; }
  const span = arcLengths[hi] - arcLengths[lo];
  return splinePoint((lo + (distance - arcLengths[lo]) / span) / ARC_STEPS);
}

export function advanceRaceTime(elapsed, delta, active) {
  if (!active || !Number.isFinite(delta) || delta <= 0) return elapsed;
  // Hidden tabs pause at the caller. A long interrupted frame must not teleport
  // the car across a turn when rendering resumes.
  return (elapsed + Math.min(delta, .1)) % RACING_LAP_SECONDS;
}

export function racingCarPose(elapsed, output = { position: [0, 0, 0], forward: [0, 0, 1], heading: 0 }, delta = 0) {
  const phase = wrap(elapsed / RACING_LAP_SECONDS);
  const point = sampleRacingPath(phase);
  output.position[0] = point.x; output.position[1] = RACING_CAR_CENTER_Y; output.position[2] = point.z;
  output.forward[0] = point.dx; output.forward[1] = 0; output.forward[2] = point.dz;
  output.heading = Math.atan2(point.dx, point.dz);
  const ahead = sampleRacingPath(phase + .16 / RACING_LAP_SECONDS);
  const desiredHeading = Math.atan2(ahead.dx, ahead.dz);
  if (output.cameraHeading == null) output.cameraHeading = desiredHeading;
  else if (Number.isFinite(delta) && delta > 0) {
    // A camera operator anticipates the road slightly and eases into a turn.
    // Circular damping crosses ±PI without taking a full reverse revolution.
    const difference = Math.atan2(Math.sin(desiredHeading - output.cameraHeading), Math.cos(desiredHeading - output.cameraHeading));
    output.cameraHeading += difference * (1 - Math.exp(-Math.min(delta, .1) / .38));
  }
  return output;
}

// Apply after cameraFrame(3, progress), before the shared viewport fit. Scroll
// chooses the shot; the live car position keeps the close shot on its subject.
export function trackRacingCamera(frame, progress, pose) {
  if (!pose) return frame;
  const following = smooth(.10, .24, progress) * (1 - smooth(.58, .75, progress));
  if (!following) return frame;
  const heading = pose.cameraHeading ?? pose.heading;
  const sin = Math.sin(heading), cos = Math.cos(heading);
  const offset = frame.position.map((value, axis) => value - frame.target[axis]);
  const trackedTarget = [pose.position[0], pose.position[1] + .035, pose.position[2]];
  const trackedCamera = [trackedTarget[0] + offset[0] * cos + offset[2] * sin,
    trackedTarget[1] + offset[1], trackedTarget[2] - offset[0] * sin + offset[2] * cos];
  return { ...frame,
    position: frame.position.map((value, axis) => value + (trackedCamera[axis] - value) * following),
    target: frame.target.map((value, axis) => value + (trackedTarget[axis] - value) * following),
  };
}
