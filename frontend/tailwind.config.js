
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#5c6b50', // Example brand color
                secondary: '#e5e7eb',
            },
        },
    },
    plugins: [],
}
