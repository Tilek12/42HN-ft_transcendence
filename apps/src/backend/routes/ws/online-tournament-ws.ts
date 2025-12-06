import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';

import { Participant, TournamentState } from '../../tournament/tournament-types';
import { userManager } from '../../service-managers/user-manager';
import { onlineTournamentManager } from '../../service-managers/online-tournament-manager';
import { gameManager } from '../../service-managers/game-manager';
import { PING_INTERVAL_MS } from '../../constants';
import { JWTPayload, User } from '../../backendTypes';

function handle_message(text: string, user:User, userId:string, socket:WebSocket) {
	if (text === 'pong') {
		userManager.setInTournament(user, true);
		return;
	}

	const data = JSON.parse(text);
	if (data.type === 'quitTournament') {
		onlineTournamentManager.quitOnlineTournament(userId);
		userManager.removeTournamentSocket(user);
		socket.send(JSON.stringify({ type: 'tournamentLeft' }));
	} else if (data.type === 'playerReady') {
		// Handle player socket ready signal for tournament matches
		onlineTournamentManager.playerSocketReady(data.tournamentId, data.matchId, userId);
	}
}

const wsOnlineTournamentPlugin: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/online-tournament', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		const params = new URLSearchParams(req.url?.split('?')[1] || '');
		const token = params.get('token');
		const action = params.get('action'); // "create" or "join"
		const tournamentId = params.get('id');
		const size = parseInt(params.get('size') || '4') as 4 | 8;

		if (!token || !action || (action === 'join' && !tournamentId)) {
			socket.close(4001, '[ONLINE Tournament WS] Missing or invalid parameters');
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
						throw new Error(`[ONLINE Tournament WS] User not valid: ${decoded.id}`);
					fastify.log.info(`🟢 [ONLINE Tournament WS] Connected: ${user.username}`);
					userId = user.id.toString();
					userManager.setTournamentSocket(user, socket);

					let tournament: TournamentState | null = null;
					const participant: Participant = { id: userId, name: user.name };

					if (action === 'create') {
						tournament = await onlineTournamentManager.createOnlineTournament(
							participant,
							size,
						);
					} else if (action === 'join') {
						tournament = await onlineTournamentManager.joinOnlineTournament(tournamentId!, participant);
					}

					if (!tournament) {
						socket.send(JSON.stringify({ type: 'error', message: 'Could not join or create tournament' }));
						socket.close();
						return;
					}

					userManager.setInTournament(user, true);
					console.log(`🎯 [ONLINE Tournament WS] Connected: ${userId} (${action})`);
					socket.send(JSON.stringify({ type: 'tournamentJoined', id: tournament.id }));
					while (buffer.length) {
						const raw = buffer.shift();
						handle_message(raw.toString(), user,userId, socket);
					}
					authenticated = true;
				}
				else if (user) {
					const text = raw.toString();
					handle_message(raw.toString(), user, userId, socket);
				}
				else {
					buffer.push(raw.toString())
				}
			} catch (err) {
				fastify.log.warn('📛 [ONLINE Tournament WS] Invalid message:', err);
				socket.close(4001, '[ONLINE Tournament WS] Unauthorized')
				return;
			}
		});

		socket.on('close', () => {
			console.log(`❌ [ONLINE Tournament WS] Disconnected: ${userId}`);
			onlineTournamentManager.quitOnlineTournament(userId);
			userManager.removeTournamentSocket(user);
		});
		socket.on('error', (err: any) => {
			console.error(`⚠️ [ONLINE Tournament WS] Error from ${userId}:`, err);
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
					console.warn(`⚠️ [ONLINE Tournament WS] Ping failed for ${id}:`, err);
				}
			}
		});
	}, PING_INTERVAL_MS);
};

export default fp(wsOnlineTournamentPlugin);
