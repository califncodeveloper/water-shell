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
          navy: '#1B1F5E',
          'navy-dark': '#101321',
          'navy-surface': '#191D30',
          'navy-light': '#2D3487',
          'navy-muted': '#EEF0F9',
          green: '#2E8B57',
          'green-light': '#3BAA6B',
          'green-muted': '#E8F5EE',
          orange: '#F5A623',
          'orange-light': '#FBBF57',
          'orange-muted': '#FEF5E7',
          gray: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(27, 31, 94, 0.08), 0 2px 6px -1px rgba(27, 31, 94, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(27, 31, 94, 0.16), 0 4px 10px -2px rgba(27, 31, 94, 0.08)',
        'glow-orange': '0 0 25px -3px rgba(245, 166, 35, 0.35)',
        'glow-navy': '0 0 30px -5px rgba(27, 31, 94, 0.4)',
        'glow-green': '0 0 25px -3px rgba(46, 139, 87, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}

