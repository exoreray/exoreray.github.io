import { motion } from 'framer-motion';
import Chapter1Wangjing from './chapters/Chapter1Wangjing';
import Chapter2Transition from './chapters/Chapter2Transition';
import Chapter3Berkeley from './chapters/Chapter3Berkeley';
import Chapter4Robotics from './chapters/Chapter4Robotics';
import Chapter5FlowGPT from './chapters/Chapter5FlowGPT';
import Chapter6Apple from './chapters/Chapter6Apple';
import Chapter6Community from './chapters/Chapter6Community';
import Chapter7Livia from './chapters/Chapter7Livia';

const MilestonesSection = ({ onBack }) => {
  return (
    <div className="relative">
      {/* Back Button */}
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-8 left-8 z-40 p-3 border border-gold/20 hover:border-gold/50 hover:bg-gold/5 transition-all duration-500"
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

      {/* Milestone Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[40vh] flex items-center justify-center px-8"
      >
        <div className="text-center">
          <h1 className="font-serif text-5xl md:text-7xl text-text-light dark:text-text-dark mb-4">
            Milestones
          </h1>
          <p className="font-display text-xl md:text-2xl text-bronze dark:text-champagne">
            Seven Chapters of Growth
          </p>
        </div>
      </motion.div>

      {/* All Chapters */}
      <Chapter1Wangjing />
      <Chapter2Transition />
      <Chapter3Berkeley />
      <Chapter4Robotics />
      <Chapter5FlowGPT />
      <Chapter6Apple />
      <Chapter6Community />
      <Chapter7Livia />
    </div>
  );
};

export default MilestonesSection;
