import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RenaissanceSkills = () => {
  const groupRef = useRef();
  const skillNodesRef = useRef();

  const skills = useMemo(() => [
    // Technical
    { name: 'Engineering', position: [2, 1, 0], color: '#20B2AA', category: 'tech' },
    { name: 'Design', position: [1.7, 0, 1.7], color: '#9B88DA', category: 'creative' },
    { name: 'Architecture', position: [0, 0, 2.2], color: '#D4AF37', category: 'creative' },

    // Creative
    { name: 'Music', position: [-1.7, 0, 1.7], color: '#FFB6C1', category: 'creative' },
    { name: 'Photography', position: [-2, 1, 0], color: '#F5EBE0', category: 'creative' },
    { name: 'Dance', position: [-1.7, 0, -1.7], color: '#FFD700', category: 'physical' },

    // Physical
    { name: 'Basketball', position: [0, 0, -2.2], color: '#FF6347', category: 'physical' },
    { name: 'Badminton', position: [1.7, 0, -1.7], color: '#4ECDC4', category: 'physical' },

    // Intellectual
    { name: 'Philosophy', position: [0, 2, 0], color: '#FFD700', category: 'intellectual' },
    { name: 'Leadership', position: [0, -2, 0], color: '#C0C0C0', category: 'intellectual' },
  ], []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Slow rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.08;
    }

    // Skill nodes gentle pulse
    if (skillNodesRef.current) {
      skillNodesRef.current.children.forEach((node, i) => {
        const scale = 1 + Math.sin(time * 2 + i * 0.5) * 0.1;
        node.scale.setScalar(scale);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central core - representing the unified self */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Orbital rings showing different categories */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2, 0.02, 16, 64]} />
        <meshBasicMaterial color="#20B2AA" transparent opacity={0.3} />
      </mesh>

      <mesh rotation={[0, Math.PI / 4, Math.PI / 4]}>
        <torusGeometry args={[1.8, 0.02, 16, 64]} />
        <meshBasicMaterial color="#9B88DA" transparent opacity={0.3} />
      </mesh>

      {/* Skill nodes */}
      <group ref={skillNodesRef}>
        {skills.map((skill, i) => (
          <group key={i} position={skill.position}>
            {/* Main skill sphere */}
            <mesh>
              <sphereGeometry args={[0.15, 32, 32]} />
              <meshStandardMaterial
                color={skill.color}
                emissive={skill.color}
                emissiveIntensity={0.4}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Skill icon ring */}
            <mesh>
              <torusGeometry args={[0.2, 0.015, 12, 24]} />
              <meshBasicMaterial
                color={skill.color}
                transparent
                opacity={0.5}
              />
            </mesh>

            {/* Connection to center */}
            <line>
              <bufferGeometry>
                {(() => {
                  const points = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(...skill.position),
                  ];
                  const geometry = new THREE.BufferGeometry().setFromPoints(points);
                  return <primitive object={geometry} attach="geometry" />;
                })()}
              </bufferGeometry>
              <lineBasicMaterial
                color={skill.color}
                transparent
                opacity={0.3}
              />
            </line>

            {/* Particles around skill */}
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={15}
                  array={new Float32Array(Array.from({ length: 45 }, () => (Math.random() - 0.5) * 0.5))}
                  itemSize={3}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.015}
                color={skill.color}
                transparent
                opacity={0.6}
                sizeAttenuation
              />
            </points>

            {/* Skill glow */}
            <pointLight position={[0, 0, 0]} intensity={0.3} color={skill.color} distance={1} />
          </group>
        ))}
      </group>

      {/* Connections between related skills */}
      {[
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], // Outer ring
        [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], // From Philosophy
        [9, 5], [9, 6], [9, 7], [9, 0], // From Leadership
      ].map(([from, to], i) => {
        const start = new THREE.Vector3(...skills[from].position);
        const end = new THREE.Vector3(...skills[to].position);
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);

        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color="#FFD700"
              transparent
              opacity={0.1}
            />
          </line>
        );
      })}

      {/* Ambient particles */}
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
          size={0.01}
          color="#D4AF37"
          transparent
          opacity={0.3}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Lighting */}
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#FFD700" distance={6} />
      <pointLight position={[3, 2, 3]} intensity={0.8} color="#9B88DA" distance={5} />
      <pointLight position={[-3, -2, -3]} intensity={0.8} color="#20B2AA" distance={5} />
    </group>
  );
};

export default RenaissanceSkills;
