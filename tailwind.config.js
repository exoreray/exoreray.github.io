/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme backgrounds
        'bg-light': '#FDFBF7',
        'bg-light-secondary': '#F5F1EB',

        // Dark theme backgrounds
        'bg-dark': '#1A1410',
        'bg-dark-secondary': '#2A1F1A',

        // Text colors
        'text-light': '#2A2520',
        'text-dark': '#FAFAFA',

        // Legacy colors for compatibility
        navy: {
          deep: '#1A1410',
          DEFAULT: '#1A1410',
        },
        charcoal: {
          warm: '#2A1F1A',
          DEFAULT: '#2A1F1A',
        },
        white: {
          soft: '#FAFAFA',
          warm: '#FFF8F0',
          DEFAULT: '#FAFAFA',
        },
        cream: '#F5EBE0',
        silver: '#D4AF37',

        // Accent colors - warm metallic palette
        champagne: '#F7E7CE',
        gold: {
          light: '#FFD700',
          DEFAULT: '#D4AF37',
          dark: '#B8860B',
        },
        amber: {
          light: '#FFC166',
          DEFAULT: '#FF9500',
          dark: '#CC7700',
        },
        bronze: {
          light: '#E0A96D',
          DEFAULT: '#CD7F32',
          dark: '#8B5A2B',
        },
        copper: {
          light: '#F4A460',
          DEFAULT: '#B87333',
          dark: '#8B4513',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        display: ['Raleway', 'Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'ripple': 'ripple 1s ease-out forwards',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { opacity: '0.5', filter: 'blur(10px)' },
          '100%': { opacity: '1', filter: 'blur(20px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}
