/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        'surface-subtle': 'var(--bg-card)',
        card: 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
        border: 'var(--border-color)',

        // Lumixora Core Brand Tokens
        brand: {
          primary: 'var(--brand-primary)',
          'primary-hover': 'var(--brand-primary-hover)',
          'primary-soft': 'var(--brand-primary-soft)',
          cta: 'var(--brand-cta)',
          'cta-hover': 'var(--brand-cta-hover)',
          'cta-soft': 'var(--brand-cta-soft)',
          success: 'var(--brand-success)',
          warning: 'var(--brand-warning)',
          error: 'var(--brand-error)',
          aqua: 'var(--brand-aqua)',
        },

        // Requested Signature Palette:
        // 1. Soft Lavender
        lavender: {
          50: '#FAF8FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
          950: '#3B0764',
        },

        // 2. Pinkish Purple (Magenta / Fuchsia Orchid)
        pinkpurple: {
          50: '#FDF4FF',
          100: '#FAE8FF',
          200: '#F5D0FE',
          300: '#F0ABFC',
          400: '#E879F9',
          500: '#D946EF',
          600: '#C026D3',
          700: '#A21CAF',
          800: '#86198F',
          900: '#701A75',
          950: '#4A044E',
        },

        // 3. Sea Green (Aquamarine / Teal-Emerald)
        seagreen: {
          50: '#F0FDF9',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },

        // 4. Sky Blue (Cerulean / Azure)
        skyblue: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },

        // Lumixora Obsidian Dark Mode Neutrals
        navy: {
          950: '#06080F',
          900: '#090B14', // Lumixora main background
          850: '#0B0E19', // Lumixora sidebar background
          800: '#101421', // Lumixora surface
          750: '#161B2B', // Lumixora card background
          700: '#1D2335', // Lumixora card hover
          600: '#272D40', // Lumixora border color
          500: '#3A425B',
          400: '#64748B',
        },

        // Lumixora Brand Accents
        lumix: {
          primary: '#806BFF',
          'primary-hover': '#967AFF',
          'primary-soft': '#252044',
          cta: '#FF7133',
          'cta-hover': '#FF854D',
          'cta-soft': '#382117',
          aqua: '#00F5D4',
          emerald: '#34D399',
        },

        // Semantic status palettes
        teal: {
          950: '#042F2E',
          900: '#134E4A',
          800: '#115E59',
          700: '#0F766E',
          600: '#0D9488',
          500: '#14B8A6',
          400: '#2DD4BF',
          300: '#5EEAD4',
          200: '#99F6E4',
          100: '#CCFBF1',
          50: '#F0FDFA',
        },
        indigo: {
          900: '#312E81',
          800: '#3730A3',
          700: '#4338CA',
          600: '#4F46E5',
          500: '#6366F1',
          400: '#818CF8',
          100: '#E0E7FF',
          50: '#EEF2FF',
        },
        violet: {
          900: '#4C1D95',
          800: '#5B21B6',
          700: '#6D28D9',
          600: '#7C3AED',
          500: '#8B5CF6',
          400: '#A78BFA',
          100: '#EDE9FE',
          50: '#F5F3FF',
        },
        amber: {
          900: '#78350F',
          800: '#92400E',
          700: '#B45309',
          600: '#D97706',
          500: '#F59E0B',
          400: '#FBBF24',
          100: '#FEF3C7',
          50: '#FFFBEB',
        },
        rose: {
          900: '#881337',
          800: '#9F1239',
          700: '#BE123C',
          600: '#E11D48',
          500: '#F43F5E',
          400: '#FB7185',
          100: '#FFE4E6',
          50: '#FFF1F2',
        },
        emerald: {
          900: '#064E3B',
          800: '#065F46',
          700: '#047857',
          600: '#059669',
          500: '#10B981',
          400: '#34D399',
          100: '#D1FAE5',
          50: '#ECFDF5',
        },
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Sora', 'Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px rgba(15, 23, 42, 0.04)',
        'xs': '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'glow-lumix': '0 0 25px -4px rgba(128, 107, 255, 0.45)',
        'glow-aqua': '0 0 25px -4px rgba(0, 245, 212, 0.4)',
        'glow-cta': '0 0 25px -4px rgba(255, 113, 51, 0.4)',
        'glow-lavender': '0 0 18px -2px rgba(168, 85, 247, 0.35)',
        'glow-pinkpurple': '0 0 18px -2px rgba(217, 70, 239, 0.35)',
        'glow-seagreen': '0 0 18px -2px rgba(20, 184, 166, 0.35)',
        'glow-skyblue': '0 0 18px -2px rgba(14, 165, 233, 0.35)',
        'glow-teal': '0 0 15px -3px rgba(13, 148, 136, 0.3)',
        'glow-amber': '0 0 15px -3px rgba(245, 158, 11, 0.35)',
        'glow-indigo': '0 0 15px -3px rgba(99, 102, 241, 0.3)',
      },
    },
  },
  plugins: [],
}
