import { defineConfig } from 'vite';

export default defineConfig({
    css: {
        postcss: './postcss.config.cjs', // Utilise le fichier PostCSS pour Tailwind
    },
});