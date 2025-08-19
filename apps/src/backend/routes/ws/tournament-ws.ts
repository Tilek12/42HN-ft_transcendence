import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';

import { Player } from '../../game/game-types';
import { userManager } from '../../service-managers/user-manager';
import { PING_INTERVAL_MS } from '../../constants';
import { tournamentManager } from '../../service-managers/tournament-manager';
import { TournamentState } from '../../tournament/tournament-types';

const wsTournamentPlugin: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/tournament', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		const params = new URLSearchParams(req.url?.split('?')[1] || '');
		const token = params.get('token');
		const action = params.get('action'); // "create" or "join"
		const tournamentId = params.get('id');
		const size = parseInt(params.get('size') || '4') as 4 | 8;
		const mode = (params.get('mode') as 'local' | 'online') || 'online';

		if (!token || !action || (action === 'join' && !tournamentId)) {
			return socket.close(4001, 'Missing or invalid parameters');
		}

		let userId: string;
		try {
			const payload = fastify.jwt.verify(token);
			userId = payload.id;
		} catch {
			return socket.close(4002, 'Invalid token');
		}

		const user = userManager.getUser(userId);
		if (!user) return socket.close(4003, 'Presence connection not found');

		userManager.setTournamentSocket(userId, socket);

		let tournament: TournamentState | null = null;
		const player: Player = { id: userId, name: user.name, socket };

		if (action === 'create') {
			tournament = tournamentManager.createTournament(
				mode,
				{ id:userId, name: user.name },
				size,
				mode === 'local' ? socket : undefined
			);
		} else if (action === 'join') {
			tournament = tournamentManager.joinTournament(tournamentId!, { id: userId, name: user.name });
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

export default fp(wsTournamentPlugin);
