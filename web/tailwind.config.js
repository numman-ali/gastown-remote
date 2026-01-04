/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gas': {
          50: '#fef9ec',
          100: '#fcf0c9',
          200: '#f9de8e',
          300: '#f5c53d',
          400: '#f2b215',
          500: '#e39808',
          600: '#c97304',
          700: '#a75107',
          800: '#893f0e',
          900: '#71340f',
        },
      },
    },
  },
  plugins: [],
}
