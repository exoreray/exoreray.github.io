import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { advanceRaceTime, racingCarPose, sampleRacingPath, RACING_TRACK_WIDTH, RACING_TRACK_Y } from './racingPath';

function circuitRibbons(strips, segments = 512) {
  const positions = [], colors = [];
  const ivory = new THREE.Color('#bfc4b7'), vermilion = new THREE.Color('#884f46');
  const add = (point, offset, y) => [point.x - point.dz * offset, y, point.z + point.dx * offset];
  for (const strip of strips) {
    for (let i = 0; i < segments; i++) {
      const phase = (i + .5) / segments;
      if (strip.kerb && !((phase > .18 && phase < .45) || (phase > .53 && phase < .76) || (phase > .83 && phase < .98))) continue;
      const a = sampleRacingPath(i / segments), b = sampleRacingPath((i + 1) / segments);
      const leftA = add(a, strip.offset + strip.width / 2, strip.y), rightA = add(a, strip.offset - strip.width / 2, strip.y);
      const leftB = add(b, strip.offset + strip.width / 2, strip.y), rightB = add(b, strip.offset - strip.width / 2, strip.y);
      positions.push(...leftA, ...leftB, ...rightA, ...rightA, ...leftB, ...rightB);
      if (strip.kerb) {
        const color = Math.floor(i / 4) % 2 ? ivory : vermilion;
        for (let vertex = 0; vertex < 6; vertex++) colors.push(color.r, color.g, color.b);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (colors.length) geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals(); geometry.computeBoundingSphere();
  return geometry;
}

function startLine() {
  const point = sampleRacingPath(.043), positions = [], colors = [];
  const white = new THREE.Color('#ced1c2'), dark = new THREE.Color('#1c2524');
  const vertex = (across, along) => [point.x - point.dz * across + point.dx * along, RACING_TRACK_Y + .004,
    point.z + point.dx * across + point.dz * along];
  for (let row = 0; row < 2; row++) {
    for (let column = 0; column < 10; column++) {
      const a = (column / 10 - .5) * RACING_TRACK_WIDTH * .91;
      const b = ((column + 1) / 10 - .5) * RACING_TRACK_WIDTH * .91;
      const back = row * .065, front = (row + 1) * .065;
      positions.push(...vertex(a, back), ...vertex(b, back), ...vertex(a, front), ...vertex(a, front), ...vertex(b, back), ...vertex(b, front));
      const color = (row + column) % 2 ? white : dark;
      for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals(); return geometry;
}

const groundVertex = `
  varying vec2 vGround;
  void main() { vGround = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const groundFragment = `
  uniform vec3 uMeadow;
  uniform vec3 uShade;
  varying vec2 vGround;
  void main() {
    vec2 q = abs(vGround / vec2(6.65, 4.85));
    float edge = pow(pow(q.x, 4.0) + pow(q.y, 4.0), .25);
    float grain = sin(vGround.x * .9 + sin(vGround.y * .8)) * .16;
    float alpha = 1.0 - smoothstep(.73, 1.02 + grain * .14, edge);
    vec3 color = mix(uShade, uMeadow, .55 + grain);
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
const contactVertex = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const contactFragment = `
  varying vec2 vUv;
  void main() {
    vec2 p = abs(vUv - .5) * 2.0;
    float a = pow(max(0.0, 1.0 - pow(pow(p.x, 4.0) + pow(p.y, 4.0), .25)), 1.5) * .48;
    gl_FragColor = vec4(.005, .009, .008, a);
  }
`;

export default function RacingCircuit({ children, active = true, dark = false, raceRef }) {
  const car = useRef(), contact = useRef();
  const localRace = useRef({ elapsed: 0, pose: racingCarPose(0) });
  const race = raceRef || localRace;
  const geometry = useMemo(() => ({
    road: circuitRibbons([{ offset: 0, width: RACING_TRACK_WIDTH, y: RACING_TRACK_Y }]),
    edges: circuitRibbons([-1, 1].map(side => ({ offset: side * (RACING_TRACK_WIDTH / 2 - .045), width: .022, y: RACING_TRACK_Y + .003 }))),
    kerbs: circuitRibbons([-1, 1].map(side => ({ offset: side * (RACING_TRACK_WIDTH / 2 + .047), width: .11, y: RACING_TRACK_Y + .005, kerb: true }))),
    start: startLine(),
  }), []);
  const uniforms = useMemo(() => ({
    uMeadow: { value: new THREE.Color(dark ? '#344936' : '#7d8d6b') },
    uShade: { value: new THREE.Color(dark ? '#203226' : '#536b4b') },
  }), [dark]);
  useEffect(() => () => { Object.values(geometry).forEach(item => item.dispose()); }, [geometry]);
  useLayoutEffect(() => {
    if (!race.current) race.current = { elapsed: 0 };
    race.current.elapsed ??= 0;
    race.current.pose = racingCarPose(race.current.elapsed, race.current.pose);
    car.current.position.set(...race.current.pose.position); car.current.rotation.y = race.current.pose.heading;
    contact.current.position.set(race.current.pose.position[0], RACING_TRACK_Y + .005, race.current.pose.position[2]);
    contact.current.rotation.set(-Math.PI / 2, 0, race.current.pose.heading);
  }, [race]);
  // Publish the car pose before the shared Film camera's -2 callback. Paused
  // chapters and reduced motion freeze elapsed time without resetting the lap.
  useFrame((_, delta) => {
    const state = race.current;
    state.elapsed = advanceRaceTime(state.elapsed, delta, active);
    state.pose = racingCarPose(state.elapsed, state.pose, active ? delta : 0);
    car.current.position.set(...state.pose.position); car.current.rotation.y = state.pose.heading;
    contact.current.position.set(state.pose.position[0], RACING_TRACK_Y + .005, state.pose.position[2]);
    contact.current.rotation.set(-Math.PI / 2, 0, state.pose.heading);
  }, -3);
  return <group name="Racing circuit">
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, RACING_TRACK_Y - .025, 0]} renderOrder={-3}>
      <planeGeometry args={[14, 10.5]} />
      <shaderMaterial vertexShader={groundVertex} fragmentShader={groundFragment} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
    <mesh geometry={geometry.road}>
      <meshStandardMaterial color={dark ? '#151d1e' : '#26302f'} roughness={.98} metalness={.015} envMapIntensity={.08} />
    </mesh>
    <mesh geometry={geometry.edges}>
      <meshStandardMaterial color={dark ? '#9ca79b' : '#b1b9aa'} roughness={1} envMapIntensity={0} />
    </mesh>
    <mesh geometry={geometry.kerbs}>
      <meshStandardMaterial vertexColors color="#a8aea3" roughness={1} envMapIntensity={0} />
    </mesh>
    <mesh geometry={geometry.start}>
      <meshStandardMaterial vertexColors color="#aeb4a8" roughness={1} envMapIntensity={0} />
    </mesh>
    <mesh ref={contact} renderOrder={-1}>
      <planeGeometry args={[.47, 1.06]} />
      <shaderMaterial vertexShader={contactVertex} fragmentShader={contactFragment} transparent depthWrite={false} />
    </mesh>
    <group ref={car} name="F1 car driving on circuit">{children}</group>
  </group>;
}
