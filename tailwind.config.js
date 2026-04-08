/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#f0ece0',
        'parchment-2': '#e6e0d0',
        'parchment-3': '#d0c8b4',
        ink: '#181614',
        stamp: '#c8291a',
        grove: '#1a5c30',
        gold: '#c49a2a',
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        tag: ['Share Tech Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
