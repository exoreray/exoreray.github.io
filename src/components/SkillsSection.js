import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { skillsData } from '../data/skillsData';
import siteCopy from '../data/siteCopy.json';

const SkillsSection = ({ onBack }) => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { skillsSection } = siteCopy;

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  return (
    <div className="relative min-h-screen py-32 px-8">
      {/* Back Button */}
      <motion.button
        onClick={onBack}
        initial={hasAnimated ? false : { opacity: 0, x: -20 }}
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={hasAnimated ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mb-8" />
          <p className="font-display text-sm tracking-[0.3em] text-text-light/60 dark:text-text-dark/60 uppercase">
            {skillsSection.headerLabel}
          </p>
        </motion.div>

        {/* Skill Tree - Vertical Flow */}
        <div className="relative">
          {/* Core Foundation */}
          <SkillGroup
            data={skillsData.core}
            onSkillClick={setSelectedSkill}
            delay={0}
          />

          {/* Vertical Connector */}
          <div className="w-px h-16 bg-gradient-to-b from-gold/30 to-gold/10 mx-auto" />

          {/* Technical Skills */}
          <SkillGroup
            data={skillsData.technical}
            onSkillClick={setSelectedSkill}
            delay={0.2}
          />

          {/* Vertical Connector */}
          <div className="w-px h-16 bg-gradient-to-b from-gold/30 to-gold/10 mx-auto" />

          {/* Design Skills */}
          <SkillGroup
            data={skillsData.design}
            onSkillClick={setSelectedSkill}
            delay={0.4}
          />

          {/* Vertical Connector */}
          <div className="w-px h-16 bg-gradient-to-b from-gold/30 to-gold/10 mx-auto" />

          {/* Soft Skills */}
          <SkillGroup
            data={skillsData.soft}
            onSkillClick={setSelectedSkill}
            delay={0.6}
          />
        </div>
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <SkillDetailModal
            skill={selectedSkill}
            onClose={() => setSelectedSkill(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Skill Group Component
const SkillGroup = ({ data, onSkillClick, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="mb-8"
    >
      {/* Group Title */}
      <div className="text-center mb-12">
        <h3 className="font-display text-2xl text-text-light dark:text-text-dark mb-2">
          {data.name}
        </h3>
        <div className="w-16 h-px bg-gold/30 mx-auto" />
      </div>

      {/* Core Skills (no branches) */}
      {data.skills && (
        <div className="flex justify-center gap-6 flex-wrap max-w-3xl mx-auto">
          {data.skills.map((skill, index) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              onClick={() => onSkillClick(skill)}
              delay={0}
            />
          ))}
        </div>
      )}

      {/* Branched Skills */}
      {data.branches && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {data.branches.map((branch, branchIndex) => (
            <motion.div
              key={branch.category}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Branch Category */}
              <div className="text-center mb-6">
                <p className="font-display text-sm tracking-[0.2em] uppercase mb-3" style={{ color: branch.color }}>
                  {branch.category}
                </p>
                <div className="w-8 h-px mx-auto" style={{ backgroundColor: branch.color + '40' }} />
              </div>

              {/* Branch Skills */}
              <div className="flex flex-col gap-3">
                {branch.skills.map((skill, skillIndex) => (
                  <SkillNode
                    key={skill.id}
                    skill={skill}
                    onClick={() => onSkillClick(skill)}
                    delay={0}
                    compact
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Skill Node Component
const SkillNode = ({ skill, onClick, delay, compact = false }) => {
  const levelWidth = `${skill.level}%`;

  if (compact) {
    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        onClick={onClick}
        className="group relative text-left p-4 bg-transparent border border-gold/10 hover:border-gold/40 hover:bg-gold/5 transition-all duration-500"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-sm text-text-light dark:text-text-dark group-hover:text-gold transition-colors duration-500">
            {skill.name}
          </span>
          <span className="font-display text-xs text-text-light/40 dark:text-text-dark/40">
            {skill.level}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-px bg-gold/10 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: levelWidth }}
            transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-gold/60 to-gold/20"
          />
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className="group relative p-6 bg-transparent border border-gold/20 hover:border-gold/50 hover:bg-gold/5 transition-all duration-500"
    >
      <div className="text-center">
        <h4 className="font-display text-lg text-text-light dark:text-text-dark mb-3 group-hover:text-gold transition-colors duration-500">
          {skill.name}
        </h4>

        {/* Level Ring */}
        <div className="relative w-16 h-16 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gold/10"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gold"
              strokeDasharray={`${2 * Math.PI * 28}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - skill.level / 100) }}
              transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-xs text-text-light dark:text-text-dark">
              {skill.level}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

// Skill Detail Modal
const SkillDetailModal = ({ skill, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl pointer-events-auto"
        >
          <div className="bg-bg-light dark:bg-bg-dark border border-gold/30 p-12 relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gold/60 hover:text-gold transition-colors"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div>
              <h2 className="font-display text-4xl text-text-light dark:text-text-dark mb-4">
                {skill.name}
              </h2>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gold/10 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gold"
                  />
                </div>
                <span className="font-display text-2xl text-gold">
                  {skill.level}%
                </span>
              </div>

              {/* Projects */}
              {skill.projects && skill.projects.length > 0 && (
                <div>
                  <p className="font-display text-sm tracking-[0.2em] uppercase text-text-light/60 dark:text-text-dark/60 mb-4">
                    Projects
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {skill.projects.map((project, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 border border-gold/20 font-sans text-sm text-text-light dark:text-text-dark"
                      >
                        {project}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SkillsSection;
