import { useEffect } from 'react';
import Lenis from 'lenis';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import CursorTrail from './components/CursorTrail';
import RippleEffect from './components/RippleEffect';
import LandingPage from './components/LandingPage';
import ImprovedLetterRain from './components/ImprovedLetterRain';
import GlobalMusicPlayer from './components/GlobalMusicPlayer';
import MainSections from './components/MainSections';
import MilestonesSection from './components/MilestonesSection';
import WorksSection from './components/WorksSection';
import ProjectsSection from './components/ProjectsSection';
import MusicShowcase from './components/MusicShowcase';
import PhilosophySection from './components/PhilosophySection';
import SkillsSection from './components/SkillsSection';
import AwardsSection from './components/AwardsSection';
import ChapterNavigation from './components/ChapterNavigation';
import ThemeToggle from './components/ThemeToggle';
import SubpageNavigation from './components/SubpageNavigation';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import './App.css';

const PageTransition = ({ children, slide = false }) => {
  const shouldReduceMotion = useReducedMotion();
  const offset = slide && !shouldReduceMotion ? 80 : 0;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, x: offset }}
      animate={{ opacity: 1, x: 0 }}
      exit={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -offset }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
};

const SubpageRoute = ({ children, parentTo, parentLabel, parentCompactLabel }) => (
  <PageTransition slide>
    <SubpageNavigation
      parentTo={parentTo}
      parentLabel={parentLabel}
      parentCompactLabel={parentCompactLabel}
    />
    {children}
  </PageTransition>
);

const AppContent = () => {
  const location = useLocation();

  // Initialize smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    // Expose lenis instance globally for navigation
    window.lenis = lenis;

    let animationFrame;

    function raf(time) {
      lenis.raf(time);
      animationFrame = requestAnimationFrame(raf);
    }

    animationFrame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrame);
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  // Each route starts from a predictable position, including Back/Forward visits.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (window.lenis?.scrollTo) {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <div className="App relative min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark overflow-x-hidden transition-colors duration-300">
      <ThemeToggle />
      <CursorTrail />
      <RippleEffect />
      <ImprovedLetterRain />
      <GlobalMusicPlayer />
      <ChapterNavigation />

      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
                <MainSections />
              </PageTransition>
            }
          />
          <Route
            path="/milestones"
            element={
              <SubpageRoute>
                <MilestonesSection />
              </SubpageRoute>
            }
          />
          <Route
            path="/works"
            element={
              <SubpageRoute>
                <WorksSection />
              </SubpageRoute>
            }
          />
          <Route
            path="/works/projects"
            element={
              <SubpageRoute
                parentTo="/works"
                parentLabel="Back to works"
                parentCompactLabel="Works"
              >
                <ProjectsSection />
              </SubpageRoute>
            }
          />
          <Route
            path="/works/music"
            element={
              <SubpageRoute
                parentTo="/works"
                parentLabel="Back to works"
                parentCompactLabel="Works"
              >
                <MusicShowcase />
              </SubpageRoute>
            }
          />
          <Route
            path="/works/philosophy"
            element={
              <SubpageRoute
                parentTo="/works"
                parentLabel="Back to works"
                parentCompactLabel="Works"
              >
                <PhilosophySection />
              </SubpageRoute>
            }
          />
          <Route
            path="/works/skills"
            element={
              <SubpageRoute
                parentTo="/works"
                parentLabel="Back to works"
                parentCompactLabel="Works"
              >
                <SkillsSection />
              </SubpageRoute>
            }
          />
          <Route
            path="/design"
            element={
              <SubpageRoute>
                <AwardsSection />
              </SubpageRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
