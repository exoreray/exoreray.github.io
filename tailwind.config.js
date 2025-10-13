/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base colors - warmer, more elegant
        navy: {
          deep: '#0F0F23',
          DEFAULT: '#0F0F23',
        },
        charcoal: {
          warm: '#1C1C2E',
          DEFAULT: '#1C1C2E',
        },
        white: {
          soft: '#FAFAFA',
          warm: '#FFF8F0',
          DEFAULT: '#FAFAFA',
        },
        cream: '#F5EBE0',
        silver: '#D4AF37', // More gold-silver

        // Accent colors - sophisticated palette
        champagne: '#F7E7CE',
        gold: {
          light: '#FFD700',
          DEFAULT: '#D4AF37',
          dark: '#B8860B',
        },
        rose: {
          light: '#FFE4E9',
          DEFAULT: '#FFB6C1',
          dark: '#FF69B4',
        },
        violet: {
          light: '#E6E6FA',
          DEFAULT: '#9B88DA',
          dark: '#6A5ACD',
        },
        teal: {
          light: '#B2F5EA',
          DEFAULT: '#38B2AC',
          dark: '#2C7A7B',
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
