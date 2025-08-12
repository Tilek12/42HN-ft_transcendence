import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { WebSocket } from 'ws';

import { userManager } from '../user/user-manager';
import { getSafeTournamentData } from '../game/tournament-manager';
import { findUserById, getUsernameById } from '../database/user';
import { PING_INTERVAL_MS } from '../constants';

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
		tournaments: getSafeTournamentData(),
	});
	for (const u of users) {
		const socket = userManager.getUser(u.id)?.presenceSocket;
		if (socket && socket.readyState === socket.OPEN) {
			try { socket.send(msg); } catch (err) { console.warn('Tournament send error', err); }
		}
	}
};

const presencePlugin: FastifyPluginAsync = async (fastify) => {
	// WebSocket route
	fastify.get('/presence', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		// read token from query (support frameworks that put query on req.query)
		const qsToken = (req.query && (req.query as any).token) ??
			new URLSearchParams((req as any).url?.split('?')[1] || '').get('token');

		if (!qsToken) {
			try { socket.close(4001, 'Missing token'); } catch {}
			return;
		}

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
			fastify.log.warn('[Presence WS] socket error', err);
		});

		// Begin async verification AFTER handlers attached
		(async () => {
			let userId: string;
			try {
				const payload: any = await fastify.jwt.verify(qsToken);
				userId = payload.id;
			} catch (err) {
				try { if (!closed) socket.close(4002, 'Invalid token'); } catch {}
				return;
			}

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
			userManager.createUser(userId, userName, socket);
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
		})();
	});

	// single heartbeat/ping system (pings presence, game and tournament sockets through userManager)
	setInterval(() => {
		try {
			userManager.checkHeartbeats(); // implementation updated to ping all socket-types
		} catch (err) {
			fastify.log.warn('[Presence WS] heartbeat check error', err);
		}
	}, PING_INTERVAL_MS);
};

export default fp(presencePlugin);
