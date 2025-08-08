import { colors } from './src/constants/colors';
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    colors: colors,
    borderRadius: {
      primary: '10px',
      secondary: '20px',
      full: '9999px',
    },
  },
  plugins: [],
};
