/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // include other folders if you have pages, src, etc.
  ],
  // Use class-based dark mode so toggling "dark" on <html> (next-themes default)
  // will activate dark: utilities.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map Tailwind token to a CSS variable (defined in globals.css)
        primary: {
          DEFAULT: 'var(--color-primary)',
        },
        foreground: {
          DEFAULT: 'var(--color-foreground)',
        },
        'primary-opacity': {
          DEFAULT: 'var(--color-primary-opacity)',
        },
      },
    },
  },
  plugins: [],
};
