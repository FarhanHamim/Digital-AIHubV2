/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'undp-blue': '#006EB0',
        'undp-light-grey': '#F7F7F7',
        'undp-dark-blue': '#003D6B',
      },
      fontFamily: {
        'sans': ['Open Sans', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
