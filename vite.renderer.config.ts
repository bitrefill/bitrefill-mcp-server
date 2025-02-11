import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: '.vite/renderer',
    assetsDir: '.',
    rollupOptions: {
      input: 'index.html',
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  clearScreen: false,
});
