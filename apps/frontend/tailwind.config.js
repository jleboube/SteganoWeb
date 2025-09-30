/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8A2BE2',
        accent: '#00F5A0',
        dark: '#0A0A1A'
      },
      fontFamily: {
        display: ['"Saira Condensed"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      },
      backgroundImage: {
        'grid-neon': 'radial-gradient(circle at center, rgba(0,245,160,0.15), transparent 60%)'
      }
    }
  },
  plugins: []
};
