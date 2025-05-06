/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2463eb',
        secondary: '#1c4ed8',
        accent: '#ED8936',    // Portocaliu
        background: '#F7FAFC',  // Fundal deschis
        foreground: '#1A202C',   // Text închis
      },
    },
  },
  plugins: [],
}