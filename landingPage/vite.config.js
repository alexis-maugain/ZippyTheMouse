import { defineConfig } from 'vite';

export default defineConfig({
    base: '/ZippyTheMouse/',
    css: {
        postcss: './postcss.config.cjs', // Utilise le fichier PostCSS pour Tailwind
    },
});