import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhilosophySection from './PhilosophySection';
import ProjectsSection from './ProjectsSection';
import MusicShowcase from './MusicShowcase';
import siteCopy from '../data/siteCopy.json';

const WorksSection = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  const { works } = siteCopy;
  const componentById = {
    projects: ProjectsSection,
    music: MusicShowcase,
    philosophy: PhilosophySection,
  };
  const categories = works.categories.map((category) => ({
    ...category,
    component: componentById[category.id] || null,
  }));

  const activeCategoryData = categories.find((category) => category.id === activeCategory);

  if (activeCategoryData?.component) {
    const ActiveComponent = activeCategoryData.component;
    return (
      <div className="relative">
        <motion.button
          onClick={() => setActiveCategory(null)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed top-8 left-8 z-40 p-3 border border-gold/20 hover:border-gold/50 hover:bg-gold/5 transition-all duration-500"
        >
          <svg className="w-5 h-5 text-gold" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </motion.button>
        <ActiveComponent />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-8 py-32">
      {/* Back Button */}
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-8 left-8 z-40 p-3 border border-gold/20 hover:border-gold/50 hover:bg-gold/5 transition-all duration-500"
      >
        <svg className="w-5 h-5 text-gold" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </motion.button>

      <div className="max-w-7xl mx-auto w-full">
        {/* Minimal header */}
        <div className="text-center mb-24">
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mb-8" />
          <p className="font-display text-sm tracking-[0.3em] text-text-light/60 dark:text-text-dark/60 uppercase">
            {works.headerLabel}
          </p>
        </div>

        {/* Elegant grid - 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className="group relative h-[400px] bg-transparent overflow-hidden text-left border-b border-gold/10 last:border-b-0 md:border-b border-l border-gold/10 odd:border-l-0 hover:bg-gradient-to-b hover:from-gold/5 hover:to-transparent transition-all duration-700"
            >
              {/* Content wrapper with padding */}
              <div className="absolute inset-0 p-12 flex flex-col justify-between">
                {/* Number watermark */}
                <div className="absolute top-8 right-8 font-serif text-[120px] leading-none text-gold/[0.15] group-hover:text-gold/[0.25] transition-all duration-700">
                  {category.number}
                </div>

                {/* Top section */}
                <div className="relative z-10">
                  <motion.div
                    className="w-8 h-px bg-gold/50 group-hover:w-16 transition-all duration-700 mb-8"
                  />
                  <h3 className="font-display text-3xl md:text-4xl tracking-tight text-text-light dark:text-text-dark mb-4 group-hover:translate-x-2 transition-transform duration-700">
                    {category.title}
                  </h3>
                </div>

                {/* Bottom section */}
                <div className="relative z-10">
                  <p className="font-sans text-sm leading-relaxed text-text-light/70 dark:text-text-dark/70 mb-6 max-w-xs group-hover:text-text-light/90 dark:group-hover:text-text-dark/90 transition-colors duration-700">
                    {category.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="flex items-center gap-3 text-xs font-display tracking-[0.2em] text-gold/80 group-hover:text-gold group-hover:gap-5 transition-all duration-700">
                    <span>{category.ctaLabel}</span>
                    <svg
                      className="w-4 h-4"
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
            </button>
          ))}
        </div>

        {/* Bottom decoration */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-24" />
      </div>
    </div>
  );
};

export default WorksSection;
