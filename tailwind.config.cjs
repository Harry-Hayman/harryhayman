/** @type {import('tailwindcss').Config} */

/*
 * Brand system: light blue.
 * The ramp below is the single source of truth for brand colour in Tailwind
 * utilities. The same values are mirrored as CSS custom properties in
 * src/styles/global.css (--brand-50 ... --brand-950) for plain CSS.
 * Contrast is verified for WCAG AA in both themes:
 *   brand-600 on white          5.16:1
 *   white on brand-600          5.16:1
 *   brand-300 on dark surfaces  9.3:1+
 */
const brand = {
  50: '#F0F7FF',
  100: '#DDEEFF',
  200: '#B9DCFF',
  300: '#8AC6FB',
  400: '#56A9F2',
  500: '#2E8BE0',
  600: '#1B6FBF',
  700: '#155796',
  800: '#144875',
  900: '#143C5E',
  950: '#0C2438',
};

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '380px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand,
        // Semantic aliases driven by the CSS custom properties.
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--surface-raised) / <alpha-value>)',
        'surface-read': 'rgb(var(--surface-read) / <alpha-value>)',
        'surface-sunken': 'rgb(var(--surface-sunken) / <alpha-value>)',
        ink: 'rgb(var(--text-primary) / <alpha-value>)',
        'ink-soft': 'rgb(var(--text-secondary) / <alpha-value>)',
        'ink-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        hairline: 'rgb(var(--nav-border) / <alpha-value>)',
        'hairline-strong': 'rgb(var(--rule-strong) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      /*
       * One radius scale and one elevation scale for the whole site. Both are
       * driven by the custom properties in global.css so plain CSS and
       * Tailwind utilities can never drift apart.
       */
      borderRadius: {
        chip: 'var(--r-xs)',
        field: 'var(--r-sm)',
        btn: 'var(--r-md)',
        card: 'var(--r-lg)',
        panel: 'var(--r-xl)',
        pill: 'var(--r-pill)',
      },
      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
        3: 'var(--shadow-3)',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
      },
      maxWidth: {
        measure: '68ch',
        'measure-wide': '74ch',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.zinc.900'),
            maxWidth: '68ch',
            a: {
              color: brand[600],
              textUnderlineOffset: '0.2em',
              '&:hover': {
                color: brand[700],
              },
            },
            'h1,h2,h3,h4': {
              fontFamily: 'Playfair Display',
              color: theme('colors.zinc.900'),
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.zinc.300'),
            a: {
              color: brand[300],
              '&:hover': {
                color: brand[200],
              },
            },
            'h1,h2,h3,h4': {
              color: theme('colors.zinc.100'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
