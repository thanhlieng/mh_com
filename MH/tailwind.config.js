/* eslint-disable @typescript-eslint/no-var-requires */
const { fontFamily } = require('tailwindcss/defaultTheme');

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  important: true,
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      zIndex: {
        100: '100',
      },
      fontFamily: {
        primary: ['Inter', ...fontFamily.sans],
      },
      backgroundImage: {
        'bg-footer': "url('/images/footer-bg.jpg')", // Custom background
      },
      colors: {
        'yellow-primary': '#efbd2b',
        'pussy-color': 'rgba(178, 173, 173, 0.13)',
        'background-footer': '#000000',
        'color-footer': '#fff',
        'yellow-secondary': '#1464a9',

        dark: '#222222',
      },
      boxShadow: {
        'card-item': '0px 6px 30px rgba(0, 0, 0, 0.1)',
        toogle: '0px 0px 20px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: 0.99,
            filter:
              'drop-shadow(0 0 1px rgba(252, 211, 77)) drop-shadow(0 0 15px rgba(245, 158, 11)) drop-shadow(0 0 1px rgba(252, 211, 77))',
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: 0.4,
            filter: 'none',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-700px 0',
          },
          '100%': {
            backgroundPosition: '700px 0',
          },
        },
      },
      animation: {
        flicker: 'flicker 3s linear infinite',
        shimmer: 'shimmer 1.3s linear infinite',
      },
    },
    screens: {
      //mobile
      xs: { min: '0px', max: '639px' },
      // tablet
      sm: { min: '640px', max: '1024px' },
      // PC
      md: { min: '1025px' },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
