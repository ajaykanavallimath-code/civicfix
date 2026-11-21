/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          'blue-light': '#EFF6FF',
          'blue-dark': '#1E40AF',
          navy: '#172B4D',
          'navy-light': '#243B61',
          'navy-dark': '#0C1A30',
          bg: '#FFFFFF',
          'bg-subtle': '#F5F8FC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
          gold: '#F59E0B',
          'gold-light': '#FEF3C7',
          'gold-dark': '#D97706'
        },
        severity: {
          low: '#16A34A',      // Green
          medium: '#EAB308',   // Yellow
          high: '#EA580C',     // Orange
          critical: '#DC2626', // Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(23, 43, 77, 0.05), 0 1px 2px -1px rgba(23, 43, 77, 0.05)',
        'elevated': '0 4px 6px -1px rgba(23, 43, 77, 0.08), 0 2px 4px -2px rgba(23, 43, 77, 0.06)',
        'floating': '0 10px 25px -5px rgba(23, 43, 77, 0.12), 0 8px 10px -6px rgba(23, 43, 77, 0.08)',
      }
    },
  },
  plugins: [],
}
