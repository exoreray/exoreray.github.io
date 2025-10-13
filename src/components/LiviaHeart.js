import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LiviaHeart = () => {
  const particlesRef = useRef();
  const heartRef = useRef();
  const outerGlowRef = useRef();

  const particleCount = 1000;

  // Create heart-shaped particle system
  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    // Heart curve parameters - smooth and romantic
    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 2;
      const layer = Math.floor(i / (particleCount / 10)); // 10 layers
      const layerRadius = 0.3 + (layer * 0.15);

      // Smooth parametric heart curve (cardioid-based)
      const x = layerRadius * 16 * Math.pow(Math.sin(t), 3) * 0.08;
      const y = layerRadius * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.08 - 0.3;
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
  }, []);

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
        <pointsMaterial
          size={1}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
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

      {/* Light rays emanating */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 3;
        const z = Math.sin(angle) * 3;
        return (
          <mesh key={i} position={[x * 0.5, 0, z * 0.5]} rotation={[0, angle, 0]}>
            <planeGeometry args={[0.05, 3]} />
            <meshBasicMaterial
              color="#FFB6C1"
              transparent
              opacity={0.2}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}

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
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Warm lighting */}
      <pointLight position={[0, 0, 2]} intensity={2} color="#E8B4B8" distance={6} />
      <pointLight position={[2, 2, 0]} intensity={1.5} color="#FFB6C1" distance={5} />
      <pointLight position={[-2, -1, 0]} intensity={1.5} color="#B4A5E8" distance={5} />
    </group>
  );
};

export default LiviaHeart;
