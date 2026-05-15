/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Brand Palette (exact spec) ──────────────────────────────────────────
      colors: {
        primary: {
          DEFAULT: '#7C3AED', // Vibrant Violet
          dark:    '#5B21B6', // Deep Purple
          light:   '#A78BFA', // Soft Purple
        },
        neon: {
          DEFAULT: '#39FF14',              // Cyber Neon Green
          glow:    'rgba(57, 255, 20, 0.4)',
        },
        surface: {
          background: '#0F172A', // Very Dark Slate
          card:       '#1E293B', // Dark Slate
          border:     '#334155', // Subtle dividers
          elevated:   '#263348', // Cards that need to pop slightly
        },
        text: {
          main:  '#F8FAFC', // Off-White
          muted: '#94A3B8', // Slate Gray
          dim:   '#64748B', // Even more muted
        },
      },

      // ── Typography ──────────────────────────────────────────────────────────
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],       // Bold headings — geometric, futuristic
        body:    ['"DM Sans"', 'sans-serif'],     // Body — clean, readable
        mono:    ['"JetBrains Mono"', 'monospace'],
      },

      // ── Spacing (8pt grid) ──────────────────────────────────────────────────
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },

      // ── Border Radius ───────────────────────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ── Box Shadow ──────────────────────────────────────────────────────────
      boxShadow: {
        'neon-sm':  '0 0 8px rgba(57, 255, 20, 0.35)',
        'neon':     '0 0 16px rgba(57, 255, 20, 0.45), 0 0 32px rgba(57, 255, 20, 0.15)',
        'neon-lg':  '0 0 24px rgba(57, 255, 20, 0.55), 0 0 48px rgba(57, 255, 20, 0.2)',
        'violet':   '0 0 16px rgba(124, 58, 237, 0.5), 0 0 32px rgba(124, 58, 237, 0.2)',
        'card':     '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },

      // ── Keyframes & Animations ──────────────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'coin-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(57, 255, 20, 0.3)' },
          '50%':      { boxShadow: '0 0 20px rgba(57, 255, 20, 0.7)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'nav-pip': {
          '0%':   { transform: 'scaleX(0)', opacity: '0' },
          '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-up':     'fade-up 0.4s ease-out forwards',
        'fade-in':     'fade-in 0.3s ease-out forwards',
        'coin-pulse':  'coin-pulse 2s ease-in-out infinite',
        'slide-up':    'slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'shimmer':     'shimmer 2s linear infinite',
        'nav-pip':     'nav-pip 0.2s ease-out forwards',
      },

      // ── Background patterns ─────────────────────────────────────────────────
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(124, 58, 237, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.06) 1px, transparent 1px)',
        'shimmer-gradient':
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        'card-gradient':
          'linear-gradient(135deg, #1E293B 0%, #263348 100%)',
        'neon-gradient':
          'linear-gradient(135deg, #39FF14 0%, #00E5FF 100%)',
        'violet-gradient':
          'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
      },
      backgroundSize: {
        'grid': '24px 24px',
      },

      // ── Transitions ─────────────────────────────────────────────────────────
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
