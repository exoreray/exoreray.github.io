import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createLandmarkLandscape } from './landmarkLandscapeLayout';

const groundVertex = `
  uniform vec2 uCenter;
  uniform vec2 uExtent;
  varying vec2 vGround;
  varying float vRelief;
  void main() {
    vec3 p = position;
    vGround = vec2(p.x, -p.y) + uCenter;
    vec2 normalized = abs((vGround - uCenter) / uExtent);
    float edge = pow(pow(normalized.x, 4.0) + pow(normalized.y, 4.0), .25);
    vRelief = smoothstep(.60, 1.0, edge) * sin(vGround.x * .80) * cos(vGround.y * .65) * .018;
    p.z += vRelief;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const groundFragment = `
  uniform vec2 uCenter;
  uniform vec2 uExtent;
  uniform vec3 uMeadow;
  uniform vec3 uShade;
  varying vec2 vGround;
  varying float vRelief;
  void main() {
    vec2 q = abs((vGround - uCenter) / uExtent);
    float edge = pow(pow(q.x, 4.0) + pow(q.y, 4.0), .25);
    float grain = sin(vGround.x * .55 + sin(vGround.y * .45)) * cos(vGround.y * .65);
    float boundary = .98 + grain * .045;
    float alpha = 1.0 - smoothstep(.61, boundary, edge);
    vec3 color = mix(uShade, uMeadow, .55 + grain * .19 + vRelief * 2.0);
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const contactVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;
const contactFragment = `
  varying vec2 vUv;
  void main() {
    float radius = length((vUv - .5) * 2.0);
    float alpha = pow(max(0.0, 1.0 - radius), 2.0) * .23;
    gl_FragColor = vec4(.018, .026, .015, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function LandmarkGroves({ trees, dark }) {
  const crowns = useRef(), trunks = useRef(), contacts = useRef();
  useLayoutEffect(() => {
    const transform = new THREE.Object3D();
    const leaf = new THREE.Color();
    const low = new THREE.Color(dark ? '#61784f' : '#668051');
    const high = new THREE.Color(dark ? '#879164' : '#8b975f');
    trees.forEach((tree, index) => {
      transform.position.set(tree.x, tree.y + tree.height * .32, tree.z);
      transform.rotation.set(0, tree.turn, tree.lean);
      transform.scale.set(tree.height * .036, tree.height * .64, tree.height * .036);
      transform.updateMatrix(); trunks.current.setMatrixAt(index, transform.matrix);
      for (let crown = 0; crown < 2; crown++) {
        const angle = tree.turn + crown * 2.3;
        const offset = crown === 0 ? -.07 : .18;
        transform.position.set(tree.x + Math.cos(angle) * tree.height * offset,
          tree.y + tree.height * (crown === 0 ? .66 : .76),
          tree.z + Math.sin(angle) * tree.height * offset);
        transform.rotation.set(.10 * crown, tree.turn, tree.lean);
        transform.scale.set(tree.height * (crown === 0 ? .43 : .31),
          tree.height * (crown === 0 ? .29 : .25), tree.height * (crown === 0 ? .36 : .29));
        transform.updateMatrix(); crowns.current.setMatrixAt(index * 2 + crown, transform.matrix);
        leaf.copy(low).lerp(high, tree.tint * .38 + crown * .025);
        crowns.current.setColorAt(index * 2 + crown, leaf);
      }
      transform.position.set(tree.x, tree.y + .004, tree.z);
      transform.rotation.set(-Math.PI / 2, 0, tree.turn);
      transform.scale.set(tree.height * 1.5, tree.height * 1.25, 1);
      transform.updateMatrix(); contacts.current.setMatrixAt(index, transform.matrix);
    });
    for (const mesh of [crowns.current, trunks.current, contacts.current]) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
    crowns.current.instanceColor.needsUpdate = true;
    // Instance colors are populated after mount; include them in the material
    // program even if the initial compile preceded this layout effect.
    crowns.current.material.needsUpdate = true;
  }, [trees, dark]);
  return <>
    <instancedMesh ref={contacts} args={[null, null, trees.length]} renderOrder={-3}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial vertexShader={contactVertex} fragmentShader={contactFragment} transparent depthWrite={false} />
    </instancedMesh>
    <instancedMesh ref={trunks} args={[null, null, trees.length]}>
      <cylinderGeometry args={[.72, 1, 1, 5]} />
      <meshStandardMaterial color={dark ? '#394332' : '#46503a'} roughness={1} envMapIntensity={0} />
    </instancedMesh>
    <instancedMesh ref={crowns} args={[null, null, trees.length * 2]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={dark ? '#819678' : '#819b72'} roughness={1} metalness={0} envMapIntensity={0} />
    </instancedMesh>
  </>;
}

// Assets and their supplied plazas stay in authored coordinates. This wrapper
// adds a soft landscape and rooted groves, never a second presentation slab.
export default function LandmarkLandscape({ kind, specification, dark = false, children }) {
  const landscape = useMemo(() => createLandmarkLandscape(kind || specification?.landscape?.kind || specification?.label),
    [kind, specification?.landscape?.kind, specification?.label]);
  const uniforms = useMemo(() => landscape ? {
    uCenter: { value: new THREE.Vector2(...landscape.center) },
    uExtent: { value: new THREE.Vector2(...landscape.extent) },
    uMeadow: { value: new THREE.Color(dark ? '#354736' : '#7b8b65') },
    uShade: { value: new THREE.Color(dark ? '#223628' : '#526a49') },
  } : null, [landscape, dark]);
  if (!landscape) return children;
  return <group name={`${landscape.label} landscape`}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[landscape.center[0], landscape.groundY, landscape.center[1]]} renderOrder={-4}>
      <planeGeometry args={[landscape.extent[0] * 2.1, landscape.extent[1] * 2.1, 32, 32]} />
      <shaderMaterial vertexShader={groundVertex} fragmentShader={groundFragment} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
    <LandmarkGroves trees={landscape.trees} dark={dark} />
    {children}
  </group>;
}
