/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6', // Warm ivory
        surface: '#FFFFFF',
        'surface-subtle': '#F4F3EF',
        navy: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        teal: {
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          50: '#F0FDFA',
          100: '#CCFBF1',
        },
        danger: {
          600: '#DC2626',
          50: '#FEF2F2',
          100: '#FEE2E2',
        },
        warning: {
          600: '#D97706',
          50: '#FFFBEB',
          100: '#FEF3C7',
        },
        success: {
          600: '#059669',
          50: '#ECFDF5',
          100: '#D1FAE5',
        },
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
