/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./script.js"
  ],
  // Adicione esta seção "safelist"
  safelist: [
    'max-h-40',
    'opacity-100',
    'p-0',
    'px-4',
    'py-3',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}