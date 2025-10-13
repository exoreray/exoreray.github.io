import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PhilosophyMindMap = () => {
  const groupRef = useRef();
  const connectionsRef = useRef();

  // Philosophy nodes - core concepts
  const philosophyNodes = useMemo(() => [
    // Central node
    {
      name: '博爱',
      position: [0, 0, 0],
      color: '#FFD700',
      scale: 0.4,
      description: 'Universal Love'
    },
    // First ring - core values
    {
      name: 'Resource\nAllocation',
      position: [2, 1, 0],
      color: '#9B88DA',
      scale: 0.25,
      description: 'Optimal distribution'
    },
    {
      name: 'Emotion +\nLogic',
      position: [-2, 1, 0],
      color: '#FFB6C1',
      scale: 0.25,
      description: 'Balance of heart and mind'
    },
    {
      name: 'Technology\nas Art',
      position: [0, -2, 1],
      color: '#20B2AA',
      scale: 0.25,
      description: 'Beauty in function'
    },
    {
      name: 'Architecture\nof Thought',
      position: [0, 2, -1],
      color: '#D4AF37',
      scale: 0.25,
      description: 'Structure meets creativity'
    },
    // Second ring - applications
    {
      name: 'HCI',
      position: [2.5, -1, 1],
      color: '#4ECDC4',
      scale: 0.18,
      description: 'Human-centered design'
    },
    {
      name: 'Minimalism',
      position: [-2.5, -1, -1],
      color: '#F5EBE0',
      scale: 0.18,
      description: 'Less but better'
    },
    {
      name: 'Scale with\nSoul',
      position: [1.5, 0, -2],
      color: '#B4A5E8',
      scale: 0.18,
      description: 'Growth without losing essence'
    },
    {
      name: 'Delight',
      position: [-1.5, 0, 2],
      color: '#FFD700',
      scale: 0.18,
      description: 'Joy in every detail'
    },
  ], []);

  // Create connections between related nodes
  const connections = useMemo(() => {
    const lines = [];

    // Connect central node to first ring
    for (let i = 1; i <= 4; i++) {
      lines.push({ from: 0, to: i });
    }

    // Connect first ring nodes to each other
    lines.push({ from: 1, to: 2 });
    lines.push({ from: 2, to: 3 });
    lines.push({ from: 3, to: 4 });
    lines.push({ from: 4, to: 1 });

    // Connect first ring to second ring
    lines.push({ from: 1, to: 5 });
    lines.push({ from: 2, to: 6 });
    lines.push({ from: 3, to: 7 });
    lines.push({ from: 4, to: 8 });

    return lines;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Gentle rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
      groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }

    // Animate connection lines
    if (connectionsRef.current) {
      connectionsRef.current.children.forEach((line, i) => {
        const opacity = 0.3 + Math.sin(time + i * 0.3) * 0.2;
        line.material.opacity = opacity;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Philosophy nodes */}
      {philosophyNodes.map((node, i) => (
        <group key={i} position={node.position}>
          {/* Main sphere */}
          <mesh>
            <sphereGeometry args={[node.scale, 32, 32]} />
            <meshStandardMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Outer glow ring */}
          <mesh>
            <torusGeometry args={[node.scale * 1.3, node.scale * 0.08, 16, 32]} />
            <meshBasicMaterial
              color={node.color}
              transparent
              opacity={0.3}
            />
          </mesh>

          {/* Particles around node */}
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={20}
                array={new Float32Array(Array.from({ length: 60 }, () =>
                  (Math.random() - 0.5) * node.scale * 3
                ))}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.02}
              color={node.color}
              transparent
              opacity={0.6}
              sizeAttenuation
            />
          </points>
        </group>
      ))}

      {/* Connection lines */}
      <group ref={connectionsRef}>
        {connections.map((conn, i) => {
          const start = philosophyNodes[conn.from].position;
          const end = philosophyNodes[conn.to].position;

          const startVec = new THREE.Vector3(...start);
          const endVec = new THREE.Vector3(...end);

          const geometry = new THREE.BufferGeometry().setFromPoints([startVec, endVec]);

          return (
            <line key={i} geometry={geometry}>
              <lineBasicMaterial
                color="#FFD700"
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
              />
            </line>
          );
        })}
      </group>

      {/* Ambient particles floating around */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={300}
            array={new Float32Array(Array.from({ length: 900 }, () => (Math.random() - 0.5) * 10))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          color="#D4AF37"
          transparent
          opacity={0.3}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Lighting */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#FFD700" distance={8} />
      <pointLight position={[3, 3, 3]} intensity={1} color="#9B88DA" distance={6} />
      <pointLight position={[-3, -3, -3]} intensity={1} color="#FFB6C1" distance={6} />
    </group>
  );
};

export default PhilosophyMindMap;
