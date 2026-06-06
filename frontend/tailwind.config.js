/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#1a1a1a',
          accent: '#e85d26',
          light: '#fff7f3',
        },
        surface: {
          DEFAULT: '#ffffff',
          2: '#f9f8f5',
          3: '#f5f4f0',
        },
        easy: { DEFAULT: '#2d7a4f', bg: '#e8f5ee' },
        medium: { DEFAULT: '#b85c00', bg: '#fff3e0' },
        hard: { DEFAULT: '#b02020', bg: '#fdeaea' },
      },
      animation: {
        'spin-slow': 'spin 0.8s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        'realistic': '0 32px 48px rgba(0, 0, 0, 0.20)',
      },
    },
  },
  plugins: [],
};
