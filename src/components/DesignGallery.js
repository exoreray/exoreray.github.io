import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DesignGallery = () => {
  const groupRef = useRef();
  const trophiesRef = useRef();
  const projectsRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Gentle rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
    }

    // Trophy floating
    if (trophiesRef.current) {
      trophiesRef.current.children.forEach((trophy, i) => {
        trophy.position.y = Math.sin(time + i) * 0.1;
      });
    }

    // Projects subtle pulse
    if (projectsRef.current) {
      projectsRef.current.children.forEach((project, i) => {
        const scale = 1 + Math.sin(time * 2 + i * 0.5) * 0.05;
        project.scale.setScalar(scale);
      });
    }
  });

  // Award trophies
  const awards = [
    { name: 'Red Dot', position: [-2, 0.5, 0], color: '#FF0000' },
    { name: 'iF Design', position: [2, 0.5, 0], color: '#FFD700' },
    { name: 'A\' Design', position: [0, 0.5, 2], color: '#C0C0C0' },
  ];

  // Project showcases
  const projects = [
    { name: 'Luxiphos', position: [-1.5, -1, 1], color: '#9B88DA' },
    { name: 'VR Firework', position: [1.5, -1, 1], color: '#FFB6C1' },
    { name: 'Coin Flip', position: [0, -1, -1.5], color: '#20B2AA' },
  ];

  return (
    <group ref={groupRef}>
      {/* Award Trophies */}
      <group ref={trophiesRef}>
        {awards.map((award, i) => (
          <group key={i} position={award.position}>
            {/* Trophy base */}
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.15, 0.2, 0.1, 32]} />
              <meshStandardMaterial
                color="#2a2a2a"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Trophy stem */}
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
              <meshStandardMaterial
                color={award.color}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>

            {/* Trophy cup */}
            <mesh>
              <coneGeometry args={[0.2, 0.4, 32]} />
              <meshStandardMaterial
                color={award.color}
                metalness={0.9}
                roughness={0.1}
                emissive={award.color}
                emissiveIntensity={0.2}
              />
            </mesh>

            {/* Trophy handles */}
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * 0.18, -0.05, 0]} rotation={[0, 0, side * Math.PI / 4]}>
                <torusGeometry args={[0.08, 0.02, 8, 16]} />
                <meshStandardMaterial
                  color={award.color}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
            ))}

            {/* Glow effect */}
            <pointLight position={[0, 0, 0]} intensity={0.5} color={award.color} distance={2} />
          </group>
        ))}
      </group>

      {/* Project Showcases */}
      <group ref={projectsRef}>
        {projects.map((project, i) => (
          <group key={i} position={project.position}>
            {/* Project frame/card */}
            <mesh>
              <boxGeometry args={[0.8, 1, 0.05]} />
              <meshStandardMaterial
                color="#1a1a1a"
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>

            {/* Project screen/display */}
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[0.7, 0.8]} />
              <meshStandardMaterial
                color={project.color}
                emissive={project.color}
                emissiveIntensity={0.3}
              />
            </mesh>

            {/* Project accent border */}
            <mesh position={[0, 0, 0.026]}>
              <boxGeometry args={[0.75, 0.85, 0.01]} />
              <meshStandardMaterial
                color="#FFD700"
                metalness={0.8}
                roughness={0.2}
                wireframe
              />
            </mesh>

            {/* Floating particles around project */}
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={30}
                  array={new Float32Array(Array.from({ length: 90 }, () => (Math.random() - 0.5) * 1.5))}
                  itemSize={3}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.02}
                color={project.color}
                transparent
                opacity={0.6}
                sizeAttenuation
              />
            </points>
          </group>
        ))}
      </group>

      {/* Central pedestal */}
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 0.3, 32]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Gallery walls hint */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.sin(angle) * 3.5, 0, Math.cos(angle) * 3.5]}
          rotation={[0, angle, 0]}
        >
          <planeGeometry args={[3, 4]} />
          <meshStandardMaterial
            color="#0a0a0a"
            metalness={0.1}
            roughness={0.9}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}

      {/* Spotlights on each trophy */}
      {awards.map((award, i) => (
        <spotLight
          key={i}
          position={[award.position[0], award.position[1] + 2, award.position[2]]}
          angle={0.3}
          penumbra={0.5}
          intensity={1}
          color={award.color}
          target-position={award.position}
        />
      ))}

      {/* Ambient gallery lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={1} color="#FFD700" distance={8} />
    </group>
  );
};

export default DesignGallery;
