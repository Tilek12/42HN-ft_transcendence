import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';
function customNetworkLogger() {
    return {
        name: 'custom-network-logger',
        configureServer(server) {
            const originalPrintUrls = server.printUrls;
            server.printUrls = () => {
                const localUrl = server.resolvedUrls?.local[0];
                const networkUrl = `https://${process.env.LOCAL_IP}:${server.config.server.port}/`;
                console.log('\n  ➜  Local:   ', localUrl);
                console.log('  ➜  Network: ', networkUrl, '\n');
            };
        }
    };
}
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const frontendPort = parseInt(env.FRONTEND_PORT || '8080');
    const backendPort = parseInt(env.BACKEND_PORT || '3000');
    const ip = env.LOCAL_IP || '127.0.0.1';
    return {
        root: '/app/src/frontend',
        plugins: [customNetworkLogger()],
        server: {
            host: "0.0.0.0",
            port: frontendPort,
            strictPort: true,
            open: false,
            base: "/app/distbuilding",
            https: {
                key: fs.readFileSync('/run/secrets/ssl_key'),
                cert: fs.readFileSync('/run/secrets/ssl_cert'),
            },
            proxy: {
                '/api': {
                    target: `https://localhost:3000`,
                    changeOrigin: true,
                    secure: false
                },
                '/ws': {
                    target: `wss://localhost:3000`,
                    ws: true,
                    changeOrigin: true,
                    secure: false
                },
                '/2fa': {
                    target: 'https://localhost:3000',
                    changeOrigin: true,
                    secure: false,
                }
            }
        }
    };
});
