import { memo, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei/core/Environment';
import { Lightformer } from '@react-three/drei/core/Lightformer';
import * as THREE from 'three';
import JourneyModel from './JourneyModels';
import { journeyScenes } from './journeyScenes';
import { advanceFilmTimeline, cameraFrame, chapterPose, framedCameraFov, framedCameraPosition } from './journeyTimeline';
import { trackRacingCamera } from './racingPath';

function SceneLayer({ index, selected, timeline, active, motion, dark, raceRef, onReady, onError }) {
  const group = useRef();
  useFrame(() => {
    if (!group.current) return;
    const incoming = index !== timeline.current.index;
    const pose = chapterPose(timeline.current.progress, incoming, motion);
    group.current.position.y = pose.y;
    group.current.scale.setScalar(pose.scale);
    group.current.rotation.y = pose.rotation;
    group.current.visible = pose.visible;
  });
  return <group ref={group}><JourneyModel index={index} active={active && motion && index === selected} dark={dark} raceRef={raceRef} onReady={onReady} onError={onError} /></group>;
}
function Film({ selected, timeline, active, motion, dark, onReady, onError, onCameraProgress }) {
  const { camera, size, gl, invalidate } = useThree();
  const lookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const frames = useRef(0);
  const displayed=useRef({index:-1,progress:0});
  const raceRef=useRef({elapsed:0});
  useEffect(() => { invalidate(); }, [selected, motion, invalidate]);
  useFrame((_, delta) => {
    const current=advanceFilmTimeline(displayed.current,timeline.current,motion,delta);
    const baseShot = cameraFrame(current.index, current.progress, motion);
    const shot = current.index === 3 && motion ? trackRacingCamera(baseShot, current.progress, raceRef.current.pose) : baseShot;
    const position = framedCameraPosition(current.index,current.progress,shot,size.width/size.height);
    const fov=framedCameraFov(shot,size.width/size.height);
    camera.position.fromArray(position);
    lookAt.fromArray(shot.target);
    if(Math.abs(camera.fov-fov)>.001 || Math.abs(camera.near-shot.near)>.00001){
      camera.fov=fov;camera.near=shot.near;camera.updateProjectionMatrix();
    }
    camera.lookAt(lookAt);
    camera.rotateZ(shot.roll);
    onCameraProgress?.(current.progress);
    if (process.env.NODE_ENV !== 'production' && ++frames.current % 20 === 0) {
      gl.domElement.dataset.chapter = String(timeline.current.index);
      gl.domElement.dataset.progress = current.progress.toFixed(3);
      gl.domElement.dataset.camera = camera.position.toArray().map(x => x.toFixed(2)).join(',');
      gl.domElement.dataset.lens = camera.fov.toFixed(1);
      gl.domElement.dataset.target = lookAt.toArray().map(x=>x.toFixed(2)).join(',');
      gl.domElement.dataset.near = camera.near.toFixed(4);
      if (current.index === 3 && raceRef.current.pose) {
        gl.domElement.dataset.raceTime = raceRef.current.elapsed.toFixed(3);
        gl.domElement.dataset.carPosition = raceRef.current.pose.position.map(x=>x.toFixed(3)).join(',');
      }
    }
  }, -2);
  const slots = selected < journeyScenes.length - 1 ? [selected, selected + 1] : [selected];
  return <>
    <ambientLight intensity={dark ? .48 : .8} />
    <directionalLight position={[5,8,6]} intensity={3.4} color="#fff0d9" />
    <directionalLight position={[-4,4,-2]} intensity={1.1} color="#c8d6f0" />
    <directionalLight position={[1,5,-6]} intensity={2.8} color="#e8d2ae" />
    <Environment frames={1} resolution={64}>
      <Lightformer position={[0,5,0]} rotation={[Math.PI/2,0,0]} scale={[8,8,1]} intensity={2} color="#ffffff" />
      <Lightformer position={[5,1,3]} rotation={[0,-Math.PI/2,0]} scale={[4,7,1]} intensity={2} color="#fff0dc" />
      <Lightformer position={[-5,0,2]} rotation={[0,Math.PI/2,0]} scale={[4,6,1]} intensity={1.5} color="#d5def3" />
    </Environment>
    {slots.map(index => <SceneLayer key={index} index={index} selected={selected} timeline={displayed} active={active} motion={motion} dark={dark} raceRef={raceRef} onReady={onReady} onError={onError} />)}
  </>;
}
function JourneyFilmScene(props) {
  return <Canvas className="journey-film-canvas" frameloop={props.active ? 'always' : 'demand'} dpr={props.compact ? [1,1.15] : [1,1.35]} camera={{position:[4.8,2.3,10.8],fov:39,near:.1,far:60}} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} onCreated={({gl}) => gl.domElement.setAttribute('aria-hidden','true')}>
    <Film {...props} />
  </Canvas>;
}
export default memo(JourneyFilmScene);
