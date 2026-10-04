import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { motion, useReducedMotion } from 'framer-motion';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      onClick={toggleDarkMode}
      initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: shouldReduceMotion ? 0 : 0.3 }}
      className="theme-toggle"
      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {darkMode ? (
        // Sun icon for light mode
        <svg
          className="theme-toggle__icon"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg
          className="theme-toggle__icon"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </motion.button>
  );
};

export default ThemeToggle;
