import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'tensorflow': ['@tensorflow/tfjs', '@tensorflow/tfjs-backend-webgl', '@tensorflow-models/pose-detection'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer': ['framer-motion'],
        },
      },
    },
  },
});
