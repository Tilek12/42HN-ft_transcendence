import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';

import { Participant, TournamentState } from '../../tournament/tournament-types';
import { userManager } from '../../service-managers/user-manager';
import { localTournamentManager } from '../../service-managers/local-tournament-manager';
import { gameManager } from '../../service-managers/game-manager';
import { PING_INTERVAL_MS } from '../../constants';
import { JWTPayload, User } from '../../types';
import { TournamentWebsocketQuery, TournamentWebsocketSchema } from './WebsocketSchemas';
import { findUserById } from '../../database/user';

function handle_message(text: string, user:User, userId:string, socket:WebSocket) {
	if (text === 'pong') {
		userManager.setInTournament(user, true);
		return;
	}
	const data = JSON.parse(text);
	if (data.type === 'quitTournament') {
		localTournamentManager.quitLocalTournament(userId);
		userManager.removeTournamentSocket(user);
		socket.send(JSON.stringify({ type: 'tournamentLeft' }));
	} else if (data.type === 'move') {
		const tournament = localTournamentManager.getUserTournament(userId);
		if (tournament) {
			const game = gameManager.getRoomByPlayerId(userId);
			if (game) {
				game.handleMove(userId, data.direction, data.side);
			}
		}
	}
}

const wsLocalTournamentPlugin: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/local-tournament', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		const params = new URLSearchParams(req.url?.split('?')[1] || '');
		const token = params.get('token');
		const action = params.get('action'); // "create" or "join"
		const tournamentId = params.get('id');
		const size = parseInt(params.get('size') || '4') as 4 | 8;
		const namesRaw = params.get('names') || '';
		const extraNames = namesRaw ? JSON.parse(namesRaw) : [];

		if (!token || !action || (action === 'join' && !tournamentId)) {
			socket.close(4001, '[LOCAL Tournament WS] Missing or invalid parameters');
			return;
		}

		const buffer: any[] = [];
		let authenticated = false;
		let user: User | undefined;
		let decoded = req.user as JWTPayload;
		let userId: string = "unauthenticated";

		socket.on('message', async (raw: any) => {
			try {
				if (!authenticated) {
					user = userManager.getUser(decoded.id)
					if (!user)
						throw new Error(`[LOCAL Tournament WS] User not valid: ${decoded.id}`);
					fastify.log.info(`🟢 [LOCAL Tournament WS] Connected: ${user.username}`);
					userId = user.id.toString();
					userManager.setTournamentSocket(user, socket);

					const participant: Participant = { id: userId, name: user.name };

					const tournament: TournamentState | null = await localTournamentManager.createLocalTournament(
							participant,
							size,
							socket,
							extraNames
						);

					if (!tournament) {
						socket.send(JSON.stringify({ type: 'error', message: 'Could not create LOCAL Tournament' }));
						socket.close();
						return;
					}

					userManager.setInTournament(user, true);
					console.log(`🎯 [LOCAL Tournament WS] Connected: ${userId} (${action})`);
					socket.send(JSON.stringify({ type: 'tournamentJoined', id: tournament.id }));

					localTournamentManager.startLocalTournament(tournament.id);

					while (buffer.length) {
						const raw = buffer.shift();
						handle_message(raw.toString(), user,userId, socket);
					}
					authenticated = true;
				}
				else if (user) {
					const text = raw.toString();
					handle_message(raw.toString(), user,userId, socket);
				}
				else {
					buffer.push(raw.toString())
				}
			} catch (err) {
				fastify.log.warn('📛 [LOCAL Tournament WS] Invalid message:', err);
				socket.close(4001, '[LOCAL Tournament WS] Unauthorized')
				return;
			}
		});

		socket.on('close', () => {
			console.log(`❌ [LOCAL Tournament WS] Disconnected: ${userId}`);
			localTournamentManager.quitLocalTournament(userId);
			userManager.removeTournamentSocket(user);
		});
		socket.on('error', (err: any) => {
			console.error(`⚠️ [LOCAL Tournament WS] Error from ${userId}:`, err);
			socket.close();
		});
	});

	setInterval(() => {
		userManager.getOnlineUsers().forEach(({ id }) => {
			const user = userManager.getUser(id);
			if (!user || !user.tournamentSocket) return;

			if (!user.isInTournament) {
				console.log(`💀 [LOCAL Tournament WS] Inactive, closing: ${id}`);
				user.tournamentSocket.close();
				userManager.removeTournamentSocket(user);
				return;
			}

			user.isInTournament = false;
			if (user.tournamentSocket.readyState === WebSocket.OPEN) {
				try {
					user.tournamentSocket.send('ping');
				} catch (err) {
					console.warn(`⚠️ [LOCAL Tournament WS] Ping failed for ${id}:`, err);
				}
			}
		});
	}, PING_INTERVAL_MS);
};

export default fp(wsLocalTournamentPlugin);
