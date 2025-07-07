import Fastify from 'fastify';
import fs from 'fs';
import websocket from '@fastify/websocket';
import wsConnectionPlugin from './game/websocket/connections';
import authRoutes from './auth/routes';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_IP = process.env.LOCAL_IP || '127.0.0.1';

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
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`✅ Server running on https://${LOCAL_IP}:3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
