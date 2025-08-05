import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { WebSocket as WS } from 'ws';

import { userManager } from '../user/user-manager';
import { getSafeTournamentData } from '../game/tournament/tournament-manager';
import { findUserById, getUsernameById } from '../database/user'
import { PING_INTERVAL_MS } from '../constants'

export const sendPresenceUpdate = () => {
	const users = userManager.getOnlineUsers();
	const msg = JSON.stringify({
		type: 'presenceUpdate',
		count: users.length,
		users,
	});
	for (const u of users) {
		const socket = userManager.getUser(u.id)?.presenceSocket;
		if (socket?.readyState === WS.OPEN) socket.send(msg);
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
		if (socket?.readyState === WS.OPEN) socket.send(msg);
	}
};

const presencePlugin: FastifyPluginAsync = async (fastify) => {
	fastify.get('/presence', { websocket: true }, async (connection, req) => {
		const token = new URLSearchParams(req.url?.split('?')[1] || '').get('token');
		const socket = connection.socket;

		if (!token) return socket.close(4001, 'Missing token');

		let userId: string;
		try {
			const payload = await fastify.jwt.verify(token);
			userId = payload.id;
		} catch {
			return socket.close(4002, 'Invalid token');
		}

		if (userManager.getUser(userId)) {
			console.warn(`🔁 [Presence WS] Duplicate connection rejected for: ${userId}`);
			socket.close(4003, 'Already connected');
			return;
		}

		const user = await findUserById(userId);
		if (!user) {
			socket.close(4004, 'User not found');
			return;
		}

		const userName = await getUsernameById(userId);
		if (!userName) {
			socket.close(4004, 'Username not found');
			return;
		}

		userManager.createUser(userId, userName, socket);
		console.log(`🟢 [Presence WS] Connected: ${userId}`);

		sendTournamentUpdate();
		sendPresenceUpdate();

		socket.on('message', (msg) => {
			if (msg.toString() === 'pong') {
				userManager.setAlive(userId, true);
				console.log('=== received PONG from frontend Presenc WS ===');
			}
		});

		socket.on('close', () => {
			userManager.removeUser(userId);
			console.log(`🔴 [Presence WS] Disconnected: ${userId}`);
			sendPresenceUpdate();
		});
	});

	setInterval(() => {
		userManager.checkHeartbeats();
	}, PING_INTERVAL_MS);
};

export default fp(presencePlugin);
