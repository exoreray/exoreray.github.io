import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { waveformDisplayGain, waveformLevels, waveformStart } from './waveform';
import { createMeshResponse, softenMeshSignal, updateMeshResponse } from './meshResponse';

const vertexShader=`
  uniform sampler2D uWave;
  uniform float uTime;
  uniform float uEnergy;
  varying float vLight;
  varying float vDepth;
  float sampleWave(float phase) {
    float index=fract(phase)*511.0;
    float left=floor(index);
    return mix(texture2D(uWave,vec2((left+.5)/512.0,.5)).r,texture2D(uWave,vec2((min(left+1.0,511.0)+.5)/512.0,.5)).r,fract(index));
  }
  void main(){
    float u=position.x,v=position.y;
    float signal=sampleWave(u/6.28318);
    float radius=1.55+.23*cos(u*2.0+uTime*.12);
    float tube=.43+.08*sin(u*3.0-uTime*.18)+signal*.16;
    float twist=v+u*1.5+uTime*.09;
    vec3 p=vec3((radius+tube*cos(twist))*cos(u),tube*sin(twist)+.48*sin(u*2.0+uTime*.11),(radius+tube*cos(twist))*sin(u));
    p.y+=signal*.24*(.65+.35*cos(v));
    p.z+=sampleWave(u/6.28318+.25)*.10*sin(v);
    p*=1.0+uEnergy*.04;
    vDepth=p.z;
    vLight=.52+.3*sin(u*3.0+v*.7+uTime*.18)+min(1.0,abs(signal)*1.4)*.38;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
  }
`;
const fragmentShader=`
  uniform float uDark;
  uniform float uEnergy;
  uniform float uFade;
  varying float vLight;
  varying float vDepth;
  void main(){
    vec3 shadow=mix(vec3(.35,.22,.08),vec3(.6,.39,.15),uDark);
    vec3 light=mix(vec3(.65,.43,.15),vec3(1.0,.87,.61),uDark);
    vec3 color=mix(shadow,light,clamp(vLight,0.0,1.0));
    float front=smoothstep(-2.0,2.0,vDepth);
    float alpha=(.09+front*.15+vLight*.13+uEnergy*.06)*uFade;
    gl_FragColor=vec4(color,alpha);
  }
`;

export default function AudioMesh({ analysis, active, dark, compact, interaction }) {
  const group=useRef();
  const stats=useRef({frames:0,time:0});
  const {gl}=useThree();
  const {geometry,texture,samples,filtered,response,uniforms}=useMemo(()=>{
    const uSteps=compact?112:160,vSteps=compact?32:44;
    const vertices=[];
    for(let u=0;u<uSteps;u++)for(let v=0;v<vSteps;v++){
      const a=u/uSteps*Math.PI*2,b=v/vSteps*Math.PI*2;
      vertices.push(a,b,0,(u+1)/uSteps*Math.PI*2,b,0);
      vertices.push(a,b,0,a,(v+1)/vSteps*Math.PI*2,0);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(),3);
    const response=createMeshResponse();
    const texture=new THREE.DataTexture(response.wave,512,1,THREE.RedFormat,THREE.FloatType);
    texture.minFilter=THREE.NearestFilter;texture.magFilter=THREE.NearestFilter;texture.needsUpdate=true;
    return {geometry,texture,response,samples:new Float32Array(2048),filtered:new Float32Array(2048),uniforms:{uWave:{value:texture},uTime:{value:0},uEnergy:{value:0},uDark:{value:1},uFade:{value:1}}};
  },[compact]);
  useEffect(()=>{uniforms.uDark.value=dark?1:0;},[dark,uniforms]);
  useEffect(()=>{
    gl.domElement.dataset.visualizer='audio-mesh';
    gl.domElement.dataset.audioResponse='balanced';
    return ()=>{for(const key of ['visualizer','audioState','audioRms','audioResponse','musicEnvelope','musicFrame','musicFrameMs'])delete gl.domElement.dataset[key];};
  },[gl]);
  useEffect(()=>()=>{geometry.dispose();texture.dispose();},[geometry,texture]);
  useFrame((_,delta)=>{
    if(!active){gl.domElement.dataset.audioState='frozen';return;}
    const audio=analysis?.current;
    let rms=0;
    if(audio?.playing && audio.analyser){
      audio.analyser.getFloatTimeDomainData(samples);
      const levels=waveformLevels(samples);
      const gain=waveformDisplayGain(levels.peak,audio.volume??1);
      softenMeshSignal(samples,filtered);
      const start=waveformStart(filtered,1024);
      rms=levels.rms;
      updateMeshResponse(response,filtered,start,rms,gain,delta);
      gl.domElement.dataset.audioState='live';
    }else{
      updateMeshResponse(response,null,0,0,response.gain,delta);gl.domElement.dataset.audioState='idle';
    }
    uniforms.uEnergy.value=response.energy;
    texture.needsUpdate=true;
    uniforms.uTime.value+=Math.min(delta,.05);
    uniforms.uFade.value=1-Math.min(.72,(interaction.current.scroll||0)*.6);
    group.current.rotation.set(1.08+Math.sin(uniforms.uTime.value*.09)*.1,Math.sin(uniforms.uTime.value*.06)*.14,-.34);
    if(process.env.NODE_ENV!=='production'){
      const sample=stats.current;sample.frames++;sample.time+=delta;
      if(sample.frames%20===0){gl.domElement.dataset.audioRms=rms.toFixed(4);gl.domElement.dataset.musicEnvelope=response.energy.toFixed(4);gl.domElement.dataset.musicFrame=String(sample.frames);gl.domElement.dataset.musicFrameMs=(sample.time/sample.frames*1000).toFixed(1);}
    }
  });
  return <group ref={group} rotation={[1.08,0,-.34]} scale={1.05}>
    <lineSegments geometry={geometry} frustumCulled={false}>
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={dark?THREE.AdditiveBlending:THREE.NormalBlending} />
    </lineSegments>
  </group>;
}
