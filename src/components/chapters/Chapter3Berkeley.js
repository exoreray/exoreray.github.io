import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from '../Chapter';
import CollegePathway from '../CollegePathway';

const Chapter3Berkeley = () => {
  return (
    <Chapter id="berkeley" className="bg-gradient-to-b from-bg-light dark:from-bg-dark to-bg-light-secondary dark:to-bg-dark-secondary">
      <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Left Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[3, 2, 4]} />

            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1} color="#FFD700" />
            <pointLight position={[-3, 2, -2]} intensity={0.8} color="#9B88DA" />
            <pointLight position={[0, 0, 3]} intensity={0.6} color="#20B2AA" />

            <Suspense fallback={null}>
              <CollegePathway />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.8}
              maxPolarAngle={Math.PI / 1.8}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>
        </div>

        {/* Content - Right Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-text-light dark:text-white-warm mb-4">
              Chapter 3
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-bronze dark:text-champagne mb-6">
              The One Path
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <p className="font-sans text-lg md:text-xl text-text-light/ dark:text-cream/90 leading-relaxed">
              Arriving in America with a dream, I began at a community college—a place where
              paths diverge and aspirations are tested.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/ dark:text-cream/80 leading-relaxed">
              The goal seemed impossible: transfer to{' '}
              <span className="text-gold font-semibold">UC Berkeley's EECS program</span>—one of the
              most competitive in the world.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/ dark:text-cream/80 leading-relaxed">
              That year, I became <span className="text-gold italic">the only student</span> from my entire college
              to be accepted into Berkeley EECS. Among hundreds who tried, one path lit up in gold.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/ dark:text-cream/80 leading-relaxed">
              It wasn't just about getting in—it was about proving that{' '}
              <span className="text-bronze dark:text-champagne font-semibold">determination and relentless work</span>{' '}
              could overcome any odds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-4 flex gap-4 flex-wrap"
          >
            <div className="inline-block px-6 py-2 border border-gold/30 rounded-sm">
              <p className="font-mono text-sm text-gold tracking-wider">
                1 IN 100+
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-violet/30 rounded-sm">
              <p className="font-mono text-sm text-violet tracking-wider">
                UC BERKELEY
              </p>
            </div>
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

export default Chapter3Berkeley;
