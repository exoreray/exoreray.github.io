import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

// Custom shader material for particles with proper color and size support
const ParticleMaterial = shaderMaterial(
  { time: 0 },
  // Vertex shader
  `
    attribute float scale;
    attribute vec3 color;
    varying vec3 vColor;
    uniform float time;

    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = scale * 300.0 * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment shader
  `
    varying vec3 vColor;

    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;

      float alpha = 1.0 - (dist * 2.0);
      alpha = pow(alpha, 2.0);

      gl_FragColor = vec4(vColor, alpha * 0.9);
    }
  `
);

extend({ ParticleMaterial });

const LiviaHeart = () => {
  const particlesRef = useRef();
  const heartRef = useRef();
  const outerGlowRef = useRef();
  const heartMeshRef = useRef();
  const materialRef = useRef();

  const particleCount = 1000;

  // Create heart shape using bezier curves
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const scale = 1.2;

    shape.moveTo(0, 0);
    // Left upper lobe
    shape.bezierCurveTo(-0.5 * scale, 0.5 * scale, -1 * scale, 0.5 * scale, -1 * scale, 0);
    shape.bezierCurveTo(-1 * scale, -0.3 * scale, -0.7 * scale, -0.6 * scale, -0.5 * scale, -0.8 * scale);
    // Bottom point
    shape.lineTo(0, -1.5 * scale);
    // Right side
    shape.lineTo(0.5 * scale, -0.8 * scale);
    shape.bezierCurveTo(0.7 * scale, -0.6 * scale, 1 * scale, -0.3 * scale, 1 * scale, 0);
    // Right upper lobe
    shape.bezierCurveTo(1 * scale, 0.5 * scale, 0.5 * scale, 0.5 * scale, 0, 0);

    return shape;
  }, []);

  // Create heart-shaped particle system based on bezier curve
  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    // Get points from the heart shape curve
    const points = heartShape.getPoints(100);

    for (let i = 0; i < particleCount; i++) {
      const layer = Math.floor(i / (particleCount / 10)); // 10 layers
      const layerScale = 0.3 + (layer * 0.15);

      // Pick a point on the heart curve
      const pointIndex = Math.floor((i % 100));
      const point = points[pointIndex];

      // Position particles along the heart shape with some randomness
      const x = point.x * layerScale + (Math.random() - 0.5) * 0.1;
      const y = point.y * layerScale + (Math.random() - 0.5) * 0.1;
      const z = (Math.random() - 0.5) * 0.3;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color gradient: rose gold to lavender to pink
      const roseGold = new THREE.Color('#E8B4B8');
      const lavender = new THREE.Color('#B4A5E8');
      const pink = new THREE.Color('#FFB6C1');

      let color;
      const progress = i / particleCount;
      if (progress < 0.5) {
        color = roseGold.clone().lerp(lavender, progress * 2);
      } else {
        color = lavender.clone().lerp(pink, (progress - 0.5) * 2);
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      scales[i] = 0.02 + Math.random() * 0.03;
    }

    return { positions, colors, scales };
  }, [heartShape]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Breathing heart effect
    if (heartRef.current) {
      const breathe = 1 + Math.sin(time * 1.5) * 0.15;
      heartRef.current.scale.setScalar(breathe);
    }

    // Rotate particles slowly
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.1;

      // Animate individual particles
      const positions = particlesRef.current.geometry.attributes.position.array;
      const scales = particlesRef.current.geometry.attributes.scale.array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        // Add floating motion
        positions[idx + 2] = Math.sin(time + i * 0.01) * 0.3;

        // Pulsing scale
        scales[i] = (0.02 + Math.random() * 0.03) * (1 + Math.sin(time * 2 + i * 0.1) * 0.3);
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.scale.needsUpdate = true;
    }

    // Outer glow pulse
    if (outerGlowRef.current) {
      const glowScale = 1 + Math.sin(time * 1.2) * 0.2;
      outerGlowRef.current.scale.setScalar(glowScale);
      outerGlowRef.current.material.opacity = 0.2 + Math.sin(time * 1.2) * 0.1;
    }
  });

  return (
    <group ref={heartRef}>
      {/* Solid heart mesh in the center */}
      <mesh ref={heartMeshRef}>
        <extrudeGeometry
          args={[
            heartShape,
            {
              depth: 0.3,
              bevelEnabled: true,
              bevelThickness: 0.05,
              bevelSize: 0.05,
              bevelSegments: 12
            }
          ]}
        />
        <meshPhysicalMaterial
          color="#E8B4B8"
          emissive="#FFB6C1"
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.4}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Main particle heart */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-scale"
            count={particleCount}
            array={scales}
            itemSize={1}
          />
        </bufferGeometry>
        <particleMaterial ref={materialRef} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* Outer glow aura */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color="#E8B4B8"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>


      {/* Floating love particles around the heart */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={200}
            array={new Float32Array(Array.from({ length: 600 }, () => (Math.random() - 0.5) * 8))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#B4A5E8"
          transparent
          opacity={0.3}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Warm lighting */}
      <pointLight position={[0, 0, 2]} intensity={0.8} color="#E8B4B8" distance={6} />
      <pointLight position={[2, 2, 0]} intensity={0.6} color="#FFB6C1" distance={5} />
      <pointLight position={[-2, -1, 0]} intensity={0.6} color="#B4A5E8" distance={5} />
    </group>
  );
};

export default LiviaHeart;
