/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // Ajoutez vos chemins ici
  theme: {
    extend: {
      colors: {
        black: "#100C0D",
        green: "#0EAD69",
        yellow: "#FDC334",
        purple: "#BE3795",
        red: "#EE4266",

      },
      boxShadow: {
        'custom': '15px 11px 0px 1px #EE4266',
      },
      fontFamily: {
        sans: ['"ABeeZee"', 'sans-serif'],
        vcr: ['VCR OSD Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}