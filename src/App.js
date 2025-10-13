import { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import CursorTrail from './components/CursorTrail';
import RippleEffect from './components/RippleEffect';
import LandingPage from './components/LandingPage';
import ImprovedLetterRain from './components/ImprovedLetterRain';
import GlobalMusicPlayer from './components/GlobalMusicPlayer';
import MainSections from './components/MainSections';
import MilestonesSection from './components/MilestonesSection';
import WorksSection from './components/WorksSection';
import SkillsSection from './components/SkillsSection';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

const App = () => {
  const [activeSection, setActiveSection] = useState('home'); // 'home', 'milestones', 'works', 'skills'
  const mainSectionsRef = useRef(null);
  const mainSectionsPositionRef = useRef(0);

  // Initialize smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Store MainSections position when on home page
  useEffect(() => {
    if (activeSection === 'home' && mainSectionsRef.current) {
      const timer = setTimeout(() => {
        const rect = mainSectionsRef.current.getBoundingClientRect();
        mainSectionsPositionRef.current = rect.top + window.scrollY;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeSection]);

  const handleSectionClick = (section) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setActiveSection('home');
    // Scroll to MainSections position after a brief delay for state update
    setTimeout(() => {
      window.scrollTo({
        top: mainSectionsPositionRef.current,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <ThemeProvider>
      <div className="App relative min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark overflow-x-hidden transition-colors duration-300">
        <ThemeToggle />
        <CursorTrail />
        <RippleEffect />
        <ImprovedLetterRain />
        <GlobalMusicPlayer />

        <AnimatePresence mode="wait">
          {activeSection === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <LandingPage />
              <div ref={mainSectionsRef}>
                <MainSections onSectionClick={handleSectionClick} />
              </div>
            </motion.div>
          )}

          {activeSection === 'milestones' && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <MilestonesSection onBack={handleBackToHome} />
            </motion.div>
          )}

          {activeSection === 'works' && (
            <motion.div
              key="works"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <WorksSection onBack={handleBackToHome} />
            </motion.div>
          )}

          {activeSection === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <SkillsSection onBack={handleBackToHome} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}

export default App;
