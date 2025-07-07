// import { defineConfig } from 'vite';

// export default defineConfig({
//   root: './src/',
//   server: {
//     host: '0.0.0.0',
//     port: 8080,
//     proxy: {
//       '/api': {
//         target: 'http://backend:3000',
//         changeOrigin: true,
//         secure: false
//       }
//     }
//   }
// });

import { defineConfig, loadEnv } from 'vite'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    root: './src/',
    server: {
      host: '0.0.0.0',
      port: 8080,
      https: {
        key: fs.readFileSync(path.resolve(__dirname, './cert/key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, './cert/cert.pem')),
      },
      proxy: {
        '/api': {
          target: `https://${env.LOCAL_IP}:3000`,
          changeOrigin: true,
          secure: false
        },
        '/ws': {
          target: `wss://${env.LOCAL_IP}:3000`,
          ws: true,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
