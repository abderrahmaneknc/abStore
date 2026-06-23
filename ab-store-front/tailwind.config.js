export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#0a0a0a',
        card: '#f9f9f9',
        border: '#e5e5e5',
        gold: '#D48900',
        muted: '#6b7280',
      },
    },
  },

  plugins: [
    // eslint-disable-next-line no-undef
    require('tailwind-scrollbar-hide'),

  ],
};
