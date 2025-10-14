import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from '../Chapter';
import NetworkGraph from '../NetworkGraph';
import siteCopy from '../../data/siteCopy.json';

const Chapter6Community = () => {
  const { milestones } = siteCopy;
  const copy = milestones.chapters.find((chapter) => chapter.id === 'community');

  if (!copy) {
    return null;
  }

  return (
    <Chapter id="community" className="bg-gradient-to-b from-bg-light-secondary dark:from-bg-dark-secondary to-bg-light dark:to-bg-dark">
      <div className="absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Right Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[5, 3, 5]} />

            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.6} color="#FFD700" />
            <pointLight position={[-3, 3, -3]} intensity={0.8} color="#9B88DA" />

            <Suspense fallback={null}>
              <NetworkGraph />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.4}
              maxPolarAngle={Math.PI / 1.6}
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
              {copy.number}
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-bronze dark:text-champagne mb-6">
              {copy.title}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.4 }}
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.6 }}
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

export default Chapter6Community;
