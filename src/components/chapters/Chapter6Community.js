import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from '../Chapter';
import NetworkGraph from '../NetworkGraph';

const Chapter6Community = () => {
  return (
    <Chapter id="community" className="bg-gradient-to-b from-charcoal-warm to-navy">
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
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white-warm mb-4">
              Chapter 6
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-champagne mb-6">
              Building Bridges
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <p className="font-sans text-lg md:text-xl text-cream/90 leading-relaxed">
              Technology connects. But{' '}
              <span className="text-gold font-semibold">community transforms</span>.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              I founded <span className="text-gold font-semibold">StartupHarbor</span>, a place where dreamers
              could find their crew, where founders could share struggles and victories, where
              ideas could collide and create something greater.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              Collaborating with <span className="text-teal font-semibold">Bay Area Founders Club</span>, we built
              a network of <span className="text-gold italic">30,000 members</span>—30,000 stories,
              aspirations, and journeys intertwined.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              Each connection, each conversation, each shared moment of breakthrough—
              <span className="text-champagne font-semibold">that's where true innovation lives</span>.
              Not in isolation, but in the spaces between us.
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
                30K+ MEMBERS
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-teal/30 rounded-sm">
              <p className="font-mono text-sm text-teal tracking-wider">
                COMMUNITY
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

export default Chapter6Community;
