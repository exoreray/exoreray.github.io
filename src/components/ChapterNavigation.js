import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChapterNavigation = () => {
  const [activeChapter, setActiveChapter] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const isScrollingRef = useRef(false);

  const chapters = [
    { id: 'wangjing', name: '01' },
    { id: 'transition', name: '02' },
    { id: 'berkeley', name: '03' },
    { id: 'robotics', name: '04' },
    { id: 'flowgpt', name: '05' },
    { id: 'apple', name: '06' },
    { id: 'community', name: '07' },
    { id: 'livia', name: '08' }
  ];

  useEffect(() => {
    let observer = null;
    let intervalId = null;

    // Check if we're on the milestones page
    const checkVisibility = () => {
      const milestonesElement = document.getElementById('wangjing');
      const shouldBeVisible = !!milestonesElement;

      if (shouldBeVisible !== isVisible) {
        setIsVisible(shouldBeVisible);
      }

      // Set up observer when visible
      if (shouldBeVisible && !observer) {
        setupObserver();
      } else if (!shouldBeVisible && observer) {
        observer.disconnect();
        observer = null;
      }
    };

    const setupObserver = () => {
      // Set up intersection observer to track active chapter
      const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
      };

      const observerCallback = (entries) => {
        // Don't update if we're programmatically scrolling
        if (isScrollingRef.current) {
          return;
        }

        // Find the most visible entry
        let maxEntry = null;
        let maxRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            maxEntry = entry;
          }
        });

        if (maxEntry && maxRatio > 0.2) {
          const chapterIndex = chapters.findIndex(ch => ch.id === maxEntry.target.id);
          if (chapterIndex !== -1) {
            setActiveChapter(chapterIndex);
          }
        }
      };

      observer = new IntersectionObserver(observerCallback, observerOptions);

      // Observe all chapter sections
      chapters.forEach(chapter => {
        const element = document.getElementById(chapter.id);
        if (element) {
          observer.observe(element);
        }
      });
    };

    // Initial check
    checkVisibility();

    // Re-check visibility periodically
    intervalId = setInterval(checkVisibility, 500);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isVisible]);

  const scrollToChapter = (chapterIndex) => {
    const chapter = chapters[chapterIndex];
    const element = document.getElementById(chapter.id);

    if (element) {
      // Set flag to prevent observer from interfering
      isScrollingRef.current = true;

      // Update active chapter immediately
      setActiveChapter(chapterIndex);

      // Use Lenis if available, otherwise fallback to native scrollIntoView
      if (window.lenis) {
        window.lenis.scrollTo(element, {
          offset: 0,
          duration: 1.2
        });
      } else {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }

      // Re-enable observer after scroll animation completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1500);
    }
  };

  const handlePrevious = () => {
    if (activeChapter > 0) {
      scrollToChapter(activeChapter - 1);
    }
  };

  const handleNext = () => {
    if (activeChapter < chapters.length - 1) {
      scrollToChapter(activeChapter + 1);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5 }}
      className="fixed right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col items-center gap-2 lg:gap-4"
    >
      {/* Up Arrow */}
      <motion.button
        onClick={handlePrevious}
        disabled={activeChapter === 0}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-1.5 lg:p-2 rounded-full border transition-all duration-300 ${
          activeChapter === 0
            ? 'border-gold/20 text-gold/20 cursor-not-allowed'
            : 'border-gold/50 text-gold hover:border-gold hover:bg-gold/10'
        }`}
      >
        <svg
          className="w-3 h-3 lg:w-4 lg:h-4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>

      {/* Chapter Dots */}
      <div className="flex flex-col items-center gap-2 lg:gap-3 py-2 lg:py-4">
        {chapters.map((chapter, index) => (
          <motion.button
            key={chapter.id}
            onClick={() => scrollToChapter(index)}
            className="relative group"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Dot */}
            <div
              className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full transition-all duration-300 ${
                index === activeChapter
                  ? 'bg-gold shadow-[0_0_10px_rgba(255,215,0,0.8)]'
                  : 'bg-gold/30 hover:bg-gold/60'
              }`}
            />

            {/* Tooltip */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              <div className="bg-bg-dark/90 backdrop-blur-sm border border-gold/30 px-3 py-1 rounded">
                <p className="font-mono text-xs text-gold">
                  Chapter {chapter.name}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Down Arrow */}
      <motion.button
        onClick={handleNext}
        disabled={activeChapter === chapters.length - 1}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-1.5 lg:p-2 rounded-full border transition-all duration-300 ${
          activeChapter === chapters.length - 1
            ? 'border-gold/20 text-gold/20 cursor-not-allowed'
            : 'border-gold/50 text-gold hover:border-gold hover:bg-gold/10'
        }`}
      >
        <svg
          className="w-3 h-3 lg:w-4 lg:h-4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.button>
    </motion.div>
  );
};

export default ChapterNavigation;
