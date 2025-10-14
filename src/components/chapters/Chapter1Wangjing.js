import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from '../Chapter';
import WangjingSOHO from '../WangjingSOHO';
import siteCopy from '../../data/siteCopy.json';

// Check if device is mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024;
};

const Chapter1Wangjing = () => {
  const { milestones } = siteCopy;
  const copy = milestones.chapters.find((chapter) => chapter.id === 'wangjing');
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobile());
    const handleResize = () => setMobile(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!copy) {
    return null;
  }

  // Simplified animation config for mobile
  const animationConfig = mobile ? {
    initial: { opacity: 1, x: 0, y: 0 },
    whileInView: { opacity: 1, x: 0, y: 0 },
    viewport: { once: true },
    transition: { duration: 0 }
  } : {
    initial: { opacity: 0, x: 50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false },
    transition: { duration: 0.8 }
  };

  return (
    <Chapter id="wangjing" className="bg-gradient-to-b from-bg-light to-bg-light-secondary dark:from-bg-dark dark:to-bg-dark-secondary">
      <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Left Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[15, 10, 15]} />

            <ambientLight intensity={2.7} />
            <directionalLight position={[5, 8, 5]} intensity={5.4} color="#FFFFFF" />
            <pointLight position={[-3, 3, -3]} intensity={3.6} color="#FFFFFF" />
            <pointLight position={[3, 3, 3]} intensity={3} color="#FFD700" />

            <Suspense fallback={null}>
              <WangjingSOHO />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 4}
            />
          </Canvas>
        </div>

        {/* Content - Right Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left space-y-6">
          <motion.div
            {...animationConfig}
            transition={{ ...animationConfig.transition, delay: mobile ? 0 : 0.2 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-text-light dark:text-white-warm mb-4">
              {copy.number}
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-bronze dark:text-champagne mb-6">
              {copy.title}
            </h3>
          </motion.div>

          <motion.div
            {...animationConfig}
            transition={{ ...animationConfig.transition, delay: mobile ? 0 : 0.4 }}
            className="space-y-4"
          >
            {copy.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={`font-sans ${index === 0 ? 'text-lg md:text-xl text-text-light/90 dark:text-cream/90' : 'text-base md:text-lg text-text-light/80 dark:text-cream/80'} leading-relaxed`}
              >
                {paragraph}
              </p>
            ))}
          </motion.div>

          {copy.badges?.length > 0 && (
            <motion.div
              {...animationConfig}
              transition={{ ...animationConfig.transition, delay: mobile ? 0 : 0.6 }}
              className="pt-4 flex gap-4 flex-wrap"
            >
              {copy.badges.map((badge) => (
                <div key={badge} className="inline-block px-6 py-2 border border-gold/30 rounded-sm">
                  <p className="font-mono text-sm text-gold tracking-wider">
                    {badge}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Chapter>
  );
};

export default Chapter1Wangjing;
