/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Static brand palette (used in Tailwind classes)
        primary: {
          DEFAULT: '#7C3AED',
          dark:    '#5B21B6',
          light:   '#A78BFA',
        },
        neon: {
          DEFAULT: '#39FF14',
          glow:    'rgba(57, 255, 20, 0.4)',
        },
        surface: {
          background: '#0F172A',
          card:       '#1E293B',
          elevated:   '#263348',
          border:     '#334155',
        },
        text: {
          main:  '#F8FAFC',
          muted: '#94A3B8',
          dim:   '#64748B',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-sm': '0 0 8px rgba(57, 255, 20, 0.35)',
        'neon':    '0 0 16px rgba(57, 255, 20, 0.45)',
        'violet':  '0 0 16px rgba(124, 58, 237, 0.5)',
        'card':    '0 4px 24px rgba(0,0,0,0.4)',
      },
      keyframes: {
        'nav-pip': {
          from: { transform: 'scaleX(0)', opacity: '0' },
          to:   { transform: 'scaleX(1)', opacity: '1' },
        },
      },
      animation: {
        'nav-pip': 'nav-pip 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};
