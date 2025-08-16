import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { WebSocket } from 'ws';

import { startGame, cancelDuelSearch } from '../../game/matchmaking';
import { Player } from '../../game/types';
import { userManager } from '../../service-managers/user-manager';
import { PING_INTERVAL_MS } from '../../constants';

const wsGamePlugin: FastifyPluginAsync = async (fastify) => {
	fastify.get('/game', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		// parse query quickly
		const { token } = (req.query as any) ?? {};
		const mode = (req.query as any)?.mode ??
					new URLSearchParams((req as any).url?.split('?')[1] || '').get('mode') ?? 'solo';
		const tournamentId = (req.query as any)?.id ?? undefined;

		if (!token) {
			try { socket.close(4001, 'Missing token'); } catch {}
			return;
		}

		// buffer and attach synchronous handler to avoid dropped messages
		const buffer: any[] = [];
		let authenticated = false;
		let closed = false;
		let authUserId: string | null = null;

		const onMessage = (raw: any) => {
			if (!authenticated) {
				buffer.push(raw);
				return;
			}
			try {
				const msg = raw.toString();
				if (msg === 'pong') {
					userManager.setInGame(authUserId!, true);
				} else if (msg === 'quit') {
					cancelDuelSearch(authUserId!);
					try { socket.close(); } catch {}
				} else {
					// other messages are handled by GameRoom since player.socket is same socket
				}
			} catch {}
		};

		socket.on('message', onMessage);
		socket.on('close', () => { closed = true; });
		socket.on('error', (err) => fastify.log.warn('[Game WS] socket error', err));

		(async () => {
			let userId: string;
			try {
				const payload: any = await fastify.jwt.verify(token);
				userId = payload.id;
			} catch (err) {
				try { if (!closed) socket.close(4002, 'Invalid or expired token'); } catch {}
				return;
			}

			// presence must exist
			const presenceUser = userManager.getUser(userId);
			if (!presenceUser) {
				try { if (!closed) socket.close(4003, 'Presence connection not found'); } catch {}
				return;
			}

			// set the game socket (this will close previous if exists)
			userManager.setGameSocket(userId, socket);
			userManager.setInGame(userId, true);
			authUserId = userId;
			authenticated = true;

			fastify.log.info(`🏓 [Game WS] Connected: ${userId} (${mode})`);

			// create Player with this socket and start matchmaking / game
			const player: Player = { id: userId, name: presenceUser.name, socket };
			try {
				await startGame(player, mode as any, tournamentId);
			} catch (err) {
				fastify.log.warn('[Game WS] startGame error', err);
			}

			// process buffered messages (likely none)
			while (buffer.length) {
				const raw = buffer.shift();
				try {
					const msg = raw.toString();
					if (msg === 'pong') userManager.setInGame(userId, true);
					if (msg === 'quit') {
						cancelDuelSearch(userId);
						try { socket.close(); } catch {}
					}
				} catch {}
			}

			// attach final close handler to cleanup (will be appended but original close handler exists)
			socket.on('close', () => {
				fastify.log.info(`❌ [Game WS] Disconnected: ${userId}`);
				cancelDuelSearch(userId);
				userManager.removeGameSocket(userId);
				userManager.setInGame(userId, false);
			});
		})();
	});

	setInterval(() => {
		for (const { id } of userManager.getOnlineUsers()) {
			const user = userManager.getUser(id);
			const socket = user?.gameSocket;
			if (!socket || socket.readyState !== socket.OPEN) continue;

			if (!user?.isInGame) {
				console.log(`💀 [Game WS] Terminating inactive game connection: ${id}`);
				socket.close();
				userManager.removeGameSocket(id);
			} else {
				user.isInGame = false;
				socket.send('ping');
			}
		}
	}, PING_INTERVAL_MS);
};

export default fp(wsGamePlugin);
