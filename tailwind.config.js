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
          50:  '#e8eef5',
          100: '#c4d3e3',
          200: '#9cb5cf',
          300: '#7398bb',
          400: '#4f7ea7',
          500: '#1a3a63',
          600: '#163152',
          700: '#112641',
          800: '#0c1b30',
          900: '#06101e',
        }
      }
    },
  },
  plugins: [],
}
