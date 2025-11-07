import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';

import { Participant, TournamentState } from '../../tournament/tournament-types';
import { userManager } from '../../service-managers/user-manager';
import { tournamentManager } from '../../service-managers/tournament-manager';
import { gameManager } from '../../service-managers/game-manager';
import { PING_INTERVAL_MS } from '../../constants';
import { JWTPayload, User } from '../../types';



function handle_message(text: string, user:User, userId:string, socket:WebSocket) {
	if (text === 'pong') {
		userManager.setInTournament(user, true);
		return;
	}
	const data = JSON.parse(text);
	if (data.type === 'quitTournament') {
		tournamentManager.quitTournament(userId);
		userManager.removeTournamentSocket(user);
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
	else if (data.type === 'playerReady') {
		// Handle player socket ready signal for tournament matches
		tournamentManager.playerSocketReady(data.tournamentId, data.matchId, userId);
	}
}





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
		let user: User | undefined;
		let decoded: JWTPayload
		let userId: string = "unauthenticated";

		socket.on('message', async (raw: any) => {
			try {
				if (!authenticated) {
					decoded = fastify.jwt.verify(raw) as JWTPayload;
					user = userManager.getUser(decoded.id)
					if (!user)
						throw new Error(`User not valid: ${decoded.id}`);
					fastify.log.info(`🟢 [Tournament WS] Connected: ${user.username}`);
					userId = user.id.toString();
					userManager.setTournamentSocket(user, socket);

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

					userManager.setInTournament(user, true);
					console.log(`🎯 [Tournament WS] Connected: ${userId} (${action})`);
					socket.send(JSON.stringify({ type: 'tournamentJoined', id: tournament.id }));
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
				fastify.log.warn('📛 [Tournament WS] Invalid message:', err);
				socket.close(4001, 'Unauthorized')
				return;
			}
		});

		socket.on('close', () => {
			console.log(`❌ [Tournament WS] Disconnected: ${userId}`);
			tournamentManager.quitTournament(userId);
			userManager.removeTournamentSocket(user);
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
				userManager.removeTournamentSocket(user);
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
