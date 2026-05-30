/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        glass: {
          base: '#070B14',
          surface: '#0D1117',
          card: 'rgba(255,255,255,0.04)',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.3s ease-out both',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-indigo': '0 0 30px rgba(99,102,241,0.25)',
        'glow-violet': '0 0 30px rgba(139,92,246,0.25)',
        'glow-sky':    '0 0 30px rgba(14,165,233,0.25)',
        'glow-emerald':'0 0 30px rgba(16,185,129,0.25)',
        'glow-amber':  '0 0 30px rgba(245,158,11,0.25)',
        'glow-rose':   '0 0 30px rgba(244,63,94,0.25)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}
