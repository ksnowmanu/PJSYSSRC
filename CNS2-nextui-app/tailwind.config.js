import {nextui} from '@nextui-org/theme'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        bounceY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        bounceY: 'bounceY 4s infinite',
      },
      scale: {
        '55': '0.55',
        '60': '0.6',
        '65': '0.65',
        '70': '0.7',
        '80': '0.8',
        '85': '0.85',
        '90': '0.9',
        '95': '0.95',
        // 必要に応じてさらに細かい値を追加
      }
    },
  },
  darkMode: "class",
  plugins: [nextui()],
}
