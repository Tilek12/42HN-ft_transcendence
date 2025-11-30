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
import { logout_all_users } from './database/user'
import protected_validate_hook from './scopes/protected_scope';
import authRoutes from './routes/auth/auth-routes';
import tfa_Routes from './routes/auth/2fa-routes';
import userRoutes from './routes/api/user-routes';
import profileRoutes from './routes/api/profile-routes';
import matchRoutes from './routes/api/match-routes';
import tournamentRoutes from './routes/api/tournament-routes'

import wsGamePlugin from './routes/ws/game-ws';
import wsPresencePlugin from './routes/ws/presence-ws';
import wsTournamentPlugin from './routes/ws/tournament-ws';
import { Errorhandler } from './error';
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifySwagger from '@fastify/swagger'
import cookie from '@fastify/cookie'
// import csrf from '@fastify/csrf-protection'



dotenv.config();

// Environment
const LOCAL_IP = process.env.LOCAL_IP || '127.0.0.1';
let PORT = Number(process.env.BACKEND_PORT || '443');
const JWT_SECRET = fs.readFileSync('/run/secrets/jwt_secret');
const COOKIE_SECRET = fs.readFileSync('/run/secrets/cookie_secret');
const ADMIN_PASSWORD = fs.readFileSync('/run/secrets/admin_password');
const APP_MODE = process.env.NODE_ENV;

if (!JWT_SECRET || !APP_MODE) {
	console.error('❌ Missing JWT_SECRET in .env');
	process.exit(1);
}
if (APP_MODE == 'production') {
	PORT = 8080;
}
console.log(`===========>>> Server setup in APP_MODE:${APP_MODE} <<<===========`);

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
				};
			},
			res(reply) {
				return {
					statusCode: reply.statusCode,
				};
			}
		},
		level:'info', 
	},
	https: {
		key: fs.readFileSync('/run/secrets/ssl_key'),
		cert: fs.readFileSync('/run/secrets/ssl_cert')
	}
});

// for testing response payload 
// server.addHook('onSend', async (request, reply, payload) => {
//   server.log.info({
//     resBody: payload
//   }, 'Response payload');
//   return payload; 
// });

server.addHook('preValidation', async (request, reply) => {
  server.log.info({
    reqBody: request.body
  }, 'Response payload');
  return request;   
});

const jwtOpts: FastifyJWTOptions = {
	secret: JWT_SECRET,
	cookie: {
		cookieName: 'ACCESS',
		signed: true
	}
}

// App setup
async function main() {

	//plugins
	server.withTypeProvider<JsonSchemaToTsProvider>();			// Support to make Types out of schemas
	await connectToDB();										// Init DB table
	await server.register(cookie, { secret: COOKIE_SECRET });	//cookies
	// await server.register(csrf, { cookieOpts: { signed: true }})//crsf Protection						
	await server.register(fastifyJwt, jwtOpts);					// Create JWT
	await server.register(websocket, { options: { maxPayload: 1048576, backlog: 10 } });							// Add WebSocket support
	await server.register(multipart);							// file supposrt for fastify
	server.register(helmet);									// adds http headers for security


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

	// Static serving of files in produciton mode
	if (APP_MODE == "production") {
		server.log.info("Setting up fastify static");
		server.register(fastifyStatic, {
			root: '/app/dist/frontend',
			serve: true,
			cacheControl: false,
		});
	}

	// Public routes
	await server.register(authRoutes, { prefix: '/api' });			// Public routes (login/register)

	// 2FA Routes
	await server.register(async (tfa_Scope: any) => {
		await tfa_Scope.register(tfa_Routes);						// 2fa routes: /2fa/...
	}, { prefix: '/2fa' });


	// Protected routes
	await server.register(async (protectedScope: any) => {
		await protectedScope.register(protected_validate_hook);		// Middleware checking token
		await protectedScope.register(userRoutes);					// Protected routes: /api/private/me
		await protectedScope.register(profileRoutes);				// Protected routes: /api/private/profile
		await protectedScope.register(tournamentRoutes);			// Protected routes: /api/private/tournaments
		await protectedScope.register(matchRoutes);				// Protected routes: /api/private/match
	}, { prefix: '/api/private' });

	// WebSocket routes
	await server.register(async (websocketScope: any) => {
		await websocketScope.register(protected_validate_hook);
		await websocketScope.register(wsGamePlugin);				// Game-only socket:  /ws/game
		await websocketScope.register(wsPresencePlugin);			// Persistent socket: /ws/presence
		await websocketScope.register(wsTournamentPlugin);			// Tournament socket: /ws/tournament
	}, { prefix: '/ws' });

	// // Simple health check
	// server.get('/ping', async () => {
	// 	server.log.warn("Ping route triggered");
	// 	return { pong: true, time: new Date().toISOString() };
	// });

	if (APP_MODE == 'development')
		server.ready().then(() => {
			server.swagger();
		});



	server.setErrorHandler(Errorhandler);
	// Start listening
	try {
		await server.listen({ port: PORT, host: '0.0.0.0' });
		console.log(`✅ [PID ${process.pid}] Server running on:`);
		console.log(`     Local: https://localhost:${PORT}`);
		console.log(`   Network: https://${LOCAL_IP}:${PORT}`);
	} catch (err) {
		server.log.error(err, '❌ Failed to start server');
		process.exit(1);
	}

	let isShuttingDown = false;
	// Graceful shutdown
	const shutdown = async () => {
		if (isShuttingDown) return; // guard the shutdown as concurrently sends two sigints to process when running in dev mode
		isShuttingDown = true;
		console.log(`\n🛑 [PID ${process.pid}] Gracefully shutting down...`);
		// await logout_all_users();
		// console.log("❎ All Users logged out.");
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
