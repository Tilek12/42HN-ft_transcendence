import { FastifyPluginAsync } from 'fastify';
import { WebSocket as WS } from 'ws';
import fp from 'fastify-plugin';

import { startGame, cancelDuelSearch } from '../game/engine/matchmaking';
import { Player } from '../game/engine/types';
import { userManager } from '../user/user-manager';
import { PING_INTERVAL_MS } from '../constants';
// import { findProfileById } from '../database/user'

const wsGamePlugin: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/game', { websocket: true }, async (connection: any, req: any) => {
		const params = new URLSearchParams(req.url?.split('?')[1] || '');
		const mode = params.get('mode') ?? 'solo';
		const token = params.get('token');
		const socket = connection.socket;

		if (!token) return socket.close(4001, 'Missing token');

		let userId: string;
		// let profile: any;
		try {
			const payload = await fastify.jwt.verify(token);
			userId = payload.id;
			// profile = await findProfileById(payload.id);
		} catch {
			return socket.close(4002, 'Invalid or expired token');
		}

		const user = userManager.getUser(userId);
		if (!user) return socket.close(4003, 'Presence connection not found');

		userManager.setGameSocket(userId, socket);
		userManager.setInGame(userId, true);
		console.log(`🏓 [Game WS] Connected: ${userId} (${mode})`);

		const player: Player = { id: userId, name: user.name, socket };
		if (mode === 'duel' || mode === 'solo') {
			await startGame(player, mode);
		} else {
			console.warn(`⛔️ [Game WS] Invalid mode: ${mode}`);
			return socket.close(4004, 'Unsupported mode');
		}

		socket.on('message', (msg: any) => {
			if (msg.toString() === 'pong') {
				userManager.setInGame(userId, true);
			} else if (msg.toString() === 'quit') {
				cancelDuelSearch(userId);
				socket.close();
			}
		});

		socket.on('close', () => {
			console.log(`❌ [Game WS] Disconnected: ${userId}`);
			cancelDuelSearch(userId);
			userManager.removeGameSocket(userId);
		});
	});

	setInterval(() => {
		for (const { id } of userManager.getOnlineUsers()) {
			const user = userManager.getUser(id);
			const socket = user?.gameSocket;
			if (!socket || socket.readyState !== WS.OPEN) continue;

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
