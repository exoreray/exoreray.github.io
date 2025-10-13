import { motion } from 'framer-motion';

const ProjectsSection = () => {
  const projects = [
    {
      name: 'Luxiphos',
      description: 'My technology company building transformative products including StartUp Harbor, Fireworks, Livia AI, and CoinFlip—pioneering solutions at the intersection of innovation and human experience.',
      link: 'https://www.luxiphos.com/',
      tag: 'COMPANY',
      color: 'gold'
    },
    {
      name: 'FlowGPT',
      description: 'AI accessible, delightful, and empowering for everyone. Grew from 0 to 6M+ users as Founding Designer & Engineer.',
      link: 'https://flowgpt.com/',
      tag: 'PRODUCT',
      color: 'violet'
    },
    {
      name: 'F1 Autonomous Racing',
      description: 'Berkeley EECS 106B: Building an autonomous racing car from scratch with computer vision and path planning.',
      link: 'https://eecs106b-banana-radiation.github.io/',
      tag: 'ROBOTICS',
      color: 'amber'
    }
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-8 py-32 bg-gradient-to-b from-bg-light to-bg-light-secondary dark:from-bg-dark dark:to-bg-dark-secondary">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mb-8" />
          <h2 className="font-serif text-5xl md:text-7xl text-text-light dark:text-text-dark mb-6">
            Projects
          </h2>
          <p className="font-display text-xl text-bronze dark:text-champagne">
            Building at the intersection of design, engineering, and impact
          </p>
        </motion.div>

        {/* Projects List */}
        <div className="space-y-1">
          {projects.map((project, index) => (
            <motion.a
              key={project.name}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group block border-t border-gold/10 last:border-b hover:bg-gradient-to-r hover:from-gold/5 hover:to-transparent transition-all duration-700"
            >
              <div className="py-12 px-8 flex flex-col md:flex-row md:items-center gap-8">
                {/* Left: Number and Title */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-baseline gap-6">
                    <span className="font-serif text-6xl md:text-7xl text-gold/20 group-hover:text-gold/40 transition-colors duration-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-display text-3xl md:text-4xl text-text-light dark:text-text-dark group-hover:translate-x-2 transition-transform duration-700">
                        {project.name}
                      </h3>
                      <div className={`inline-block px-4 py-1 border border-${project.color}/30 rounded-sm`}>
                        <p className={`font-mono text-xs text-${project.color} tracking-wider`}>
                          {project.tag}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Description and Arrow */}
                <div className="flex-1 flex items-center gap-6">
                  <p className="font-sans text-base text-text-light/70 dark:text-text-dark/70 leading-relaxed group-hover:text-text-light/90 dark:group-hover:text-text-dark/90 transition-colors duration-700">
                    {project.description}
                  </p>
                  <svg
                    className="w-6 h-6 text-gold opacity-40 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-700 flex-shrink-0"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>

              {/* Accent line that grows on hover */}
              <div className="h-px w-0 bg-gradient-to-r from-gold/50 to-transparent group-hover:w-full transition-all duration-700 ml-8" />
            </motion.a>
          ))}
        </div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-24"
        />
      </div>
    </div>
  );
};

export default ProjectsSection;
