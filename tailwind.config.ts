import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(110vh)', opacity: '0' },
          '6%': { opacity: '0.9' },
          '90%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-30vh)', opacity: '0' },
        },
        sway: {
          '0%, 100%': { transform: 'translateX(0px) rotate(-4deg)' },
          '33%': { transform: 'translateX(18px) rotate(6deg)' },
          '66%': { transform: 'translateX(-14px) rotate(-3deg)' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'float-up': 'floatUp var(--duration) ease-in-out var(--delay) infinite both',
        sway: 'sway var(--sway-duration) ease-in-out infinite',
        'fade-slide-up': 'fadeSlideUp 0.7s ease-out both',
        'fade-slide-up-delay': 'fadeSlideUp 0.7s 0.25s ease-out both',
        'fade-slide-up-delay-2': 'fadeSlideUp 0.7s 0.5s ease-out both',
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
