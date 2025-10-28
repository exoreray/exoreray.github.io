import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import siteCopy from '../data/siteCopy.json';

// Global flag to track if animations have played (persists across remounts)
let globalHasAnimated = false;

const MainSections = ({ onSectionClick }) => {
  const { mainSections } = siteCopy;
  const sections = mainSections.items;
  const [hasAnimated, setHasAnimated] = useState(globalHasAnimated);

  useEffect(() => {
    // Mark as animated after first render
    if (!globalHasAnimated) {
      globalHasAnimated = true;
      setHasAnimated(true);
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-8 py-32">
      <div className="max-w-7xl mx-auto w-full">
        {/* Minimal header */}
        <motion.div
          initial={hasAnimated ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mb-8" />
          <p className="font-display text-sm tracking-[0.3em] text-text-light/60 dark:text-text-dark/60 uppercase">
            {mainSections.headerLabel}
          </p>
        </motion.div>

        {/* Elegant grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-0">
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              initial={hasAnimated ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="group relative h-[500px] bg-transparent overflow-hidden text-left border-l border-gold/10 first:border-l-0 hover:bg-gradient-to-b hover:from-gold/5 hover:to-transparent transition-all duration-700 backdrop-blur-md"
            >
              {/* Content wrapper with padding */}
              <div className="absolute inset-0 p-12 flex flex-col justify-between bg-bg-light/30 dark:bg-bg-dark/30">
                {/* Number watermark */}
                <div className="absolute top-8 right-8 font-serif text-[140px] leading-none text-gold/[0.15] group-hover:text-gold/[0.25] transition-all duration-700">
                  {section.number}
                </div>

                {/* Top section */}
                <div className="relative z-10">
                  <motion.div
                    className="w-8 h-px bg-gold/50 group-hover:w-16 transition-all duration-700 mb-8"
                  />
                  <h3 className="font-display text-4xl md:text-5xl tracking-tight text-text-light dark:text-text-dark mb-4 group-hover:translate-x-2 transition-transform duration-700">
                    {section.title}
                  </h3>
                </div>

                {/* Bottom section */}
                <div className="relative z-10">
                  <p className="font-sans text-base leading-relaxed text-text-light/70 dark:text-text-dark/70 mb-6 max-w-xs group-hover:text-text-light/90 dark:group-hover:text-text-dark/90 transition-colors duration-700">
                    {section.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="flex items-center gap-3 text-sm font-display tracking-[0.2em] text-gold/80 group-hover:text-gold group-hover:gap-5 transition-all duration-700">
                    <span>{section.ctaLabel}</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Subtle border accent on hover */}
              <div className="absolute inset-0 border border-transparent group-hover:border-gold/20 transition-all duration-700 pointer-events-none" />
            </motion.button>
          ))}
        </div>

        {/* Bottom decoration */}
        <motion.div
          initial={hasAnimated ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-24"
        />
      </div>
    </section>
  );
};

export default MainSections;
