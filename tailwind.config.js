/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        surface: {
          DEFAULT: '#ffffff',
          soft: '#f8fafc',
          card: 'rgba(255, 255, 255, 0.95)',
          border: '#e2e8f0',
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'floating': '0 12px 40px -10px rgba(15, 23, 42, 0.12)',
      }
    },
  },
  plugins: [],
}
