/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1E7A40', foreground: '#ffffff' },
        destructive: { DEFAULT: '#CC2929' },
      },
    },
  },
  plugins: [],
};
