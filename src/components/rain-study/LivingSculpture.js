import { memo, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import AudioMesh from './AudioMesh';
import { advanceWaterSurface, createWaterSurface, resetWaterSurface, WATER_LIMIT, WATER_SIZE, WATER_SPAN } from './waterSurface';

const vertexShader = `
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uTouchPoint;
uniform float uTouchStrength;
uniform sampler2D uWater;
uniform float uWaterSpan;
uniform float uWaterLimit;
uniform float uPulse;
uniform float uHover;
uniform float uWeights[8];
uniform float uSelected;
uniform float uAudio;
uniform float uScroll;
varying float vDepth;
varying float vLight;
varying vec3 vWorld;
void main() {
  float t = uTime;
  float u = atan(position.z, position.x);
  float v = asin(clamp(position.y / max(length(position), .01), -.999, .999));
  float h = v / 1.57;
  float ringRadius = 1.5 + .48 * cos(v * 2.0);
  vec3 journey = vec3(cos(h * 4.2 + u * .10) * (1.1 + .35 * cos(u)), h * 2.2, sin(h * 4.2 + u * .10) * (1.1 + .35 * cos(u)));
  vec3 works = vec3(ringRadius * cos(u), .72 * sin(v * 2.0) + .16 * sin(u * 3.0 + t * .3), ringRadius * sin(u));
  vec3 projects = vec3(position.x * 1.05, position.y * .55 + .3 * sin(u * 2.0 + v * 3.0 + t * .2), position.z * .85);
  float musicRadius = ringRadius + uAudio * .18 * sin(u * 12.0 + t);
  vec3 music = vec3(musicRadius * cos(u), musicRadius * sin(u), .35 * sin(v * 2.0));
  vec3 thoughts = vec3(position.x * 1.15, position.y * .85, position.z + .3 * sin(position.x * 2.0 + t * .2));
  vec3 skills = vec3((1.4 + .55 * cos(u * 3.0 + v)) * cos(u * 2.0), (1.4 + .55 * cos(u * 3.0 + v)) * sin(u * 2.0), .55 * sin(u * 3.0 + v));
  vec3 awards = vec3(position.x * (.5 + .15 * cos(v * 3.0)), position.y * 1.18, position.z * .6);
  vec3 p = position * uWeights[0] + journey * uWeights[1] + works * uWeights[2] + projects * uWeights[3] + music * uWeights[4] + thoughts * uWeights[5] + skills * uWeights[6] + awards * uWeights[7];
  p.xz = mat2(cos(uSelected * .09), -sin(uSelected * .09), sin(uSelected * .09), cos(uSelected * .09)) * p.xz;
  float wave = sin(p.y * 2.8 + t * .46) * .12 + cos(p.x * 2.5 - t * .31) * .07;
  float distanceToTouch = length(p.xy - uTouchPoint);
  float touch = exp(-distanceToTouch * distanceToTouch * .65);
  float ripple = sin(distanceToTouch * 8.0 - uPulse * 5.0) * exp(-uPulse * .85) * .14;
  p += normalize(p) * (wave + (touch * (.035 + .15 * uTouchStrength) + ripple * .35) * (1.0 - uWeights[0]));
  float twist = p.y * (.19 + sin(t * .24) * .1) + t * .045;
  mat2 rotate = mat2(cos(twist), -sin(twist), sin(twist), cos(twist));
  p.xz = rotate * p.xz;
  vec2 waterUV = p.xy / uWaterSpan + .5;
  vec2 waterSample = texture2D(uWater, waterUV).rg;
  float waterHeight = (dot(waterSample, vec2(65280.0, 255.0)) - 32768.0) / 32767.0 * uWaterLimit;
  // Display gain leaves the water simulation's speed and damping unchanged.
  p += normalize(p) * waterHeight * uWeights[0] * 4.5;
  p.x *= 1.0 + uHover * .055;
  p.y *= 1.0 - uHover * .03;
  vDepth = p.z;
  vWorld = p;
  vLight = .6 + .4 * sin(position.y * 7.0 + position.x * 2.0 + t * .65);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const fragmentShader = `
uniform float uDark;
varying float vDepth;
varying float vLight;
varying vec3 vWorld;
uniform float uScroll;
void main() {
  float front = smoothstep(-1.9, 1.9, vDepth);
  float rim = 1.0 - smoothstep(.45, 1.8, abs(vDepth));
  float quietCenter = smoothstep(.4, 1.4, length(vWorld.xy));
  float alpha = (.035 + front * .12 + rim * .12) * (.42 + vLight * .58) * (.22 + quietCenter * .78);
  vec3 shadowGold = mix(vec3(.43,.29,.1), vec3(.62,.39,.14), uDark);
  vec3 lightGold = mix(vec3(.64,.44,.17), vec3(1.0,.86,.57), uDark);
  vec3 color = mix(shadowGold, lightGold, vLight * .65 + rim * .35);
  gl_FragColor = vec4(color, alpha * (1.0 - uScroll * .86));
}`;
const pointVertex = `
uniform float uTime;
uniform vec2 uPointer;
attribute float aSize;
attribute float aPhase;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.x += sin(uTime * .15 + aPhase) * .09 + uPointer.x * .04;
  p.y += cos(uTime * .2 + aPhase * 2.0) * .08;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * (18.0 / -mv.z);
  vAlpha = .22 + .5 * pow(.5 + .5 * sin(uTime * .9 + aPhase), 3.0);
}`;
const pointFragment = `
uniform float uDark;
varying float vAlpha;
void main() {
 float d = length(gl_PointCoord - .5);
 if(d > .5) discard;
 float glow = pow(1.0 - d * 2.0, 2.0);
 gl_FragColor = vec4(mix(vec3(.6,.38,.13), vec3(1.0,.86,.57), uDark), glow * vAlpha);
}`;
function Silk({ interaction, active, hovered, dark, shape, selected, compact, analysis }) {
  const group = useRef(); const lastPulse = useRef(interaction.current.pulse);
  const frameStats = useRef({frames:0,elapsed:0,total:0});
  const { invalidate, gl, camera, size } = useThree();
  const water = useMemo(createWaterSurface,[]);
  const waterTexture = useMemo(()=>{
    const texture=new THREE.DataTexture(water.pixels,WATER_SIZE,WATER_SIZE,THREE.RGBAFormat,THREE.UnsignedByteType);
    texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
    texture.generateMipmaps=false;texture.needsUpdate=true;
    return texture;
  },[water]);
  const canvasBounds = useRef(null);
  const touchVector = useMemo(() => new THREE.Vector3(), []);
  const touchDirection = useMemo(() => new THREE.Vector3(), []);
  const uniforms = useMemo(() => ({uTime:{value:0},uPointer:{value:new THREE.Vector2()},uTouchPoint:{value:new THREE.Vector2()},uTouchStrength:{value:0},uWater:{value:waterTexture},uWaterSpan:{value:WATER_SPAN},uWaterLimit:{value:WATER_LIMIT},uPulse:{value:30},uHover:{value:0},uDark:{value:1},uWeights:{value:[1,0,0,0,0,0,0,0]},uSelected:{value:0},uAudio:{value:0},uScroll:{value:0}}), [waterTexture]);
  const geometry = useMemo(() => {
    const vertices = []; const count = compact ? 64 : 105; const steps = compact ? 140 : 180;
    for (let line = 0; line < count; line++) {
      const latitude = (line / (count - 1) - .5) * Math.PI * .98;
      for (let j = 0; j < steps; j++) {
        for (const k of [j, j + 1]) {
          const t = k / steps * Math.PI * 2;
          const warp = .08 * Math.sin(t * 3 + latitude * 5) + .045 * Math.sin(t * 7 - latitude * 3);
          const radius = 2.14 + warp;
          const x = radius * Math.cos(latitude) * Math.cos(t);
          const y = radius * Math.sin(latitude) * (1 + .045 * Math.sin(t * 2));
          const z = radius * Math.cos(latitude) * Math.sin(t);
          vertices.push(x, y, z);
        }
      }
    }
    const result = new THREE.BufferGeometry(); result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); return result;
  }, [compact]);
  const dust = useMemo(() => {
    const points = [], sizes = [], phases = [];
    for (let i = 0; i < 500; i++) {
      const phi = Math.acos(1 - 2 * ((i + .5) / 500)); const theta = i * Math.PI * (3 - Math.sqrt(5));
      const radius = 2.2 + (Math.sin(i * 731.4) + 1) * .37;
      points.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
      sizes.push(.65 + (Math.sin(i * 38.3) + 1) * .65); phases.push(i * 13.45);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); g.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1)); g.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1)); return g;
  }, []);
  useEffect(() => { uniforms.uDark.value = dark ? 1 : 0; invalidate(); }, [dark, uniforms, invalidate]);
  useEffect(() => { gl.domElement.setAttribute('aria-hidden', 'true'); }, [gl]);
  useEffect(() => {if(active){water.positioned=false;water.pressure=0;}},[active,water]);
  useEffect(() => {
    gl.domElement.dataset.deformation=shape===0?'water-surface':'ambient';
    if(shape!==0){resetWaterSurface(water);waterTexture.needsUpdate=true;}
  },[gl,shape,water,waterTexture]);
  useEffect(() => {water.positioned=false;water.pressure=0;},[water,size.width,size.height]);
  useEffect(() => () => waterTexture.dispose(),[waterTexture]);
  useEffect(() => {
    const update=()=>{canvasBounds.current=gl.domElement.getBoundingClientRect();};
    update();
    window.visualViewport?.addEventListener('scroll',update);
    window.visualViewport?.addEventListener('resize',update);
    window.addEventListener('scroll',update,{passive:true});
    return()=>{
      window.visualViewport?.removeEventListener('scroll',update);
      window.visualViewport?.removeEventListener('resize',update);
      window.removeEventListener('scroll',update);
    };
  },[gl,size.width,size.height]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => dust.dispose(), [dust]);
  useFrame((_, delta) => {
    if(shape===4)return;
    if (process.env.NODE_ENV !== 'production' && active) {
      const sample=frameStats.current; sample.frames++;sample.total++;sample.elapsed+=delta;
      if (sample.elapsed>=1) {gl.domElement.dataset.frameMs=String(Math.round(sample.elapsed/sample.frames*1000));gl.domElement.dataset.frameCount=String(sample.total);sample.frames=0;sample.elapsed=0;}
    }
    const dt = Math.min(delta, .05);
    const bounds=canvasBounds.current;
    const projectTouch = (x,y) => {
      if (!bounds?.width || !bounds?.height) return touchVector.set(0,0,0);
      touchVector.set((x-bounds.left)/bounds.width*2-1,1-(y-bounds.top)/bounds.height*2,.5).unproject(camera);
      touchDirection.copy(touchVector).sub(camera.position).normalize();
      touchVector.copy(camera.position).addScaledVector(touchDirection,-camera.position.z/touchDirection.z);
      if(group.current) group.current.worldToLocal(touchVector);
      return touchVector;
    };
    const touch=projectTouch(interaction.current.clientX,interaction.current.clientY);
    uniforms.uTouchPoint.value.lerp(touch,1-Math.exp(-(shape===0?5:14)*dt));
    uniforms.uTouchStrength.value=THREE.MathUtils.damp(uniforms.uTouchStrength.value,interaction.current.down?1:0,8,dt);
    if(active && (shape===0 || uniforms.uWeights.value[0]>.001)) {
      advanceWaterSurface(water,touch.x,touch.y,shape===0 && interaction.current.dragActive,dt);
      waterTexture.needsUpdate=true;
      if(process.env.NODE_ENV!=='production') gl.domElement.dataset.waterAmplitude=water.peak.toFixed(3);
    }
    let unsettled = false;
    for (let i = 0; i < 8; i++) {
      const target = i === shape ? 1 : 0;
      uniforms.uWeights.value[i] = active ? THREE.MathUtils.damp(uniforms.uWeights.value[i], target, 5, dt) : target;
      if (Math.abs(uniforms.uWeights.value[i] - target) > .001) unsettled = true;
    }
    if (unsettled) invalidate();
    uniforms.uScroll.value = interaction.current.scroll || 0;
    uniforms.uSelected.value = THREE.MathUtils.damp(uniforms.uSelected.value, selected || 0, 4, dt);
    const audio = analysis?.current;
    let energy = 0;
    if (active && audio?.playing && audio.analyser) {audio.analyser.getByteFrequencyData(audio.data); for (let i=0;i<16;i++) energy += audio.data[i] / (16 * 255);}
    uniforms.uAudio.value = THREE.MathUtils.damp(uniforms.uAudio.value, energy, 9, dt);
    if (active) { uniforms.uTime.value += dt; uniforms.uPulse.value += dt; }
    if (interaction.current.pulse !== lastPulse.current) {lastPulse.current = interaction.current.pulse; uniforms.uPulse.value = 0;}
    uniforms.uPointer.value.x = THREE.MathUtils.damp(uniforms.uPointer.value.x, interaction.current.x, 3, dt);
    uniforms.uPointer.value.y = THREE.MathUtils.damp(uniforms.uPointer.value.y, interaction.current.y, 3, dt);
    const hoverTarget = shape===0 ? 0 : hovered+1;
    uniforms.uHover.value = THREE.MathUtils.damp(uniforms.uHover.value, hoverTarget, 3, dt);
    if (group.current) {
      const pointerTilt = .08*(1-uniforms.uWeights.value[0]);
      group.current.rotation.z = -.25 + uniforms.uPointer.value.x * pointerTilt;
      group.current.rotation.x = .27 + uniforms.uPointer.value.y * pointerTilt;
    }
  });
  return <group ref={group} visible={shape!==4} rotation={[.27, 0, -.25]}><lineSegments geometry={geometry}><shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending} /></lineSegments><points geometry={dust}><shaderMaterial uniforms={uniforms} vertexShader={pointVertex} fragmentShader={pointFragment} transparent depthWrite={false} blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending} /></points></group>;
}
let sceneInstances = 0;
function LivingSculpture(props) {
  return <div className="living-sculpture"><Canvas onCreated={({gl}) => {if(process.env.NODE_ENV !== 'production') gl.domElement.dataset.sceneInstance=String(++sceneInstances);}} frameloop={props.suspended ? 'never' : props.active ? 'always' : 'demand'} camera={{position:[0,0,7.6], fov:44}} dpr={props.compact ? [1,1.25] : [1,1.5]} gl={{alpha:true, antialias:true, powerPreference:'low-power'}}><Silk {...props} />{props.shape===4 && <AudioMesh {...props} />}</Canvas></div>;
}

export default memo(LivingSculpture);
