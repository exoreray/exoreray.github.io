export const skillsData = {
  // Core trunk/foundation skills
  core: {
    name: 'Core Foundation',
    skills: [
      { id: 'cs', name: 'Computer Science', level: 95, color: '#FFD700' },
      { id: 'architecture', name: 'Architecture', level: 90, color: '#D4AF37' },
      { id: 'design-thinking', name: 'Design Thinking', level: 95, color: '#FF9500' },
    ]
  },

  // Technical branches
  technical: {
    name: 'Technical Skills',
    branches: [
      {
        category: 'Frontend',
        color: '#FFD700',
        skills: [
          { id: 'react', name: 'React', level: 95, projects: ['FlowGPT', 'Portfolio'] },
          { id: 'react-three', name: 'React Three Fiber', level: 90, projects: ['Portfolio'] },
          { id: 'typescript', name: 'TypeScript', level: 90, projects: ['FlowGPT'] },
          { id: 'tailwind', name: 'Tailwind CSS', level: 95, projects: ['Portfolio'] },
          { id: 'next', name: 'Next.js', level: 85, projects: ['FlowGPT'] },
        ]
      },
      {
        category: 'Mobile',
        color: '#FF9500',
        skills: [
          { id: 'ios', name: 'iOS Development', level: 85, projects: ['Apple'] },
          { id: 'swift', name: 'Swift', level: 85, projects: ['Apple'] },
          { id: 'uikit', name: 'UIKit', level: 80, projects: ['Apple'] },
        ]
      },
      {
        category: 'Backend',
        color: '#CD7F32',
        skills: [
          { id: 'node', name: 'Node.js', level: 85, projects: ['FlowGPT'] },
          { id: 'python', name: 'Python', level: 80, projects: ['Berkeley'] },
          { id: 'databases', name: 'Databases', level: 85, projects: ['FlowGPT'] },
        ]
      },
    ]
  },

  // Design branches
  design: {
    name: 'Design Skills',
    branches: [
      {
        category: 'UI/UX',
        color: '#E0A96D',
        skills: [
          { id: 'figma', name: 'Figma', level: 95, projects: ['FlowGPT'] },
          { id: 'ux-research', name: 'UX Research', level: 90, projects: ['FlowGPT'] },
          { id: 'interaction', name: 'Interaction Design', level: 95, projects: ['Portfolio'] },
          { id: 'visual', name: 'Visual Design', level: 90, projects: ['Portfolio'] },
        ]
      },
      {
        category: '3D Design',
        color: '#B87333',
        skills: [
          { id: 'blender', name: 'Blender', level: 70, projects: ['Portfolio'] },
          { id: 'three-js', name: 'Three.js', level: 85, projects: ['Portfolio'] },
        ]
      },
    ]
  },

  // Soft skills
  soft: {
    name: 'Soft Skills',
    branches: [
      {
        category: 'Leadership',
        color: '#F4A460',
        skills: [
          { id: 'team-lead', name: 'Team Leadership', level: 90, projects: ['FlowGPT', 'StartupHarbor'] },
          { id: 'mentorship', name: 'Mentorship', level: 85, projects: ['StartupHarbor'] },
          { id: 'product', name: 'Product Strategy', level: 90, projects: ['FlowGPT'] },
        ]
      },
      {
        category: 'Communication',
        color: '#DEB887',
        skills: [
          { id: 'writing', name: 'Technical Writing', level: 85, projects: ['Philosophy'] },
          { id: 'presentation', name: 'Presentation', level: 90, projects: ['Community'] },
          { id: 'collaboration', name: 'Collaboration', level: 95, projects: ['Apple', 'FlowGPT'] },
        ]
      },
    ]
  },
};
