import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from './Chapter';
import DesignGallery from './DesignGallery';

const DesignSection = () => {
  return (
    <Chapter id="design" className="bg-gradient-to-b from-charcoal-warm to-navy">
      <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Left Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[0, 1, 5]} />

            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} color="#FFD700" />
            <pointLight position={[-3, 2, -2]} intensity={0.6} color="#9B88DA" />

            <Suspense fallback={null}>
              <DesignGallery />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.4}
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
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white-warm mb-4">
              Design
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-champagne mb-6">
              Awards & Creations
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
              Design is <span className="text-gold font-semibold">intentionality made visible</span>.
              Every line, every curve, every decision—all in service of clarity and delight.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              My work has been recognized with{' '}
              <span className="text-gold font-semibold">Red Dot</span>,{' '}
              <span className="text-gold font-semibold">iF Design</span>, and{' '}
              <span className="text-gold font-semibold">A' Design</span> awards.
              Not for decoration, but for solving real problems with elegance.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              <span className="text-violet font-semibold">Luxiphos</span>—my design studio—is where
              physical meets digital. From VR fireworks that explode with real physics to
              interactive coin flips that feel tangible, I blend technology with craft.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              Featured in design publications, exhibited internationally—but the real measure
              is when someone uses what I've created and it just{' '}
              <span className="text-champagne italic">feels right</span>.
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
                RED DOT
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-gold/30 rounded-sm">
              <p className="font-mono text-sm text-gold tracking-wider">
                iF DESIGN
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-violet/30 rounded-sm">
              <p className="font-mono text-sm text-violet tracking-wider">
                LUXIPHOS
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

export default DesignSection;
