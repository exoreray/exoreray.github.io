import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MusicRoom = () => {
  const vinylRef = useRef();
  const needleRef = useRef();
  const waveformsRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Rotate vinyl
    if (vinylRef.current) {
      vinylRef.current.rotation.z += 0.01; // Constant rotation like a playing record
    }

    // Gentle needle movement
    if (needleRef.current) {
      needleRef.current.rotation.z = -0.3 + Math.sin(time * 0.5) * 0.05;
    }

    // Animate waveforms
    if (waveformsRef.current) {
      waveformsRef.current.children.forEach((wave, i) => {
        const scale = 1 + Math.sin(time * 2 + i * 0.3) * 0.3;
        wave.scale.y = scale;
        wave.material.opacity = 0.3 + Math.sin(time * 2 + i * 0.3) * 0.2;
      });
    }
  });

  // Create vinyl grooves
  const grooves = [];
  for (let i = 0; i < 30; i++) {
    const radius = 0.3 + (i * 0.05);
    grooves.push(radius);
  }

  return (
    <group>
      {/* Vinyl Record */}
      <group ref={vinylRef}>
        {/* Main disc */}
        <mesh>
          <cylinderGeometry args={[2, 2, 0.05, 64]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>

        {/* Label in center */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.01, 32]} />
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>

        {/* Grooves */}
        {grooves.map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.005, 8, 32]} />
            <meshStandardMaterial
              color="#0a0a0a"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        ))}

        {/* Center hole */}
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 32]} />
          <meshStandardMaterial
            color="#000000"
          />
        </mesh>

        {/* Sparkle particles on vinyl */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={100}
              array={new Float32Array(Array.from({ length: 300 }, (_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const radius = 0.7 + Math.random() * 1.2;
                return i % 3 === 0 ? Math.cos(angle) * radius :
                       i % 3 === 1 ? 0.03 :
                       Math.sin(angle) * radius;
              }))}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.02}
            color="#FFD700"
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>
      </group>

      {/* Turntable base */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 0.1, 64]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Tonearm */}
      <group ref={needleRef} position={[1.5, 0.1, 0]}>
        {/* Arm */}
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1, 0.05, 0.05]} />
          <meshStandardMaterial
            color="#C0C0C0"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Needle head */}
        <mesh position={[1, -0.05, 0]}>
          <coneGeometry args={[0.08, 0.15, 8]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Waveform visualization floating above */}
      <group ref={waveformsRef} position={[0, 1.5, 0]}>
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 1.5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <mesh key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.1, 0.5, 0.05]} />
              <meshBasicMaterial
                color="#9B88DA"
                transparent
                opacity={0.4}
              />
            </mesh>
          );
        })}
      </group>

      {/* Musical notes particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={50}
            array={new Float32Array(Array.from({ length: 150 }, () => (Math.random() - 0.5) * 6))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#FFB6C1"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Lighting */}
      <pointLight position={[0, 2, 2]} intensity={1.5} color="#D4AF37" distance={6} />
      <pointLight position={[2, 0, 0]} intensity={1} color="#9B88DA" distance={4} />
      <spotLight
        position={[0, 4, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={1}
        color="#FFD700"
        target-position={[0, 0, 0]}
      />
    </group>
  );
};

export default MusicRoom;
