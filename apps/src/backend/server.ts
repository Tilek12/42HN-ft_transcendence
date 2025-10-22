import Fastify from 'fastify';
import fs from 'fs';
import websocket from '@fastify/websocket';
import fastifyJwt, { FastifyJWTOptions } from '@fastify/jwt'
import fastifyStatic from '@fastify/static';
import multipart from '@fastify/multipart'
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import helmet from '@fastify/helmet'
import dotenv from 'dotenv';

import { connectToDB, db } from './database/client';
import authPlugin  from './plugins/private_hook';
import tfa_validate_hook from './plugins/2fa_hook'
import authRoutes from './routes/auth/auth-routes';
import tfa_Routes from './routes/auth/2fa-routes';
import userRoutes from './routes/api/user-routes';
import profileRoutes from './routes/api/profile-routes';
import matchRoutes from './routes/api/match-routes';
import tournamentRoutes from './routes/api/tournament-routes';
import wsGamePlugin from './routes/ws/game-ws';
import wsPresencePlugin from './routes/ws/presence-ws';
import wsTournamentPlugin from './routes/ws/tournament-ws';
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
		},
		serializers: {
			req(request) {
				return {
					method: request.method,
					url: request.url,
					body: request.body,
					// headers: request.headers,
				};
			},
			res(reply) {
				return {
					statusCode: reply.statusCode,
					// message: reply,
				};
			}
		}
	},
	https: {
		key: fs.readFileSync('/run/secrets/ssl_key'),
		cert: fs.readFileSync('/run/secrets/ssl_cert')
	}
});

const jwtOpts: FastifyJWTOptions = {
	secret: JWT_SECRET
}

// App setup
async function main() {
	server.withTypeProvider<JsonSchemaToTsProvider>();	// Support to make Types out of schemas
	await connectToDB();								// Init DB table
	await server.register(fastifyJwt, jwtOpts);			// Create JWT
	await server.register(websocket);					// Add WebSocket support
	await server.register(multipart);					// file supposrt for fastify
	server.register(helmet);							// adds http headers for security

	await server.register(fastifySwagger, {
		openapi: {
			openapi: '3.0.0',
			info: {
				title: 'Transcendence',
				description: 'Testing Transcendence API',
				version: '0.1.0'
			},
			servers: [
				{
					url: 'https://localhost:3000',
					description: 'Development server'
				}
			],
		}
	});
	await server.register(fastifySwaggerUi, {
		routePrefix: '/docs',
		uiConfig: {
			docExpansion: 'full',
			deepLinking: false
		}
	});


	// Public routes
	await server.register(authRoutes, { prefix: '/api' });			// Public routes (login/register)
	// await server.register(profileRoutes, { prefix: '/api' });	// !!! REPLACE TO PRIVATE !!!
	// await server.register(tournamentRoutes, { prefix: '/api' });	// !!! REPLACE TO PRIVATE !!!
	await server.register(async (tfa_Scope: any) => {
		await server.register(tfa_validate_hook);					// 2fa validation
		await server.register(tfa_Routes, { prefix: '/2fa' });		// 2fa routes: /2fa/...
	})
	// Protected scope of routes
	await server.register(async (protectedScope: any) => {
		await protectedScope.register(authPlugin);			// Middleware checking token
		await protectedScope.register(userRoutes);			// Protected routes: /api/private/me
		await protectedScope.register(profileRoutes);		// Protected routes: /api/private/profile
		// await protectedScope.register(tournamentRoutes);	// Protected routes: /api/private/tournaments
		await protectedScope.register(matchRoutes);			// Protected routes: /api/private/match
	}, { prefix: '/api/private' });

	// WebSocket scope of routes
	await server.register(async (websocketScope: any) => {
		await websocketScope.register(wsGamePlugin);		// Game-only socket:  /ws/game
		await websocketScope.register(wsPresencePlugin);	// Persistent socket: /ws/presence
		await websocketScope.register(wsTournamentPlugin);	// Tournament socket: /ws/tournament
	}, { prefix: '/ws' });

	// Simple health check
	server.get('/ping', async () => {
		return { pong: true, time: new Date().toISOString() };
	});

	server.ready().then(() => {
		server.swagger();
	});


	// server.setErrorHandler(Errorhandler);
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
			logout_all_users();
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
