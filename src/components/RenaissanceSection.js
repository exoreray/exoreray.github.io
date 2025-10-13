import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from './Chapter';
import RenaissanceSkills from './RenaissanceSkills';

const RenaissanceSection = () => {
  return (
    <Chapter id="renaissance" className="bg-gradient-to-b from-navy to-charcoal-warm">
      <div className="absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Right Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[0, 0, 6]} />

            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.6} color="#FFD700" />
            <pointLight position={[-3, 3, -3]} intensity={0.8} color="#9B88DA" />

            <Suspense fallback={null}>
              <RenaissanceSkills />
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

        {/* Content - Left Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white-warm mb-4">
              Renaissance
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-champagne mb-6">
              The Whole Human
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
              I refuse to be{' '}
              <span className="text-gold font-semibold">just one thing</span>.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              <span className="text-teal font-semibold">Engineer</span> by training.{' '}
              <span className="text-violet font-semibold">Designer</span> by passion.{' '}
              <span className="text-rose font-semibold">Musician</span> by soul.{' '}
              <span className="text-gold font-semibold">Architect</span> by philosophy.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              I play basketball. Dance. Take photos that tell stories. Practice badminton.
              Study philosophy. Lead communities. Each skill informs the others—
              <span className="text-champagne italic">the rhythm of code mirrors the rhythm of music</span>,
              the balance in sports reflects the balance in design.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              Leonardo da Vinci didn't choose between art and science. Neither do I.
              The renaissance person sees <span className="text-gold font-semibold">connections where others see boundaries</span>.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              This is how I stay creative. How I avoid burnout. How I remain{' '}
              <span className="text-champagne font-semibold">fully human</span> in a world that
              wants to reduce us to functions.
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
                10+ SKILLS
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-violet/30 rounded-sm">
              <p className="font-mono text-sm text-violet tracking-wider">
                ONE HUMAN
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

export default RenaissanceSection;
