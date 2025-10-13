import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConstellationNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const chapters = [
    { id: 'wangjing', name: 'Wangjing', icon: '01' },
    { id: 'transition', name: 'Transition', icon: '02' },
    { id: 'berkeley', name: 'Berkeley', icon: '03' },
    { id: 'flowgpt', name: 'FlowGPT', icon: '04' },
    { id: 'apple', name: 'Apple', icon: '05' },
    { id: 'community', name: 'Community', icon: '06' },
    { id: 'livia', name: 'Livia', icon: '07' },
    { id: 'philosophy', name: 'Philosophy', icon: '08' },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Toggle Button - Fixed position */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 md:top-8 md:right-8 w-14 h-14 md:w-16 md:h-16 rounded-full bg-navy/90 backdrop-blur-md border-2 border-gold/40 flex items-center justify-center cursor-pointer hover:border-gold transition-all shadow-2xl z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {isOpen ? (
            <svg className="w-6 h-6 md:w-7 md:h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 md:w-7 md:h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" strokeWidth="2" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          )}
        </motion.div>

        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-gold/20"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.button>

      {/* Menu Panel - Slide from right */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-40"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-navy/95 backdrop-blur-xl border-l-2 border-gold/30 z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gold/20">
                <h3 className="font-serif text-2xl text-champagne">Navigation</h3>
                <p className="font-sans text-sm text-cream/60 mt-1">Chapter by Chapter</p>
              </div>

              {/* Chapter List */}
              <div className="p-4 space-y-2">
                {chapters.map((chapter, index) => (
                  <motion.button
                    key={chapter.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => scrollToSection(chapter.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg bg-navy/50 border border-gold/20 hover:bg-gold/10 hover:border-gold/50 transition-all group"
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Chapter Number */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                      <span className="font-mono text-sm text-gold font-semibold">{chapter.icon}</span>
                    </div>

                    {/* Chapter Name */}
                    <div className="flex-1 text-left">
                      <p className="font-display text-base text-cream group-hover:text-gold transition-colors">
                        {chapter.name}
                      </p>
                    </div>

                    {/* Arrow */}
                    <svg
                      className="w-5 h-5 text-gold/50 group-hover:text-gold group-hover:translate-x-1 transition-all"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gold/20 mt-4">
                <p className="font-mono text-xs text-cream/40 text-center">
                  恰到好处 · Just Right
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConstellationNav;
