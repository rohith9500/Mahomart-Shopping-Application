/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0a192f',       // Deep Premium Blue (Dark Mode/Header)
          primary: '#172a45',    // Premium Deep Navy
          secondary: '#306090',  // Slate Blue
          light: '#f8fafc',      // Crisp White/Grey
          accent: '#ff5a5f',     // Vibrant Coral Action Buttons
          amber: '#f59e0b',      // Energetic Amber Reviews/Highlights
          success: '#10b981',    // Emerald Green
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
