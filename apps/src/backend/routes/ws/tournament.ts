import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import type { WebSocket } from "@fastify/websocket"; 


import type { Player } from '../../game/types.js';
import { userManager } from '../../service-managers/user-manager.js';
import { PING_INTERVAL_MS } from '../../constants.js';
import {
	createTournament,
	joinTournament,
	quitTournament
} from '../../service-managers/tournament-manager.js';
import type { Tournament } from '../../service-managers/tournament-manager.js';

const tournamentPlugin: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/tournament', { websocket: true }, async (connection: any, req: any) => {
		const params = new URLSearchParams(req.url?.split('?')[1] || '');
		const token = params.get('token');
		const action = params.get('action'); // "create" or "join"
		const tournamentId = params.get('id');
		const size = parseInt(params.get('size') || '4') as 4 | 8;
		const socket = connection.socket;

		if (!token || !action || (action === 'join' && !tournamentId)) {
			return socket.close(4001, 'Missing or invalid parameters');
		}

		let userId: string;
		let username: string;
		try {
			const payload = await fastify.jwt.verify(token);
			userId = payload.id;
			username = payload.name;
		} catch {
			return socket.close(4002, 'Invalid token');
		}

		const user = userManager.getUser(userId);
		if (!user) return socket.close(4003, 'Presence connection not found');

		userManager.setTournamentSocket(userId, socket);

		const player: Player = { id: userId, name: username, socket };

		let tournament: Tournament | null = null;
		if (action === 'create') {
			tournament = await createTournament(player, size);
		} else if (action === 'join') {
			tournament = await joinTournament(player, tournamentId!);
		}

		if (!tournament) {
			socket.send(JSON.stringify({ type: 'error', message: 'Could not join or create tournament' }));
			socket.close();
			return;
		}

		userManager.setInTornament(userId, true);
		console.log(`🎯 [Tournament WS] Connected: ${userId} (${action})`);
		socket.send(JSON.stringify({ type: 'tournamentJoined', id: tournament.id }));

		socket.on('message', (msg: any) => {
			const text = msg.toString();

			if (text === 'pong') {
				userManager.setInTornament(userId, true);
				return;
			}

			try {
				const data = JSON.parse(text);
				if (data.type === 'quitTournament') {
					quitTournament(userId);
					userManager.removeTournamentSocket(userId);
					socket.send(JSON.stringify({ type: 'tournamentLeft' }));
				}
			} catch (err) {
				console.warn('📛 [Tournament WS] Invalid message:', text);
			}
		});

		socket.on('close', () => {
			console.log(`❌ [Tournament WS] Disconnected: ${userId}`);
			quitTournament(userId);
			userManager.removeTournamentSocket(userId);
		});

		socket.on('error', (err: any) => {
			console.error(`⚠️ [Tournament WS] Error from ${userId}:`, err);
			socket.close();
		});
	});

	setInterval(() => {
		userManager.getOnlineUsers().forEach(({ id }) => {
			const user = userManager.getUser(id);
			if (!user || !user.tournamentSocket) return;

			if (!user.isInTournament) {
				console.log(`💀 [Tournament WS] Inactive, closing: ${id}`);
				user.tournamentSocket.close();
				userManager.removeTournamentSocket(id);
				return;
			}

			user.isInTournament = false;
			if (user.tournamentSocket.readyState === WebSocket.OPEN) {
				user.tournamentSocket.send('ping');
			}
		});
	}, PING_INTERVAL_MS);
};

export default fp(tournamentPlugin);
