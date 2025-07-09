import Fastify from 'fastify';
import fs from 'fs';
import websocket from '@fastify/websocket';
import wsConnectionPlugin from './game/websocket/connections';
import authRoutes from './auth/routes';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_IP = process.env.LOCAL_IP || '127.0.0.1';
const PORT = parseInt(process.env.BACKEND_PORT || 3000);

const server = Fastify({
  logger: true,
  https: {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
  }
});

async function main() {
  await server.register(websocket);                 // 👈 Add WebSocket support
  await server.register(wsConnectionPlugin);        // 👈 Register WS logic
  await server.register(authRoutes);                // 👈 Register routes

  server.get('/api/ping', async () => {
    return { pong: true, time: new Date().toISOString() };
  });

  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log('✅ Server running on:');
    console.log(`     Local: https://localhost:${PORT}`);
    console.log(`   Network: https://${LOCAL_IP}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  const shutdown = async () => {
    try {
      await server.close();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
