import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Torus, Sphere, Cone } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from '../Chapter';

// F1 Racing 3D Scene Component
const F1RacingScene = () => {
  const carRef = useRef();
  const trackRef = useRef();

  useFrame((state) => {
    if (carRef.current) {
      // Car moving on track
      const t = state.clock.elapsedTime;
      carRef.current.position.x = Math.sin(t * 0.5) * 2;
      carRef.current.position.z = Math.cos(t * 0.5) * 2;
      // Point the car in the direction of movement (tangent to the circle)
      carRef.current.rotation.y = t * 0.5;
    }
    if (trackRef.current) {
      trackRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <>
      {/* Racing track */}
      <group ref={trackRef}>
        <Torus args={[2.5, 0.01, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#FFD700" opacity={0.3} transparent />
        </Torus>
        <Torus args={[2, 0.01, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#FF6B35" opacity={0.2} transparent />
        </Torus>
      </group>

      {/* F1 Car */}
      <group ref={carRef}>
        {/* Car body */}
        <Box args={[0.8, 0.2, 0.4]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#FF6B35" metalness={0.9} roughness={0.1} />
        </Box>
        {/* Front wing */}
        <Box args={[0.3, 0.05, 0.5]} position={[0.35, -0.05, 0]}>
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </Box>
        {/* Rear wing */}
        <Box args={[0.2, 0.15, 0.4]} position={[-0.3, 0.1, 0]}>
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </Box>
        {/* Wheels */}
        {[
          [-0.25, -0.1, 0.25],
          [-0.25, -0.1, -0.25],
          [0.25, -0.1, 0.25],
          [0.25, -0.1, -0.25]
        ].map((pos, i) => (
          <Sphere key={i} args={[0.08, 16, 16]} position={pos}>
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </Sphere>
        ))}
      </group>

      {/* Speed lines */}
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          args={[0.02, 0.02, 1 + i * 0.5]}
          position={[-1 - i * 0.3, 0, 0]}
        >
          <meshStandardMaterial
            color="#FFD700"
            opacity={0.3 - i * 0.1}
            transparent
          />
        </Box>
      ))}
    </>
  );
};

const Chapter4Robotics = () => {
  return (
    <Chapter id="robotics" className="bg-gradient-to-b from-bg-light-secondary dark:from-bg-dark-secondary to-bg-light dark:to-bg-dark">
      <div className="absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Right Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[4, 2, 4]} />

            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1} color="#FFD700" />
            <pointLight position={[-3, 2, -2]} intensity={0.8} color="#FF6B35" />

            <Suspense fallback={null}>
              <F1RacingScene />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.3}
              maxPolarAngle={Math.PI / 1.8}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>
        </div>

        {/* Content - Left Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-text-light dark:text-white-warm mb-4">
              Chapter 4
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-bronze dark:text-champagne mb-6">
              Racing at the Edge
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <p className="font-sans text-lg md:text-xl text-text-light/ dark:text-cream/90 leading-relaxed">
              At Berkeley EECS, I pushed the boundaries of what machines could do—
              <span className="text-gold font-semibold"> building an F1 autonomous racing car</span> from the ground up.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/ dark:text-cream/80 leading-relaxed">
              This wasn't just about speed. It was about creating{' '}
              <span className="text-amber-dark dark:text-amber font-semibold">intelligence at velocity</span>—
              computer vision processing at 120fps, path planning algorithms making microsecond decisions,
              sensor fusion creating perfect spatial awareness.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/ dark:text-cream/80 leading-relaxed">
              Every line of code had to be flawless. At those speeds, there's no room for error.
              The car became an extension of algorithmic precision—
              <span className="text-bronze dark:text-champagne font-semibold"> where mathematics meets adrenaline</span>.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/ dark:text-cream/80 leading-relaxed">
              This project shaped my philosophy: build systems that perform at the edge of possibility,
              elegant under pressure, <span className="text-gold italic">reliable at scale</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-4"
          >
            <a
              href="https://eecs106b-banana-radiation.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 border border-amber/30 hover:border-amber/60 hover:bg-amber/5 rounded-sm transition-all duration-300"
            >
              <p className="font-mono text-sm text-amber tracking-wider">
                VIEW F1 PROJECT →
              </p>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          className="w-6 h-6 mx-auto text-gold"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </motion.div>
    </Chapter>
  );
};

export default Chapter4Robotics;