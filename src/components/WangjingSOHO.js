import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WangjingSOHO = () => {
  const groupRef = useRef();
  const buildingsRef = useRef([]);

  useFrame((state) => {
    const { mouse } = state;

    if (groupRef.current) {
      // Subtle rotation based on mouse
      groupRef.current.rotation.y = mouse.x * 0.3;
      groupRef.current.rotation.x = -mouse.y * 0.2;
    }

    // Individual building animations
    buildingsRef.current.forEach((building, i) => {
      if (building) {
        building.rotation.y += 0.001 * (i + 1);
      }
    });
  });

  // Wangjing SOHO's iconic curved towers
  const createCurvedTower = (position, scale, color, index) => {
    return (
      <mesh
        key={`tower-${index}`}
        ref={(el) => (buildingsRef.current[index] = el)}
        position={position}
        scale={scale}
      >
        {/* Curved tower shape */}
        <cylinderGeometry args={[0.8, 1, 3, 8, 1, false, 0, Math.PI * 2]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
    );
  };

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Three iconic curved towers */}
      {createCurvedTower([-2, 0, 0], [1, 1, 1], '#E8E8E8', 0)}
      {createCurvedTower([0, 0.3, 0.5], [1.1, 1.2, 1.1], '#F0F0F0', 1)}
      {createCurvedTower([2, 0, -0.3], [0.9, 1.1, 0.9], '#DCDCDC', 2)}

      {/* Windows - small cubes for detail */}
      {[...Array(20)].map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 2.5;
        return (
          <mesh
            key={`window-${i}`}
            position={[
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 2,
              Math.sin(angle) * radius,
            ]}
            scale={0.05}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial
              color="#FFD700"
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Platform/base */}
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[3, 3.5, 0.3, 32]} />
        <meshStandardMaterial
          color="#A0A0A0"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Ground reflection effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <circleGeometry args={[4, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

export default WangjingSOHO;
