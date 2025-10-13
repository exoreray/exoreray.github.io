import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from '../Chapter';
import LiviaHeart from '../LiviaHeart';

const Chapter7Livia = () => {
  return (
    <Chapter id="livia" className="bg-gradient-to-b from-navy to-charcoal-warm">
      <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Left Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[0, 0, 6]} />

            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} color="#E8B4B8" />
            <pointLight position={[-3, 3, -3]} intensity={1} color="#B4A5E8" />

            <Suspense fallback={null}>
              <LiviaHeart />
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

        {/* Content - Right Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white-warm mb-4">
              Chapter 7
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-champagne mb-6">
              The Heart
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <p className="font-sans text-lg md:text-xl text-cream/90 leading-relaxed">
              <span className="text-rose font-semibold">Livia</span>—born from a simple truth:{' '}
              <span className="text-champagne italic">every human deserves to feel loved, cared for, and understood</span>.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              We live in a world rich with technology but starved for genuine connection.
              I'm building Livia to bridge that gap—to use AI not as a replacement for human
              warmth, but as a channel to amplify it.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              <span className="text-gold font-semibold">博爱</span>—universal love—is not just philosophy.
              It's my north star. Better resource allocation, deeper emotional intelligence,
              technology that serves humanity's highest potential.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              This is why I build. This is my purpose.{' '}
              <span className="text-champagne font-semibold">To spread love and care to every human through AI</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-4 flex gap-4 flex-wrap"
          >
            <div className="inline-block px-6 py-2 border border-rose/30 rounded-sm">
              <p className="font-mono text-sm text-rose tracking-wider">
                博爱
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-violet/30 rounded-sm">
              <p className="font-mono text-sm text-violet tracking-wider">
                UNIVERSAL LOVE
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

export default Chapter7Livia;
