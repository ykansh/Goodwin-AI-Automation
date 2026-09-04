/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00a631',
          light: '#33b85a',
          dark: '#008527',
        },
        secondary: {
          DEFAULT: '#3a3b39',
          light: '#5e5f5c',
          dark: '#1b1c1a',
        },
        tertiary: {
          DEFAULT: '#cde06c',
          light: '#d9ec77',
          dark: '#bdd05e',
        },
        canvas: {
          DEFAULT: '#f5f4f0',
          surface: '#ffffff',
          variant: '#e3e2df',
        },
        danger: '#d93829',
        warning: '#e59b12',
        info: '#2b6cb0',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        display: ['Coolvetica', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'level-1': '0 1px 3px rgba(58, 59, 57, 0.1)',
        'level-2': '0 4px 16px -2px rgba(58, 59, 57, 0.08)',
        'level-3': '0 16px 36px -4px rgba(58, 59, 57, 0.16)',
      },
    },
  },
  plugins: [],
}
