// vite.config.js
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [ react() ],
    server: {
        port: 3000
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '~': resolve(__dirname, 'node_modules')
        }
    },
    build: {
        assetsInlineLimit: 102400,
        rollupOptions: {
            output: {
                assetFileNames: 'src/assets/[name].[ext]',
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'ui-vendor': ['@headlessui/react', '@headlessui/tailwindcss'],
                    'pixi-vendor': ['pixi.js'],
                    'form-vendor': ['react-hook-form']
                }
            }
        },
        outDir: 'dist',
        sourcemap: true,
        chunkSizeWarningLimit: 1000
    }
})
