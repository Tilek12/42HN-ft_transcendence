import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import * as WebSocket from 'ws'
import { userManager } from '../../service-managers/user-manager';
import { tournamentManager } from '../../service-managers/tournament-manager';
import { findUserById, getUsernameById } from '../../database/user';
import { PING_INTERVAL_MS } from '../../constants';
import { WebsocketSchema } from '../../auth/schemas'
import { JWTPayload } from '../../types';


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

const wsPresencePlugin: FastifyPluginAsync = async (fastify: any) => {
	// WebSocket route
	fastify.get('/presence', {schema:WebsocketSchema, websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		
		// buffer incoming messages while we verify token
		const messageBuffer: any[] = [];
		let authenticated = false;
		let closed = false;

		// Sync attach to prevent dropped messages
		const onMessage = (raw: any) => {
			// store raw bytes / strings until auth finished
			if (!authenticated) {
				messageBuffer.push(raw);
				return;
			}
			// If already authenticated, we only expect pongs (but presence socket only needs pongs)
			try {
				const msg = raw.toString();
				if (msg === 'pong') userManager.setAlive((req as any).__authenticatedUserId, true);
			} catch {}
		};

		// attach handlers synchronously
		socket.on('message', onMessage);
		socket.on('close', () => { closed = true; });
		socket.on('error', (err) => {
			fastify.log.warn({ err },'[Presence WS] socket error');
		});
		const payload = req.user as JWTPayload;

		// Begin async verification AFTER handlers attached
		(async (userId:number, socket: WebSocket) => {
	
			// Reject duplicate presence connections
			if (userManager.getUser(userId)) {
				fastify.log.warn(`[Presence WS] Duplicate connection rejected for: ${userId}`);
				try { if (!closed) socket.close(4003, 'Already connected'); } catch {}
				return;
			}

			// Ensure user exists in DB
			const user = await findUserById(userId);
			if (!user) {
				try { if (!closed) socket.close(4004, 'User not found'); } catch {}
				return;
			}
			const userName = await getUsernameById(userId);
			if (!userName) {
				try { if (!closed) socket.close(4004, 'Username not found'); } catch {}
				return;
			}

			// Register presenceSocket in userManager (this will close any old socket if present)
			userManager.createUser(user, socket);
			(req as any).__authenticatedUserId = userId; // small tag to allow message handler to access id
			authenticated = true;

			fastify.log.info(`🟢 [Presence WS] Connected: ${userId}`);

			// send initial presence and tournament info
			sendTournamentUpdate();
			sendPresenceUpdate();

			// process any buffered messages (likely none; keep simple)
			while (messageBuffer.length) {
				const raw = messageBuffer.shift();
				try {
					const msg = raw.toString();
					if (msg === 'pong') userManager.setAlive(userId, true);
				} catch {}
			}

			// update handlers to use userId (already our onMessage uses req.__authenticatedUserId)
			// final close handler will remove user
			socket.on('close', () => {
				userManager.removeUser(userId);
				fastify.log.info(`🔴 [Presence WS] Disconnected: ${userId}`);
				sendPresenceUpdate();
			});
		})(payload.id, socket);
	});

	// single heartbeat/ping system (pings presence, game and tournament sockets through userManager)
	setInterval(() => {
		try {
			userManager.checkHeartbeats(); // implementation updated to ping all socket-types
		} catch (err) {
			fastify.log.warn({ err },'[Presence WS] heartbeat check error');
		}
	}, PING_INTERVAL_MS);
};

export default fp(wsPresencePlugin);
