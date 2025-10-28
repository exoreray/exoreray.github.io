import { motion } from 'framer-motion';
import siteCopy from '../data/siteCopy.json';

const AwardsSection = () => {
  const awards = siteCopy.works.categories.find(cat => cat.id === 'design')?.items || [];
  const designAwards = awards.filter(award => award.type === 'design');
  const recognitionAwards = awards.filter(award => award.type === 'recognition');

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 md:px-8 py-32 bg-gradient-to-b from-bg-light via-bg-light to-gold/5 dark:from-bg-dark dark:via-bg-dark dark:to-gold/5">
      {/* Prestigious Header */}
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-32"
        >
          {/* Top ornament */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/60 to-gold" />
            <div className="w-2 h-2 rotate-45 border border-gold/60" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent via-gold/60 to-gold" />
          </div>

          {/* Main heading */}
          <h1 className="font-serif text-7xl md:text-8xl lg:text-9xl tracking-tight text-text-light dark:text-text-dark mb-8 relative">
            <span className="relative inline-block">
              Awards
              {/* Subtle glow effect */}
              <div className="absolute inset-0 blur-2xl opacity-20 bg-gold" />
            </span>
          </h1>

          <p className="font-display text-sm md:text-base tracking-[0.3em] text-text-light/60 dark:text-text-dark/60 uppercase mb-4">
            Recognition & Excellence
          </p>

          {/* Bottom ornament */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
        </motion.div>

        {/* Recognition Awards - Museum Gallery Style */}
        <div className="space-y-12 mb-32">
          {recognitionAwards.map((award, index) => (
            <motion.a
              key={index}
              href={award.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="group block relative"
            >
              {/* Main Award Card */}
              <div className="relative bg-gradient-to-br from-white/5 to-transparent dark:from-white/[0.02] dark:to-transparent border border-gold/20 hover:border-gold/40 transition-all duration-700 overflow-hidden backdrop-blur-md">

                {/* Gradient overlay background with award color */}
                <div
                  className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(circle at 80% 50%, ${award.color}, transparent 70%)`
                  }}
                />

                {/* Spotlight effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                  style={{
                    background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${award.color}15, transparent 40%)`
                  }}
                />

                <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 p-8 md:p-12 lg:p-16">

                  {/* Award Logo Area - Left Side */}
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
                      {/* Ornate frame */}
                      <div className="absolute inset-0 border-2 border-gold/30 group-hover:border-gold/50 transition-all duration-700">
                        {/* Corner decorations */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-gold" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-gold" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-gold" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-gold" />
                      </div>

                      {/* Award Logo */}
                      {award.image && (
                        <div className="absolute inset-0 p-4 flex items-center justify-center">
                          <img
                            src={award.image}
                            alt={award.title}
                            className="w-full h-full object-contain filter brightness-90 group-hover:brightness-110 contrast-110 group-hover:scale-105 transition-all duration-700"
                            style={{
                              filter: 'brightness(0.9) contrast(1.1)'
                            }}
                          />
                        </div>
                      )}

                      {/* Subtle glow overlay */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle, ${award.color}, transparent 70%)`
                        }}
                      />
                    </div>
                  </div>

                  {/* Award Details - Right Side */}
                  <div className="flex-1 text-center md:text-left space-y-4">
                    {/* Year badge */}
                    <div className="inline-block">
                      <div className="px-4 py-1.5 border border-gold/30 bg-gold/10">
                        <span className="font-display text-xs tracking-[0.3em] text-gold">
                          {award.year}
                        </span>
                      </div>
                    </div>

                    {/* Award title */}
                    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight text-text-light dark:text-text-dark group-hover:text-gold transition-colors duration-700">
                      {award.title}
                    </h2>

                    {/* Category - single line, minimal */}
                    <p className="font-sans text-base md:text-lg text-text-light/50 dark:text-text-dark/50 tracking-wide">
                      {award.category}
                    </p>

                    {/* View link */}
                    <div className="pt-4 flex items-center justify-center md:justify-start gap-3 text-gold/70 group-hover:text-gold group-hover:gap-5 transition-all duration-500">
                      <span className="font-display text-xs tracking-[0.25em]">VIEW CREDENTIAL</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent group-hover:via-gold/40 transition-all duration-700" />
              </div>

              {/* Floating decorative elements */}
              <div className="absolute -z-10 inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div
                  className="absolute top-1/2 left-0 w-32 h-32 blur-3xl rounded-full"
                  style={{ backgroundColor: `${award.color}20` }}
                />
                <div
                  className="absolute top-1/2 right-0 w-32 h-32 blur-3xl rounded-full"
                  style={{ backgroundColor: `${award.color}15` }}
                />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="mb-32"
        >
          <div className="flex items-center justify-center gap-6">
            <div className="w-24 h-px bg-gradient-to-r from-transparent to-gold/30" />
            <div className="flex gap-2">
              <div className="w-1 h-1 rounded-full bg-gold/40" />
              <div className="w-1 h-1 rounded-full bg-gold/60" />
              <div className="w-1 h-1 rounded-full bg-gold/40" />
            </div>
            <div className="w-24 h-px bg-gradient-to-l from-transparent to-gold/30" />
          </div>
        </motion.div>

        {/* Design Awards */}
        <div className="space-y-12">
          {designAwards.map((award, index) => (
            <motion.a
              key={index}
              href={award.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: (recognitionAwards.length * 0.15) + (index * 0.15),
                ease: [0.22, 1, 0.36, 1]
              }}
              className="group block relative"
            >
              {/* Main Award Card */}
              <div className="relative bg-gradient-to-br from-white/5 to-transparent dark:from-white/[0.02] dark:to-transparent border border-gold/20 hover:border-gold/40 transition-all duration-700 overflow-hidden backdrop-blur-md">

                {/* Gradient overlay background with award color */}
                <div
                  className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(circle at 80% 50%, ${award.color}, transparent 70%)`
                  }}
                />

                {/* Spotlight effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                  style={{
                    background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${award.color}15, transparent 40%)`
                  }}
                />

                <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 p-8 md:p-12 lg:p-16">

                  {/* Award Logo/Icon Area - Left Side */}
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
                      {/* Ornate frame */}
                      <div className="absolute inset-0 border-2 border-gold/30 group-hover:border-gold/50 transition-all duration-700">
                        {/* Corner decorations */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-gold" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-gold" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-gold" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-gold" />
                      </div>

                      {/* Award Logo or Icon */}
                      {award.image ? (
                        <>
                          <div className="absolute inset-0 p-4 flex items-center justify-center">
                            <img
                              src={award.image}
                              alt={award.title}
                              className="w-full h-full object-contain filter brightness-90 group-hover:brightness-110 contrast-110 group-hover:scale-105 transition-all duration-700"
                              style={{
                                filter: 'brightness(0.9) contrast(1.1)'
                              }}
                            />
                          </div>
                          {/* Subtle glow overlay */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                            style={{
                              background: `radial-gradient(circle, ${award.color}, transparent 70%)`
                            }}
                          />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            {/* Rotating ring */}
                            <div className="absolute inset-0 w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 border border-gold/20 rounded-full group-hover:rotate-180 transition-transform duration-[3s] ease-out" />

                            {/* Award badge */}
                            <div
                              className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center"
                              style={{
                                background: `radial-gradient(circle, ${award.color}40, ${award.color}10)`
                              }}
                            >
                              {/* Star icon for recognition */}
                              <svg
                                className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 group-hover:scale-110 transition-transform duration-700"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke={award.color}
                                strokeWidth="1"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Award Details - Right Side */}
                  <div className="flex-1 text-center md:text-left space-y-4">
                    {/* Year badge */}
                    <div className="inline-block">
                      <div className="px-4 py-1.5 border border-gold/30 bg-gold/10">
                        <span className="font-display text-xs tracking-[0.3em] text-gold">
                          {award.year}
                        </span>
                      </div>
                    </div>

                    {/* Award title */}
                    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight text-text-light dark:text-text-dark group-hover:text-gold transition-colors duration-700">
                      {award.title}
                    </h2>

                    {/* Category - single line, minimal */}
                    <p className="font-sans text-base md:text-lg text-text-light/50 dark:text-text-dark/50 tracking-wide">
                      {award.category}
                    </p>

                    {/* View link */}
                    <div className="pt-4 flex items-center justify-center md:justify-start gap-3 text-gold/70 group-hover:text-gold group-hover:gap-5 transition-all duration-500">
                      <span className="font-display text-xs tracking-[0.25em]">VIEW CREDENTIAL</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent group-hover:via-gold/40 transition-all duration-700" />
              </div>

              {/* Floating decorative elements */}
              <div className="absolute -z-10 inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div
                  className="absolute top-1/2 left-0 w-32 h-32 blur-3xl rounded-full"
                  style={{ backgroundColor: `${award.color}20` }}
                />
                <div
                  className="absolute top-1/2 right-0 w-32 h-32 blur-3xl rounded-full"
                  style={{ backgroundColor: `${award.color}15` }}
                />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Bottom Decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
          className="mt-32 text-center"
        >
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent to-gold/30" />
            <div className="flex gap-2">
              <div className="w-1 h-1 rounded-full bg-gold/40" />
              <div className="w-1 h-1 rounded-full bg-gold/60" />
              <div className="w-1 h-1 rounded-full bg-gold/40" />
            </div>
            <div className="w-24 h-px bg-gradient-to-l from-transparent to-gold/30" />
          </div>
          <p className="font-display text-xs tracking-[0.4em] text-text-light/40 dark:text-text-dark/40 uppercase">
            Excellence Recognized Worldwide
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AwardsSection;
