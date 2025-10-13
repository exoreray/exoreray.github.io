import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const Crystal = () => {
  const meshRef = useRef();
  const particlesRef = useRef();

  // Smooth rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      const { mouse, clock } = state;
      const time = clock.getElapsedTime();

      // Gentle rotation
      meshRef.current.rotation.y = mouse.x * 0.2 + time * 0.15;
      meshRef.current.rotation.x = mouse.y * 0.2 + Math.sin(time * 0.3) * 0.1;
    }

    // Rotate particles slowly
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group>
        {/* Main Wireframe Diamond - Clean and elegant */}
        <mesh ref={meshRef} scale={1.8}>
          <icosahedronGeometry args={[1, 2]} />
          <meshBasicMaterial
            color="#FFD700"
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Inner wireframe for depth */}
        <mesh scale={1.4}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#D4AF37"
            wireframe
            transparent
            opacity={0.25}
          />
        </mesh>

        {/* Subtle particles around */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={30}
              array={new Float32Array(
                Array.from({ length: 30 * 3 }, (_, i) => {
                  const angle = (i / 3) * 0.5;
                  const radius = 1.8 + Math.random() * 0.2;
                  return i % 3 === 0
                    ? Math.cos(angle) * radius
                    : i % 3 === 1
                    ? (Math.random() - 0.5) * 2
                    : Math.sin(angle) * radius;
                })
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.03}
            color="#FFD700"
            transparent
            opacity={0.6}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Soft golden glow */}
        <mesh scale={2.2}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.02}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </Float>
  );
};

export default Crystal;
