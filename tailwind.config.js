/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#e8f2ec',
          100: '#c3dece',
          200: '#9bcaaf',
          300: '#6eb58e',
          400: '#4aa474',
          500: '#1a5c3a',
          600: '#155030',
          700: '#0f3d26',
          800: '#092a1b',
          900: '#041710',
        }
      }
    },
  },
  plugins: [],
}
