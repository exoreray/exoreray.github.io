import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Crystal from './Crystal';

const LandingPage = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-10">
        <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />

          {/* Simplified lighting for better performance */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} color="#FFD700" />
          <directionalLight position={[-5, 0, -3]} intensity={0.8} color="#FFF8F0" />

          <Suspense fallback={null}>
            <Crystal />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.4}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
        {/* Name Animation - Elegant Serif */}
        <motion.h1
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 tracking-wide text-text-light dark:text-text-dark"
          style={{
            textShadow: '0 0 40px rgba(255, 215, 0, 0.3), 0 0 80px rgba(255, 215, 0, 0.1)',
            fontWeight: 300,
            letterSpacing: '0.08em'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        >
          <motion.span
            className="inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            R
          </motion.span>
          <motion.span
            className="inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            a
          </motion.span>
          <motion.span
            className="inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            y
          </motion.span>
          <motion.span className="inline-block mx-3 sm:mx-4">
            {' '}
          </motion.span>
          <motion.span
            className="inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            X
          </motion.span>
          <motion.span
            className="inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            i
          </motion.span>
        </motion.h1>

        {/* Subtitle - Display Font */}
        <motion.p
          className="font-display text-lg sm:text-xl md:text-2xl text-bronze dark:text-champagne max-w-2xl mb-8 tracking-wider"
          style={{
            textShadow: '0 0 20px rgba(247, 231, 206, 0.2)',
            fontWeight: 300
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          Architect of Digital Dreams
        </motion.p>

        {/* Description */}
        <motion.p
          className="font-sans text-sm sm:text-base md:text-lg text-text-light/80 dark:text-cream/80 max-w-xl mb-12 leading-relaxed"
          style={{ fontWeight: 300 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
          Software Engineer @ Apple | EECS @ Berkeley
          <br />
          Building delightful experiences at the intersection of art and technology
        </motion.p>

        {/* Scroll Hint */}
        <motion.div
          className="absolute bottom-8 sm:bottom-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 3,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 0.5
          }}
        >
          <p className="font-display text-xs sm:text-sm text-bronze dark:text-champagne/60 mb-2 tracking-widest">
            SCROLL TO EXPLORE
          </p>
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-gold"
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
      </div>
    </div>
  );
};

export default LandingPage;
