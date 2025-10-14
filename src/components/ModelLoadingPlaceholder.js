import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const ModelLoadingPlaceholder = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color="#FFD700"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Pulsing glow */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        color="#FFD700"
        distance={5}
      />
    </group>
  );
};

export default ModelLoadingPlaceholder;
