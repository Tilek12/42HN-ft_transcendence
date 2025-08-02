import Fastify from 'fastify';
import fs from 'fs';
import websocket from '@fastify/websocket';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';

import { connectToDB } from './database/client';
import authRoutes from './auth/routes';
import userRoutes from './user/routes';
import authPlugin from './plugins/auth';
import onlineUsersRoute from './user/online-users';
import tournamentsDataRoute from './game/tournament/routes';
import wsPresencePlugin from './websocket/presence';
import wsGamePlugin from './websocket/game';
import wsTournamentPlugin from './websocket/tournament';

dotenv.config();

// Environment
const LOCAL_IP = process.env.LOCAL_IP || '127.0.0.1';
const PORT = parseInt(process.env.BACKEND_PORT || '3000');
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET in .env');
  process.exit(1);
}

// Create server instance
const server = Fastify({
  logger: true,
  https: {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
  }
});

// App setup
async function main() {
  await connectToDB();                                    // ✅ Init DB tables
  await server.register(jwt, { secret: JWT_SECRET });     // ✅ Create JWT
  await server.register(websocket);                       // ✅ Add WebSocket support

  // Public auth routes                                   // 👈 Public routes: /api/login
  await server.register(authRoutes, { prefix: '/api' });  // 👈 Public routes: /api/register

  // Protected scope of routes
  await server.register(async (protectedScope) => {
    await protectedScope.register(authPlugin);            // 👈 Middleware checking token
    await protectedScope.register(userRoutes);            // 👈 Protected routes: /api/private/me
    await protectedScope.register(onlineUsersRoute);      // 👈 Protected routes: /api/private/online-users
    await protectedScope.register(tournamentsDataRoute);  // 👈 Protected routes: /api/private/tournaments
  }, { prefix: '/api/private' });

  // WebSocket scope of routes
  await server.register(async (websocketScope) => {
    await websocketScope.register(wsGamePlugin);          // 🕹️ Game-only socket:  /ws/game
    await websocketScope.register(wsPresencePlugin);      // 🔁 Persistent socket: /ws/presence
    await websocketScope.register(wsTournamentPlugin);    // 🏆 Tournament socket: /ws/tournament
  }, { prefix: '/ws' });

  // Simple health check
  server.get('/ping', async () => {
    return { pong: true, time: new Date().toISOString() };
  });

  // Start listening
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log('✅ Server running on:');
    console.log(`     Local: https://localhost:${PORT}`);
    console.log(`   Network: https://${LOCAL_IP}:${PORT}`);
  } catch (err) {
    server.log.error(err, '❌ Failed to start server');
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Gracefully shutting down...');
    try {
      await server.close();
      console.log('❎ Server closed');
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
