import { defineConfig } from 'vite';

export default defineConfig({
  root: './src/',
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
