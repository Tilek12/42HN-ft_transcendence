import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import wsConnectionPlugin from './game/websocket/connections';

const server = Fastify({ logger: true });

async function main() {
  await server.register(websocket);                 // 👈 Add WebSocket support
  await server.register(wsConnectionPlugin);        // 👈 Register WS logic

  server.get('/api/ping', async () => {
    return { pong: true, time: new Date().toISOString() };
  });

  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('✅ Backend running on http://localhost:3001');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
