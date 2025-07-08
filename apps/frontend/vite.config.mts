import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

function customNetworkLogger(): Plugin {
  return {
    name: 'custom-network-logger',
    configureServer(server) {
      const originalPrintUrls = server.printUrls
      server.printUrls = () => {
        const localUrl = server.resolvedUrls?.local[0]
        const networkUrl = `https://${process.env.LOCAL_IP}:${server.config.server.port}/`

        console.log('\n  ➜  Local:   ', localUrl)
        console.log('  ➜  Network: ', networkUrl, '\n')
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['LOCAL_IP', 'FRONTEND_PORT'])
  const port = parseInt(env.FRONTEND_PORT || '8080')

  return {
    root: './src/',
    plugins: [customNetworkLogger()],
    server: {
      host: true,
      port: port,
      strictPort: true,
      open: false,
      https: {
        key: fs.readFileSync(path.resolve(__dirname, './cert/key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, './cert/cert.pem')),
      },
      proxy: {
        '/api': {
          target: `https://${env.LOCAL_IP}:${env.BACKEND_PORT}`,
          changeOrigin: true,
          secure: false
        },
        '/ws': {
          target: `wss://${env.LOCAL_IP}:${env.BACKEND_PORT}`,
          ws: true,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
