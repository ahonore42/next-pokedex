import type { Config } from 'tailwindcss';
import tailwindcssPlugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/utils/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class'], // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Main app backgrounds
        background: 'var(--color-background)',
        secondary: 'var(--color-background-secondary)',
        tertiary: 'var(--color-background-tertiary)',

        // Surface colors for cards and elevated content
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          hover: 'var(--color-surface-hover)',
          indigo: 'var(--color-surface-indigo)',
          'indigo-hover': 'var(--color-surface-indigo-hover)',
        },

        // Text hierarchy
        primary: 'var(--color-text-primary)',
        muted: 'var(--color-text-secondary)',
        subtle: 'var(--color-text-tertiary)',
        disabled: 'var(--color-text-quaternary)',
        inverse: 'var(--color-text-inverse)',

        // Text using primary colors
        'primary-color': 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',

        // Brand colors
        brand: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          light: 'var(--color-primary-light)',
          lighter: 'var(--color-primary-lighter)',
          subtle: 'var(--color-primary-subtle)',
          text: 'var(--color-primary-text)',
        },

        // Border colors
        border: {
          DEFAULT: 'var(--color-border)',
          hover: 'var(--color-border-hover)',
          strong: 'var(--color-border-strong)',
        },

        // Status colors
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          bg: 'var(--color-error-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          bg: 'var(--color-info-bg)',
        },

        // Interactive states
        interactive: {
          hover: 'var(--color-interactive-hover)',
          active: 'var(--color-interactive-active)',
          disabled: 'var(--color-interactive-disabled)',
          'disabled-text': 'var(--color-interactive-disabled-text)',
        },

        // Pokemon-specific colors
        pokemon: {
          DEFAULT: 'var(--color-pokemon-card-bg)',
          hover: 'var(--color-pokemon-card-hover-bg)',
          border: 'var(--color-pokemon-card-border)',
          'border-hover': 'var(--color-pokemon-card-hover-border)',
          text: 'var(--color-pokemon-card-text)',
          'text-muted': 'var(--color-pokemon-card-text-secondary)',
        },

        // Update-specific colors
        update: {
          DEFAULT: 'var(--color-update-card-bg)',
          hover: 'var(--color-update-card-hover-bg)',
        },
      },

      textColor: {
        DEFAULT: 'var(--color-text-primary)',
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)', // Keep original naming
        tertiary: 'var(--color-text-tertiary)', // Keep original naming
        quaternary: 'var(--color-text-quaternary)', // Keep original naming
        muted: 'var(--color-text-secondary)',
        subtle: 'var(--color-text-tertiary)',
        disabled: 'var(--color-text-quaternary)',
        inverse: 'var(--color-text-inverse)',
        'primary-color': 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
      },

      backgroundColor: {
        DEFAULT: 'var(--color-background)',
        'background-secondary': 'var(--color-background-secondary)', // Keep original naming
        secondary: 'var(--color-background-secondary)',
        tertiary: 'var(--color-background-tertiary)',
      },

      borderColor: {
        DEFAULT: 'var(--color-border)',
        default: 'var(--color-border)', // Keep original naming
        hover: 'var(--color-border-hover)',
        strong: 'var(--color-border-strong)',
      },

      // Custom shadow system
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },

      // Font family integration
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },

      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s infinite',
        spin: 'spin 1s linear infinite',
      },

      // Custom keyframes
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },

      transitionProperty: {
        theme: 'color, background-color, border-color, opacity', // Only animate these properties
      },
      transitionDuration: {
        theme: '300ms', // Standard duration for theme changes
      },
      transitionTimingFunction: {
        theme: 'ease-out', // Smoother finish
      },

      // Custom spacing if needed
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [
    // Add base styles as a plugin
    tailwindcssPlugin((api) => {
      api.addBase({
        // Reset margins and padding
        'body, ul, ol, li': {
          margin: '0',
          padding: '0',
        },
        // HTML base styles
        html: {
          'scroll-behavior': 'smooth',
          height: '100%',
        },
        body: {
          margin: '0',
          'background-color': 'var(--color-background)',
          color: 'var(--color-text-primary)',
          'font-family':
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
          'line-height': '1.6',
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          'overflow-x': 'hidden',
          'min-height': '100%',
        },
      });

      // Add the theme transition styles as components
      api.addComponents({
        '.theme-transition': {
          '@apply transition-theme duration-theme ease-theme': '',
          'will-change': 'color, background-color, border-color',
        },

        '.interactive-transition': {
          '@apply transition-all duration-300 ease-out': '',
          'will-change': 'transform, translate, scale, box-shadow, opacity',
        },

        '.contain-layout': {
          contain: 'layout',
          'will-change': 'transform',
          transform: 'translateZ(0)',
        },

        '@media (prefers-reduced-motion: reduce)': {
          '.theme-transition, .interactive-transition': {
            '@apply transition-none': '',
          },
        },
      });

      // Add reduced motion support
      api.addBase({
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            'animation-duration': '0.01ms !important',
            'animation-iteration-count': '1 !important',
            'transition-duration': '0.01ms !important',
            'scroll-behavior': 'auto !important',
          },
        },
      });
    }),
  ],
};

export default config;
