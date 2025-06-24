import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true, // 👈 expose to host (0.0.0.0)
    port: 5173, // keep consistent with Docker
    strictPort: true // fail if port is taken (useful for debugging)
  }
})
