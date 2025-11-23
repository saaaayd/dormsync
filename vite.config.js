import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // <--- Import this

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css', 
                'resources/js/index.tsx'
            ],
            refresh: true,
        }),
        react(),
        tailwindcss(), // <--- Add this to the plugins array
    ],
});