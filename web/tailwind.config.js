/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                catamaran: ['Catamaran', 'sans-serif'],
                opensans: ['Open Sans', 'sans-serif'],
                sans: ['Catamaran', 'sans-serif'], // torna Catamaran a padrão
            },
        },
    },
    plugins: [],
};
