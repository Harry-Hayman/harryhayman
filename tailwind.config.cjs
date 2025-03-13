/** @type {import('tailwindcss').Config} */
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
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.zinc.900'),
            a: {
              color: theme('colors.purple.600'),
              '&:hover': {
                color: theme('colors.purple.500'),
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
              color: theme('colors.purple.400'),
              '&:hover': {
                color: theme('colors.purple.300'),
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
