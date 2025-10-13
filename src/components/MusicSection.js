import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Chapter from './Chapter';
import MusicRoom from './MusicRoom';

const MusicSection = () => {
  return (
    <Chapter id="music" className="bg-gradient-to-b from-navy to-charcoal-warm">
      <div className="absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-center gap-8 px-8 lg:px-16">

        {/* 3D Scene - Right Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh]">
          <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[3, 2, 4]} />

            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1} color="#D4AF37" />
            <pointLight position={[-3, 2, -2]} intensity={0.8} color="#9B88DA" />

            <Suspense fallback={null}>
              <MusicRoom />
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

        {/* Content - Left Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white-warm mb-4">
              Music
            </h2>
            <h3 className="font-display text-3xl md:text-4xl text-champagne mb-6">
              The Rhythm of Creation
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
              Music is where emotion becomes structure. Where{' '}
              <span className="text-violet font-semibold">feeling finds form</span>.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              I produce, I mix, I create soundscapes that tell stories without words.
              Every beat, every transition, every silence—all carefully architected.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              It's the same principle as design: <span className="text-gold font-semibold">恰到好处</span>.
              Not too much, not too little. Every element serves the whole.
              The art is knowing what to add, and more importantly, what to leave out.
            </p>

            <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed">
              Music taught me that <span className="text-champagne italic">rhythm matters</span>—in
              sound, in interfaces, in life. The spaces between notes are as important
              as the notes themselves.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-4 flex gap-4 flex-wrap"
          >
            <div className="inline-block px-6 py-2 border border-violet/30 rounded-sm">
              <p className="font-mono text-sm text-violet tracking-wider">
                PRODUCER
              </p>
            </div>
            <div className="inline-block px-6 py-2 border border-gold/30 rounded-sm">
              <p className="font-mono text-sm text-gold tracking-wider">
                SOUNDCLOUD
              </p>
            </div>
          </motion.div>

          {/* Optional: Add SoundCloud embed here if you have tracks */}
          {/*
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="pt-6"
          >
            <iframe
              width="100%"
              height="166"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=YOUR_SOUNDCLOUD_URL&color=%23d4af37&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"
              className="rounded-lg"
            />
          </motion.div>
          */}
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

export default MusicSection;
