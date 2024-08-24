/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,ejs,js,ts,jsx,tsx}', // Include EJS, HTML, JS, TS, JSX, and TSX files
  ],
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss'), require('autoprefixer')],
};
