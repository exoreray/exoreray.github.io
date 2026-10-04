import { useContext, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei/core/Gltf';
import { MeshTransmissionMaterial } from '@react-three/drei/core/MeshTransmissionMaterial';
import { Environment } from '@react-three/drei/core/Environment';
import { Lightformer } from '@react-three/drei/core/Lightformer';
import { useFBO } from '@react-three/drei/core/Fbo';
import { ThemeContext } from '../context/ThemeContext';
import LiviaSoulAtmosphere from './LiviaSoulAtmosphere';
import * as THREE from 'three';

const auraVertex = `
  uniform float uTime;
  varying vec3 vLocal;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 p=position;
    float breathing=sin(p.y*2.8+uTime*.55)*sin(p.x*2.1-uTime*.31)*.022;
    p+=normal*breathing;
    vLocal=p;
    vec4 view=modelViewMatrix*vec4(p,1.0);
    vView=-view.xyz;
    vNormal=normalize(normalMatrix*normal);
    gl_Position=projectionMatrix*view;
  }
`;
const auraFragment = `
  uniform float uTime;
  uniform vec3 uWater;
  uniform vec3 uRose;
  uniform vec3 uMint;
  varying vec3 vLocal;
  varying vec3 vNormal;
  varying vec3 vView;
  vec3 colorAt(float step) {
    float key=mod(step,3.0);
    return key<1.0 ? uWater : (key<2.0 ? uRose : uMint);
  }
  void main() {
    float t=uTime*.62;
    vec3 p=vLocal;
    p+=.22*vec3(sin(p.y*2.7+t),sin(p.z*2.4-t*.8),sin(p.x*2.5+t*.7));
    vec3 a=vec3(cos(t)*.58,sin(t)*.48,sin(t*.7)*.25);
    vec3 b=vec3(cos(t+2.094)*.58,sin(t+2.094)*.48,cos(t*.8)*.25);
    vec3 c=vec3(cos(t+4.189)*.58,sin(t+4.189)*.48,-sin(t*.6)*.25);
    float wa=exp(-3.1*dot(p-a,p-a));
    float wb=exp(-3.1*dot(p-b,p-b));
    float wc=exp(-3.1*dot(p-c,p-c));
    // Short, eased changes between color arrangements, with a pause to let
    // each arrangement read. Local glints have independent phases.
    float beat=uTime*.72;
    float step=floor(beat);
    float hop=smoothstep(.08,.3,fract(beat));
    vec3 water=mix(colorAt(step),colorAt(step+1.0),hop);
    vec3 rose=mix(colorAt(step+1.0),colorAt(step+2.0),hop);
    vec3 mint=mix(colorAt(step+2.0),colorAt(step+3.0),hop);
    vec3 tint=(water*wa+rose*wb+mint*wc)/max(.0001,wa+wb+wc);
    float facing=abs(dot(normalize(vNormal),normalize(vView)));
    float wisp=pow(.5+.5*sin(p.y*5.0+p.x*2.0+sin(p.z*3.0+t)),5.0);
    float veil=pow(.5+.5*sin(p.x*3.4-p.y*2.1+sin(p.z*2.0-t*.7)),3.0);
    float glint=pow(.5+.5*sin(p.x*7.0+p.y*5.0+uTime*3.2),16.0);
    glint*=pow(.5+.5*sin(p.z*6.0-p.y*3.0-uTime*2.1),4.0);
    tint=mix(tint,vec3(.87,.94,1.0),.03+wisp*.08+glint*.35);
    tint*=.95+facing*.26+glint*.85;
    float density=(.23+wisp*.32+veil*.2+glint*.22)*smoothstep(.02,.42,facing);
    gl_FragColor=vec4(tint,density);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function LiviaSoulOrb({ active = true }) {
  const { scene } = useGLTF('/models/livia-soul-orb-v2.glb', false, false);
  const group = useRef();
  const glass = useRef();
  const shellMesh = useRef();
  const atmosphere = useRef();
  const buffer = useFBO(512, 512, { samples: 4 });
  const { darkMode } = useContext(ThemeContext);
  const studio = useMemo(()=>new THREE.Scene(),[]);
  const backdrop = useMemo(()=>new THREE.Color(darkMode?'#1a1410':'#fdfbf7'),[darkMode]);
  const elapsed = useRef(0);
  const { object, shellGeometry, shellMatrix, faceMaterial, coreMaterial, eyes, faceMeshes } = useMemo(() => {
    const object=scene.clone(true);
    object.updateMatrixWorld(true);
    const shell=object.getObjectByName('SoulShell');
    const core=object.getObjectByName('ChromaticCore');
    const eyes=['EyeLeft','EyeRight'].map(name=>object.getObjectByName(name));
    const faceMaterial=new THREE.MeshPhysicalMaterial({color:'#9ebbc4',transparent:true,opacity:.18,roughness:.22,metalness:.04,clearcoat:.7,depthWrite:false});
    const coreMaterial=new THREE.ShaderMaterial({vertexShader:auraVertex,fragmentShader:auraFragment,uniforms:{uTime:{value:0},uWater:{value:new THREE.Color('#78c5f2')},uRose:{value:new THREE.Color('#efa2ce')},uMint:{value:new THREE.Color('#91e4c6')}},transparent:true,depthWrite:false,toneMapped:false});
    core.material=coreMaterial;core.renderOrder=0;
    const faceMeshes=[];
    object.traverse(mesh=>{
      if(mesh.isMesh && /^(Eye|Smile)/.test(mesh.name)){
        mesh.material=faceMaterial;mesh.renderOrder=20;
        faceMeshes.push(mesh);
      }
    });
    const shellGeometry=shell.geometry, shellMatrix=shell.matrixWorld.clone();
    shell.visible=false;
    return {object,shellGeometry,shellMatrix,faceMaterial,coreMaterial,eyes,faceMeshes};
  }, [scene]);
  useEffect(()=>()=>{faceMaterial.dispose();coreMaterial.dispose();},[faceMaterial,coreMaterial]);
  useEffect(()=>{
    faceMaterial.color.set(darkMode?'#b3cbd5':'#6e8b9c');
    coreMaterial.uniforms.uWater.value.set(darkMode?'#42bdff':'#199bdd');
    coreMaterial.uniforms.uRose.value.set(darkMode?'#ff77d0':'#e64f9b');
    coreMaterial.uniforms.uMint.value.set(darkMode?'#6bf5b5':'#2aba8a');
  },[darkMode,faceMaterial,coreMaterial]);
  useFrame((state,delta)=>{
    if(glass.current && studio.environment && glass.current.envMap!==studio.environment){glass.current.envMap=studio.environment;glass.current.needsUpdate=true;}
    if(active)elapsed.current+=Math.min(delta,.05);
    const time=elapsed.current;
    coreMaterial.uniforms.uTime.value=time;
    // Quiet movement and a translucent expression; the face remains attached to the orb.
    const breath=1+Math.sin(time*.85)*.014;
    if(group.current){group.current.scale.set(breath,breath,breath);group.current.position.y=Math.sin(time*.55)*.055;group.current.rotation.z=Math.sin(time*.32)*.035;}
    faceMaterial.opacity=.18+Math.sin(time*.65)*.025;
    const phase=time%7.1;
    const blink=phase>5.8 && phase<6.04 ? 1-.92*Math.sin((phase-5.8)/.24*Math.PI) : 1;
    eyes.forEach(eye=>{if(eye)eye.scale.y=blink;});
    // Capture the inner color once. Excluding the etched face prevents a second,
    // refracted set of eyes; a hidden prefetched chapter does no offscreen work.
    for(let ancestor=group.current;ancestor;ancestor=ancestor.parent){if(!ancestor.visible)return;}
    if(!shellMesh.current)return;
    const background=state.scene.background;
    const toneMapping=state.gl.toneMapping;
    const target=state.gl.getRenderTarget();
    shellMesh.current.visible=false;
    if(atmosphere.current)atmosphere.current.visible=false;
    faceMeshes.forEach(mesh=>{mesh.visible=false;});
    try{
      state.scene.background=backdrop;
      state.gl.toneMapping=THREE.NoToneMapping;
      state.gl.setRenderTarget(buffer);
      state.gl.render(state.scene,state.camera);
    }finally{
      shellMesh.current.visible=true;
      if(atmosphere.current)atmosphere.current.visible=true;
      faceMeshes.forEach(mesh=>{mesh.visible=true;});
      state.scene.background=background;
      state.gl.toneMapping=toneMapping;
      state.gl.setRenderTarget(target);
    }
  });
  return <group ref={group} dispose={null}>
    <Environment scene={studio} frames={1} resolution={128}>
      <color attach="background" args={['#80778b']} />
      <Lightformer form="circle" position={[-4,4,5]} target={[0,0,0]} scale={[2.4,4,1]} intensity={1.6} color="#f3f6ff" />
      <Lightformer form="circle" position={[4,2,-2]} target={[0,0,0]} scale={[2.2,2.2,1]} intensity={1.3} color="#ffe1ef" />
      <Lightformer form="circle" position={[0,-3,4]} target={[0,0,0]} scale={[3,1.5,1]} intensity={.8} color="#caf2dc" />
    </Environment>
    <primitive object={object} dispose={null} />
    <mesh ref={shellMesh} geometry={shellGeometry} matrix={shellMatrix} matrixAutoUpdate={false} renderOrder={10}>
      <MeshTransmissionMaterial ref={glass} buffer={buffer.texture} transparent depthWrite={false} toneMapped={false} resolution={32} samples={4} transmission={.98} thickness={.18} roughness={.035} ior={1.28} chromaticAberration={.006} anisotropicBlur={.015} distortion={.012} distortionScale={.32} temporalDistortion={0} color="#edf6ff" clearcoat={1} clearcoatRoughness={.1} envMapIntensity={.7} iridescence={.48} iridescenceIOR={1.25} />
    </mesh>
    <group ref={atmosphere}><LiviaSoulAtmosphere time={coreMaterial.uniforms.uTime} dark={darkMode} /></group>
  </group>;
}
