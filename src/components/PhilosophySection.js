import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from './Chapter';
import PhilosophyMindMap from './PhilosophyMindMap';
import siteCopy from '../data/siteCopy.json';

const PhilosophySection = ({ onBack }) => {
  const { philosophySection } = siteCopy;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Chapter id="philosophy" className="bg-gradient-to-b from-bg-light-secondary to-bg-light dark:from-bg-dark-secondary dark:to-bg-dark">
      {/* Back Button */}
      {onBack && (
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed top-8 left-8 z-50 p-3 border border-gold/20 hover:border-gold/50 hover:bg-gold/5 transition-all duration-500"
        >
          <svg
            className="w-5 h-5 text-gold"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </motion.button>
      )}
      <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Left Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[0, 0, 12]} />

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
              {philosophySection.title}
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-bronze dark:text-champagne mb-6">
              {philosophySection.subtitle}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            {philosophySection.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={`font-sans ${index === 0 ? 'text-lg md:text-xl text-text-light/90 dark:text-cream/90' : 'text-base md:text-lg text-text-light/80 dark:text-cream/80'} leading-relaxed`}
              >
                {paragraph}
              </p>
            ))}
          </motion.div>

          {philosophySection.badges?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="pt-4 flex gap-4 flex-wrap"
            >
              {philosophySection.badges.map((badge) => (
                <div key={badge} className="inline-block px-6 py-2 border border-gold/30 rounded-sm">
                  <p className="font-mono text-sm text-gold tracking-wider">
                    {badge}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Medium Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="pt-6"
          >
            <a
              href="https://medium.com/@DarrenX"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-gold/70 hover:text-gold transition-all duration-500"
            >
              <span className="font-display text-sm tracking-[0.25em]">READ MORE ON MEDIUM</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </Chapter>
  );
};

export default PhilosophySection;
