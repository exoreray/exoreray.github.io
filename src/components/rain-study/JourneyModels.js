import { Component, Suspense, lazy, useLayoutEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei/core/Gltf';
import * as THREE from 'three';
import { journeyScenes } from './journeyScenes';

const AppleParkStage = lazy(() => import('./AppleParkStage'));
const LandmarkLandscape = lazy(() => import('./LandmarkLandscape'));
const RacingCircuit = lazy(() => import('./RacingCircuit'));
const Growth = lazy(() => import('../FlowGPTGrowth'));
const Network = lazy(() => import('../NetworkGraph'));
const SoulOrb = lazy(() => import('../LiviaSoulOrb'));

class ChapterBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(this.props.index); }
  render() { return this.state.failed ? null : this.props.children; }
}

function OriginalAsset({ specification }) {
  // Normalize each authored asset while retaining its sculpted geometry and materials.
  const { scene } = useGLTF(specification.asset, false, false);
  const fitted = useMemo(() => {
    const object = scene.clone(true);
    if(specification.authored)return {object,offset:new THREE.Vector3(),scale:1};
    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    return { object, offset: center.multiplyScalar(-1), scale: specification.size / Math.max(size.x, size.y, size.z, .001) };
  }, [scene, specification]);
  return <group rotation={specification.rotation}><group scale={fitted.scale}><primitive object={fitted.object} position={fitted.offset} dispose={null} /></group></group>;
}

function OriginalScene({ index, active, dark, raceRef, onReady }) {
  const specification = journeyScenes[index];
  // This effect runs only after the nested lazy module/GLB has resolved.
  return <Suspense fallback={null}><ReadyScene index={index} onReady={onReady}>
    {specification.kind === 'campus' ? <LandmarkLandscape specification={specification} dark={dark}><OriginalAsset specification={specification} /></LandmarkLandscape>
      : specification.kind === 'apple-park' ? <AppleParkStage active={active} dark={dark}><OriginalAsset specification={specification} /></AppleParkStage>
      : specification.kind === 'racing' ? <RacingCircuit active={active} dark={dark} raceRef={raceRef}><OriginalAsset specification={specification} /></RacingCircuit>
      : specification.asset ? <OriginalAsset specification={specification} /> : null}
    {specification.kind === 'growth' && <group scale={.62}><Growth active={active} particleSize={.055} /></group>}
    {specification.kind === 'network' && <group scale={.56}><Network active={active} /></group>}
    {specification.kind === 'soul-orb' && <group scale={.95}><SoulOrb active={active} /></group>}
  </ReadyScene></Suspense>;
}
function ReadyScene({ index, onReady, children }) {
  const group = useRef();
  useLayoutEffect(() => { onReady(index); }, [index, onReady]);
  return <group ref={group}>{children}</group>;
}


export default function JourneyModel(props) {
  return <ChapterBoundary index={props.index} onError={props.onError}><OriginalScene {...props} /></ChapterBoundary>;
}
