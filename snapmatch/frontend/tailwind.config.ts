import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base:    '#070707',
        surface: '#0f0f0f',
        card:    '#161616',
        border:  '#242424',
        text:    '#f0ece6',
        muted:   '#888078',
        dim:     '#444040',
        gold:    '#F5A623',
        amber:   '#E8820C',
        orange:  '#FF4D00',
        cyan:    '#00D4C8',
        success: '#22D97E',
        danger:  '#FF3B3B',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
