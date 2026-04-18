/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif']
      },
      colors: {
        accent: 'var(--accent-color)'
      },
      borderRadius: {
        'glass': '1.5rem'
      }
    }
  },
  plugins: []
}
