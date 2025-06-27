import { defineConfig } from 'vite';

export default defineConfig({
  root: './src/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
