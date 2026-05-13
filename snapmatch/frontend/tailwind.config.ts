import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base:        '#08090d',
        surface:     '#0e1018',
        card:        '#13161f',
        'card-hi':   '#181c28',
        border:      '#1f2436',
        'border-hi': '#2e3450',
        primary:     '#7c6fff',
        'primary-d': '#5a4fd6',
        'primary-l': '#a99fff',
        amber:       '#f8a84b',
        success:     '#22d97e',
        danger:      '#ff4d6d',
        muted:       '#4a5270',
        dim:         '#282d40',
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up':    'fadeUp 0.45s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
        shimmer:      'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
    },
  },
  plugins: [],
}
export default config
