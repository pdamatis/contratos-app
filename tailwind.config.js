/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canaa: {
          bg:      '#0D0B0B',
          surface: '#161212',
          card:    '#1C1717',
          border:  '#2A2222',
          wine:    '#7b1c1c',
          wine2:   '#9B2323',
          muted:   '#7A6B6B',
          light:   '#A89898',
        },
      },
    },
  },
  plugins: [],
}
