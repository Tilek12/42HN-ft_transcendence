import Fastify from 'fastify';
import fs from 'fs';
import websocket from '@fastify/websocket';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import path from 'path';
import multipart from '@fastify/multipart'
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';

import { connectToDB } from './database/client';
import authPlugin from './plugins/auth';
import authRoutes from './routes/api/auth-routes';
import userRoutes from './routes/api/user-routes';
import profileRoutes from './routes/api/profile-routes';
import matchRoutes from './routes/api/match-routes';
import tournamentRoutes from './routes/api/tournament-routes';
import wsGamePlugin from './routes/ws/game';
import wsPresencePlugin from './routes/ws/presence';
import wsTournamentPlugin from './routes/ws/tournament';
import {Errorhandler} from './error';

import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifySwagger from '@fastify/swagger'

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
	logger: {
		transport: {
			target: 'pino-pretty'
		}},
	https: {
		key: fs.readFileSync('/run/secrets/ssl_key'),
		cert: fs.readFileSync('/run/secrets/ssl_cert')
	}
});

// App setup
async function main() {

	await connectToDB();								// ✅ Init DB tables
	await server.register(jwt, { secret: JWT_SECRET });	// ✅ Create JWT
	await server.register(websocket);					// ✅ Add WebSocket support
	await server.register(multipart);

	//upload pics path register
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	// console.log(`here is the __dirname : ${__dirname}`);
	server.register(fastifyStatic,
	{
		root: path.join(__dirname, 'assets/profile_pics'),
		prefix: '/profile_pics/',
	}
	);
	  await server.register(fastifySwagger, {
    hideUntagged: true,
    openapi: {
      info: {
        title: 'Fastify demo API',
        description: 'lol',
        swagger: '9.5.2'
      }
    }
  });
    await server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
	  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
}});
	// Public routes
	await server.register(authRoutes, { prefix: '/api' });			// 👈 Public routes (login/register)
	// await server.register(profileRoutes, { prefix: '/api' });		// !!! REPLACE TO PRIVATE !!!
	await server.register(tournamentRoutes, { prefix: '/api' });	// !!! REPLACE TO PRIVATE !!!

	// Protected scope of routes
	await server.register(async (protectedScope : any) => {
		await protectedScope.register(authPlugin);			// 👈 Middleware checking token
		await protectedScope.register(userRoutes);			// 👈 Protected routes: /api/private/me
		await protectedScope.register(profileRoutes);		// 👈 Protected routes: /api/private/profile
		// await protectedScope.register(tournamentRoutes);	// 👈 Protected routes: /api/private/tournaments
		await protectedScope.register(matchRoutes);			// 👈 Protected routes: /api/private/match
	}, { prefix: '/api/private' });

	// WebSocket scope of routes
	await server.register(async (websocketScope : any) => {
		await websocketScope.register(wsGamePlugin);		// 🕹️ Game-only socket:  /ws/game
		await websocketScope.register(wsPresencePlugin);	// 🔁 Persistent socket: /ws/presence
		await websocketScope.register(wsTournamentPlugin);	// 🏆 Tournament socket: /ws/tournament
	}, { prefix: '/ws' });

	// Simple health check
	server.get('/ping', async () => {
		return { pong: true, time: new Date().toISOString() };
	});
	
	server.ready().then(() => {
	server.swagger();
	});

	server.setErrorHandler(Errorhandler);
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
