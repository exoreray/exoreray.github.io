import { useRef, useContext } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { ThemeContext } from '../context/ThemeContext';
import * as THREE from 'three';

const Crystal = () => {
  const meshRef = useRef();
  const particlesRef = useRef();
  const { darkMode } = useContext(ThemeContext);

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

  // Colors based on theme
  const mainColor = darkMode ? "#FFD700" : "#B8860B"; // Gold or darker gold
  const particleColor = darkMode ? "#FFD700" : "#CD7F32"; // Gold or bronze
  const opacity = darkMode ? 0.5 : 0.7;

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group>
        {/* Main Wireframe Diamond - Clean and elegant */}
        <mesh ref={meshRef} scale={1.8}>
          <icosahedronGeometry args={[1, 2]} />
          <meshBasicMaterial
            color={mainColor}
            wireframe
            transparent
            opacity={opacity}
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
            color={particleColor}
            transparent
            opacity={darkMode ? 0.6 : 0.8}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </Float>
  );
};

export default Crystal;
