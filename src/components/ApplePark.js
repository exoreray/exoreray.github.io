import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ApplePark = () => {
  const ringRef = useRef();
  const innerGlassRef = useRef();
  const badgeRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Slow rotation of the ring
    if (ringRef.current) {
      ringRef.current.rotation.y = time * 0.2;
    }

    // Subtle inner glass rotation opposite direction
    if (innerGlassRef.current) {
      innerGlassRef.current.rotation.y = -time * 0.15;
    }

    // Badge gentle float
    if (badgeRef.current) {
      badgeRef.current.position.y = Math.sin(time * 0.8) * 0.2;
    }

    // Glow pulse
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }
  });

  return (
    <group>
      {/* Main Ring - Apple Park iconic circular building */}
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[2.5, 0.4, 16, 64]} />
          <meshStandardMaterial
            color="#E8E8ED"
            metalness={0.8}
            roughness={0.2}
            emissive="#FFFFFF"
            emissiveIntensity={0.1}
          />
        </mesh>

        {/* Inner glass ring */}
        <mesh ref={innerGlassRef}>
          <torusGeometry args={[2.2, 0.3, 16, 64]} />
          <meshPhysicalMaterial
            color="#A0C4D9"
            metalness={0.1}
            roughness={0.1}
            transparent
            opacity={0.3}
            transmission={0.8}
          />
        </mesh>

        {/* Windows/segments */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const x = Math.cos(angle) * 2.5;
          const z = Math.sin(angle) * 2.5;
          return (
            <mesh
              key={i}
              position={[x, 0, z]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[0.15, 0.6, 0.35]} />
              <meshStandardMaterial
                color="#FFFFFF"
                metalness={0.9}
                roughness={0.1}
                emissive="#C0C0C0"
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        })}
      </group>

      {/* Center plaza/courtyard */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.1, 32]} />
        <meshStandardMaterial
          color="#3A3A3C"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Central tree (iconic nature element) */}
      <group position={[0, 0.2, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color="#6B8E23"
            roughness={0.9}
          />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.5, 8]} />
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.9}
          />
        </mesh>
      </group>

      {/* ID Badge floating above - represents "the only bachelor's grad" */}
      <group ref={badgeRef} position={[0, 2, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 0.9, 0.05]} />
          <meshStandardMaterial
            color="#FFFFFF"
            metalness={0.1}
            roughness={0.3}
            emissive="#FFFFFF"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Apple logo representation */}
        <mesh position={[0, 0.2, 0.03]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color="#000000"
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>

        {/* Golden accent on badge - representing the achievement */}
        <mesh position={[0, -0.2, 0.03]}>
          <boxGeometry args={[0.4, 0.15, 0.02]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Subtle glow ring */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <torusGeometry args={[3, 0.05, 16, 64]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Ground shadow/reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <circleGeometry args={[3.5, 64]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Lighting specific to Apple's clean aesthetic */}
      <pointLight position={[0, 4, 0]} intensity={1.5} color="#FFFFFF" distance={8} />
      <pointLight position={[3, 2, 3]} intensity={0.8} color="#FFD700" distance={6} />
      <pointLight position={[-3, 2, -3]} intensity={0.8} color="#C0C0C0" distance={6} />
    </group>
  );
};

export default ApplePark;
