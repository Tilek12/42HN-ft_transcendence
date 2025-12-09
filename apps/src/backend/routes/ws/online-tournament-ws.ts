import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';

import { Participant, TournamentState } from '../../tournament/tournament-types';
import { userManager } from '../../service-managers/user-manager';
import { onlineTournamentManager } from '../../service-managers/online-tournament-manager';
import { gameManager } from '../../service-managers/game-manager';
import { PING_INTERVAL_MS } from '../../constants';
import { JWTPayload, User } from '../../backendTypes';

function handle_message(text: string, user:User, userId: number, socket:WebSocket) {
	if (text === 'pong') {
		userManager.setInOnlineTournament(user, true);
		return;
	}

	const data = JSON.parse(text);
	if (data.type === 'quitOnlineTournament') {
		onlineTournamentManager.quitOnlineTournament(userId);
		userManager.removeOnlineTournamentSocket(user);
		socket.send(JSON.stringify({ type: 'onlineTournamentLeft' }));
	} else if (data.type === 'playerReady') {
		// Handle player socket ready signal for tournament matches
		onlineTournamentManager.playerSocketReady(data.tournamentId, data.matchId, userId);
	}
}

const wsOnlineTournamentPlugin: FastifyPluginAsync = async (fastify: any) => {


	fastify.get('/online-tournament',
		 { websocket: true },
		  (socket: WebSocket, req: FastifyRequest) => {

		const params = new URLSearchParams(req.url?.split('?')[1] || '');
		const action = params.get('action'); // "create" or "join"
		const tournamentId = Number(params.get('id'));
		const size = parseInt(params.get('size') || '4') as 4 | 8;

		if (!action || (action === 'join' && !tournamentId)) {
			console.log('[LOCAL Tournament WS] Missing or invalid parameters', action, tournamentId);
			socket.close(4001, '[ONLINE Tournament WS] Missing or invalid parameters');
			return;
		}

		const buffer: any[] = [];
		let authenticated = false;
		let user: User | undefined;
		let decoded = req.user as JWTPayload;
		let userId: number = -100;

		socket.on('message', async (raw: any) => {
			try {
				if (!authenticated) {
					user = userManager.getUser(decoded.id)
					if (!user)
						throw new Error(`[ONLINE Tournament WS] User not valid: ${decoded.id}`);
					fastify.log.info(`🟢 [ONLINE Tournament WS] Connected: ${user.username}`);
					userId = user.id;
					userManager.setOnlineTournamentSocket(user, socket);

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
						console.log('[ONLINE Tournament WS] Could not join or create tournament');
						socket.send(JSON.stringify({ type: 'error', message: 'Could not join or create tournament' }));
						socket.close();
						return;
					}

					userManager.setInOnlineTournament(user, true);
					console.log(`🎯 [ONLINE Tournament WS] Connected: ${userId} (${action})`);
					socket.send(JSON.stringify({ type: 'onlineTournamentJoined', id: tournament.id }));
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
			userManager.removeOnlineTournamentSocket(user);
		});
		socket.on('error', (err: any) => {
			console.log(`⚠️ [ONLINE Tournament WS] Error from ${userId}:`, err);
			socket.close();
		});
	});

	setInterval(() => {
		userManager.getOnlineUsers().forEach(({ id }) => {
			const user = userManager.getUser(id);
			if (!user || !user.onlineTournamentSocket) return;

			if (!user.isInOnlineTournament) {
				console.log(`💀 [ONLINE Tournament WS] Inactive, closing: ${id}`);
				user.onlineTournamentSocket.close();
				userManager.removeOnlineTournamentSocket(user);
				return;
			}

			user.isInOnlineTournament = false;
			if (user.onlineTournamentSocket.readyState === WebSocket.OPEN) {
				try {
					user.onlineTournamentSocket.send('ping');
				} catch (err) {
					console.warn(`⚠️ [ONLINE Tournament WS] Ping failed for ${id}:`, err);
				}
			}
		});
	}, PING_INTERVAL_MS);
};

export default fp(wsOnlineTournamentPlugin);
