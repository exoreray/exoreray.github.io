import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CollegePathway = () => {
  const groupRef = useRef();
  const pathRef = useRef();
  const particlesRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }

    // Animate path progression
    if (pathRef.current) {
      pathRef.current.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }

    // Animate particles traveling along the path
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] = (positions[i + 2] + 0.02) % 4 - 2;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Create multiple paths representing different students
  const createPath = (startX, targetY, isMainPath = false) => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(startX, -1.5, 0),
      new THREE.Vector3(startX * 0.5, targetY * 0.5, 0),
      new THREE.Vector3(0, targetY, 0)
    );
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    return (
      <line key={startX} geometry={geometry}>
        <lineBasicMaterial
          color={isMainPath ? "#FFD700" : "#9B88DA"}
          opacity={isMainPath ? 0.8 : 0.2}
          transparent
          linewidth={isMainPath ? 3 : 1}
        />
      </line>
    );
  };

  // Particles for the golden path
  const particleCount = 20;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 4;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }

  return (
    <group ref={groupRef}>
      {/* Community College - Bottom Platform */}
      <group position={[0, -1.5, 0]}>
        <mesh>
          <boxGeometry args={[3, 0.2, 1]} />
          <meshStandardMaterial color="#4A5568" />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[2.8, 0.15, 0.9]} />
          <meshStandardMaterial color="#2D3748" emissive="#6B46C1" emissiveIntensity={0.2} />
        </mesh>
        {/* Small buildings representing community college */}
        {[-0.8, 0, 0.8].map((x, i) => (
          <mesh key={i} position={[x, 0.5, 0]}>
            <boxGeometry args={[0.4, 0.6, 0.4]} />
            <meshStandardMaterial color="#9B88DA" opacity={0.6} transparent />
          </mesh>
        ))}
      </group>

      {/* Berkeley - Top Platform (larger, more prestigious) */}
      <group position={[0, 1.5, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 0.25, 1]} />
          <meshStandardMaterial color="#003262" /> {/* Berkeley blue */}
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[2.3, 0.2, 0.9]} />
          <meshStandardMaterial color="#FDB515" emissive="#FFD700" emissiveIntensity={0.3} /> {/* Berkeley gold */}
        </mesh>
        {/* Berkeley campanile tower */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
        {/* EECS label */}
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.4, 0.15, 0.4]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Multiple paths - representing many students attempting transfer */}
      {[-1.5, -1, -0.5, 0.5, 1, 1.5].map((x) =>
        createPath(x, -0.5 + Math.random() * 0.5, false)
      )}

      {/* The ONE successful path - highlighted in gold */}
      <line ref={pathRef}>
        <tubeGeometry args={[
          new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, -1.5, 0),
            new THREE.Vector3(0.5, 0, 0.5),
            new THREE.Vector3(0, 1.5, 0)
          ),
          64,
          0.05,
          8,
          false
        ]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </line>

      {/* Golden particles traveling along the successful path */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#FFD700"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Spotlight on the achievement */}
      <pointLight position={[0, 1.5, 1]} intensity={1} color="#FFD700" distance={3} />
      <pointLight position={[0, -1.5, 1]} intensity={0.5} color="#9B88DA" distance={2} />
    </group>
  );
};

export default CollegePathway;
