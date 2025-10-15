import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';

import { Participant, TournamentState } from '../../tournament/tournament-types';
import { userManager } from '../../service-managers/user-manager';
import { tournamentManager } from '../../service-managers/tournament-manager';
import { gameManager } from '../../service-managers/game-manager';
import { PING_INTERVAL_MS } from '../../constants';

const wsTournamentPlugin: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/tournament', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		const params = new URLSearchParams(req.url?.split('?')[1] || '');
		const token = params.get('token');
		const action = params.get('action'); // "create" or "join"
		const tournamentId = params.get('id');
		const size = parseInt(params.get('size') || '4') as 4 | 8;
		const mode = (params.get('mode') as 'local' | 'online') || 'online';
		const namesRaw = params.get('names') || '';
		const extraNames = namesRaw ? JSON.parse(namesRaw) : [];

		if (!token || !action || (action === 'join' && !tournamentId)) {
			socket.close(4001, 'Missing or invalid parameters');
			return;
		}

		const buffer: any[] = [];
		let authenticated = false;
		let userId: string;

		const onMessage = (msg: any) => {
			if (!authenticated) {
				buffer.push(msg);
				return;
			}

			const text = msg.toString();
			if (text === 'pong') {
				userManager.setInTournament(userId, true);
				return;
			}

			try {
				const data = JSON.parse(text);
				if (data.type === 'quitTournament') {
					tournamentManager.quitTournament(userId);
					userManager.removeTournamentSocket(userId);
					socket.send(JSON.stringify({ type: 'tournamentLeft' }));
				} else if (data.type === 'move') {
					const tournament = tournamentManager.getUserTournament(userId);
					if (tournament && tournament.mode === 'local') {
						const game = gameManager.getRoomByPlayerId(userId);
						if (game) {
							game.handleMove(userId, data.direction, data.side);
						}
					}
				}
			} catch (err) {
				console.warn('📛 [Tournament WS] Invalid message:', text);
			}
		};

		socket.on('message', onMessage);
		socket.on('close', () => {
			console.log(`❌ [Tournament WS] Disconnected: ${userId}`);
			tournamentManager.quitTournament(userId);
			userManager.removeTournamentSocket(userId);
		});
		socket.on('error', (err: any) => {
			console.error(`⚠️ [Tournament WS] Error from ${userId}:`, err);
			socket.close();
		});

		(async () => {
			try {
				const payload = await fastify.jwt.verify(token);
				userId = payload.id;

				const user = userManager.getUser(userId);
				if (!user) {
					socket.close(4003, 'Presence connection not found');
					return;
				}

				userManager.setTournamentSocket(userId, socket);

				let tournament: TournamentState | null = null;
				const participant: Participant = { id: userId, name: user.name };

				if (action === 'create') {
					tournament = await tournamentManager.createTournament(
						mode,
						participant,
						size,
						mode === 'local' ? socket : undefined,
						extraNames
					);
					if (mode === 'local') {
						tournamentManager.startTournament(tournament.id);
					}
				} else if (action === 'join') {
					tournament = await tournamentManager.joinTournament(tournamentId!, participant);
				}

				if (!tournament) {
					socket.send(JSON.stringify({ type: 'error', message: 'Could not join or create tournament' }));
					socket.close();
					return;
				}

				userManager.setInTournament(userId, true);
				console.log(`🎯 [Tournament WS] Connected: ${userId} (${action})`);
				socket.send(JSON.stringify({ type: 'tournamentJoined', id: tournament.id }));

				authenticated = true;

				while (buffer.length) {
					const raw = buffer.shift();
					onMessage(raw);
				}
			} catch (err) {
				console.error(`⚠️ [Tournament WS] Error during setup:`, err);
				socket.close(4004, 'Tournament setup failed');
			}
		})();
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
				try {
					user.tournamentSocket.send('ping');
				} catch (err) {
					console.warn(`⚠️ [Tournament WS] Ping failed for ${id}:`, err);
				}
			}
		});
	}, PING_INTERVAL_MS);
};

export default fp(wsTournamentPlugin);
