import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NetworkGraph = () => {
  const nodesRef = useRef();
  const linesRef = useRef();
  const centralNodeRef = useRef();
  const pulseRingRef = useRef();

  // Create network of 30 nodes representing 30,000 members
  const nodeCount = 30;

  const { nodePositions, connections } = useMemo(() => {
    const positions = [];
    const connections = [];

    // Create nodes in a sphere distribution
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const radius = 2 + Math.random() * 1.5;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      positions.push({ x, y, z });
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const pos1 = positions[i];
        const pos2 = positions[j];
        const distance = Math.sqrt(
          Math.pow(pos2.x - pos1.x, 2) +
          Math.pow(pos2.y - pos1.y, 2) +
          Math.pow(pos2.z - pos1.z, 2)
        );

        // Connect nodes that are close enough
        if (distance < 2) {
          connections.push({ start: pos1, end: pos2 });
        }
      }

      // Always connect to center
      connections.push({
        start: { x: 0, y: 0, z: 0 },
        end: positions[i]
      });
    }

    return { nodePositions: positions, connections };
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Rotate entire network
    if (nodesRef.current) {
      nodesRef.current.rotation.y = time * 0.15;
      nodesRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }

    // Pulse central node
    if (centralNodeRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.2;
      centralNodeRef.current.scale.setScalar(scale);
    }

    // Pulse ring
    if (pulseRingRef.current) {
      const scale = 1 + Math.sin(time * 1.5) * 0.15;
      pulseRingRef.current.scale.setScalar(scale);
      pulseRingRef.current.material.opacity = 0.3 + Math.sin(time * 1.5) * 0.15;
    }

    // Animate line opacity
    if (linesRef.current) {
      linesRef.current.children.forEach((line, i) => {
        const offset = i * 0.1;
        line.material.opacity = 0.15 + Math.sin(time + offset) * 0.1;
      });
    }
  });

  return (
    <group>
      <group ref={nodesRef}>
        {/* Network nodes - representing members */}
        {nodePositions.map((pos, i) => (
          <mesh key={i} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#9B88DA" : "#20B2AA"}
              emissive={i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#9B88DA" : "#20B2AA"}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))}

        {/* Connection lines - representing community bonds */}
        <group ref={linesRef}>
          {connections.map((conn, i) => {
            const start = new THREE.Vector3(conn.start.x, conn.start.y, conn.start.z);
            const end = new THREE.Vector3(conn.end.x, conn.end.y, conn.end.z);
            const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);

            return (
              <line key={i} geometry={geometry}>
                <lineBasicMaterial
                  color="#FFD700"
                  transparent
                  opacity={0.2}
                  blending={THREE.AdditiveBlending}
                />
              </line>
            );
          })}
        </group>
      </group>

      {/* Central hub - representing StartupHarbor */}
      <mesh ref={centralNodeRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Pulse ring around central hub */}
      <mesh ref={pulseRingRef}>
        <torusGeometry args={[0.5, 0.03, 16, 64]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Orbital rings showing scale */}
      {[1.5, 2.5, 3.5].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[radius, 0.01, 16, 64]} />
          <meshBasicMaterial
            color="#9B88DA"
            transparent
            opacity={0.1}
          />
        </mesh>
      ))}

      {/* Particle effect around the network */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={200}
            array={new Float32Array(Array.from({ length: 600 }, () => (Math.random() - 0.5) * 10))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#20B2AA"
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>

      {/* Lighting */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#FFD700" distance={8} />
      <pointLight position={[4, 4, 4]} intensity={1} color="#9B88DA" distance={8} />
      <pointLight position={[-4, -4, -4]} intensity={1} color="#20B2AA" distance={8} />
    </group>
  );
};

export default NetworkGraph;
