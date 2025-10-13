import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from '../Chapter';
import ApplePark from '../ApplePark';

const Chapter6Apple = () => {
  return (
    <Chapter id="apple" className="bg-gradient-to-b from-bg-light dark:from-bg-dark to-bg-light-secondary dark:to-bg-dark-secondary">
      <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Left Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[4, 3, 5]} />

            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} color="#FFFFFF" />
            <pointLight position={[-3, 3, -3]} intensity={0.6} color="#C0C0C0" />

            <Suspense fallback={null}>
              <ApplePark />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.6}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 4}
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
              Chapter 6
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-bronze dark:text-champagne mb-6">
              Among Thousands, One
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
              <span className="text-gold font-semibold">Apple</span>—a place where{' '}
              <span className="text-bronze dark:text-champagne italic">craft meets innovation</span>, where every
              detail matters, where design is not just how it looks but how it works.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/ dark:text-cream/80 leading-relaxed">
              That year, among thousands of applicants, I became{' '}
              <span className="text-gold font-semibold">the only bachelor's degree graduate from Berkeley</span>{' '}
              accepted as a new grad. Not because of years of experience, but because of vision,
              craft, and relentless attention to detail.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/ dark:text-cream/80 leading-relaxed">
              I joined the masters of craft. I learned that technology, at its best, disappears—
              leaving only delight, only intuition, only{' '}
              <span className="text-bronze dark:text-champagne font-semibold">恰到好处</span>.
            </p>

            <p className="font-sans text-base md:text-lg text-text-light/ dark:text-cream/80 leading-relaxed">
              Apple taught me that excellence isn't flashy. It's quiet. Elegant. Inevitable.
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
                THE ONE
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-gray-400/30 rounded-sm">
              <p className="font-mono text-sm text-gray-300 tracking-wider">
                APPLE
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

export default Chapter6Apple;
