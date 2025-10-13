import { useEffect } from 'react';
import Lenis from 'lenis';
import CursorTrail from './components/CursorTrail';
import RippleEffect from './components/RippleEffect';
import LandingPage from './components/LandingPage';
import ImprovedLetterRain from './components/ImprovedLetterRain';
import ConstellationNav from './components/ConstellationNav';
import GlobalMusicPlayer from './components/GlobalMusicPlayer';
import Chapter1Wangjing from './components/chapters/Chapter1Wangjing';
import Chapter2Transition from './components/chapters/Chapter2Transition';
import Chapter3Berkeley from './components/chapters/Chapter3Berkeley';
import Chapter4FlowGPT from './components/chapters/Chapter4FlowGPT';
import Chapter5Apple from './components/chapters/Chapter5Apple';
import Chapter6Community from './components/chapters/Chapter6Community';
import Chapter7Livia from './components/chapters/Chapter7Livia';
import PhilosophySection from './components/PhilosophySection';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

const App = () => {
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

  return (
    <ThemeProvider>
      <div className="App relative min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark overflow-x-hidden transition-colors duration-300">
        <ThemeToggle />
        <CursorTrail />
        <RippleEffect />
        <ImprovedLetterRain />
        <ConstellationNav />
        <GlobalMusicPlayer />

        {/* Landing Page */}
        <LandingPage />

        {/* Story Chapters */}
        <Chapter1Wangjing />
        <Chapter2Transition />
        <Chapter3Berkeley />
        <Chapter4FlowGPT />
        <Chapter5Apple />
        <Chapter6Community />
        <Chapter7Livia />

        {/* Philosophy */}
        <PhilosophySection />

      </div>
    </ThemeProvider>
  );
}

export default App;
