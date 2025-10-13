import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from '../Chapter';
import FlowGPTGrowth from '../FlowGPTGrowth';

const Chapter4FlowGPT = () => {
  return (
    <Chapter id="flowgpt" className="bg-gradient-to-b from-charcoal-warm to-navy">
      <div className="absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Right Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[4, 2, 4]} />

            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} color="#FFD700" />
            <pointLight position={[-3, 2, -2]} intensity={1} color="#9B88DA" />

            <Suspense fallback={null}>
              <FlowGPTGrowth />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 1.8}
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
              Chapter 4
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-champagne mb-6">
              The Scale
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
              What begins with a single spark can become a wildfire.{' '}
              <span className="text-teal font-semibold">FlowGPT</span> started with an idea:
              make AI accessible, delightful, and empowering for everyone.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              As <span className="text-gold font-semibold">Founding Designer & Engineer</span>, I didn't just
              build features—I architected experiences. Every pixel, every interaction, every line of code
              was crafted with intention.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              From <span className="text-violet italic">0 users</span> on day one to{' '}
              <span className="text-teal font-semibold">6,000,000+</span> at scale.
              Exponential growth, sustained delight.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              I learned that scale isn't just about numbers—it's about{' '}
              <span className="text-champagne font-semibold">maintaining soul while growing fast</span>.
              Every one of those six million users deserved delight, and we delivered it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-4 flex gap-4 flex-wrap"
          >
            <div className="inline-block px-6 py-2 border border-teal/30 rounded-sm">
              <p className="font-mono text-sm text-teal tracking-wider">
                FOUNDING DESIGNER
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-gold/30 rounded-sm">
              <p className="font-mono text-sm text-gold tracking-wider">
                6M+ USERS
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

export default Chapter4FlowGPT;
