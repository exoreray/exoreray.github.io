import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FlowGPTGrowth = () => {
  const particlesRef = useRef();
  const groupRef = useRef();
  const flowLinesRef = useRef();

  // Create particles representing user growth from 1 to 6M
  const particleCount = 3000;

  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Create a flowing river shape - starts narrow, expands exponentially
      const progress = i / particleCount;
      const angle = progress * Math.PI * 8; // Multiple spirals
      const radius = progress * 3; // Exponential expansion
      const height = progress * 6 - 3; // Flow upward

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Color transition: violet (start) -> gold (middle) -> teal (end)
      const goldColor = new THREE.Color('#FFD700');
      const violetColor = new THREE.Color('#9B88DA');
      const tealColor = new THREE.Color('#20B2AA');

      let color;
      if (progress < 0.5) {
        color = violetColor.clone().lerp(goldColor, progress * 2);
      } else {
        color = goldColor.clone().lerp(tealColor, (progress - 0.5) * 2);
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Size grows with progress
      scales[i] = 0.02 + progress * 0.08;
    }

    return { positions, colors, scales };
  }, []);

  // Create flowing lines connecting particles
  const flowLines = useMemo(() => {
    const lines = [];
    const lineCount = 15;

    for (let i = 0; i < lineCount; i++) {
      const points = [];
      const angle = (i / lineCount) * Math.PI * 2;

      for (let j = 0; j < 50; j++) {
        const progress = j / 50;
        const radius = progress * 3;
        const height = progress * 6 - 3;

        points.push(
          new THREE.Vector3(
            Math.cos(angle + progress * Math.PI * 8) * radius,
            height,
            Math.sin(angle + progress * Math.PI * 8) * radius
          )
        );
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(100));
      lines.push({ geometry, angle });
    }

    return lines;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Gentle rotation of entire group
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.15;
    }

    // Animate particles flowing
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      const scales = particlesRef.current.geometry.attributes.scale.array;

      for (let i = 0; i < particleCount; i++) {
        const progress = i / particleCount;
        const pulseSpeed = 0.5 + progress * 1.5;
        const pulse = Math.sin(time * pulseSpeed + i * 0.01);

        // Subtle pulsing scale
        scales[i] = (0.02 + progress * 0.08) * (1 + pulse * 0.3);
      }

      particlesRef.current.geometry.attributes.scale.needsUpdate = true;
    }

    // Animate flow lines opacity
    if (flowLinesRef.current) {
      flowLinesRef.current.children.forEach((line, i) => {
        const opacity = 0.15 + Math.sin(time * 0.5 + i * 0.5) * 0.1;
        line.material.opacity = opacity;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main particle system - the "users" */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-scale"
            count={particleCount}
            array={scales}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Flowing lines showing growth trajectory */}
      <group ref={flowLinesRef}>
        {flowLines.map((line, i) => (
          <line key={i} geometry={line.geometry}>
            <lineBasicMaterial
              color="#FFD700"
              transparent
              opacity={0.15}
              blending={THREE.AdditiveBlending}
            />
          </line>
        ))}
      </group>

      {/* Start point - single glowing sphere (represents "0") */}
      <mesh position={[0, -3, 0]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial
          color="#9B88DA"
          emissive="#9B88DA"
          emissiveIntensity={1}
        />
      </mesh>

      {/* End point - large glowing sphere representing 6M */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#20B2AA"
          emissive="#20B2AA"
          emissiveIntensity={0.8}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Milestone markers */}
      {[1, 2, 3, 4, 5].map((milestone) => {
        const y = (milestone / 6) * 6 - 3;
        return (
          <mesh key={milestone} position={[0, y, 0]}>
            <ringGeometry args={[0.8, 0.85, 32]} />
            <meshBasicMaterial
              color="#FFD700"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Lighting */}
      <pointLight position={[0, 3, 2]} intensity={2} color="#20B2AA" distance={5} />
      <pointLight position={[0, -3, 2]} intensity={1} color="#9B88DA" distance={4} />
      <pointLight position={[3, 0, 0]} intensity={1} color="#FFD700" distance={5} />
    </group>
  );
};

export default FlowGPTGrowth;
