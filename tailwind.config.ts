import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ===== Mhmd Market Luxury Palette =====
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        emerald2: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        vodafone: {
          DEFAULT: '#e60000',
          light: '#ff3333',
          dark: '#b30000',
        },
        royal: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          dark: '#5b21b6',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 16px)',
      },
      fontFamily: {
        sans: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-tajawal)', 'var(--font-cairo)', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-luxury': 'linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #f59e0b 100%)',
        'gradient-gold': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        'gradient-royal': 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
        'gradient-vodafone': 'linear-gradient(135deg, #e60000 0%, #ff3333 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-mesh': 'radial-gradient(at 0% 0%, hsl(var(--brand-500)/0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsl(var(--gold-400)/0.12) 0px, transparent 50%), radial-gradient(at 50% 100%, hsl(var(--royal)/0.1) 0px, transparent 50%)',
        'gradient-aurora': 'linear-gradient(120deg, #f97316, #fbbf24, #10b981, #7c3aed, #f97316)',
        'gradient-dark': 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)',
      },
      boxShadow: {
        'glow-orange': '0 0 40px -10px rgba(249,115,22,0.5)',
        'glow-gold': '0 0 40px -10px rgba(251,191,36,0.5)',
        'glow-vodafone': '0 0 40px -10px rgba(230,0,0,0.5)',
        'glow-emerald': '0 0 40px -10px rgba(16,185,129,0.5)',
        'glow-royal': '0 0 40px -10px rgba(124,58,237,0.5)',
        'luxury': '0 20px 60px -15px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05) inset',
        'glass': '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.1), inset 0 -1px 0 0 rgba(0,0,0,0.1)',
        'neon': '0 0 5px rgba(249,115,22,0.8), 0 0 20px rgba(249,115,22,0.6), 0 0 40px rgba(249,115,22,0.4)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'aurora': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px -10px rgba(249,115,22,0.5)' },
          '50%': { boxShadow: '0 0 40px -5px rgba(249,115,22,0.8)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'glow-border': {
          '0%, 100%': { borderColor: 'rgba(249,115,22,0.3)' },
          '50%': { borderColor: 'rgba(251,191,36,0.8)' },
        },
        'marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'tilt': {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-scale': 'fade-in-scale 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'aurora': 'aurora 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'gradient-x': 'gradient-x 4s ease infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'glow-border': 'glow-border 3s ease-in-out infinite',
        'marquee': 'marquee 20s linear infinite',
        'count-up': 'count-up 0.6s ease-out',
        'ripple': 'ripple 1s ease-out',
        'tilt': 'tilt 4s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
};
export default config;
