import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// The fitted ring is 4.6 units across. Its low foundation meets this landscape;
// the landscape fades into the page instead of ending at a presentation plinth.
const GROUND = -.167;
const terrainVertex = `
  varying vec2 vGround;
  varying float vRelief;
  void main() {
    vec3 p = position;
    vGround = p.xy;
    float outside = smoothstep(2.5, 3.5, length(p.xy));
    vRelief = outside * (sin(p.x * 1.1 + .3) * cos(p.y * .85) * .033);
    p.z += vRelief;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const terrainFragment = `
  uniform vec3 uMeadow;
  uniform vec3 uShade;
  varying vec2 vGround;
  varying float vRelief;
  void main() {
    float radius = length(vGround);
    float grain = sin(vGround.x * 1.7 + sin(vGround.y * 1.5)) * .5 + .5;
    float angle = atan(vGround.y, vGround.x);
    float boundary = 5.0 + sin(angle * 3.0 + .4) * .34 + cos(angle * 5.0) * .17;
    float alpha = 1.0 - smoothstep(2.8, boundary, radius);
    float ringShade = exp(-pow((radius - 2.26) * 12.0, 2.0)) * .17;
    vec3 color = mix(uShade, uMeadow, .58 + grain * .25 + vRelief * 1.4);
    gl_FragColor = vec4(color * (1.0 - ringShade), alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function buildGroves() {
  let state = 2017;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  const trees = [];
  const plant = (x, z, h) => {
    if (trees.some(tree => (tree.x - x) ** 2 + (tree.z - z) ** 2 < .026)) return;
    const relief = THREE.MathUtils.smoothstep(Math.hypot(x, z), 2.5, 3.5)
      * Math.sin(x * 1.1 + .3) * Math.cos(z * .85) * .033;
    trees.push({ x, z, y: GROUND - .008 + relief, h, turn: random() * Math.PI, tint: random() });
  };
  // Connected irregular groves read as landscape, with clear pockets between
  // them. Scattering identical isolated crowns makes the site feel like a toy.
  for (let grove = 0; grove < 13; grove++) {
    const angle = grove / 13 * Math.PI * 2 + random() * .22;
    const radius = 3.14 + random() * .47;
    const centerX = Math.cos(angle) * radius, centerZ = Math.sin(angle) * radius;
    for (let tree = 0; tree < 17; tree++) {
      const bearing = random() * Math.PI * 2, spread = Math.sqrt(random()) * .62;
      const x = centerX + Math.cos(bearing) * spread, z = centerZ + Math.sin(bearing) * spread;
      if (Math.hypot(x, z) < 2.68 || Math.hypot(x, z) > 4.26 || (Math.abs(x) < .24 && z > 0)) continue;
      plant(x, z, .20 + random() * .15);
    }
  }
  for (let i = 0; i < 90; i++) {
    const x = (random() * 2 - 1) * 1.45, z = (random() * 2 - 1) * 1.45;
    if (Math.hypot(x, z) > 1.49 || Math.abs(x) < .20 || Math.abs(z) < .17) continue;
    if ((x + .45) ** 2 + (z + .52) ** 2 < .23 || (x > .1 && z > .18)) continue;
    plant(x, z, .18 + random() * .13);
  }
  // A quiet orchard rhythm is one of the actual courtyard's distinguishing features.
  for (let x = .36; x < 1.23; x += .24) {
    for (let z = .3; z < 1.19; z += .24) {
      if (Math.hypot(x, z) < 1.46) plant(x, z, .19 + random() * .025);
    }
  }
  return trees;
}

function Groves({ dark }) {
  const canopy = useRef(), trunks = useRef();
  const trees = useMemo(buildGroves, []);
  useLayoutEffect(() => {
    const matrix = new THREE.Object3D();
    const leaf = new THREE.Color();
    trees.forEach((tree, index) => {
      matrix.position.set(tree.x, tree.y + tree.h * .34, tree.z);
      matrix.rotation.set(0, tree.turn, 0);
      matrix.scale.set(.011, tree.h * .64, .011);
      matrix.updateMatrix(); trunks.current.setMatrixAt(index, matrix.matrix);
      for (let cluster = 0; cluster < 3; cluster++) {
        const angle = tree.turn + cluster * Math.PI * 2 / 3;
        matrix.position.set(tree.x + Math.cos(angle) * tree.h * (cluster === 0 ? .05 : .17),
          tree.y + tree.h * (.67 + (cluster === 1 ? .10 : -.03 * cluster)),
          tree.z + Math.sin(angle) * tree.h * (cluster === 0 ? .05 : .17));
        matrix.rotation.set(.12 * cluster, tree.turn, -.08 * cluster);
        matrix.scale.set(tree.h * (cluster === 0 ? .44 : .32), tree.h * .25, tree.h * (cluster === 0 ? .38 : .29));
        matrix.updateMatrix(); canopy.current.setMatrixAt(index * 3 + cluster, matrix.matrix);
        leaf.set(dark ? '#61784f' : '#668051').lerp(new THREE.Color(dark ? '#879164' : '#8b975f'), tree.tint * .38);
        canopy.current.setColorAt(index * 3 + cluster, leaf);
      }
    });
    canopy.current.instanceMatrix.needsUpdate = true;
    canopy.current.instanceColor.needsUpdate = true;
    // The first render can precede instanceColor allocation; compile with the
    // instance tint path explicitly once it is populated.
    canopy.current.material.needsUpdate = true;
    canopy.current.computeBoundingSphere();
    trunks.current.instanceMatrix.needsUpdate = true;
    trunks.current.computeBoundingSphere();
  }, [trees, dark]);
  return <>
    <instancedMesh ref={trunks} args={[null, null, trees.length]}>
      <cylinderGeometry args={[.72, 1, 1, 5]} />
      <meshStandardMaterial color={dark ? '#394332' : '#46503a'} roughness={1} envMapIntensity={0} />
    </instancedMesh>
    <instancedMesh ref={canopy} args={[null, null, trees.length * 3]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={dark ? '#819678' : '#819b72'} roughness={1} metalness={0} envMapIntensity={0} />
    </instancedMesh>
  </>;
}

export default function AppleParkStage({ children, dark = false }) {
  const uniforms = useMemo(() => ({
    uMeadow: { value: new THREE.Color(dark ? '#354736' : '#7b8b65') },
    uShade: { value: new THREE.Color(dark ? '#223628' : '#526a49') },
  }), [dark]);
  const pond = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-.29, -.02);
    shape.bezierCurveTo(-.31, .16, -.08, .21, .10, .12);
    shape.bezierCurveTo(.28, .06, .30, -.08, .10, -.13);
    shape.bezierCurveTo(-.10, -.19, -.25, -.13, -.29, -.02);
    return shape;
  }, []);
  return <group name="Apple Park campus setting">
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND - .008, 0]} renderOrder={-2}>
      <planeGeometry args={[11, 11, 48, 48]} />
      <shaderMaterial vertexShader={terrainVertex} fragmentShader={terrainFragment} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
    {[{ inner: 2.47, outer: 2.51 }, { inner: 1.62, outer: 1.65 }].map(({ inner, outer }) =>
      <mesh key={inner} rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND + .002, 0]}>
        <ringGeometry args={[inner, outer, 192]} />
        <meshStandardMaterial color={dark ? '#8d998c' : '#b8c0a7'} roughness={.98} envMapIntensity={.15} />
      </mesh>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-.46, GROUND + .006, -.53]}>
      <shapeGeometry args={[pond, 32]} />
      <meshStandardMaterial color={dark ? '#526f70' : '#839fa0'} metalness={.36} roughness={.18} />
    </mesh>
    <Groves dark={dark} />
    {children}
  </group>;
}
