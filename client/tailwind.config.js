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
    screens: {
      xs: '600px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
};
