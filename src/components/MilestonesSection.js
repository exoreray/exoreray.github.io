import { motion } from 'framer-motion';
import Chapter1Wangjing from './chapters/Chapter1Wangjing';
import Chapter2Transition from './chapters/Chapter2Transition';
import Chapter3Berkeley from './chapters/Chapter3Berkeley';
import Chapter4Robotics from './chapters/Chapter4Robotics';
import Chapter5FlowGPT from './chapters/Chapter5FlowGPT';
import Chapter6Apple from './chapters/Chapter6Apple';
import Chapter6Community from './chapters/Chapter6Community';
import Chapter7Livia from './chapters/Chapter7Livia';
import siteCopy from '../data/siteCopy.json';

const MilestonesSection = () => {
  const { milestones } = siteCopy;

  return (
    <div className="relative">
      {/* Milestone Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[40vh] flex items-center justify-center px-8"
      >
        <div className="text-center">
          <h1 className="font-serif text-5xl md:text-7xl text-text-light dark:text-text-dark mb-4">
            {milestones.header.title}
          </h1>
          <p className="font-display text-xl md:text-2xl text-bronze dark:text-champagne">
            {milestones.header.tagline}
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
