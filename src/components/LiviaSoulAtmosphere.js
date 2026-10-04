import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const spectrum = `
  vec3 spectrum(float phase) {
    return .55 + .45*cos(6.28318*(phase+vec3(.0,.33,.67)));
  }
`;

const haloVertex = `
  varying vec2 vUv;
  void main() {
    vUv=uv;
    vec4 center=modelViewMatrix*vec4(0.0,0.0,0.0,1.0);
    float scale=length(modelMatrix[0].xyz);
    center.xy+=position.xy*scale;
    gl_Position=projectionMatrix*center;
  }
`;
const haloFragment = `
  uniform float uTime;
  uniform float uStrength;
  varying vec2 vUv;
  ${spectrum}
  void main() {
    vec2 p=(vUv-.5)*2.0;
    float r=length(p);
    float angle=atan(p.y,p.x);
    float t=uTime;
    float contour=.49+.021*sin(angle*3.0-t*.9)+.012*sin(angle*7.0+t*1.3);
    float arc=pow(.5+.5*sin(angle*2.0+t*.85),3.0);
    float filament=exp(-pow((r-contour)/.006,2.0))*arc;
    float second=exp(-pow((r-contour-.023*sin(angle*4.0-t))/.012,2.0));
    second*=pow(.5+.5*cos(angle*3.0-t*.7),5.0);
    float mist=exp(-pow((r-contour)/.075,2.0))*(.3+arc*.7);
    float alpha=(filament*.46+second*.32+mist*.34)*uStrength;
    alpha*=smoothstep(.42,.475,r)*(1.0-smoothstep(.64,.85,r));
    vec3 tint=mix(spectrum(angle*.13-t*.055),vec3(.66,.85,1.0),.23);
    gl_FragColor=vec4(tint*(1.0+filament*.7),alpha);
    #include <colorspace_fragment>
  }
`;

const particleVertex = `
  uniform float uTime;
  uniform float uPointScale;
  attribute vec4 aSeed;
  varying float vTwinkle;
  varying float vHue;
  varying float vStar;
  void main() {
    float t=uTime;
    float angle=aSeed.x*6.28318+t*(.055+aSeed.y*.055);
    float radius=1.52+aSeed.y*.74+.055*sin(t*.8+aSeed.x*24.0);
    vec3 p=vec3(cos(angle)*radius,sin(angle)*radius*.96,position.z);
    p.y+=.065*sin(t*.9+aSeed.x*12.0);
    vec4 view=modelViewMatrix*vec4(p,1.0);
    vTwinkle=.12+.88*pow(.5+.5*sin(t*(1.7+aSeed.y*.9)+aSeed.x*31.0),5.0);
    vHue=aSeed.w+t*.045;
    vStar=step(.85,aSeed.z);
    gl_Position=projectionMatrix*view;
    gl_PointSize=clamp((.025+aSeed.z*.045)*uPointScale*projectionMatrix[1][1]/-view.z*(.7+vTwinkle*.6),3.0,26.0);
  }
`;
const particleFragment = `
  uniform float uStrength;
  varying float vTwinkle;
  varying float vHue;
  varying float vStar;
  ${spectrum}
  void main() {
    vec2 p=(gl_PointCoord-.5)*2.0;
    float r=length(p);
    float core=exp(-r*r*23.0);
    float haze=exp(-r*r*5.0)*.28;
    float cross=(exp(-abs(p.x)*27.0-abs(p.y)*4.0)+exp(-abs(p.y)*27.0-abs(p.x)*4.0))*.2*vStar;
    float alpha=(core+haze+cross)*vTwinkle*uStrength*(1.0-smoothstep(.7,1.0,r));
    vec3 tint=mix(spectrum(vHue),vec3(1.0),core*.6);
    gl_FragColor=vec4(tint,alpha);
    #include <colorspace_fragment>
  }
`;

export default function LiviaSoulAtmosphere({ time, dark }) {
  const { dust, haloGeometry, halo, particles } = useMemo(() => {
    const count=88;
    const positions=new Float32Array(count*3);
    const seeds=new Float32Array(count*4);
    // A stable constellation avoids flicker/reseeding when React renders.
    const random=index=>THREE.MathUtils.euclideanModulo(Math.sin(index*127.1+311.7)*43758.5453,1);
    for(let i=0;i<count;i++){
      positions[i*3+2]=(random(i+400)-.5)*1.3;
      seeds.set([random(i+1),random(i+100),random(i+200),random(i+300)],i*4);
    }
    const dust=new THREE.BufferGeometry();
    const haloGeometry=new THREE.PlaneGeometry(5.6,5.6);
    dust.setAttribute('position',new THREE.BufferAttribute(positions,3));
    dust.setAttribute('aSeed',new THREE.BufferAttribute(seeds,4));
    dust.boundingSphere=new THREE.Sphere(new THREE.Vector3(),2.6);
    const settings={transparent:true,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending};
    const halo=new THREE.ShaderMaterial({...settings,vertexShader:haloVertex,fragmentShader:haloFragment,uniforms:{uTime:time,uStrength:{value:1}}});
    const particles=new THREE.ShaderMaterial({...settings,vertexShader:particleVertex,fragmentShader:particleFragment,uniforms:{uTime:time,uStrength:{value:1},uPointScale:{value:720}}});
    return {dust,haloGeometry,halo,particles};
  },[time]);
  useEffect(()=>{
    for(const material of [halo,particles]){
      material.blending=dark?THREE.AdditiveBlending:THREE.NormalBlending;
      material.uniforms.uStrength.value=dark?1:.7;
      material.needsUpdate=true;
    }
  },[dark,halo,particles]);
  useEffect(()=>()=>{dust.dispose();haloGeometry.dispose();halo.dispose();particles.dispose();},[dust,haloGeometry,halo,particles]);
  useFrame(({size,gl})=>{particles.uniforms.uPointScale.value=size.height*gl.getPixelRatio();});
  return <>
    <mesh geometry={haloGeometry} material={halo} renderOrder={25} frustumCulled={false} />
    <points geometry={dust} material={particles} renderOrder={26} />
  </>;
}
