import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const BlueprintToCircuit = () => {
  const groupRef = useRef();
  const linesRef = useRef([]);

  useFrame((state) => {
    const { clock } = state;
    const time = clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(time * 0.3) * 0.1;
    }

    // Animate lines
    linesRef.current.forEach((line, i) => {
      if (line) {
        line.material.opacity = 0.3 + Math.sin(time * 2 + i) * 0.2;
      }
    });
  });

  // Create grid lines (blueprint style)
  const createGridLines = () => {
    const lines = [];
    const gridSize = 6;
    const divisions = 12;

    for (let i = 0; i <= divisions; i++) {
      const pos = (i / divisions - 0.5) * gridSize;

      // Horizontal lines
      lines.push(
        <mesh
          key={`h-${i}`}
          ref={(el) => linesRef.current.push(el)}
          position={[0, pos, 0]}
        >
          <boxGeometry args={[gridSize, 0.02, 0.02]} />
          <meshBasicMaterial color="#4ECDC4" transparent opacity={0.4} />
        </mesh>
      );

      // Vertical lines
      lines.push(
        <mesh
          key={`v-${i}`}
          ref={(el) => linesRef.current.push(el)}
          position={[pos, 0, 0]}
        >
          <boxGeometry args={[0.02, gridSize, 0.02]} />
          <meshBasicMaterial color="#4ECDC4" transparent opacity={0.4} />
        </mesh>
      );
    }

    return lines;
  };

  // Create circuit nodes
  const createCircuitNodes = () => {
    const nodes = [];
    const positions = [
      [-2, 2, 0], [0, 2, 0], [2, 2, 0],
      [-2, 0, 0], [0, 0, 0], [2, 0, 0],
      [-2, -2, 0], [0, -2, 0], [2, -2, 0],
    ];

    positions.forEach((pos, i) => {
      nodes.push(
        <mesh key={`node-${i}`} position={pos}>
          <circleGeometry args={[0.15, 16]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      );

      // Glow effect
      nodes.push(
        <mesh key={`glow-${i}`} position={pos}>
          <circleGeometry args={[0.25, 16]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.2} />
        </mesh>
      );
    });

    return nodes;
  };

  // Connection lines between nodes
  const createConnections = () => {
    const connections = [
      [[-2, 2], [0, 2]],
      [[0, 2], [2, 2]],
      [[-2, 0], [0, 0]],
      [[0, 0], [2, 0]],
      [[-2, -2], [0, -2]],
      [[0, -2], [2, -2]],
      [[0, 2], [0, 0]],
      [[0, 0], [0, -2]],
    ];

    return connections.map((conn, i) => {
      const start = conn[0];
      const end = conn[1];
      const midX = (start[0] + end[0]) / 2;
      const midY = (start[1] + end[1]) / 2;
      const length = Math.sqrt(
        Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
      );
      const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);

      return (
        <mesh
          key={`conn-${i}`}
          position={[midX, midY, -0.1]}
          rotation={[0, 0, angle]}
        >
          <boxGeometry args={[length, 0.05, 0.05]} />
          <meshBasicMaterial color="#9B88DA" transparent opacity={0.6} />
        </mesh>
      );
    });
  };

  return (
    <group ref={groupRef}>
      {/* Blueprint grid */}
      {createGridLines()}

      {/* Circuit connections */}
      {createConnections()}

      {/* Circuit nodes */}
      {createCircuitNodes()}
    </group>
  );
};

export default BlueprintToCircuit;
