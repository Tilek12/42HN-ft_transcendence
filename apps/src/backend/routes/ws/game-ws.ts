import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import  WebSocket from 'ws';

import { gameManager } from '../../service-managers/game-manager';
import { GameMode, Player } from '../../game/game-types';
import { userManager } from '../../service-managers/user-manager';
import { PING_INTERVAL_MS } from '../../constants';
import { GameWebsocketSchema, GameWebsocketQuery } from './WebsocketSchemas';
import { JWTPayload, User } from '../../backendTypes';
import { sleep } from '../../utils'
import { WebsocketHandler } from '@fastify/websocket';


async function setup(user:User, socket:WebSocket, buffer:string[], mode:string)
{
	// set the game socket (this will close previous if exists)
	console.log("SETUP GAME WS FOR USER", user.id);
	userManager.setGameSocket(user.id, socket);
	userManager.setInGame(user.id, true);

	// create Player with this socket and start matchmaking / game
	const player: Player = { id: user.id.toString(), name: user.username, socket };
	await gameManager.startGame(player, mode as GameMode);

	// while (buffer.length)
	// {
	// 	const raw = buffer.shift();
	// 	try {
	// 		const msg = raw;
	// 		if (msg === 'pong') userManager.setInGame(user.id, true);
	// 		if (msg === 'quit') {
	// 			console.log('game-ws setup() received quit from user', user.id);
	// 			socket.close(1000, "Quit game");
	// 		}
	// 	} catch {}
	// }

	// attach final close handler to cleanup (will be appended to the close handlers )
	socket.on('close', () => {
		console.log(`setup close handler ${user.id}`);
		gameManager.cancelDuelSearch(user.id.toString()); // TODO change id everywhere to number type
		userManager.removeGameSocket(user.id);
		userManager.setInGame(user.id, false);
	});
}


const wsGamePlugin: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/game', { websocket: true, Schema:GameWebsocketSchema}, (socket: WebSocket, req: FastifyRequest) => {
		// parse query quickly
		const buffer: string[] = [];
		const	query = req.query as GameWebsocketQuery;
		const	mode = query.mode;
		let 	authenticated = false;
		let		closed = false;
		let		user: User | undefined = undefined;
		let decoded = req.user as JWTPayload;


		socket.on('message', async (raw: any) => {
			try {
				if (!authenticated)
				{
					// decoded = fastify.jwt.verify(raw) as JWTPayload;
					user = userManager.getUser(decoded.id);
					if (!user)
						throw new Error("User not present");
					else {
						await setup(user, socket, buffer, mode);
						fastify.log.info(`🏓 [Game WS] Connected: ${user.id} (${mode})`);
						authenticated = true;
					}
				}
				else if (user)
				{
					const msg = raw.toString() as string;
					if (msg === 'pong')
					{
						userManager.setInGame(user.id, true);
					}
					else if (msg === 'quit')
					{
						// this execution path is reached only when the user has authenticated so no need for cancelDuelSearch
						console.log(`🏳️ [Game WS] Quit received from user ${user.id}`);
						socket.close();
					} //else other messages are handled by GameRoom since player.socket is same socket
				}
				else
				{
					buffer.push(raw.toString());
				}
			} catch (e:any){
				fastify.log.warn(`🔴 [Game WS] Error: ${e}`);
				socket.close(4003, 'Unauthorized')
			}
		});
		socket.on('close', () => {
			closed = true;
			fastify.log.info(`❌ [Game WS] Disconnected: ${user?user.id:'unauthenticated user'}`);
		});
		socket.on('error', (err: any) => fastify.log.warn('🔴 [Game WS] socket error', err));

	});

	setInterval(() => {
		for (const { id } of userManager.getOnlineUsers()) {
			const user = userManager.getUser(id);
			const socket = user?.gameSocket;
			if (!socket || socket.readyState !== socket.OPEN) continue;

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
