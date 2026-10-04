import { motion } from 'framer-motion';

// Fixed top-left "back" arrow, matching the one on the other section pages.
const BackButton = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    aria-label="Back"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="fixed top-8 left-8 z-50 p-3 border border-gold/20 hover:border-gold/50 hover:bg-gold/5 transition-all duration-500"
  >
    <svg
      className="w-5 h-5 text-gold"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  </motion.button>
);

export default BackButton;
