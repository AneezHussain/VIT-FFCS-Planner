module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        // Primary brand color from the image
        primary: {
          50: '#edf7ff',
          100: '#d6eaff',
          200: '#b5d8ff',
          300: '#8ebeff',
          400: '#619eff',
          500: '#3E7BFA', // Primary blue color from the image
          600: '#2f62d9',
          700: '#254eb2',
          800: '#1e3c8a',
          900: '#1a336d',
        },
        // System colors from the image for different status indicators
        system: {
          red: '#FF4D4D',      // Red from the image
          green: '#4CD964',    // Green from the image
          blue: '#4D7FFF',     // Blue from the image
          orange: '#FF9500',   // Orange from the image
          yellow: '#FFCC00',   // Yellow from the image
          teal: '#5AC8FA',     // Teal from the image
          purple: '#BF5AF2',   // Purple from the image
        },
        // Text and background colors (grayscale) from the image
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        expandDown: {
          '0%': { maxHeight: '0', opacity: '0' },
          '100%': { maxHeight: '300px', opacity: '1' }
        },
        collapseUp: {
          '0%': { maxHeight: '300px', opacity: '1' },
          '100%': { maxHeight: '0', opacity: '0' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        expandDown: 'expandDown 0.3s ease-in-out',
        collapseUp: 'collapseUp 0.3s ease-in-out'
      }
    },
  },
  plugins: [],
} 