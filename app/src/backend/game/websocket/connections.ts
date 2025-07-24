import { FastifyPluginAsync } from 'fastify';
import { WebSocket as WS } from 'ws';
import fp from 'fastify-plugin';

import { startGame } from '../engine/matchmaking';
import { Player } from '../engine/types';

interface ConnectedUser {
  id: string;
  socket: WebSocket;
  isAlive: boolean;
}
//-----------thomas---------------------
//-----Testing sockets------------------

const wsConnectionPluginTest: FastifyPluginAsync = async (fastify)=> {

	fastify.get('ws-echo', {websocket: true}, (con : any) => {
		const socket  = con.socket;
	   
	   socket.on('message', (msg : any) => {
		   console.log(`Received:  ${msg}`);
		   socket.send(`Echo: ${msg}`);
	   });
	});
}


//-----------thomas---------------------
const connectedUsers: ConnectedUser[] = [];
const PING_INTERVAL_MS = 10000;

const wsConnectionPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/ws', { websocket: true }, async (connection, req) => {
    console.log('🌐 Incoming WS connection');
    const url = req.url || '';
    const params = new URLSearchParams(url?.split('?')[1] || '');
    const mode = params.get('mode') === 'duel' ? 'duel' : 'solo';
    const token = params.get('token');

    // Validate token
    if (!token) {
      connection.socket.close(4001, 'Missing token');
      return;
    }

    let userId: string;
    try {
      const payload = await fastify.jwt.verify(token);
      userId = payload.id;
    } catch {
      connection.socket.close(4002, 'Invalid or expired token');
      return;
    }

    const socket = connection.socket;

    // Track in heartbeat list
    const user: ConnectedUser = {
      id: userId,
      socket,
      isAlive: true
    };
    connectedUsers.push(user);
    console.log(`✅ WebSocket connected: ${userId} (${mode})`);

    // Send player to matchmaking
    const player: Player = { id: userId, socket };
    startGame(player, mode);

    socket.on('message', (msg) => {
      const text = msg.toString();
      if (text === 'pong') {
        user.isAlive = true;
        return;
      }

      // Optional: log or ignore non-ping/pong messages here.
      // GameRoom handles move input internally per player.
    });

    socket.on('close', () => {
      console.log(`❌ User disconnected: ${userId}`);
      const index = connectedUsers.findIndex((u) => u.id === userId);
      if (index !== -1) connectedUsers.splice(index, 1);
      // GameRoom will also handle clean-up per match on player close.
    });
  });

  // Ping-pong heartbeat
  setInterval(() => {
    connectedUsers.forEach((user, i) => {
      if (user.socket.readyState !== WS.OPEN) return;

      if (!user.isAlive) {
        console.log(`💀 Terminating inactive: ${user.id}`);
        user.socket.close();
        connectedUsers.splice(i, 1);
        return;
      }

      user.isAlive = false;
      user.socket.send('ping');
    });
  }, PING_INTERVAL_MS);
};

export default fp(wsConnectionPlugin);
