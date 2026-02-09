/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#09090b",
                surface: "#18181b",
                primary: "#8b5cf6", // Violet 500
                secondary: "#ec4899", // Pink 500
                accent: "#06b6d4", // Cyan 500
                text: "#faFAFA",
                muted: "#71717a",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
