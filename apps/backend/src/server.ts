import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import wsConnectionPlugin from './game/websocket/connections';
import authRoutes from './auth/routes';

const server = Fastify({ logger: true });

async function main() {
  await server.register(websocket);                 // 👈 Add WebSocket support
  await server.register(wsConnectionPlugin);        // 👈 Register WS logic
  await server.register(authRoutes);                // 👈 Register routes

  server.get('/api/ping', async () => {
    return { pong: true, time: new Date().toISOString() };
  });

  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('✅ Backend running on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
