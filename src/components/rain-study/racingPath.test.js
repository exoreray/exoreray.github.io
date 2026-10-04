import { advanceRaceTime, racingCarPose, sampleRacingPath, trackRacingCamera, RACING_LAP_SECONDS, RACING_TRACK_LENGTH } from './racingPath';

test('the car completes a closed lap with continuous nose direction', () => {
  const start = racingCarPose(0), end = racingCarPose(RACING_LAP_SECONDS);
  expect(end).toEqual(start);
  const before = racingCarPose(RACING_LAP_SECONDS - .0001), after = racingCarPose(.0001);
  expect(Math.hypot(...before.position.map((x, i) => x - after.position[i]))).toBeLessThan(.001);
  expect(before.forward.reduce((sum, value, i) => sum + value * after.forward[i], 0)).toBeGreaterThan(.99999);
  for (let time = 0; time < RACING_LAP_SECONDS; time += .025) {
    const car = racingCarPose(time), next = racingCarPose(time + .001);
    const movement = next.position.map((value, i) => value - car.position[i]);
    const length = Math.hypot(...movement);
    expect((movement[0] * Math.sin(car.heading) + movement[2] * Math.cos(car.heading)) / length).toBeGreaterThan(.9999);
  }
});

test('road speed follows distance rather than control point spacing', () => {
  const distances = [];
  for (let i = 0; i < 1200; i++) {
    const a = sampleRacingPath(i / 1200), b = sampleRacingPath((i + 1) / 1200);
    distances.push(Math.hypot(b.x - a.x, b.z - a.z));
  }
  const expected = RACING_TRACK_LENGTH / 1200;
  expect(Math.min(...distances)).toBeGreaterThan(expected * .995);
  expect(Math.max(...distances)).toBeLessThan(expected * 1.005);
});

test('full-width asphalt and kerbs remain a simple closed circuit through the technical bend', () => {
  const count = 256;
  const edges = [-1, 1].map(side => Array.from({ length: count }, (_, i) => {
    const point = sampleRacingPath(i / count);
    return [point.x - point.dz * side * .65, point.z + point.dx * side * .65];
  }));
  const orient = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const crosses = (a, b, c, d) => orient(a, b, c) * orient(a, b, d) < -1e-12 && orient(c, d, a) * orient(c, d, b) < -1e-12;
  let intersections = 0;
  for (const edge of edges) {
    for (let i = 0; i < count; i++) {
      for (let j = i + 2; j < count; j++) {
        if (i === 0 && j === count - 1) continue;
        if (crosses(edge[i], edge[(i + 1) % count], edge[j], edge[(j + 1) % count])) intersections++;
      }
    }
  }
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      if (crosses(edges[0][i], edges[0][(i + 1) % count], edges[1][j], edges[1][(j + 1) % count])) intersections++;
    }
  }
  expect(intersections).toBe(0);
});

test('pause freezes the car and normal frame rates cover the same road distance', () => {
  expect(advanceRaceTime(3.25, .016, false)).toBe(3.25);
  expect(advanceRaceTime(3.25, 5, true)).toBeCloseTo(3.35);
  expect(advanceRaceTime(3.25, NaN, true)).toBe(3.25);
  const run = fps => { let time = 0; for (let frame = 0; frame < fps * 5; frame++) time = advanceRaceTime(time, 1 / fps, true); return time; };
  expect(run(30)).toBeCloseTo(run(60), 9);
  expect(run(120)).toBeCloseTo(run(60), 9);
  expect(advanceRaceTime(RACING_LAP_SECONDS - .01, .02, true)).toBeCloseTo(.01);
});

test('the following camera eases circular heading changes and freezes when the car pauses', () => {
  const pose = racingCarPose(0);
  let time = 0, maximumHeadingStep = 0;
  for (let frame = 0; frame < 900; frame++) {
    const before = pose.cameraHeading;
    time = advanceRaceTime(time, 1 / 60, true);
    racingCarPose(time, pose, 1 / 60);
    maximumHeadingStep = Math.max(maximumHeadingStep, Math.abs(pose.cameraHeading - before));
  }
  expect(maximumHeadingStep).toBeLessThan(.045);
  const pausedHeading = pose.cameraHeading, pausedPosition = pose.position.slice();
  racingCarPose(time, pose, 0);
  expect(pose.cameraHeading).toBe(pausedHeading);
  expect(pose.position).toEqual(pausedPosition);
  // An equivalent orientation displaced by2PI must never trigger a spin.
  const equivalent = racingCarPose(time);
  equivalent.cameraHeading += Math.PI * 2;
  const originalHeading = equivalent.cameraHeading;
  racingCarPose(time, equivalent, 1 / 60);
  expect(equivalent.cameraHeading).toBeCloseTo(originalHeading, 10);
});

test('scroll-directed close shots follow the actual car while wide shots retain the circuit', () => {
  const frame = { position: [1.7, .62, 2.5], target: [0, 0, 0], fov: 32, near: .1, framing: 1, roll: 0 };
  const car = racingCarPose(4.5), close = trackRacingCamera(frame, .32, car);
  expect(close.target[0]).toBeCloseTo(car.position[0]);
  expect(close.target[2]).toBeCloseTo(car.position[2]);
  expect(close.position).not.toEqual(frame.position);
  expect(close.fov).toBe(frame.fov);
  expect(close.near).toBe(frame.near);
  expect(trackRacingCamera(frame, 0, car)).toBe(frame);
  expect(trackRacingCamera(frame, .84, car)).toBe(frame);
  expect(trackRacingCamera(frame, .3, null)).toBe(frame);
  const before = trackRacingCamera(frame, .32, racingCarPose(RACING_LAP_SECONDS - .0001));
  const after = trackRacingCamera(frame, .32, racingCarPose(.0001));
  expect(Math.hypot(...before.position.map((value, i) => value - after.position[i]))).toBeLessThan(.003);
});
