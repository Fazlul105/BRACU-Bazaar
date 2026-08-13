/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bracu: {
          blue: '#003366',
          navy: '#0b192c',
          lightBlue: '#0055a5',
          gold: '#f1c40f',
          accent: '#10b981',
          darkBg: '#0f172a',
          cardBg: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
