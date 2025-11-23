/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.jsx",
        "./resources/**/*.ts",
        "./resources/**/*.tsx",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                // Add your custom Navy/Yellow here
                navy: {
                    DEFAULT: "#001F3F",
                },
                yellow: {
                    DEFAULT: "#FFD700",
                }
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};