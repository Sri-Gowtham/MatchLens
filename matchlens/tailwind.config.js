/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B2A4A',
          light: '#243659',
          dark: '#131e35',
        },
        accent: {
          DEFAULT: '#E8A33D',
          light: '#f0b85a',
          dark: '#d4902a',
        },
        success: {
          DEFAULT: '#1F9D6B',
          light: '#27b87c',
          dark: '#187a54',
        },
        warning: {
          DEFAULT: '#E8A33D',
          light: '#f0b85a',
          dark: '#d4902a',
        },
        danger: {
          DEFAULT: '#C65D4A',
          light: '#d4705d',
          dark: '#b04a38',
        },
        background: '#FAF8F3',
        'text-primary': '#1F2430',
        'text-secondary': '#4a5568',
        surface: '#FFFFFF',
        'surface-alt': '#F3F0E8',
        border: '#E2DDD4',
      },
      fontFamily: {
        serif: ['"Lora"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(27, 42, 74, 0.08)',
        'card-hover': '0 6px 24px rgba(27, 42, 74, 0.14)',
        'nav': '0 1px 8px rgba(27, 42, 74, 0.1)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
