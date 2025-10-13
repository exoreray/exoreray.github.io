import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from '../Chapter';
import BlueprintToCircuit from '../BlueprintToCircuit';

const Chapter2Transition = () => {
  return (
    <Chapter id="transition" className="bg-gradient-to-b from-bg-light-secondary to-bg-light dark:from-bg-dark-secondary dark:to-bg-dark">
      <div className="absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Right Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[0, 0, 6]} />

            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={0.8} color="#4ECDC4" />
            <pointLight position={[-5, -5, 5]} intensity={0.6} color="#9B88DA" />

            <Suspense fallback={null}>
              <BlueprintToCircuit />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.3}
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
              Chapter 2
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-bronze dark:text-champagne mb-6">
              The Architect's Lens
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <p className="font-sans text-lg md:text-xl text-text-light/90 dark:text-cream/90 leading-relaxed">
              I studied <span className="text-amber-dark dark:text-amber font-semibold">architecture</span> — learning to shape spaces,
              to design experiences, to think in systems and beauty simultaneously.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/80 dark:text-cream/80 leading-relaxed">
              But then I discovered something profound: <span className="text-bronze-dark dark:text-bronze italic">digital architecture</span>.
              The blueprints became circuit boards. The buildings became interfaces.
              The same principles — form, function, user experience — just in a different medium.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/80 dark:text-cream/80 leading-relaxed">
              I realized I could build worlds that millions could inhabit instantly.
              Spaces without physical constraints. <span className="text-bronze dark:text-champagne font-semibold">Architecture at the speed of thought</span>.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/80 dark:text-cream/80 leading-relaxed">
              So I made the leap. From China to America. From architecture school to computer science.
              The foundation remained — I was still designing experiences. Just in code.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-4 flex gap-4"
          >
            <div className="inline-block px-6 py-2 border border-amber/30 rounded-sm">
              <p className="font-mono text-sm text-amber-dark dark:text-amber tracking-wider">
                ARCHITECTURE
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-bronze/30 rounded-sm">
              <p className="font-mono text-sm text-bronze-dark dark:text-bronze tracking-wider">
                COMPUTER SCIENCE
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

export default Chapter2Transition;
