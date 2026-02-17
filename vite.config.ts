import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@features': path.resolve(__dirname, './src/features'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@layout': path.resolve(__dirname, './src/layout'),
            '@cardEditor': path.resolve(__dirname, './src/features/cardEditor'),
            '@css': path.resolve(__dirname, './src/css/index.ts'),
            '@routes': path.resolve(__dirname, './src/routes.ts'),
            '@interfaces': path.resolve(__dirname, './src/interfaces'),
            '@services': path.resolve(__dirname, './src/services'),
            '@db': path.resolve(__dirname, './src/db'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@assets': path.resolve(__dirname, './public/assets'),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },
});
