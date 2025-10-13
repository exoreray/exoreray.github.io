import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { skillsData } from '../data/skillsData';
import * as THREE from 'three';

// Skill Node Component
const SkillNode = ({ position, skill, onClick, isHovered }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05;

      // Scale on hover
      const targetScale = hovered || isHovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  // Size based on skill level
  const size = (skill.level / 100) * 0.3 + 0.2;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={skill.color || '#FFD700'}
          emissive={skill.color || '#FFD700'}
          emissiveIntensity={hovered || isHovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Skill name label */}
      {(hovered || isHovered) && (
        <Html center distanceFactor={8}>
          <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-gold/30 pointer-events-none">
            <p className="font-sans text-sm text-white whitespace-nowrap font-semibold">
              {skill.name}
            </p>
            <p className="font-mono text-xs text-gold">
              Level {skill.level}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
};

// Connection Line Component
const ConnectionLine = ({ start, end, color = '#FFD700' }) => {
  const points = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3((start[0] + end[0]) / 2, (start[1] + end[1]) / 2 + 0.5, (start[2] + end[2]) / 2),
      new THREE.Vector3(...end)
    );
    return curve.getPoints(50);
  }, [start, end]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={0.3} linewidth={2} />
    </line>
  );
};

// Main Skill Tree Scene
const SkillTreeScene = ({ selectedSkill, onSelectSkill }) => {
  const nodes = useMemo(() => {
    const allNodes = [];
    let yOffset = 0;

    // Core foundation at center
    skillsData.core.skills.forEach((skill, i) => {
      allNodes.push({
        skill,
        position: [0, 0, 0],
        isCore: true,
      });
    });

    // Technical branch (right side)
    yOffset = 2;
    skillsData.technical.branches.forEach((branch, branchIdx) => {
      branch.skills.forEach((skill, skillIdx) => {
        allNodes.push({
          skill: { ...skill, color: branch.color },
          position: [3 + skillIdx * 0.5, yOffset, branchIdx * 1.5 - 2],
          parentPos: [0, 0, 0],
        });
      });
      yOffset -= 1.5;
    });

    // Design branch (left side)
    yOffset = 2;
    skillsData.design.branches.forEach((branch, branchIdx) => {
      branch.skills.forEach((skill, skillIdx) => {
        allNodes.push({
          skill: { ...skill, color: branch.color },
          position: [-3 - skillIdx * 0.5, yOffset, branchIdx * 1.5 - 1],
          parentPos: [0, 0, 0],
        });
      });
      yOffset -= 1.5;
    });

    // Soft skills (top)
    yOffset = 3;
    skillsData.soft.branches.forEach((branch, branchIdx) => {
      branch.skills.forEach((skill, skillIdx) => {
        allNodes.push({
          skill: { ...skill, color: branch.color },
          position: [branchIdx * 2 - 1, yOffset + skillIdx * 0.8, 2],
          parentPos: [0, 0, 0],
        });
      });
    });

    return allNodes;
  }, []);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF9500" />

      {/* Draw connections */}
      {nodes.map((node, idx) => {
        if (node.parentPos) {
          return (
            <ConnectionLine
              key={`line-${idx}`}
              start={node.parentPos}
              end={node.position}
              color={node.skill.color}
            />
          );
        }
        return null;
      })}

      {/* Draw skill nodes */}
      {nodes.map((node, idx) => (
        <SkillNode
          key={`node-${idx}`}
          position={node.position}
          skill={node.skill}
          isHovered={selectedSkill?.id === node.skill.id}
          onClick={() => onSelectSkill(node.skill)}
        />
      ))}

      {/* Category labels */}
      <Text
        position={[3.5, 3, 0]}
        fontSize={0.3}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
      >
        Technical
      </Text>
      <Text
        position={[-3.5, 3, 0]}
        fontSize={0.3}
        color="#E0A96D"
        anchorX="center"
        anchorY="middle"
      >
        Design
      </Text>
      <Text
        position={[0, 5, 2]}
        fontSize={0.3}
        color="#F4A460"
        anchorX="center"
        anchorY="middle"
      >
        Leadership
      </Text>

      {/* Camera controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        maxDistance={15}
        minDistance={5}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Main Component
const SkillTree3D = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);

  return (
    <div className="relative w-full h-screen">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <SkillTreeScene selectedSkill={selectedSkill} onSelectSkill={setSelectedSkill} />
      </Canvas>

      {/* Skill Detail Panel */}
      {selectedSkill && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
          <div className="bg-white/90 dark:bg-bg-dark/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-gold/30 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-2xl text-text-light dark:text-text-dark mb-1">
                  {selectedSkill.name}
                </h3>
                <p className="font-mono text-sm text-gold">
                  Proficiency: {selectedSkill.level}%
                </p>
              </div>
              <button
                onClick={() => setSelectedSkill(null)}
                className="text-text-light/50 dark:text-text-dark/50 hover:text-text-light dark:hover:text-text-dark"
              >
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedSkill.projects && (
              <div>
                <p className="font-sans text-sm text-text-light/70 dark:text-text-dark/70 mb-2">
                  Used in projects:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkill.projects.map((project, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gold/20 text-gold text-xs rounded-full border border-gold/30"
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTree3D;
