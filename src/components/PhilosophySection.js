import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from './Chapter';
import PhilosophyMindMap from './PhilosophyMindMap';

const PhilosophySection = () => {
  return (
    <Chapter id="philosophy" className="bg-gradient-to-b from-bg-light-secondary to-bg-light dark:from-bg-dark-secondary dark:to-bg-dark">
      <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Left Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[0, 0, 7]} />

            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.6} color="#FFD700" />
            <pointLight position={[-3, 3, -3]} intensity={0.8} color="#9B88DA" />

            <Suspense fallback={null}>
              <PhilosophyMindMap />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.3}
              maxPolarAngle={Math.PI / 1.6}
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
              Philosophy
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-bronze dark:text-champagne mb-6">
              The Architecture of Thought
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <p className="font-sans text-lg md:text-xl text-text-light/90 dark:text-cream/90 leading-relaxed">
              At the center of everything I build is{' '}
              <span className="text-gold font-semibold">博爱</span>—universal love.
              Not as abstract philosophy, but as a practical north star.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/80 dark:text-cream/80 leading-relaxed">
              I believe in <span className="text-bronze-dark dark:text-bronze font-semibold">optimal resource allocation</span>—
              directing energy, attention, and technology toward what truly matters.
              Building systems that amplify human potential, not diminish it.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/80 dark:text-cream/80 leading-relaxed">
              <span className="text-copper-dark dark:text-copper font-semibold">Emotion and logic</span> aren't opposites—
              they're complementary forces. The best design balances analytical rigor with
              intuitive delight. The best technology feels invisible yet profound.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/80 dark:text-cream/80 leading-relaxed">
              I see <span className="text-amber-dark dark:text-amber font-semibold">technology as art</span>—
              where craft meets purpose, where architecture meets experience,
              where every detail matters because <span className="text-bronze dark:text-champagne italic">恰到好处</span>:
              just right, precisely balanced, elegantly inevitable.
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
                博爱
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-bronze/30 rounded-sm">
              <p className="font-mono text-sm text-bronze-dark dark:text-bronze tracking-wider">
                BALANCE
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-amber/30 rounded-sm">
              <p className="font-mono text-sm text-amber-dark dark:text-amber tracking-wider">
                恰到好处
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

export default PhilosophySection;
