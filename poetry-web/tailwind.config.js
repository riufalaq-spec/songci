/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-red': '#C93726',
        'accent-red-light': '#F5E6E3',
        'bg-paper': '#F9F6F0',
        'border-subtle': '#E8E2D8',
        'surface-card': '#FFFFFF',
        'text-primary': '#2C3539',
        'text-secondary': '#6B7280',
        'text-inverse': '#FFFFFF',
      },
      fontFamily: {
        heading: ['"Playfair Display"', '"Noto Serif SC"', 'serif'],
        body: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        caption: ['"Geist"', '"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
