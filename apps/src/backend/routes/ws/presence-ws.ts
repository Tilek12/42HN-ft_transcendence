import { FastifyPluginAsync, FastifyRequest, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
// import {  WebSocket } from '@fastify/websocket'
import { userManager } from '../../service-managers/user-manager';
import { tournamentManager } from '../../service-managers/tournament-manager';
import { findUserById, getUsernameById } from '../../database/user';
import { PING_INTERVAL_MS } from '../../constants';
import { PresenceWebsocketSchema } from './WebsocketSchemas'
import { JWTPayload } from '../../types';
import { verifyUserJWT } from '../../auth/utils';
import { Jwt_type, User } from '../../types';
import { JWT } from '@fastify/jwt';
import { error } from 'console';

export const sendPresenceUpdate = () => {
	const users = userManager.getOnlineUsers();
	const msg = JSON.stringify({
		type: 'presenceUpdate',
		count: users.length,
		users,
	});
	for (const u of users) {
		const socket = userManager.getUser(u.id)?.presenceSocket;
		if (socket && socket.readyState === socket.OPEN) {
			try { socket.send(msg); } catch (err) { console.warn('Presence send error', err); }
		}
	}
};

export const sendTournamentUpdate = () => {
	const users = userManager.getOnlineUsers();
	const msg = JSON.stringify({
		type: 'tournamentUpdate',
		tournaments: tournamentManager.getSafeTournamentData(),
	});
	for (const u of users) {
		const socket = userManager.getUser(u.id)?.presenceSocket;
		if (socket && socket.readyState === socket.OPEN) {
			try { socket.send(msg); } catch (err) { console.warn('Tournament send error', err); }
		}
	}
};



const wsPresencePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	// WebSocket route
	fastify.get('/presence',
		{	schema: PresenceWebsocketSchema,
			websocket: true },
			(socket, req) => {
		let authenticated = false;
		let decoded = req.user as JWTPayload;
		let user: User | null;
		
		console.log("presence endpoint triggered for id: ", decoded.id);
		// Sync attach to prevent dropped messages


		socket.on('open', async (msg: any) => {
			console.log("presence ws message handler");
			try {
				if (!authenticated) {
					user = await findUserById(decoded.id);
					if ((fastify.jwt.verify(msg) as JWTPayload).id !== decoded.id )
						throw new Error("Message token does not match header token!")
					// console.log(user)
					if (userManager.getUser(decoded.id))
						throw new Error(` Duplicate connection rejected for: ${decoded.id}`);
					if (user) {
						console.log(`presence ws authenticated user ${user.id}`);
						userManager.createUser(user, socket);
						userManager.setAlive(user.id);
						authenticated = true;
						fastify.log.info(`🟢 [Presence WS] Connected: ${user.username}`);
						sendTournamentUpdate();
						sendPresenceUpdate();
					}
					else 
						throw new Error(`Couldnt find ${decoded.username} in db`);
				}
				else {
					console.log("lol");
					
				}
			}
			catch (err) {
				fastify.log.warn(`🔴 [Presence WS] Error: ${err}`);
				socket.close(4001, 'Unauthorized')
					return;
			}
			
		});
		socket.on('message', (msg:any) => {
			try {
			if (authenticated)
			{
				const message = msg.toString();
				if (message === 'pong' && user)
				{
					userManager.setAlive(user.id);
				}
				else
					throw new Error('message is not "pong"');
			}
			else
				throw new Error('not authenticated user sent message!');
			}
			catch (e: any){
				fastify.log.warn('💀 [Presence WS]', e.message);
				socket.close();
			}
		})

		socket.on('close', () => {
			console.log("presence ws close handler");
			if (user)
			{
				userManager.removeUser(user.id);
				fastify.log.info(`🔴 [Presence WS] Disconnected: ${user.id}`);
				sendPresenceUpdate();
			}
			else
				fastify.log.warn("[Presence WS] no user to remove");

		});
		socket.on('error', (err) => {
			fastify.log.warn({ err }, '[Presence WS] socket error');
		});
	});

	// single heartbeat/ping system (pings presence, game and tournament sockets through userManager)
	setInterval(() => {
		console.log("current present users: ", userManager.getOnlineUsers())
		try {
			userManager.checkHeartbeats(); // implementation updated to ping all socket-types
		} catch (err) {
			fastify.log.warn({ err }, '💀 [Presence WS] heartbeat check error');
		}
	}, PING_INTERVAL_MS);
};

export default fp(wsPresencePlugin);
