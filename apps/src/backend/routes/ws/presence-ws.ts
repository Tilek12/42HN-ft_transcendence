import { FastifyPluginAsync, FastifyRequest, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import WebSocket from 'ws'
import { userManager } from '../../service-managers/user-manager';
import { tournamentManager } from '../../service-managers/tournament-manager';
import { findUserById, getUsernameById } from '../../database/user';
import { PING_INTERVAL_MS } from '../../constants';
import { WebsocketSchema } from '../../auth/schemas'
import { JWTPayload } from '../../types';
import { verifyUserJWT } from '../../auth/utils';
import { Jwt_type, User } from '../../types';

export const sendPresenceUpdate = () => {
	const users = userManager.getOnlineUsers();
	const msg = JSON.stringify({
		type: 'presenceUpdate',
		count: users.length,
		users,
	});
	for (const u of users) {
		const socket = userManager.getUser(u.id)?.presenceSocket;
		if (socket && socket.readyState === socket.OPEN) {
			try { socket.send(msg); } catch (err) { console.warn('Presence send error', err); }
		}
	}
};

export const sendTournamentUpdate = () => {
	const users = userManager.getOnlineUsers();
	const msg = JSON.stringify({
		type: 'tournamentUpdate',
		tournaments: tournamentManager.getSafeTournamentData(),
	});
	for (const u of users) {
		const socket = userManager.getUser(u.id)?.presenceSocket;
		if (socket && socket.readyState === socket.OPEN) {
			try { socket.send(msg); } catch (err) { console.warn('Tournament send error', err); }
		}
	}
};



const wsPresencePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	// WebSocket route
	fastify.get('/presence', { schema: WebsocketSchema, websocket: true }, (socket, req) => {
		let authenticated = false;
		let user: User | null;
		let decoded: JWTPayload;
		// Sync attach to prevent dropped messages
		socket.on('message', async (raw: any) => {
			// console.log("presence ws message handler");
			try {
				if (!authenticated) {
					decoded = fastify.jwt.verify(raw) as JWTPayload;

					if (userManager.getUser(decoded.id))
						throw new Error(` Duplicate connection rejected for: ${decoded.id}`);
					user = await findUserById(decoded.id);
					if (user) {
						// console.log(`presence ws authenticated user ${user.id}`);
						userManager.createUser(user, socket);
						userManager.setAlive(user.id);
						authenticated = true;
						fastify.log.info(`🟢 [Presence WS] Connected: ${user.username}`);
						sendTournamentUpdate();
						sendPresenceUpdate();
					}
					else 
						throw new Error(`Couldnt find ${decoded.username} in db`);
				}
				else {
					// If already authenticated, we only expect pongs
					const msg = raw.toString();
					if (msg === 'pong' && user)
					{
							 userManager.setAlive(user.id);
					}
				}
			}
			catch (err) {
				fastify.log.warn(`🔴 [Presence WS] Error: ${err}`);
				socket.close(4001, 'Unauthorized')
					return;
			}
			
		});

		socket.on('close', () => {
			// console.log("presence ws close handler");
			if (user)
			{
				userManager.removeUser(user.id);
				fastify.log.info(`🔴 [Presence WS] Disconnected: ${user.id}`);
				sendPresenceUpdate();
			}
			else
				fastify.log.warn("[Presence WS] no user to remove");

		});
		socket.on('error', (err) => {
			fastify.log.warn({ err }, '[Presence WS] socket error');
		});
	});

	// single heartbeat/ping system (pings presence, game and tournament sockets through userManager)
	setInterval(() => {
		console.log("presence ws interval");
		try {
			userManager.checkHeartbeats(); // implementation updated to ping all socket-types
		} catch (err) {
			fastify.log.warn({ err }, '[Presence WS] heartbeat check error');
		}
	}, PING_INTERVAL_MS);
};

export default fp(wsPresencePlugin);
